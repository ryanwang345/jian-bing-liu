import { getMenuDb } from "@/lib/cf-bindings";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { getSiteContent } from "@/lib/site-content-service";

export type CouponStoredStatus = "active" | "redeemed" | "void";
export type CouponEffectiveStatus = CouponStoredStatus | "expired";

export const DEVICE_COUPON_COOKIE_NAME = "jbl_coupon_device";

export interface WelcomeCouponRecord {
  id: string;
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
}

export interface CouponStatsSummary {
  total: number;
  active: number;
  redeemed: number;
  expired: number;
  voided: number;
}

interface RawCouponRow {
  id: string;
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
  marketing_opt_in: number;
  expires_at: string;
  created_at: string;
  redeemed_at: string | null;
  redeemed_by: string | null;
  ip_hash?: string | null;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const RAW_CODE_BODY_RE = /^[A-Z0-9]{4,12}$/;
const CODE_RE = /^JBL-[A-Z0-9]{4,12}$/;

// Anti-abuse rate limits
const IP_BURST_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const IP_BURST_MAX_ATTEMPTS = 6;
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

export async function hashClientIp(rawIp: string | null | undefined): Promise<string | null> {
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

function checkAndRecordIpBurst(ipHash: string | null): boolean {
  if (!ipHash) return true;
  const now = Date.now();
  const prev = (ipBurstTracker.get(ipHash) ?? []).filter(
    (ts) => now - ts < IP_BURST_WINDOW_MS
  );
  if (prev.length >= IP_BURST_MAX_ATTEMPTS) {
    ipBurstTracker.set(ipHash, prev);
    return false;
  }
  prev.push(now);
  ipBurstTracker.set(ipHash, prev);
  if (ipBurstTracker.size > 2000) {
    for (const [key, timestamps] of ipBurstTracker) {
      if (timestamps.every((ts) => now - ts >= IP_BURST_WINDOW_MS)) {
        ipBurstTracker.delete(key);
      }
    }
  }
  return true;
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
      // Fail open on transient DNS gateway issues so genuine customers aren't blocked
      return true;
    }
    const data = (await res.json()) as {
      Status?: number;
      Answer?: Array<{ type?: number; data?: string }>;
    };
    // Status 3 = NXDOMAIN (non-existent domain, e.g. `abc@sdjfkl123.com`)
    if (data.Status === 3) {
      mxDomainCache.set(domain, { valid: false, expiresAt: now + 30 * 60 * 1000 });
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
    // Fail open in offline / sandboxed dev environments
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

  // Safely upgrade pre-existing tables that were created before `ip_hash` was added
  try {
    await db.prepare("ALTER TABLE welcome_coupons ADD COLUMN ip_hash TEXT").run();
  } catch {
    // Column already exists
  }

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
  schemaReady = true;
}

/** Parses SQLite `YYYY-MM-DD HH:MM:SS` (UTC) into epoch ms. */
export function parseUtcSqliteDate(raw: string): number {
  const iso = raw.includes("T") ? raw : `${raw.replace(" ", "T")}Z`;
  return Date.parse(iso);
}

function toCouponRecord(row: RawCouponRow): WelcomeCouponRecord {
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
    marketingOptIn: row.marketing_opt_in === 1,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    redeemedAt: row.redeemed_at,
    redeemedBy: row.redeemed_by,
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
        Show this code at our Camden Road counter before paying. Limit 1 per order, not valid on delivery platforms.<br/>
        到店点餐付款前向店员出示此券码即可立减（每单限用 1 张，不与外卖平台同享）。
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
        subject: `Your Jian Bing Liu Welcome Code: ${coupon.couponCode} (${coupon.discountLabelEn})`,
        html,
      }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
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
  marketingOptIn?: boolean;
  turnstileToken?: string;
  honeypot?: string;
  clientIp?: string | null;
  deviceCouponCode?: string | null;
}): Promise<ClaimCouponResult> {
  // Silent honeypot trap against automated form-filling bots
  if (input.honeypot && input.honeypot.trim() !== "") {
    return {
      ok: false,
      reason: "rate_limited",
      messageZh: "请求过于频繁，请稍后再试。",
      messageEn: "Too many requests. Please try again later.",
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
      messageEn: "Please enter a valid personal email address (burner emails are not accepted).",
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
      const deviceCoupon = toCouponRecord(deviceRow);
      // Same user cleared localStorage and re-entered their own email -> seamlessly restore active voucher!
      if (
        deviceCoupon.normalizedEmail === parsedEmail.normalized &&
        deviceCoupon.effectiveStatus === "active"
      ) {
        return {
          ok: true,
          coupon: deviceCoupon,
          emailSent: false,
          restoredExisting: true,
        };
      }
      // Customer trying to register a second fake email on the exact same phone/browser -> block!
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
    const existingCoupon = toCouponRecord(existingRow);
    if (existingCoupon.effectiveStatus === "redeemed") {
      return {
        ok: false,
        reason: "already_claimed",
        messageZh: `该邮箱的新客立减券已于 ${existingCoupon.redeemedAt?.slice(0, 10) ?? "早前"} 到店核销使用过啦，每人限享 1 次！`,
        messageEn: "This email's welcome coupon has already been redeemed in-store (limit 1 per customer).",
      };
    }
    if (existingCoupon.effectiveStatus === "active") {
      // Re-send to their inbox if Resend is configured, without leaking another person's code to unverified devices
      const resent = await sendCouponEmailIfConfigured(existingCoupon);
      if (resent) {
        return {
          ok: false,
          reason: "already_claimed",
          messageZh: "该邮箱已领取过新客券！我们已将核销码重新发送至你的邮箱，请查收。",
          messageEn: "Already claimed! We just re-sent your active voucher code to your email inbox.",
        };
      }
    }
    return {
      ok: false,
      reason: "already_claimed",
      messageZh: "该邮箱已领取过新客优惠券，每人限领一次。",
      messageEn:
        "A welcome coupon has already been claimed with this email (limit 1 per customer).",
    };
  }

  // 3. Enforce per-IP & global issuance caps against incognito multi-account abuse & botnets
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
        messageZh: "当前网络今日领券次数已达上限（每位新客限领 1 张）。如在店内需要帮助请联系店员。",
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
      messageEn: "Today's batch of online welcome vouchers has been fully claimed. Please check back tomorrow!",
    };
  }

  const cleanEmail = input.email.trim().slice(0, 254);
  const cleanName = (input.name ?? "").trim().slice(0, 80);
  const optIn = input.marketingOptIn ? 1 : 0;
  const validDays = Math.min(365, Math.max(1, Math.round(cfg.validDays || 14)));
  const maxUses = Math.min(10, Math.max(1, Math.round(cfg.maxUses || 1)));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = crypto.randomUUID();
    const code = generateRandomCouponCode();

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
        const record = toCouponRecord(inserted);
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

export async function lookupCouponByCode(
  rawCode: string
): Promise<WelcomeCouponRecord | null> {
  const code = normalizeCouponCode(rawCode);
  if (!code) return null;
  const db = await getMenuDb();
  if (!db) return null;
  await ensureCouponsSchema(db);

  const row = await db
    .prepare("SELECT * FROM welcome_coupons WHERE coupon_code = ?")
    .bind(code)
    .first<RawCouponRow>();

  return row ? toCouponRecord(row) : null;
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

  // Atomic conditional update prevents double-redemption under concurrent clicks or expired timestamps
  const updated = await db
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

  if (updated) {
    return { ok: true, coupon: toCouponRecord(updated) };
  }

  const existing = await lookupCouponByCode(code);
  if (!existing) {
    return {
      ok: false,
      reason: "not_found",
      message: `查无此券码（${code}），谨防伪造截图！`,
    };
  }

  if (existing.effectiveStatus === "void") {
    return {
      ok: false,
      reason: "void",
      message: `此券（${code}）已被作废，切勿减免！`,
      coupon: existing,
    };
  }

  if (existing.effectiveStatus === "redeemed") {
    return {
      ok: false,
      reason: "exhausted",
      message: `此券已于 ${existing.redeemedAt ?? "早前"} 核销用过了（${existing.usedCount}/${existing.maxUses} 次），切勿重复减免！`,
      coupon: existing,
    };
  }

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

  const updated = await db
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

  if (!updated) {
    const existing = await lookupCouponByCode(code);
    if (!existing) return { ok: false, message: `找不到核销码 ${code}。` };
    return { ok: false, coupon: existing, message: "该券当前没有可撤销的核销记录。" };
  }

  return {
    ok: true,
    coupon: toCouponRecord(updated),
    message: `已撤销误操作，${code} 已恢复为「可使用」状态！`,
  };
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

  const updated = await db
    .prepare(
      `UPDATE welcome_coupons
       SET status = 'void',
           redeemed_by = COALESCE(redeemed_by, ?)
       WHERE coupon_code = ? AND status != 'void'
       RETURNING *`
    )
    .bind(staffIdentity, code)
    .first<RawCouponRow>();

  if (!updated) {
    const existing = await lookupCouponByCode(code);
    if (!existing) return { ok: false, message: `找不到核销码 ${code}。` };
    return { ok: false, coupon: existing, message: "该核销码已是作废状态。" };
  }

  return {
    ok: true,
    coupon: toCouponRecord(updated),
    message: `已作废核销码 ${code}。`,
  };
}

export async function listWelcomeCoupons(limit = 150): Promise<{
  writable: boolean;
  coupons: WelcomeCouponRecord[];
  stats: CouponStatsSummary;
}> {
  const db = await getMenuDb();
  if (!db) {
    return {
      writable: false,
      coupons: [],
      stats: { total: 0, active: 0, redeemed: 0, expired: 0, voided: 0 },
    };
  }

  await ensureCouponsSchema(db);

  const safeLimit = Math.min(300, Math.max(1, Math.round(limit)));
  const rows = await db
    .prepare(
      "SELECT * FROM welcome_coupons ORDER BY created_at DESC LIMIT ?"
    )
    .bind(safeLimit)
    .all<RawCouponRow>();

  const coupons = (rows.results ?? []).map(toCouponRecord);

  const statsRow = await db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'active' AND used_count < max_uses AND expires_at > datetime('now') THEN 1 ELSE 0 END) AS active,
         SUM(CASE WHEN status = 'redeemed' OR (status = 'active' AND used_count >= max_uses) THEN 1 ELSE 0 END) AS redeemed,
         SUM(CASE WHEN status = 'active' AND used_count < max_uses AND expires_at <= datetime('now') THEN 1 ELSE 0 END) AS expired,
         SUM(CASE WHEN status = 'void' THEN 1 ELSE 0 END) AS voided
       FROM welcome_coupons`
    )
    .first<{
      total: number;
      active: number | null;
      redeemed: number | null;
      expired: number | null;
      voided: number | null;
    }>();

  return {
    writable: true,
    coupons,
    stats: {
      total: Number(statsRow?.total ?? 0),
      active: Number(statsRow?.active ?? 0),
      redeemed: Number(statsRow?.redeemed ?? 0),
      expired: Number(statsRow?.expired ?? 0),
      voided: Number(statsRow?.voided ?? 0),
    },
  };
}
