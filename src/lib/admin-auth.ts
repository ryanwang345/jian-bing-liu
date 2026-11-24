import { cookies, headers } from "next/headers";
import { getRuntimeEnv } from "@/lib/runtime-env";

export const ADMIN_COOKIE_NAME = "jbl_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const LOCAL_DEV_FALLBACK_PASSWORD = "jianbingliu-local";

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
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

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(`jian-bing-liu-admin-v1:${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function getAdminSecretInfo(): Promise<{
  secret: string | null;
  isLocalFallback: boolean;
}> {
  const configured = await getRuntimeEnv("ADMIN_PASSWORD");
  if (configured) {
    return { secret: configured, isLocalFallback: false };
  }
  if (process.env.NODE_ENV !== "production") {
    return { secret: LOCAL_DEV_FALLBACK_PASSWORD, isLocalFallback: true };
  }
  return { secret: null, isLocalFallback: false };
}

export async function createAdminSessionToken(): Promise<string | null> {
  const { secret } = await getAdminSecretInfo();
  if (!secret) return null;

  const payload = JSON.stringify({
    v: 1,
    exp: Date.now() + SESSION_TTL_MS,
  });
  const payloadB64 = toBase64Url(encoder.encode(payload));
  const key = await importHmacKey(secret);
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64))
  );
  return `${payloadB64}.${toBase64Url(signature)}`;
}

async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;
  const { secret } = await getAdminSecretInfo();
  if (!secret) return false;

  const sigBytes = fromBase64Url(sigB64);
  if (!sigBytes) return false;

  const key = await importHmacKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes as BufferSource,
    encoder.encode(payloadB64)
  );
  if (!valid) return false;

  const payloadBytes = fromBase64Url(payloadB64);
  if (!payloadBytes) return false;

  try {
    const parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      exp?: number;
    };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(candidate: string): Promise<{
  ok: boolean;
  configured: boolean;
}> {
  const { secret } = await getAdminSecretInfo();
  if (!secret) return { ok: false, configured: false };

  // Constant-time comparison via HMAC digest equality
  const key = await importHmacKey("password-check");
  const expectedSig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(secret))
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    expectedSig as BufferSource,
    encoder.encode(candidate)
  );
  return { ok: valid, configured: true };
}

export interface AdminSessionStatus {
  authenticated: boolean;
  configured: boolean;
  isLocalFallback: boolean;
  method: "cloudflare-access" | "session-cookie" | null;
  identity?: string;
}

export async function getAdminSessionStatus(): Promise<AdminSessionStatus> {
  const headerStore = await headers();
  const cfAccessEmail = headerStore.get("cf-access-authenticated-user-email")?.trim();
  if (cfAccessEmail) {
    return {
      authenticated: true,
      configured: true,
      isLocalFallback: false,
      method: "cloudflare-access",
      identity: cfAccessEmail,
    };
  }

  const { secret, isLocalFallback } = await getAdminSecretInfo();
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const authenticated = await verifyAdminSessionToken(token);

  return {
    authenticated,
    configured: Boolean(secret),
    isLocalFallback,
    method: authenticated ? "session-cookie" : null,
  };
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}
