import { cookies, headers } from "next/headers";
import { getRuntimeEnv } from "@/lib/runtime-env";

export const LEGACY_ADMIN_COOKIE_NAME = "jbl_admin_session";
const CF_ACCESS_COOKIE_NAME = "CF_Authorization";

const JWKS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const JWKS_REFRESH_COOLDOWN_MS = 30 * 1000; // 30 seconds anti-stampede cooldown
const CLOCK_SKEW_SEC = 60;

const encoder = new TextEncoder();

interface CachedJwksEntry {
  keys: Map<string, { alg: "RS256" | "ES256"; cryptoKey: CryptoKey }>;
  fetchedAt: number;
  lastRefreshAttemptAt: number;
}

const jwksCache = new Map<string, CachedJwksEntry>();

interface CfJwk {
  kid?: string;
  kty?: string;
  alg?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  y?: string;
}

interface JwtHeader {
  alg?: string;
  kid?: string;
  typ?: string;
}

interface CfAccessJwtPayload {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  email?: string;
  sub?: string;
  common_name?: string;
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

function decodeJwtJson<T>(segment: string): T | null {
  const bytes = fromBase64Url(segment);
  if (!bytes) return null;
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}

/**
 * Normalizes `CF_ACCESS_TEAM_DOMAIN` into `https://<team>.cloudflareaccess.com`.
 * Accepts `"myteam"`, `"myteam.cloudflareaccess.com"`, or `"https://myteam.cloudflareaccess.com/"`.
 */
function normalizeTeamOrigin(raw: string | undefined): string | null {
  const trimmed = raw?.trim().replace(/\/+$/, "");
  if (!trimmed) return null;

  const candidate = trimmed.includes("://")
    ? trimmed
    : trimmed.includes(".")
      ? `https://${trimmed}`
      : `https://${trimmed}.cloudflareaccess.com`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function parseAudienceList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function importCfPublicKey(
  jwk: CfJwk
): Promise<{ alg: "RS256" | "ES256"; cryptoKey: CryptoKey } | null> {
  try {
    if (jwk.kty === "RSA" && jwk.n && jwk.e) {
      const cryptoKey = await crypto.subtle.importKey(
        "jwk",
        { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      );
      return { alg: "RS256", cryptoKey };
    }

    if (jwk.kty === "EC" && jwk.crv === "P-256" && jwk.x && jwk.y) {
      const cryptoKey = await crypto.subtle.importKey(
        "jwk",
        { kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y, ext: true },
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["verify"]
      );
      return { alg: "ES256", cryptoKey };
    }
  } catch {
    return null;
  }
  return null;
}

async function getVerificationKey(
  teamOrigin: string,
  kid: string
): Promise<{ alg: "RS256" | "ES256"; cryptoKey: CryptoKey } | null> {
  const now = Date.now();
  const cached = jwksCache.get(teamOrigin);

  if (cached && now - cached.fetchedAt < JWKS_CACHE_TTL_MS) {
    const hit = cached.keys.get(kid);
    if (hit) return hit;
    if (now - cached.lastRefreshAttemptAt < JWKS_REFRESH_COOLDOWN_MS) {
      return null;
    }
  }

  if (cached) {
    cached.lastRefreshAttemptAt = now;
  }

  const res = await fetch(`${teamOrigin}/cdn-cgi/access/certs`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    return cached?.keys.get(kid) ?? null;
  }

  const body = (await res.json()) as { keys?: CfJwk[] };
  if (!Array.isArray(body.keys)) {
    return null;
  }

  const nextMap = new Map<string, { alg: "RS256" | "ES256"; cryptoKey: CryptoKey }>();
  for (const jwk of body.keys) {
    if (!jwk.kid) continue;
    const imported = await importCfPublicKey(jwk);
    if (imported) {
      nextMap.set(jwk.kid, imported);
    }
  }

  jwksCache.set(teamOrigin, {
    keys: nextMap,
    fetchedAt: now,
    lastRefreshAttemptAt: now,
  });

  return nextMap.get(kid) ?? null;
}

export type AdminAuthDiagnostic =
  | "missing-token"
  | "invalid-jwt-format"
  | "issuer-mismatch"
  | "aud-mismatch"
  | "token-expired"
  | "certs-fetch-failed"
  | "signing-key-missing"
  | "bad-signature";

async function verifyCfAccessJwt(
  token: string,
  teamOrigin: string,
  allowedAuds: string[]
): Promise<
  | { ok: true; identity: string }
  | { ok: false; diagnostic: AdminAuthDiagnostic }
> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false, diagnostic: "invalid-jwt-format" };
  }

  const [headerB64, payloadB64, sigB64] = parts;
  if (!headerB64 || !payloadB64 || !sigB64) {
    return { ok: false, diagnostic: "invalid-jwt-format" };
  }

  const header = decodeJwtJson<JwtHeader>(headerB64);
  if (
    !header ||
    !header.kid ||
    (header.alg !== "RS256" && header.alg !== "ES256")
  ) {
    return { ok: false, diagnostic: "invalid-jwt-format" };
  }

  const payload = decodeJwtJson<CfAccessJwtPayload>(payloadB64);
  if (!payload) {
    return { ok: false, diagnostic: "invalid-jwt-format" };
  }

  // Validate issuer & audience before network JWKS lookup
  if (payload.iss?.replace(/\/+$/, "") !== teamOrigin) {
    return { ok: false, diagnostic: "issuer-mismatch" };
  }

  const tokenAuds = Array.isArray(payload.aud)
    ? payload.aud
    : typeof payload.aud === "string"
      ? [payload.aud]
      : [];
  const audMatched = tokenAuds.some((aud) => allowedAuds.includes(aud));
  if (!audMatched) {
    return { ok: false, diagnostic: "aud-mismatch" };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp <= nowSec) {
    return { ok: false, diagnostic: "token-expired" };
  }
  if (typeof payload.nbf === "number" && payload.nbf > nowSec + CLOCK_SKEW_SEC) {
    return { ok: false, diagnostic: "token-expired" };
  }
  if (typeof payload.iat === "number" && payload.iat > nowSec + CLOCK_SKEW_SEC) {
    return { ok: false, diagnostic: "token-expired" };
  }

  const sigBytes = fromBase64Url(sigB64);
  if (!sigBytes) {
    return { ok: false, diagnostic: "invalid-jwt-format" };
  }

  let keyEntry: { alg: "RS256" | "ES256"; cryptoKey: CryptoKey } | null = null;
  try {
    keyEntry = await getVerificationKey(teamOrigin, header.kid);
  } catch {
    return { ok: false, diagnostic: "certs-fetch-failed" };
  }
  if (!keyEntry || keyEntry.alg !== header.alg) {
    return { ok: false, diagnostic: "signing-key-missing" };
  }

  const verifyAlgorithm =
    keyEntry.alg === "RS256"
      ? { name: "RSASSA-PKCS1-v1_5" }
      : { name: "ECDSA", hash: "SHA-256" };

  const signatureValid = await crypto.subtle.verify(
    verifyAlgorithm,
    keyEntry.cryptoKey,
    sigBytes as BufferSource,
    encoder.encode(`${headerB64}.${payloadB64}`)
  );
  if (!signatureValid) {
    return { ok: false, diagnostic: "bad-signature" };
  }

  const identity =
    payload.email?.trim() ||
    payload.common_name?.trim() ||
    payload.sub?.trim() ||
    "authenticated-admin";

  return { ok: true, identity };
}

export interface AdminSessionStatus {
  authenticated: boolean;
  configured: boolean;
  isLocalDevBypass: boolean;
  method: "cloudflare-access" | "local-dev-bypass" | null;
  identity?: string;
  logoutUrl?: string;
  requestHost?: string;
  diagnostic?: AdminAuthDiagnostic;
}

export async function getAdminSessionStatus(): Promise<AdminSessionStatus> {
  const [rawTeamDomain, rawAud, rawDevBypass, headerStore, cookieStore] =
    await Promise.all([
      getRuntimeEnv("CF_ACCESS_TEAM_DOMAIN"),
      getRuntimeEnv("CF_ACCESS_AUD"),
      getRuntimeEnv("ADMIN_DEV_BYPASS"),
      headers(),
      cookies(),
    ]);

  const requestHost =
    headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headerStore.get("host")?.trim() ||
    undefined;

  // Strictly non-production local UI development bypass (never active in production builds)
  if (process.env.NODE_ENV === "development" && rawDevBypass === "true") {
    return {
      authenticated: true,
      configured: true,
      isLocalDevBypass: true,
      method: "local-dev-bypass",
      identity: "local-dev@localhost",
      requestHost,
    };
  }

  const teamOrigin = normalizeTeamOrigin(rawTeamDomain);
  const allowedAuds = parseAudienceList(rawAud);
  const configured = Boolean(teamOrigin && allowedAuds.length > 0);

  if (configured && teamOrigin) {
    const jwtAssertion =
      headerStore.get("cf-access-jwt-assertion")?.trim() ||
      cookieStore.get(CF_ACCESS_COOKIE_NAME)?.value?.trim();

    if (!jwtAssertion) {
      return {
        authenticated: false,
        configured: true,
        isLocalDevBypass: false,
        method: null,
        requestHost,
        diagnostic: "missing-token",
      };
    }

    const verified = await verifyCfAccessJwt(
      jwtAssertion,
      teamOrigin,
      allowedAuds
    );
    if (verified.ok) {
      return {
        authenticated: true,
        configured: true,
        isLocalDevBypass: false,
        method: "cloudflare-access",
        identity: verified.identity,
        logoutUrl: "/cdn-cgi/access/logout",
        requestHost,
      };
    }

    return {
      authenticated: false,
      configured: true,
      isLocalDevBypass: false,
      method: null,
      requestHost,
      diagnostic: verified.diagnostic,
    };
  }

  return {
    authenticated: false,
    configured: false,
    isLocalDevBypass: false,
    method: null,
    requestHost,
  };
}
