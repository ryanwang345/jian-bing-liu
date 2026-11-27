import { cookies } from "next/headers";
import { getMenuDb } from "@/lib/cf-bindings";
import { getRuntimeEnv } from "@/lib/runtime-env";

export const CUSTOMER_WALLET_COOKIE_NAME = "jbl_customer_wallet";
export const CUSTOMER_WALLET_MAX_AGE_SEC = 90 * 24 * 60 * 60; // 90 days

export interface CustomerWalletSession {
  email: string;
  normalizedEmail: string;
}

interface SignedWalletPayload {
  email: string;
  normalizedEmail: string;
  exp: number;
}

let cachedSigningSecret: string | null = null;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const padded = input
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(input.length / 4) * 4, "=");
    const binary = atob(padded);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

async function getWalletSigningSecret(): Promise<string> {
  if (cachedSigningSecret) return cachedSigningSecret;

  const envSecret = await getRuntimeEnv("CUSTOMER_SESSION_SECRET");
  if (envSecret && envSecret.length >= 16) {
    cachedSigningSecret = envSecret;
    return envSecret;
  }

  // Self-bootstrapping 256-bit secret persisted in private Cloudflare D1 so
  // tokens stay unforgeable across all Worker isolates with zero manual setup.
  const db = await getMenuDb();
  if (db) {
    try {
      await db
        .prepare(
          `CREATE TABLE IF NOT EXISTS wallet_server_secrets (
            key TEXT PRIMARY KEY,
            secret TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`
        )
        .run();

      const candidateBytes = new Uint8Array(32);
      crypto.getRandomValues(candidateBytes);
      const candidateHex = Array.from(candidateBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      await db
        .prepare(
          "INSERT OR IGNORE INTO wallet_server_secrets (key, secret) VALUES ('wallet_hmac_v1', ?)"
        )
        .bind(candidateHex)
        .run();

      const row = await db
        .prepare(
          "SELECT secret FROM wallet_server_secrets WHERE key = 'wallet_hmac_v1'"
        )
        .first<{ secret: string }>();

      if (row?.secret) {
        cachedSigningSecret = row.secret;
        return row.secret;
      }
    } catch {
      // Fall through to deterministic fallback in read-only / local test mode
    }
  }

  const fallback =
    (await getRuntimeEnv("CF_ACCESS_AUD")) || "jbl-local-dev-wallet-hmac-v1";
  cachedSigningSecret = fallback;
  return fallback;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export function normalizeCustomerPin(raw: string | undefined | null): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!/^\d{4,8}$/.test(trimmed)) return null;
  return trimmed;
}

export async function hashCustomerPin(
  normalizedEmail: string,
  pin: string
): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`jbl-wallet-pin-v1:${pin}`),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(`jbl-salt:${normalizedEmail}`),
      iterations: 20000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashEmailOtp(
  normalizedEmail: string,
  otpCode: string
): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`jbl-wallet-otp-v1:${normalizedEmail}:${otpCode}`)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createCustomerWalletToken(
  session: CustomerWalletSession
): Promise<string> {
  const payload: SignedWalletPayload = {
    email: session.email,
    normalizedEmail: session.normalizedEmail,
    exp: Math.floor(Date.now() / 1000) + CUSTOMER_WALLET_MAX_AGE_SEC,
  };
  const payloadSegment = toBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const secret = await getWalletSigningSecret();
  const key = await importHmacKey(secret);
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadSegment)
  );
  return `${payloadSegment}.${toBase64Url(new Uint8Array(sigBuffer))}`;
}

export async function verifyCustomerWalletToken(
  token: string | undefined | null
): Promise<CustomerWalletSession | null> {
  if (!token) return null;
  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0 || dotIdx === token.length - 1) return null;

  const payloadSegment = token.slice(0, dotIdx);
  const sigSegment = token.slice(dotIdx + 1);
  const sigBytes = fromBase64Url(sigSegment);
  const payloadBytes = fromBase64Url(payloadSegment);
  if (!sigBytes || !payloadBytes) return null;

  try {
    const secret = await getWalletSigningSecret();
    const key = await importHmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as BufferSource,
      new TextEncoder().encode(payloadSegment)
    );
    if (!valid) return null;

    const parsed = JSON.parse(
      new TextDecoder().decode(payloadBytes)
    ) as Partial<SignedWalletPayload>;

    if (
      typeof parsed.email !== "string" ||
      typeof parsed.normalizedEmail !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    if (parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      email: parsed.email,
      normalizedEmail: parsed.normalizedEmail,
    };
  } catch {
    return null;
  }
}

export async function getCustomerWalletSession(): Promise<CustomerWalletSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CUSTOMER_WALLET_COOKIE_NAME)?.value;
  return verifyCustomerWalletToken(raw);
}
