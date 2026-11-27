import { getMenuDb } from "@/lib/cf-bindings";
import {
  hashCustomerPin,
  hashEmailOtp,
  normalizeCustomerPin,
} from "@/lib/customer-wallet-auth";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { getSiteContent } from "@/lib/site-content-service";

export type CouponStoredStatus = "active" | "redeemed" | "void";
export type CouponEffectiveStatus = CouponStoredStatus | "expired";
export type CouponSource = "welcome" | "voucher";

export type CouponActivityEventType =
  | "issued"
  | "admin_issued"
  | "scanned_valid"
  | "scanned_used"
  | "scanned_expired"
  | "scanned_void"
  | "scanned_invalid"
  | "redeemed"
  | "unredeemed"
  | "voided";

export const DEVICE_COUPON_COOKIE_NAME = "jbl_coupon_device";

export interface WelcomeCouponRecord {
  id: string;
  source: CouponSource;
  campaignType: string;
  email: string;
  normalizedEmail: string;
  customerName: string;
  couponCode: string;
  offerTitleZh: string;
  offerTitleEn: string;
  discountLabelZh: string;
  discountLabelEn: string;
  maxUses: number;
  usedCount: number;
  remainingUses: number;
  status: CouponStoredStatus;
  effectiveStatus: CouponEffectiveStatus;
  marketingOptIn: boolean;
  expiresAt: string;
  createdAt: string;
  redeemedAt: string | null;
  redeemedBy: string | null;
  issuedBy?: string | null;
}

export interface CouponStatsSummary {
  total: number;
  active: number;
  redeemed: number;
  expired: number;
  voided: number;
  todayRedeemed: number;
}

export interface CouponActivityLogRecord {
  id: string;
  couponCode: string;
  customerEmail: string;
  eventType: CouponActivityEventType | string;
  statusSnapshot: string;
  actor: string;
  detail: string;
  createdAt: string;
}

export interface CustomerWalletSnapshot {
  email: string;
  normalizedEmail: string;
  customerName: string;
  hasPin: boolean;
  marketingOptIn: boolean;
  coupons: WelcomeCouponRecord[];
  activities: CouponActivityLogRecord[];
}

interface RawCouponRow {
  id: string;
  campaign_type?: string | null;
  email: string;
  normalized_email: string;
  customer_name: string;
  coupon_code: string;
  offer_title_zh: string;
  offer_title_en: string;
  discount_label_zh: string;
  discount_label_en: string;
  max_uses: number;
  used_count: number;
  status: CouponStoredStatus;
  marketing_opt_in?: number | null;
  expires_at: string;
  created_at: string;
  redeemed_at: string | null;
  redeemed_by: string | null;
  issued_by?: string | null;
  ip_hash?: string | null;
}

interface RawWalletAccountRow {
  normalized_email: string;
  email: string;
  customer_name: string;
  pin_hash: string | null;
  marketing_opt_in: number;
  otp_hash: string | null;
  otp_expires_at: string | null;
  otp_attempts: number;
  updated_at: string;
  created_at: string;
}

interface RawActivityLogRow {
  id: string;
  coupon_code: string;
  customer_email: string;
  event_type: string;
  status_snapshot: string;
  actor: string;
  detail: string;
  created_at: string;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const RAW_CODE_BODY_RE = /^[A-Z0-9]{4,12}$/;
const CODE_RE = /^JBL-[A-Z0-9]{4,12}$/;

// Anti-abuse rate limits
const IP_BURST_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const IP_BURST_MAX_ATTEMPTS = 6;
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_MAX_IP_ATTEMPTS = 10;
const AUTH_MAX_EMAIL_FAILURES = 5;
const MAX_ISSUED_PER_IP_24H = 2; // Allows couples/flatmates on shared Wi-Fi, stops repeat incognito abuse
const MAX_ISSUED_PER_IP_30D = 3;
const MAX_GLOBAL_ISSUED_PER_24H = 250; // Circuit breaker against botnet DDoS

// Known trusted consumer email domains (skip external MX lookup for instant 0ms validation)
const TRUSTED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "live.co.uk",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "btinternet.com",
  "sky.com",
  "virginmedia.com",
  "talktalk.net",
  "proton.me",
  "protonmail.com",
  "qq.com",
  "vip.qq.com",
  "foxmail.com",
  "163.com",
  "126.com",
  "yeah.net",
  "sina.com",
  "aliyun.com",
]);

// Disposable / burner / fake test email domains blocked from claiming welcome coupons
const BLOCKED_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "testing.com",
  "abc.com",
  "123.com",
  "asdf.com",
  "qwer.com",
  "localhost",
  "invalid",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tmpmail.net",
  "tmpmail.org",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "trashmail.net",
  "getnada.com",
  "nada.email",
  "fakeinbox.com",
  "dispostable.com",
  "maildrop.cc",
  "mailnesia.com",
  "mohmal.com",
  "throwawaymail.com",
  "mintemail.com",
  "mytemp.email",
  "emailondeck.com",
  "burnermail.io",
  "inboxkitten.com",
]);

const ipBurstTracker = new Map<string, number[]>();
const authIpBurstTracker = new Map<string, number[]>();
const authEmailFailureTracker = new Map<string, number[]>();
const mxDomainCache = new Map<string, { valid: boolean; expiresAt: number }>();

let schemaReady = false;

type MenuDb = NonNullable<Awaited<ReturnType<typeof getMenuDb>>>;

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function hashClientIp(
  rawIp: string | null | undefined
): Promise<string | null> {
  const clean = rawIp?.trim();
  if (!clean || clean === "unknown") return null;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`jbl-coupon-ip-v1:${clean}`)
  );
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function checkSlidingWindow(
  tracker: Map<string, number[]>,
  key: string | null,
  windowMs: number,
  maxEvents: number,
  recordHit = true
): boolean {
  if (!key) return true;
  const now = Date.now();
  const prev = (tracker.get(key) ?? []).filter((ts) => now - ts < windowMs);
  if (prev.length >= maxEvents) {
    tracker.set(key, prev);
    return false;
  }
  if (recordHit) {
    prev.push(now);
    tracker.set(key, prev);
  }
  if (tracker.size > 2000) {
    for (const [k, timestamps] of tracker) {
      if (timestamps.every((ts) => now - ts >= windowMs)) {
        tracker.delete(k);
      }
    }
  }
  return true;
}

function checkAndRecordIpBurst(ipHash: string | null): boolean {
  return checkSlidingWindow(
    ipBurstTracker,
    ipHash,
    IP_BURST_WINDOW_MS,
    IP_BURST_MAX_ATTEMPTS,
    true
  );
}

async function hasValidMailExchange(domain: string): Promise<boolean> {
  if (TRUSTED_EMAIL_DOMAINS.has(domain)) return true;
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return false;

  const now = Date.now();
  const cached = mxDomainCache.get(domain);
  if (cached && cached.expiresAt > now) {
    return cached.valid;
  }

  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      {
        headers: { Accept: "application/dns-json" },
        signal: AbortSignal.timeout(1600),
      }
    );
    if (!res.ok) {
      return true;
    }
    const data = (await res.json()) as {
      Status?: number;
      Answer?: Array<{ type?: number; data?: string }>;
    };
    if (data.Status === 3) {
      mxDomainCache.set(domain, {
        valid: false,
        expiresAt: now + 30 * 60 * 1000,
      });
      return false;
    }
    const hasMx =
      Array.isArray(data.Answer) &&
      data.Answer.some(
        (ans) =>
          ans.type === 15 &&
          typeof ans.data === "string" &&
          ans.data.trim() !== "" &&
          ans.data.trim() !== "0 ."
      );
    mxDomainCache.set(domain, {
      valid: hasMx,
      expiresAt: now + 30 * 60 * 1000,
    });
    return hasMx;
  } catch {
    return true;
  }
}

async function ensureCouponsSchema(db: MenuDb): Promise<void> {
  if (schemaReady) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS welcome_coupons (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        normalized_email TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL DEFAULT '',
        coupon_code TEXT NOT NULL UNIQUE,
        offer_title_zh TEXT NOT NULL,
        offer_title_en TEXT NOT NULL,
        discount_label_zh TEXT NOT NULL,
        discount_label_en TEXT NOT NULL,
        max_uses INTEGER NOT NULL DEFAULT 1,
        used_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'void')),
        marketing_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (marketing_opt_in IN (0, 1)),
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        redeemed_at TEXT,
        redeemed_by TEXT,
        ip_hash TEXT
      )`
    )
    .run();

  try {
    await db
      .prepare("ALTER TABLE welcome_coupons ADD COLUMN ip_hash TEXT")
      .run();
  } catch {
    // Column already exists
  }

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS customer_vouchers (
        id TEXT PRIMARY KEY,
        campaign_type TEXT NOT NULL DEFAULT 'reward',
        email TEXT NOT NULL,
        normalized_email TEXT NOT NULL,
        customer_name TEXT NOT NULL DEFAULT '',
        coupon_code TEXT NOT NULL UNIQUE,
        offer_title_zh TEXT NOT NULL,
        offer_title_en TEXT NOT NULL,
        discount_label_zh TEXT NOT NULL,
        discount_label_en TEXT NOT NULL,
        max_uses INTEGER NOT NULL DEFAULT 1,
        used_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'void')),
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        redeemed_at TEXT,
        redeemed_by TEXT,
        issued_by TEXT
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS customer_wallet_accounts (
        normalized_email TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        customer_name TEXT NOT NULL DEFAULT '',
        pin_hash TEXT,
        marketing_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (marketing_opt_in IN (0, 1)),
        otp_hash TEXT,
        otp_expires_at TEXT,
        otp_attempts INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS coupon_activity_logs (
        id TEXT PRIMARY KEY,
        coupon_code TEXT NOT NULL,
        customer_email TEXT NOT NULL DEFAULT '',
        event_type TEXT NOT NULL,
        status_snapshot TEXT NOT NULL,
        actor TEXT NOT NULL DEFAULT 'system',
        detail TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    .run();

  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS idx_welcome_coupons_code ON welcome_coupons(coupon_code)"
    )
    .run();
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS idx_welcome_coupons_created ON welcome_coupons(created_at DESC)"
    )
    .run();
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS idx_welcome_coupons_ip_created ON welcome_coupons(ip_hash, created_at DESC)"
    )
    .run();
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS idx_customer_vouchers_email ON customer_vouchers(normalized_email, created_at DESC)"
    )
    .run();
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS idx_customer_vouchers_code ON customer_vouchers(coupon_code)"
    )
    .run();
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS idx_coupon_activity_logs_created ON coupon_activity_logs(created_at DESC)"
    )
    .run();
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS idx_coupon_activity_logs_code ON coupon_activity_logs(coupon_code, created_at DESC)"
    )
    .run();

  schemaReady = true;
}

async function recordCouponActivity(
  db: MenuDb,
  entry: {
    couponCode: string;
    customerEmail?: string;
    eventType: CouponActivityEventType;
    statusSnapshot: string;
    actor?: string;
    detail?: string;
  }
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO coupon_activity_logs (
           id, coupon_code, customer_email, event_type, status_snapshot, actor, detail
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        crypto.randomUUID(),
        entry.couponCode,
        entry.customerEmail ?? "",
        entry.eventType,
        entry.statusSnapshot,
        entry.actor ?? "system",
        entry.detail ?? ""
      )
      .run();
  } catch {
    // Audit logging must never block customer or counter operations
  }
}

function toActivityLogRecord(row: RawActivityLogRow): CouponActivityLogRecord {
  return {
    id: row.id,
    couponCode: row.coupon_code,
    customerEmail: row.customer_email,
    eventType: row.event_type,
    statusSnapshot: row.status_snapshot,
    actor: row.actor,
    detail: row.detail,
    createdAt: row.created_at,
  };
}

/** Parses SQLite `YYYY-MM-DD HH:MM:SS` (UTC) into epoch ms. */
export function parseUtcSqliteDate(raw: string): number {
  const iso = raw.includes("T") ? raw : `${raw.replace(" ", "T")}Z`;
  return Date.parse(iso);
}

function toCouponRecord(
  row: RawCouponRow,
  source: CouponSource = "welcome",
  marketingFallback = false
): WelcomeCouponRecord {
  const expiresMs = parseUtcSqliteDate(row.expires_at);
  const isExpired = Number.isFinite(expiresMs) && expiresMs <= Date.now();
  const remainingUses = Math.max(0, row.max_uses - row.used_count);

  let effectiveStatus: CouponEffectiveStatus = row.status;
  if (row.status === "active") {
    if (remainingUses <= 0) {
      effectiveStatus = "redeemed";
    } else if (isExpired) {
      effectiveStatus = "expired";
    }
  }

  return {
    id: row.id,
    source,
    campaignType:
      source === "welcome" ? "welcome" : (row.campaign_type ?? "reward"),
    email: row.email,
    normalizedEmail: row.normalized_email,
    customerName: row.customer_name,
    couponCode: row.coupon_code,
    offerTitleZh: row.offer_title_zh,
    offerTitleEn: row.offer_title_en,
    discountLabelZh: row.discount_label_zh,
    discountLabelEn: row.discount_label_en,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    remainingUses,
    status: row.status,
    effectiveStatus,
    marketingOptIn:
      typeof row.marketing_opt_in === "number"
        ? row.marketing_opt_in === 1
        : marketingFallback,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    redeemedAt: row.redeemed_at,
    redeemedBy: row.redeemed_by,
    issuedBy: row.issued_by ?? null,
  };
}

export function normalizeCustomerEmail(raw: string): {
  normalized: string;
  domain: string;
} | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed.length > 254 || !EMAIL_RE.test(trimmed)) {
    return null;
  }
  const atIndex = trimmed.lastIndexOf("@");
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (!local || !domain || local.length < 2) return null;
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return null;

  if (domain === "gmail.com" || domain === "googlemail.com") {
    const plusIdx = local.indexOf("+");
    const baseLocal = (plusIdx >= 0 ? local.slice(0, plusIdx) : local).replace(
      /\./g,
      ""
    );
    if (baseLocal.length < 2) return null;
    return { normalized: `${baseLocal}@gmail.com`, domain: "gmail.com" };
  }

  return { normalized: `${local}@${domain}`, domain };
}

/**
 * Accepts both full `JBL-7K3M2A` and shorthand `7K3M2A` so staff at the counter
 * never have to type the `JBL-` prefix manually.
 */
export function normalizeCouponCode(raw: string): string | null {
  const clean = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (CODE_RE.test(clean)) return clean;
  if (RAW_CODE_BODY_RE.test(clean)) return `JBL-${clean}`;
  return null;
}

function generateRandomCouponCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (let i = 0; i < bytes.length; i += 1) {
    suffix += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return `JBL-${suffix}`;
}

async function isCouponCodeTaken(db: MenuDb, code: string): Promise<boolean> {
  const [w, v] = await Promise.all([
    db
      .prepare("SELECT 1 AS hit FROM welcome_coupons WHERE coupon_code = ?")
      .bind(code)
      .first<{ hit: number }>(),
    db
      .prepare("SELECT 1 AS hit FROM customer_vouchers WHERE coupon_code = ?")
      .bind(code)
      .first<{ hit: number }>(),
  ]);
  return Boolean(w || v);
}

async function verifyTurnstileIfConfigured(
  token: string | undefined
): Promise<boolean> {
  const secret = await getRuntimeEnv("TURNSTILE_SECRET_KEY");
  if (!secret) return true;
  if (!token?.trim()) return false;

  try {
    const formData = new URLSearchParams();
    formData.set("secret", secret);
    formData.set("response", token.trim());
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(4000),
      }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export async function isEmailOtpConfigured(): Promise<boolean> {
  const apiKey = await getRuntimeEnv("RESEND_API_KEY");
  return Boolean(apiKey);
}

async function sendCouponEmailIfConfigured(
  coupon: WelcomeCouponRecord
): Promise<boolean> {
  const apiKey = await getRuntimeEnv("RESEND_API_KEY");
  if (!apiKey) return false;

  const fromEmail =
    (await getRuntimeEnv("RESEND_FROM_EMAIL")) ||
    "Jian Bing Liu <onboarding@resend.dev>";

  const expiryDate = escapeHtml(coupon.expiresAt.slice(0, 10));
  const safeOfferEn = escapeHtml(coupon.offerTitleEn);
  const safeOfferZh = escapeHtml(coupon.offerTitleZh);
  const safeDiscountEn = escapeHtml(coupon.discountLabelEn);
  const safeDiscountZh = escapeHtml(coupon.discountLabelZh);
  const safeCode = escapeHtml(coupon.couponCode);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1c1816;">
      <h2 style="margin: 0 0 8px; color: #9c2d1d;">Jian Bing Liu 煎饼刘 · 124 Camden Rd</h2>
      <p style="margin: 0 0 16px; color: #5c514a;">${safeOfferEn} / ${safeOfferZh}</p>
      <div style="border: 2px dashed #c84b31; border-radius: 16px; padding: 20px; text-align: center; background: #fbf8f3;">
        <div style="font-size: 13px; font-weight: 700; color: #9c2d1d; letter-spacing: 0.08em; text-transform: uppercase;">
          ${safeDiscountEn} · ${safeDiscountZh}
        </div>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 0.14em; margin: 12px 0; color: #1c1816;">
          ${safeCode}
        </div>
        <div style="font-size: 13px; color: #5c514a;">
          Valid until / 有效期至: <strong>${expiryDate}</strong> · Walk-in counter orders £10+ only / 限到店柜台点餐满 £10 使用
        </div>
      </div>
      <p style="margin: 16px 0 0; font-size: 13px; color: #5c514a;">
        Manage all your vouchers anytime at <a href="https://jianbingliu.uk/my-coupons" style="color: #9c2d1d; font-weight: 600;">jianbingliu.uk/my-coupons</a>.<br/>
        随时访问 <a href="https://jianbingliu.uk/my-coupons" style="color: #9c2d1d; font-weight: 600;">jianbingliu.uk/my-coupons</a> 登录管理你的全部优惠券。
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [coupon.email],
        subject: `Your Jian Bing Liu Voucher: ${coupon.couponCode} (${coupon.discountLabelEn})`,
        html,
      }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function upsertWalletAccountOnIssue(
  db: MenuDb,
  params: {
    normalizedEmail: string;
    email: string;
    customerName: string;
    marketingOptIn?: boolean;
    pin?: string | null;
  }
): Promise<void> {
  const pinHash = params.pin
    ? await hashCustomerPin(params.normalizedEmail, params.pin)
    : null;
  const optInInt = params.marketingOptIn ? 1 : 0;

  await db
    .prepare(
      `INSERT INTO customer_wallet_accounts (
         normalized_email, email, customer_name, pin_hash, marketing_opt_in, updated_at
       ) VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(normalized_email) DO UPDATE SET
         email = excluded.email,
         customer_name = CASE WHEN excluded.customer_name != '' THEN excluded.customer_name ELSE customer_wallet_accounts.customer_name END,
         pin_hash = COALESCE(excluded.pin_hash, customer_wallet_accounts.pin_hash),
         marketing_opt_in = CASE WHEN excluded.marketing_opt_in = 1 THEN 1 ELSE customer_wallet_accounts.marketing_opt_in END,
         updated_at = datetime('now')`
    )
    .bind(
      params.normalizedEmail,
      params.email,
      params.customerName,
      pinHash,
      optInInt
    )
    .run();
}

export type ClaimCouponResult =
  | {
      ok: true;
      coupon: WelcomeCouponRecord;
      emailSent: boolean;
      restoredExisting?: boolean;
    }
  | {
      ok: false;
      reason:
        | "disabled"
        | "db_unavailable"
        | "invalid_email"
        | "invalid_pin"
        | "rate_limited"
        | "turnstile_failed"
        | "already_claimed"
        | "device_limit"
        | "internal_error";
      messageZh: string;
      messageEn: string;
    };

export async function claimWelcomeCoupon(input: {
  email: string;
  name?: string;
  pin?: string;
  marketingOptIn?: boolean;
  turnstileToken?: string;
  honeypot?: string;
  clientIp?: string | null;
  deviceCouponCode?: string | null;
}): Promise<ClaimCouponResult> {
  if (input.honeypot && input.honeypot.trim() !== "") {
    return {
      ok: false,
      reason: "rate_limited",
      messageZh: "请求过于频繁，请稍后再试。",
      messageEn: "Too many requests. Please try again later.",
    };
  }

  const rawPinTrimmed = input.pin?.trim() ?? "";
  const normalizedPin = rawPinTrimmed
    ? normalizeCustomerPin(rawPinTrimmed)
    : null;
  if (rawPinTrimmed && !normalizedPin) {
    return {
      ok: false,
      reason: "invalid_pin",
      messageZh: "取券密码请填写 4 至 8 位纯数字（如手机尾号后 4 位），或留空。",
      messageEn: "PIN must be 4–8 digits (or leave blank).",
    };
  }

  const ipHash = await hashClientIp(input.clientIp);
  if (!checkAndRecordIpBurst(ipHash)) {
    return {
      ok: false,
      reason: "rate_limited",
      messageZh: "操作过于频繁，请过几分钟再试。",
      messageEn: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const siteContent = await getSiteContent();
  const cfg = siteContent.welcomeCoupon;
  if (!cfg.enabled) {
    return {
      ok: false,
      reason: "disabled",
      messageZh: "新客优惠活动暂未开启。",
      messageEn: "This welcome offer is currently paused.",
    };
  }

  const parsedEmail = normalizeCustomerEmail(input.email);
  if (!parsedEmail) {
    return {
      ok: false,
      reason: "invalid_email",
      messageZh: "请输入真实有效的常用电子邮箱（不支持临时邮箱）。",
      messageEn:
        "Please enter a valid personal email address (burner emails are not accepted).",
    };
  }

  const mxValid = await hasValidMailExchange(parsedEmail.domain);
  if (!mxValid) {
    return {
      ok: false,
      reason: "invalid_email",
      messageZh: "该邮箱域名无法接收邮件，请检查是否拼写有误。",
      messageEn: "That email domain cannot receive mail. Please check for typos.",
    };
  }

  const turnstileOk = await verifyTurnstileIfConfigured(input.turnstileToken);
  if (!turnstileOk) {
    return {
      ok: false,
      reason: "turnstile_failed",
      messageZh: "人机验证未通过，请刷新后重试。",
      messageEn: "Verification check failed. Please try again.",
    };
  }

  const db = await getMenuDb();
  if (!db) {
    return {
      ok: false,
      reason: "db_unavailable",
      messageZh: "店铺数据库暂未连接，请稍后再试。",
      messageEn: "Coupon service is temporarily unavailable.",
    };
  }

  await ensureCouponsSchema(db);

  const cleanEmail = input.email.trim().slice(0, 254);
  const cleanName = (input.name ?? "").trim().slice(0, 80);

  // 1. Check if this device already holds a coupon via HttpOnly cookie
  const normalizedDeviceCode = input.deviceCouponCode
    ? normalizeCouponCode(input.deviceCouponCode)
    : null;
  if (normalizedDeviceCode) {
    const deviceRow = await db
      .prepare("SELECT * FROM welcome_coupons WHERE coupon_code = ?")
      .bind(normalizedDeviceCode)
      .first<RawCouponRow>();

    if (deviceRow) {
      const deviceCoupon = toCouponRecord(deviceRow, "welcome");
      if (
        deviceCoupon.normalizedEmail === parsedEmail.normalized &&
        deviceCoupon.effectiveStatus === "active"
      ) {
        await upsertWalletAccountOnIssue(db, {
          normalizedEmail: parsedEmail.normalized,
          email: deviceCoupon.email,
          customerName: cleanName || deviceCoupon.customerName,
          marketingOptIn: input.marketingOptIn,
          pin: normalizedPin,
        });
        return {
          ok: true,
          coupon: deviceCoupon,
          emailSent: false,
          restoredExisting: true,
        };
      }
      if (deviceCoupon.normalizedEmail !== parsedEmail.normalized) {
        return {
          ok: false,
          reason: "device_limit",
          messageZh:
            deviceCoupon.effectiveStatus === "active"
              ? `当前设备已领过新客券（${deviceCoupon.couponCode}），每人每台设备限享 1 次首单礼。`
              : "当前设备已使用过新客首单优惠，每人限享 1 次，感谢光临煎饼刘！",
          messageEn:
            deviceCoupon.effectiveStatus === "active"
              ? `This device already has an active welcome voucher (${deviceCoupon.couponCode}). Limit 1 per customer.`
              : "A welcome voucher has already been used on this device (limit 1 per customer).",
        };
      }
    }
  }

  // 2. Check if this email already claimed previously
  const existingRow = await db
    .prepare("SELECT * FROM welcome_coupons WHERE normalized_email = ?")
    .bind(parsedEmail.normalized)
    .first<RawCouponRow>();

  if (existingRow) {
    const existingCoupon = toCouponRecord(existingRow, "welcome");
    if (existingCoupon.effectiveStatus === "redeemed") {
      return {
        ok: false,
        reason: "already_claimed",
        messageZh: `该邮箱的新客立减券已于 ${existingCoupon.redeemedAt?.slice(0, 10) ?? "早前"} 到店核销使用过啦！你可前往「我的优惠券」页面登录查看历史记录。`,
        messageEn:
          "This email's welcome coupon has already been redeemed in-store. Visit My Coupons to view your wallet.",
      };
    }
    if (existingCoupon.effectiveStatus === "active") {
      const resent = await sendCouponEmailIfConfigured(existingCoupon);
      if (resent) {
        return {
          ok: false,
          reason: "already_claimed",
          messageZh:
            "该邮箱已领取过新客券！我们已将核销码重新发送至你的邮箱，你也可在「我的优惠券」登录查看。",
          messageEn:
            "Already claimed! We just re-sent your active voucher code to your inbox, or sign in on My Coupons.",
        };
      }
    }
    return {
      ok: false,
      reason: "already_claimed",
      messageZh:
        "该邮箱已领取过新客优惠券（每人限领 1 次）。如更换了手机，请前往「我的优惠券」输入邮箱与密码/券码登录找回！",
      messageEn:
        "Already claimed with this email. Sign in on the My Coupons page to access your wallet.",
    };
  }

  // 3. Enforce per-IP & global issuance caps
  if (ipHash) {
    const ipCounts = await db
      .prepare(
        `SELECT
           SUM(CASE WHEN created_at >= datetime('now', '-1 day') THEN 1 ELSE 0 END) AS day_count,
           SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS month_count
         FROM welcome_coupons
         WHERE ip_hash = ?`
      )
      .bind(ipHash)
      .first<{ day_count: number | null; month_count: number | null }>();

    if (
      Number(ipCounts?.day_count ?? 0) >= MAX_ISSUED_PER_IP_24H ||
      Number(ipCounts?.month_count ?? 0) >= MAX_ISSUED_PER_IP_30D
    ) {
      return {
        ok: false,
        reason: "rate_limited",
        messageZh:
          "当前网络今日领券次数已达上限（每位新客限领 1 张）。如在店内需要帮助请联系店员。",
        messageEn:
          "Claim limit reached for this network connection (limit 1 welcome offer per new customer).",
      };
    }
  }

  const globalDayCount = await db
    .prepare(
      "SELECT COUNT(*) AS cnt FROM welcome_coupons WHERE created_at >= datetime('now', '-1 day')"
    )
    .first<{ cnt: number }>();

  if (Number(globalDayCount?.cnt ?? 0) >= MAX_GLOBAL_ISSUED_PER_24H) {
    return {
      ok: false,
      reason: "rate_limited",
      messageZh: "今日新客线上立减券已抢完，欢迎明日再来领取！",
      messageEn:
        "Today's batch of online welcome vouchers has been fully claimed. Please check back tomorrow!",
    };
  }

  const optIn = input.marketingOptIn ? 1 : 0;
  const validDays = Math.min(365, Math.max(1, Math.round(cfg.validDays || 14)));
  const maxUses = Math.min(10, Math.max(1, Math.round(cfg.maxUses || 1)));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = crypto.randomUUID();
    const code = generateRandomCouponCode();
    if (await isCouponCodeTaken(db, code)) {
      continue;
    }

    try {
      const inserted = await db
        .prepare(
          `INSERT INTO welcome_coupons (
             id, email, normalized_email, customer_name, coupon_code,
             offer_title_zh, offer_title_en, discount_label_zh, discount_label_en,
             max_uses, used_count, status, marketing_opt_in, expires_at, ip_hash
           )
           VALUES (
             ?, ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, 0, 'active', ?, datetime('now', '+' || ? || ' days'), ?
           )
           RETURNING *`
        )
        .bind(
          id,
          cleanEmail,
          parsedEmail.normalized,
          cleanName,
          code,
          cfg.title.zh,
          cfg.title.en,
          cfg.discountLabel.zh,
          cfg.discountLabel.en,
          maxUses,
          optIn,
          String(validDays),
          ipHash
        )
        .first<RawCouponRow>();

      if (inserted) {
        const record = toCouponRecord(inserted, "welcome");
        await Promise.all([
          upsertWalletAccountOnIssue(db, {
            normalizedEmail: parsedEmail.normalized,
            email: cleanEmail,
            customerName: cleanName,
            marketingOptIn: Boolean(input.marketingOptIn),
            pin: normalizedPin,
          }),
          recordCouponActivity(db, {
            couponCode: record.couponCode,
            customerEmail: record.email,
            eventType: "issued",
            statusSnapshot: "active",
            actor: "顾客线上领券",
            detail: `领取新客首单券：${record.discountLabelZh}（有效期至 ${record.expiresAt.slice(0, 10)}）`,
          }),
        ]);
        const emailSent = await sendCouponEmailIfConfigured(record);
        return { ok: true, coupon: record, emailSent };
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("normalized_email")) {
        return {
          ok: false,
          reason: "already_claimed",
          messageZh: "该邮箱已领取过新客优惠券，每人限领一次。",
          messageEn:
            "A welcome coupon has already been claimed with this email (limit 1 per customer).",
        };
      }
      if (msg.includes("coupon_code") && attempt < 4) {
        continue;
      }
      break;
    }
  }

  return {
    ok: false,
    reason: "internal_error",
    messageZh: "发券失败，请稍后重试。",
    messageEn: "Could not issue coupon right now. Please try again.",
  };
}

async function findCouponAcrossTables(
  db: MenuDb,
  code: string
): Promise<WelcomeCouponRecord | null> {
  const welcomeRow = await db
    .prepare("SELECT * FROM welcome_coupons WHERE coupon_code = ?")
    .bind(code)
    .first<RawCouponRow>();
  if (welcomeRow) {
    return toCouponRecord(welcomeRow, "welcome");
  }

  const voucherRow = await db
    .prepare("SELECT * FROM customer_vouchers WHERE coupon_code = ?")
    .bind(code)
    .first<RawCouponRow>();
  if (voucherRow) {
    return toCouponRecord(voucherRow, "voucher");
  }

  return null;
}

export async function lookupCouponByCode(
  rawCode: string,
  options?: { recordScanByStaff?: string }
): Promise<WelcomeCouponRecord | null> {
  const code = normalizeCouponCode(rawCode);
  if (!code) return null;
  const db = await getMenuDb();
  if (!db) return null;
  await ensureCouponsSchema(db);

  const found = await findCouponAcrossTables(db, code);
  const staff = options?.recordScanByStaff?.trim();

  if (staff) {
    if (!found) {
      await recordCouponActivity(db, {
        couponCode: code,
        customerEmail: "",
        eventType: "scanned_invalid",
        statusSnapshot: "invalid",
        actor: staff,
        detail: "柜台扫码/查询拦截：系统内查无此券码（疑似输错或假截图）",
      });
    } else if (found.effectiveStatus === "active") {
      await recordCouponActivity(db, {
        couponCode: found.couponCode,
        customerEmail: found.email,
        eventType: "scanned_valid",
        statusSnapshot: "active",
        actor: staff,
        detail: `柜台扫码验真通过：未使用过（${found.discountLabelZh}）`,
      });
    } else if (found.effectiveStatus === "redeemed") {
      await recordCouponActivity(db, {
        couponCode: found.couponCode,
        customerEmail: found.email,
        eventType: "scanned_used",
        statusSnapshot: "redeemed",
        actor: staff,
        detail: `柜台扫码自动拦截：该券已于 ${found.redeemedAt ?? "早前"} 使用过`,
      });
    } else if (found.effectiveStatus === "expired") {
      await recordCouponActivity(db, {
        couponCode: found.couponCode,
        customerEmail: found.email,
        eventType: "scanned_expired",
        statusSnapshot: "expired",
        actor: staff,
        detail: `柜台扫码自动拦截：该券已于 ${found.expiresAt.slice(0, 10)} 过期`,
      });
    } else {
      await recordCouponActivity(db, {
        couponCode: found.couponCode,
        customerEmail: found.email,
        eventType: "scanned_void",
        statusSnapshot: "void",
        actor: staff,
        detail: "柜台扫码自动拦截：该券处于已作废状态",
      });
    }
  }

  return found;
}

export type RedeemCouponResult =
  | { ok: true; coupon: WelcomeCouponRecord }
  | {
      ok: false;
      reason:
        | "db_unavailable"
        | "invalid_code"
        | "not_found"
        | "expired"
        | "exhausted"
        | "void";
      message: string;
      coupon?: WelcomeCouponRecord;
    };

export async function redeemCouponAtomic(
  rawCode: string,
  staffIdentity: string
): Promise<RedeemCouponResult> {
  const code = normalizeCouponCode(rawCode);
  if (!code) {
    return {
      ok: false,
      reason: "invalid_code",
      message: "核销码格式不正确（请输入 6 位券码或完整 JBL-XXXXXX）。",
    };
  }

  const db = await getMenuDb();
  if (!db) {
    return {
      ok: false,
      reason: "db_unavailable",
      message: "未连接到 Cloudflare D1 数据库。",
    };
  }

  await ensureCouponsSchema(db);

  // 1. Try atomic update on welcome_coupons
  const updatedWelcome = await db
    .prepare(
      `UPDATE welcome_coupons
       SET used_count = used_count + 1,
           status = CASE WHEN used_count + 1 >= max_uses THEN 'redeemed' ELSE 'active' END,
           redeemed_at = datetime('now'),
           redeemed_by = ?
       WHERE coupon_code = ?
         AND status = 'active'
         AND used_count < max_uses
         AND expires_at > datetime('now')
       RETURNING *`
    )
    .bind(staffIdentity, code)
    .first<RawCouponRow>();

  if (updatedWelcome) {
    const record = toCouponRecord(updatedWelcome, "welcome");
    await recordCouponActivity(db, {
      couponCode: record.couponCode,
      customerEmail: record.email,
      eventType: "redeemed",
      statusSnapshot: record.effectiveStatus,
      actor: staffIdentity,
      detail: `柜台核销成功：${record.discountLabelZh}（第 ${record.usedCount}/${record.maxUses} 次）`,
    });
    return { ok: true, coupon: record };
  }

  // 2. Try atomic update on customer_vouchers
  const updatedVoucher = await db
    .prepare(
      `UPDATE customer_vouchers
       SET used_count = used_count + 1,
           status = CASE WHEN used_count + 1 >= max_uses THEN 'redeemed' ELSE 'active' END,
           redeemed_at = datetime('now'),
           redeemed_by = ?
       WHERE coupon_code = ?
         AND status = 'active'
         AND used_count < max_uses
         AND expires_at > datetime('now')
       RETURNING *`
    )
    .bind(staffIdentity, code)
    .first<RawCouponRow>();

  if (updatedVoucher) {
    const record = toCouponRecord(updatedVoucher, "voucher");
    await recordCouponActivity(db, {
      couponCode: record.couponCode,
      customerEmail: record.email,
      eventType: "redeemed",
      statusSnapshot: record.effectiveStatus,
      actor: staffIdentity,
      detail: `柜台核销成功：${record.discountLabelZh}（第 ${record.usedCount}/${record.maxUses} 次）`,
    });
    return { ok: true, coupon: record };
  }

  const existing = await findCouponAcrossTables(db, code);
  if (!existing) {
    await recordCouponActivity(db, {
      couponCode: code,
      customerEmail: "",
      eventType: "scanned_invalid",
      statusSnapshot: "invalid",
      actor: staffIdentity,
      detail: "核销失败：查无此券码",
    });
    return {
      ok: false,
      reason: "not_found",
      message: `查无此券码（${code}），谨防伪造截图！`,
    };
  }

  if (existing.effectiveStatus === "void") {
    await recordCouponActivity(db, {
      couponCode: existing.couponCode,
      customerEmail: existing.email,
      eventType: "scanned_void",
      statusSnapshot: "void",
      actor: staffIdentity,
      detail: "重复核销拦截：该券已作废",
    });
    return {
      ok: false,
      reason: "void",
      message: `此券（${code}）已被作废，切勿减免！`,
      coupon: existing,
    };
  }

  if (existing.effectiveStatus === "redeemed") {
    await recordCouponActivity(db, {
      couponCode: existing.couponCode,
      customerEmail: existing.email,
      eventType: "scanned_used",
      statusSnapshot: "redeemed",
      actor: staffIdentity,
      detail: `重复核销拦截：该券已于 ${existing.redeemedAt ?? "早前"} 用过`,
    });
    return {
      ok: false,
      reason: "exhausted",
      message: `此券已于 ${existing.redeemedAt ?? "早前"} 核销用过了（${existing.usedCount}/${existing.maxUses} 次），切勿重复减免！`,
      coupon: existing,
    };
  }

  await recordCouponActivity(db, {
    couponCode: existing.couponCode,
    customerEmail: existing.email,
    eventType: "scanned_expired",
    statusSnapshot: "expired",
    actor: staffIdentity,
    detail: `过期核销拦截：该券已于 ${existing.expiresAt.slice(0, 10)} 过期`,
  });
  return {
    ok: false,
    reason: "expired",
    message: `此券已于 ${existing.expiresAt.slice(0, 10)} 过期，无法使用！`,
    coupon: existing,
  };
}

/**
 * Allows store staff to undo an accidental tap of "Redeem" so Mom never worries about a slip of the finger.
 */
export async function unredeemCouponByCode(
  rawCode: string,
  staffIdentity: string
): Promise<{ ok: boolean; coupon?: WelcomeCouponRecord; message: string }> {
  const code = normalizeCouponCode(rawCode);
  if (!code) {
    return { ok: false, message: "核销码格式不正确。" };
  }
  const db = await getMenuDb();
  if (!db) {
    return { ok: false, message: "未连接到 Cloudflare D1 数据库。" };
  }
  await ensureCouponsSchema(db);

  const updatedWelcome = await db
    .prepare(
      `UPDATE welcome_coupons
       SET used_count = MAX(0, used_count - 1),
           status = 'active',
           redeemed_at = CASE WHEN used_count - 1 <= 0 THEN NULL ELSE redeemed_at END,
           redeemed_by = ?
       WHERE coupon_code = ?
         AND used_count > 0
         AND status != 'void'
       RETURNING *`
    )
    .bind(`undo:${staffIdentity}`, code)
    .first<RawCouponRow>();

  if (updatedWelcome) {
    const record = toCouponRecord(updatedWelcome, "welcome");
    await recordCouponActivity(db, {
      couponCode: record.couponCode,
      customerEmail: record.email,
      eventType: "unredeemed",
      statusSnapshot: record.effectiveStatus,
      actor: staffIdentity,
      detail: "店员撤销刚刚的误核销，已恢复为未使用状态",
    });
    return {
      ok: true,
      coupon: record,
      message: `已撤销误操作，${code} 已恢复为「未使用过」状态！`,
    };
  }

  const updatedVoucher = await db
    .prepare(
      `UPDATE customer_vouchers
       SET used_count = MAX(0, used_count - 1),
           status = 'active',
           redeemed_at = CASE WHEN used_count - 1 <= 0 THEN NULL ELSE redeemed_at END,
           redeemed_by = ?
       WHERE coupon_code = ?
         AND used_count > 0
         AND status != 'void'
       RETURNING *`
    )
    .bind(`undo:${staffIdentity}`, code)
    .first<RawCouponRow>();

  if (updatedVoucher) {
    const record = toCouponRecord(updatedVoucher, "voucher");
    await recordCouponActivity(db, {
      couponCode: record.couponCode,
      customerEmail: record.email,
      eventType: "unredeemed",
      statusSnapshot: record.effectiveStatus,
      actor: staffIdentity,
      detail: "店员撤销刚刚的误核销，已恢复为未使用状态",
    });
    return {
      ok: true,
      coupon: record,
      message: `已撤销误操作，${code} 已恢复为「未使用过」状态！`,
    };
  }

  const existing = await findCouponAcrossTables(db, code);
  if (!existing) return { ok: false, message: `找不到核销码 ${code}。` };
  return { ok: false, coupon: existing, message: "该券当前没有可撤销的核销记录。" };
}

export async function voidCouponByCode(
  rawCode: string,
  staffIdentity: string
): Promise<{ ok: boolean; coupon?: WelcomeCouponRecord; message: string }> {
  const code = normalizeCouponCode(rawCode);
  if (!code) {
    return { ok: false, message: "核销码格式不正确。" };
  }
  const db = await getMenuDb();
  if (!db) {
    return { ok: false, message: "未连接到 Cloudflare D1 数据库。" };
  }
  await ensureCouponsSchema(db);

  const updatedWelcome = await db
    .prepare(
      `UPDATE welcome_coupons
       SET status = 'void',
           redeemed_by = COALESCE(redeemed_by, ?)
       WHERE coupon_code = ? AND status != 'void'
       RETURNING *`
    )
    .bind(staffIdentity, code)
    .first<RawCouponRow>();

  if (updatedWelcome) {
    const record = toCouponRecord(updatedWelcome, "welcome");
    await recordCouponActivity(db, {
      couponCode: record.couponCode,
      customerEmail: record.email,
      eventType: "voided",
      statusSnapshot: "void",
      actor: staffIdentity,
      detail: "店员手动永久作废该优惠券",
    });
    return {
      ok: true,
      coupon: record,
      message: `已作废核销码 ${code}。`,
    };
  }

  const updatedVoucher = await db
    .prepare(
      `UPDATE customer_vouchers
       SET status = 'void',
           redeemed_by = COALESCE(redeemed_by, ?)
       WHERE coupon_code = ? AND status != 'void'
       RETURNING *`
    )
    .bind(staffIdentity, code)
    .first<RawCouponRow>();

  if (updatedVoucher) {
    const record = toCouponRecord(updatedVoucher, "voucher");
    await recordCouponActivity(db, {
      couponCode: record.couponCode,
      customerEmail: record.email,
      eventType: "voided",
      statusSnapshot: "void",
      actor: staffIdentity,
      detail: "店员手动永久作废该优惠券",
    });
    return {
      ok: true,
      coupon: record,
      message: `已作废核销码 ${code}。`,
    };
  }

  const existing = await findCouponAcrossTables(db, code);
  if (!existing) return { ok: false, message: `找不到核销码 ${code}。` };
  return { ok: false, coupon: existing, message: "该核销码已是作废状态。" };
}

export async function issueCustomerVoucherByAdmin(input: {
  email: string;
  customerName?: string;
  campaignType?: string;
  offerTitleZh: string;
  offerTitleEn: string;
  discountLabelZh: string;
  discountLabelEn: string;
  validDays?: number;
  maxUses?: number;
  staffIdentity: string;
}): Promise<{
  ok: boolean;
  coupon?: WelcomeCouponRecord;
  emailSent?: boolean;
  message: string;
}> {
  const parsedEmail = normalizeCustomerEmail(input.email);
  if (!parsedEmail) {
    return { ok: false, message: "请输入有效的顾客电子邮箱。" };
  }
  const offerTitleZh = input.offerTitleZh.trim().slice(0, 100);
  const discountLabelZh = input.discountLabelZh.trim().slice(0, 60);
  if (!offerTitleZh || !discountLabelZh) {
    return { ok: false, message: "请填写优惠券标题与立减金额标签。" };
  }
  const offerTitleEn =
    input.offerTitleEn.trim().slice(0, 100) || offerTitleZh;
  const discountLabelEn =
    input.discountLabelEn.trim().slice(0, 60) || discountLabelZh;

  const db = await getMenuDb();
  if (!db) {
    return { ok: false, message: "未连接到 Cloudflare D1 数据库。" };
  }
  await ensureCouponsSchema(db);

  const cleanEmail = input.email.trim().slice(0, 254);
  const cleanName = (input.customerName ?? "").trim().slice(0, 80);
  const campaignType = (input.campaignType ?? "vip").trim().slice(0, 32) || "vip";
  const validDays = Math.min(365, Math.max(1, Math.round(input.validDays || 30)));
  const maxUses = Math.min(20, Math.max(1, Math.round(input.maxUses || 1)));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = crypto.randomUUID();
    const code = generateRandomCouponCode();
    if (await isCouponCodeTaken(db, code)) continue;

    try {
      const inserted = await db
        .prepare(
          `INSERT INTO customer_vouchers (
             id, campaign_type, email, normalized_email, customer_name, coupon_code,
             offer_title_zh, offer_title_en, discount_label_zh, discount_label_en,
             max_uses, used_count, status, expires_at, issued_by
           ) VALUES (
             ?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, 0, 'active', datetime('now', '+' || ? || ' days'), ?
           )
           RETURNING *`
        )
        .bind(
          id,
          campaignType,
          cleanEmail,
          parsedEmail.normalized,
          cleanName,
          code,
          offerTitleZh,
          offerTitleEn,
          discountLabelZh,
          discountLabelEn,
          maxUses,
          String(validDays),
          input.staffIdentity
        )
        .first<RawCouponRow>();

      if (inserted) {
        const record = toCouponRecord(inserted, "voucher");
        await Promise.all([
          upsertWalletAccountOnIssue(db, {
            normalizedEmail: parsedEmail.normalized,
            email: cleanEmail,
            customerName: cleanName,
          }),
          recordCouponActivity(db, {
            couponCode: record.couponCode,
            customerEmail: record.email,
            eventType: "admin_issued",
            statusSnapshot: "active",
            actor: input.staffIdentity,
            detail: `后台派发专属券：${record.discountLabelZh}（${record.offerTitleZh}）`,
          }),
        ]);
        const emailSent = await sendCouponEmailIfConfigured(record);
        return {
          ok: true,
          coupon: record,
          emailSent,
          message: `已成功为 ${cleanEmail} 派发优惠券 ${record.couponCode}！顾客登录「我的优惠券」即可看到。`,
        };
      }
    } catch {
      continue;
    }
  }

  return { ok: false, message: "派发优惠券失败，请重试。" };
}

export async function listCouponActivityLogs(
  limit = 80
): Promise<CouponActivityLogRecord[]> {
  const db = await getMenuDb();
  if (!db) return [];
  await ensureCouponsSchema(db);

  const safeLimit = Math.min(250, Math.max(1, Math.round(limit)));
  const rows = await db
    .prepare(
      "SELECT * FROM coupon_activity_logs ORDER BY created_at DESC LIMIT ?"
    )
    .bind(safeLimit)
    .all<RawActivityLogRow>();

  return (rows.results ?? []).map(toActivityLogRecord);
}

export async function listWelcomeCoupons(limit = 150): Promise<{
  writable: boolean;
  coupons: WelcomeCouponRecord[];
  stats: CouponStatsSummary;
  logs: CouponActivityLogRecord[];
}> {
  const db = await getMenuDb();
  if (!db) {
    return {
      writable: false,
      coupons: [],
      stats: {
        total: 0,
        active: 0,
        redeemed: 0,
        expired: 0,
        voided: 0,
        todayRedeemed: 0,
      },
      logs: [],
    };
  }

  await ensureCouponsSchema(db);

  const safeLimit = Math.min(300, Math.max(1, Math.round(limit)));
  const [welcomeRows, voucherRows, logRows, welcomeStats, voucherStats] =
    await Promise.all([
      db
        .prepare(
          "SELECT * FROM welcome_coupons ORDER BY created_at DESC LIMIT ?"
        )
        .bind(safeLimit)
        .all<RawCouponRow>(),
      db
        .prepare(
          "SELECT * FROM customer_vouchers ORDER BY created_at DESC LIMIT ?"
        )
        .bind(safeLimit)
        .all<RawCouponRow>(),
      db
        .prepare(
          "SELECT * FROM coupon_activity_logs ORDER BY created_at DESC LIMIT 100"
        )
        .all<RawActivityLogRow>(),
      db
        .prepare(
          `SELECT
             COUNT(*) AS total,
             SUM(CASE WHEN status = 'active' AND used_count < max_uses AND expires_at > datetime('now') THEN 1 ELSE 0 END) AS active,
             SUM(CASE WHEN status = 'redeemed' OR (status = 'active' AND used_count >= max_uses) THEN 1 ELSE 0 END) AS redeemed,
             SUM(CASE WHEN status = 'active' AND used_count < max_uses AND expires_at <= datetime('now') THEN 1 ELSE 0 END) AS expired,
             SUM(CASE WHEN status = 'void' THEN 1 ELSE 0 END) AS voided,
             SUM(CASE WHEN redeemed_at >= date('now') THEN 1 ELSE 0 END) AS today_redeemed
           FROM welcome_coupons`
        )
        .first<{
          total: number;
          active: number | null;
          redeemed: number | null;
          expired: number | null;
          voided: number | null;
          today_redeemed: number | null;
        }>(),
      db
        .prepare(
          `SELECT
             COUNT(*) AS total,
             SUM(CASE WHEN status = 'active' AND used_count < max_uses AND expires_at > datetime('now') THEN 1 ELSE 0 END) AS active,
             SUM(CASE WHEN status = 'redeemed' OR (status = 'active' AND used_count >= max_uses) THEN 1 ELSE 0 END) AS redeemed,
             SUM(CASE WHEN status = 'active' AND used_count < max_uses AND expires_at <= datetime('now') THEN 1 ELSE 0 END) AS expired,
             SUM(CASE WHEN status = 'void' THEN 1 ELSE 0 END) AS voided,
             SUM(CASE WHEN redeemed_at >= date('now') THEN 1 ELSE 0 END) AS today_redeemed
           FROM customer_vouchers`
        )
        .first<{
          total: number;
          active: number | null;
          redeemed: number | null;
          expired: number | null;
          voided: number | null;
          today_redeemed: number | null;
        }>(),
    ]);

  const combined = [
    ...(welcomeRows.results ?? []).map((r) => toCouponRecord(r, "welcome")),
    ...(voucherRows.results ?? []).map((r) => toCouponRecord(r, "voucher")),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, safeLimit);

  return {
    writable: true,
    coupons: combined,
    stats: {
      total: Number(welcomeStats?.total ?? 0) + Number(voucherStats?.total ?? 0),
      active:
        Number(welcomeStats?.active ?? 0) + Number(voucherStats?.active ?? 0),
      redeemed:
        Number(welcomeStats?.redeemed ?? 0) +
        Number(voucherStats?.redeemed ?? 0),
      expired:
        Number(welcomeStats?.expired ?? 0) + Number(voucherStats?.expired ?? 0),
      voided:
        Number(welcomeStats?.voided ?? 0) + Number(voucherStats?.voided ?? 0),
      todayRedeemed:
        Number(welcomeStats?.today_redeemed ?? 0) +
        Number(voucherStats?.today_redeemed ?? 0),
    },
    logs: (logRows.results ?? []).map(toActivityLogRecord),
  };
}

/* ───────────────────── Customer Self-Service Wallet & Login ───────────────────── */

export async function getCustomerWalletSnapshot(
  normalizedEmail: string
): Promise<CustomerWalletSnapshot | null> {
  const db = await getMenuDb();
  if (!db) return null;
  await ensureCouponsSchema(db);

  const [accountRow, welcomeRow, voucherRows, activityRows] = await Promise.all([
    db
      .prepare(
        "SELECT * FROM customer_wallet_accounts WHERE normalized_email = ?"
      )
      .bind(normalizedEmail)
      .first<RawWalletAccountRow>(),
    db
      .prepare("SELECT * FROM welcome_coupons WHERE normalized_email = ?")
      .bind(normalizedEmail)
      .first<RawCouponRow>(),
    db
      .prepare(
        "SELECT * FROM customer_vouchers WHERE normalized_email = ? ORDER BY created_at DESC"
      )
      .bind(normalizedEmail)
      .all<RawCouponRow>(),
    db
      .prepare(
        `SELECT * FROM coupon_activity_logs
         WHERE LOWER(customer_email) = ?
            OR coupon_code IN (
              SELECT coupon_code FROM welcome_coupons WHERE normalized_email = ?
              UNION
              SELECT coupon_code FROM customer_vouchers WHERE normalized_email = ?
            )
         ORDER BY created_at DESC
         LIMIT 40`
      )
      .bind(normalizedEmail, normalizedEmail, normalizedEmail)
      .all<RawActivityLogRow>(),
  ]);

  const optInFallback = accountRow
    ? accountRow.marketing_opt_in === 1
    : welcomeRow
      ? welcomeRow.marketing_opt_in === 1
      : false;

  const coupons: WelcomeCouponRecord[] = [];
  if (welcomeRow) {
    coupons.push(toCouponRecord(welcomeRow, "welcome", optInFallback));
  }
  for (const row of voucherRows.results ?? []) {
    coupons.push(toCouponRecord(row, "voucher", optInFallback));
  }

  if (!accountRow && coupons.length === 0) {
    return null;
  }

  // Sort: active first, then redeemed, then expired/void, newest first
  const statusRank: Record<CouponEffectiveStatus, number> = {
    active: 0,
    redeemed: 1,
    expired: 2,
    void: 3,
  };
  coupons.sort((a, b) => {
    const rankDiff = statusRank[a.effectiveStatus] - statusRank[b.effectiveStatus];
    if (rankDiff !== 0) return rankDiff;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const displayEmail =
    accountRow?.email || coupons[0]?.email || normalizedEmail;
  const customerName =
    accountRow?.customer_name || coupons[0]?.customerName || "";

  return {
    email: displayEmail,
    normalizedEmail,
    customerName,
    hasPin: Boolean(accountRow?.pin_hash),
    marketingOptIn: optInFallback,
    coupons,
    activities: (activityRows.results ?? []).map(toActivityLogRecord),
  };
}

export async function resolveWalletFromDeviceCookie(
  deviceCouponCode: string | null | undefined
): Promise<CustomerWalletSnapshot | null> {
  if (!deviceCouponCode) return null;
  const code = normalizeCouponCode(deviceCouponCode);
  if (!code) return null;
  const db = await getMenuDb();
  if (!db) return null;
  await ensureCouponsSchema(db);

  const found = await findCouponAcrossTables(db, code);
  if (!found) return null;
  return getCustomerWalletSnapshot(found.normalizedEmail);
}

export async function requestCustomerWalletOtp(input: {
  email: string;
  clientIp?: string | null;
}): Promise<{
  ok: boolean;
  messageZh: string;
  messageEn: string;
}> {
  const apiKey = await getRuntimeEnv("RESEND_API_KEY");
  if (!apiKey) {
    return {
      ok: false,
      messageZh:
        "当前未开启邮件验证码通道，请直接使用「取券密码」或任意一张「6 位优惠券码」登录。",
      messageEn:
        "Email OTP is not enabled. Please sign in with your PIN or any 6-character voucher code.",
    };
  }

  const ipHash = await hashClientIp(input.clientIp);
  if (
    !checkSlidingWindow(
      authIpBurstTracker,
      ipHash,
      AUTH_WINDOW_MS,
      AUTH_MAX_IP_ATTEMPTS,
      true
    )
  ) {
    return {
      ok: false,
      messageZh: "请求过于频繁，请稍后再试。",
      messageEn: "Too many attempts. Please wait a few minutes.",
    };
  }

  const parsedEmail = normalizeCustomerEmail(input.email);
  if (!parsedEmail) {
    return {
      ok: false,
      messageZh: "请输入有效的电子邮箱。",
      messageEn: "Please enter a valid email address.",
    };
  }

  const db = await getMenuDb();
  if (!db) {
    return {
      ok: false,
      messageZh: "数据库暂未连接，请稍后再试。",
      messageEn: "Service temporarily unavailable.",
    };
  }
  await ensureCouponsSchema(db);

  const snapshot = await getCustomerWalletSnapshot(parsedEmail.normalized);
  if (!snapshot) {
    return {
      ok: false,
      messageZh: "该邮箱暂未领取过优惠券，请先免费领取新客首单券！",
      messageEn: "No coupons found for this email yet. Claim your welcome offer first!",
    };
  }

  const otpBytes = new Uint8Array(4);
  crypto.getRandomValues(otpBytes);
  const num =
    (((otpBytes[0] << 24) |
      (otpBytes[1] << 16) |
      (otpBytes[2] << 8) |
      otpBytes[3]) >>>
      0) %
    1000000;
  const otpCode = String(num).padStart(6, "0");
  const otpHash = await hashEmailOtp(parsedEmail.normalized, otpCode);

  await db
    .prepare(
      `INSERT INTO customer_wallet_accounts (
         normalized_email, email, customer_name, marketing_opt_in, otp_hash, otp_expires_at, otp_attempts, updated_at
       ) VALUES (?, ?, ?, ?, ?, datetime('now', '+10 minutes'), 0, datetime('now'))
       ON CONFLICT(normalized_email) DO UPDATE SET
         otp_hash = excluded.otp_hash,
         otp_expires_at = datetime('now', '+10 minutes'),
         otp_attempts = 0,
         updated_at = datetime('now')`
    )
    .bind(
      parsedEmail.normalized,
      snapshot.email,
      snapshot.customerName,
      snapshot.marketingOptIn ? 1 : 0,
      otpHash
    )
    .run();

  const fromEmail =
    (await getRuntimeEnv("RESEND_FROM_EMAIL")) ||
    "Jian Bing Liu <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [snapshot.email],
        subject: `${otpCode} — Jian Bing Liu 煎饼刘登录验证码`,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #1c1816;">
          <h3 style="color: #9c2d1d; margin: 0 0 8px;">Jian Bing Liu 煎饼刘 · 我的优惠券登录</h3>
          <p style="margin: 0 0 12px;">Your 6-digit verification code / 你的 6 位登录验证码：</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 0.2em; padding: 14px 20px; background: #fbf6ec; border-radius: 12px; display: inline-block;">${otpCode}</div>
          <p style="margin: 12px 0 0; font-size: 12px; color: #6e6258;">Valid for 10 minutes / 10 分钟内有效。</p>
        </div>`,
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error("Resend failed");
    return {
      ok: true,
      messageZh: "6 位验证码已发送至你的邮箱，请在 10 分钟内输入。",
      messageEn: "A 6-digit code has been sent to your email (valid for 10 minutes).",
    };
  } catch {
    return {
      ok: false,
      messageZh: "邮件发送失败，请改用「取券密码」或「优惠券码」登录。",
      messageEn: "Could not send email code. Please sign in with your PIN or voucher code.",
    };
  }
}

export async function authenticateCustomerWallet(input: {
  email: string;
  credential?: string;
  otpCode?: string;
  clientIp?: string | null;
}): Promise<
  | { ok: true; wallet: CustomerWalletSnapshot }
  | { ok: false; status: number; messageZh: string; messageEn: string }
> {
  const ipHash = await hashClientIp(input.clientIp);
  if (
    !checkSlidingWindow(
      authIpBurstTracker,
      ipHash,
      AUTH_WINDOW_MS,
      AUTH_MAX_IP_ATTEMPTS,
      true
    )
  ) {
    return {
      ok: false,
      status: 429,
      messageZh: "登录尝试过于频繁，请过 15 分钟再试。",
      messageEn: "Too many login attempts. Please try again in 15 minutes.",
    };
  }

  const parsedEmail = normalizeCustomerEmail(input.email);
  if (!parsedEmail) {
    return {
      ok: false,
      status: 400,
      messageZh: "请输入正确的电子邮箱地址。",
      messageEn: "Please enter a valid email address.",
    };
  }

  if (
    !checkSlidingWindow(
      authEmailFailureTracker,
      parsedEmail.normalized,
      AUTH_WINDOW_MS,
      AUTH_MAX_EMAIL_FAILURES,
      false
    )
  ) {
    return {
      ok: false,
      status: 429,
      messageZh: "该账号输错次数过多，已临时保护锁定 15 分钟。",
      messageEn: "Too many failed attempts for this email. Locked for 15 minutes.",
    };
  }

  const db = await getMenuDb();
  if (!db) {
    return {
      ok: false,
      status: 503,
      messageZh: "数据库暂未连接，请稍后再试。",
      messageEn: "Wallet service is temporarily unavailable.",
    };
  }
  await ensureCouponsSchema(db);

  const wallet = await getCustomerWalletSnapshot(parsedEmail.normalized);
  if (!wallet) {
    checkSlidingWindow(
      authEmailFailureTracker,
      parsedEmail.normalized,
      AUTH_WINDOW_MS,
      AUTH_MAX_EMAIL_FAILURES,
      true
    );
    return {
      ok: false,
      status: 404,
      messageZh:
        "未找到该邮箱的优惠券账户。如果你是首次光临，请点击下方「免费领取新客立减券」！",
      messageEn:
        "No coupon wallet found for this email. Claim your first-visit welcome voucher below!",
    };
  }

  const accountRow = await db
    .prepare(
      "SELECT * FROM customer_wallet_accounts WHERE normalized_email = ?"
    )
    .bind(parsedEmail.normalized)
    .first<RawWalletAccountRow>();

  // Mode A: 6-digit Email OTP verification
  if (input.otpCode && input.otpCode.trim() !== "") {
    const cleanOtp = input.otpCode.trim();
    const expectedHash = await hashEmailOtp(parsedEmail.normalized, cleanOtp);
    const expiresMs = accountRow?.otp_expires_at
      ? parseUtcSqliteDate(accountRow.otp_expires_at)
      : 0;

    if (
      accountRow?.otp_hash &&
      accountRow.otp_hash === expectedHash &&
      expiresMs > Date.now() &&
      accountRow.otp_attempts < 5
    ) {
      await db
        .prepare(
          "UPDATE customer_wallet_accounts SET otp_hash = NULL, otp_expires_at = NULL, otp_attempts = 0 WHERE normalized_email = ?"
        )
        .bind(parsedEmail.normalized)
        .run();
      authEmailFailureTracker.delete(parsedEmail.normalized);
      return { ok: true, wallet };
    }

    if (accountRow) {
      await db
        .prepare(
          "UPDATE customer_wallet_accounts SET otp_attempts = otp_attempts + 1 WHERE normalized_email = ?"
        )
        .bind(parsedEmail.normalized)
        .run();
    }
    checkSlidingWindow(
      authEmailFailureTracker,
      parsedEmail.normalized,
      AUTH_WINDOW_MS,
      AUTH_MAX_EMAIL_FAILURES,
      true
    );
    return {
      ok: false,
      status: 401,
      messageZh: "邮箱验证码不正确或已过期，请重新获取。",
      messageEn: "Invalid or expired verification code.",
    };
  }

  // Mode B: PIN (4-8 digits) OR any owned Coupon Code (`JBL-XXXXXX` / `XXXXXX`)
  const rawCred = (input.credential ?? "").trim();
  if (!rawCred) {
    return {
      ok: false,
      status: 400,
      messageZh: "请输入你的「取券密码」或任意一张「优惠券码（如 7K3M2A）」。",
      messageEn: "Please enter your PIN or one of your voucher codes.",
    };
  }

  // 1) Check if `rawCred` matches any coupon code belonging to this customer
  const candidateCode = normalizeCouponCode(rawCred);
  if (candidateCode) {
    const ownsCode = wallet.coupons.some(
      (c) => c.couponCode.toUpperCase() === candidateCode
    );
    if (ownsCode) {
      authEmailFailureTracker.delete(parsedEmail.normalized);
      return { ok: true, wallet };
    }
  }

  // 2) Check if `rawCred` matches their 4-8 digit PIN
  const candidatePin = normalizeCustomerPin(rawCred);
  if (candidatePin) {
    if (!accountRow?.pin_hash) {
      checkSlidingWindow(
        authEmailFailureTracker,
        parsedEmail.normalized,
        AUTH_WINDOW_MS,
        AUTH_MAX_EMAIL_FAILURES,
        true
      );
      return {
        ok: false,
        status: 401,
        messageZh:
          "该账号尚未设置数字取券密码——请输入你领券时的 6 位优惠券码（如 7K3M2A）登录，登录后即可设置专属密码！",
        messageEn:
          "No numeric PIN is set yet — please sign in using your 6-character voucher code, then set a PIN inside your wallet.",
      };
    }

    const candidateHash = await hashCustomerPin(
      parsedEmail.normalized,
      candidatePin
    );
    if (candidateHash === accountRow.pin_hash) {
      authEmailFailureTracker.delete(parsedEmail.normalized);
      return { ok: true, wallet };
    }
  }

  checkSlidingWindow(
    authEmailFailureTracker,
    parsedEmail.normalized,
    AUTH_WINDOW_MS,
    AUTH_MAX_EMAIL_FAILURES,
    true
  );
  return {
    ok: false,
    status: 401,
    messageZh: "取券密码或优惠券码与该邮箱不匹配，请核对后重试。",
    messageEn: "PIN or voucher code did not match this email address.",
  };
}

export async function updateCustomerWalletProfile(
  normalizedEmail: string,
  input: {
    customerName?: string;
    marketingOptIn?: boolean;
    newPin?: string;
  }
): Promise<
  | { ok: true; wallet: CustomerWalletSnapshot }
  | { ok: false; messageZh: string; messageEn: string }
> {
  const db = await getMenuDb();
  if (!db) {
    return {
      ok: false,
      messageZh: "数据库暂未连接，请稍后再试。",
      messageEn: "Database unavailable.",
    };
  }
  await ensureCouponsSchema(db);

  const current = await getCustomerWalletSnapshot(normalizedEmail);
  if (!current) {
    return {
      ok: false,
      messageZh: "账户不存在。",
      messageEn: "Account not found.",
    };
  }

  let newPinHash: string | null = null;
  if (typeof input.newPin === "string" && input.newPin.trim() !== "") {
    const cleanPin = normalizeCustomerPin(input.newPin);
    if (!cleanPin) {
      return {
        ok: false,
        messageZh: "取券密码必须为 4 至 8 位纯数字（例如手机尾号后 4 位）。",
        messageEn: "PIN must be 4 to 8 digits.",
      };
    }
    newPinHash = await hashCustomerPin(normalizedEmail, cleanPin);
  }

  const nextName =
    typeof input.customerName === "string"
      ? input.customerName.trim().slice(0, 80)
      : current.customerName;
  const nextOptIn =
    typeof input.marketingOptIn === "boolean"
      ? input.marketingOptIn
      : current.marketingOptIn;

  await db
    .prepare(
      `INSERT INTO customer_wallet_accounts (
         normalized_email, email, customer_name, pin_hash, marketing_opt_in, updated_at
       ) VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(normalized_email) DO UPDATE SET
         customer_name = excluded.customer_name,
         pin_hash = COALESCE(excluded.pin_hash, customer_wallet_accounts.pin_hash),
         marketing_opt_in = excluded.marketing_opt_in,
         updated_at = datetime('now')`
    )
    .bind(
      normalizedEmail,
      current.email,
      nextName,
      newPinHash,
      nextOptIn ? 1 : 0
    )
    .run();

  await db
    .prepare(
      `UPDATE welcome_coupons
       SET customer_name = ?, marketing_opt_in = ?
       WHERE normalized_email = ?`
    )
    .bind(nextName, nextOptIn ? 1 : 0, normalizedEmail)
    .run();

  const updated = await getCustomerWalletSnapshot(normalizedEmail);
  if (!updated) {
    return {
      ok: false,
      messageZh: "更新失败，请重试。",
      messageEn: "Could not load updated profile.",
    };
  }

  return { ok: true, wallet: updated };
}
