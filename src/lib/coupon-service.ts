import { getMenuDb } from "@/lib/cf-bindings";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { getSiteContent } from "@/lib/site-content-service";

export type CouponStoredStatus = "active" | "redeemed" | "void";
export type CouponEffectiveStatus = CouponStoredStatus | "expired";

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
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CODE_RE = /^JBL-[A-Z0-9]{4,12}$/;

let schemaReady = false;

type MenuDb = NonNullable<Awaited<ReturnType<typeof getMenuDb>>>;

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
        redeemed_by TEXT
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

export function normalizeCustomerEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed.length > 254 || !EMAIL_RE.test(trimmed)) {
    return null;
  }
  const atIndex = trimmed.lastIndexOf("@");
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (!local || !domain) return null;

  if (domain === "gmail.com" || domain === "googlemail.com") {
    const plusIdx = local.indexOf("+");
    const baseLocal = (plusIdx >= 0 ? local.slice(0, plusIdx) : local).replace(
      /\./g,
      ""
    );
    if (!baseLocal) return null;
    return `${baseLocal}@gmail.com`;
  }

  return `${local}@${domain}`;
}

export function normalizeCouponCode(raw: string): string | null {
  const clean = raw.trim().toUpperCase();
  if (!CODE_RE.test(clean)) return null;
  return clean;
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

  const expiryDate = coupon.expiresAt.slice(0, 10);
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1c1816;">
      <h2 style="margin: 0 0 8px; color: #9c2d1d;">Jian Bing Liu 煎饼刘 · 124 Camden Rd</h2>
      <p style="margin: 0 0 16px; color: #5c514a;">${coupon.offerTitleEn} / ${coupon.offerTitleZh}</p>
      <div style="border: 2px dashed #c84b31; border-radius: 16px; padding: 20px; text-align: center; background: #fbf8f3;">
        <div style="font-size: 13px; font-weight: 700; color: #9c2d1d; letter-spacing: 0.08em; text-transform: uppercase;">
          ${coupon.discountLabelEn} · ${coupon.discountLabelZh}
        </div>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 0.14em; margin: 12px 0; color: #1c1816;">
          ${coupon.couponCode}
        </div>
        <div style="font-size: 13px; color: #5c514a;">
          Valid until / 有效期至: <strong>${expiryDate}</strong> · Max uses / 可用次数: <strong>${coupon.maxUses}</strong>
        </div>
      </div>
      <p style="margin: 16px 0 0; font-size: 13px; color: #5c514a;">
        Show this code at our Camden Road counter before paying. Staff will redeem it once in-store.<br/>
        到店点餐付款前向店员出示此券码即可立减。
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
    }
  | {
      ok: false;
      reason:
        | "disabled"
        | "db_unavailable"
        | "invalid_email"
        | "turnstile_failed"
        | "already_claimed"
        | "internal_error";
      messageZh: string;
      messageEn: string;
    };

export async function claimWelcomeCoupon(input: {
  email: string;
  name?: string;
  marketingOptIn?: boolean;
  turnstileToken?: string;
}): Promise<ClaimCouponResult> {
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

  const normalizedEmail = normalizeCustomerEmail(input.email);
  if (!normalizedEmail) {
    return {
      ok: false,
      reason: "invalid_email",
      messageZh: "请输入有效的电子邮箱地址。",
      messageEn: "Please enter a valid email address.",
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

  const existing = await db
    .prepare("SELECT id FROM welcome_coupons WHERE normalized_email = ?")
    .bind(normalizedEmail)
    .first<{ id: string }>();

  if (existing) {
    return {
      ok: false,
      reason: "already_claimed",
      messageZh: "该邮箱已领取过新客优惠券，每人限领一次。",
      messageEn:
        "A welcome coupon has already been claimed with this email (limit 1 per customer).",
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
             max_uses, used_count, status, marketing_opt_in, expires_at
           )
           VALUES (
             ?, ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, 0, 'active', ?, datetime('now', '+' || ? || ' days')
           )
           RETURNING *`
        )
        .bind(
          id,
          cleanEmail,
          normalizedEmail,
          cleanName,
          code,
          cfg.title.zh,
          cfg.title.en,
          cfg.discountLabel.zh,
          cfg.discountLabel.en,
          maxUses,
          optIn,
          String(validDays)
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
      message: "核销码格式不正确（应为 JBL-XXXXXX）。",
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
      message: `找不到核销码 ${code}，请核对后重试。`,
    };
  }

  if (existing.effectiveStatus === "void") {
    return {
      ok: false,
      reason: "void",
      message: `核销码 ${code} 已被作废，无法使用。`,
      coupon: existing,
    };
  }

  if (existing.effectiveStatus === "redeemed") {
    return {
      ok: false,
      reason: "exhausted",
      message: `核销码 ${code} 已用完（${existing.usedCount}/${existing.maxUses} 次），不可重复核销。`,
      coupon: existing,
    };
  }

  return {
    ok: false,
    reason: "expired",
    message: `核销码 ${code} 已于 ${existing.expiresAt.slice(0, 10)} 过期，无法使用。`,
    coupon: existing,
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

export async function listWelcomeCoupons(limit = 100): Promise<{
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
