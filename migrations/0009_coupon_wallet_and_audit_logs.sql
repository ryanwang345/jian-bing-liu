-- Upgrade coupon system with customer wallet PIN auth, multi-coupon support, and automatic audit logs

CREATE TABLE IF NOT EXISTS customer_vouchers (
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
);

CREATE INDEX IF NOT EXISTS idx_customer_vouchers_email
  ON customer_vouchers(normalized_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_vouchers_code
  ON customer_vouchers(coupon_code);

CREATE TABLE IF NOT EXISTS customer_wallet_accounts (
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
);

CREATE TABLE IF NOT EXISTS coupon_activity_logs (
  id TEXT PRIMARY KEY,
  coupon_code TEXT NOT NULL,
  customer_email TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL,
  status_snapshot TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_coupon_activity_logs_created
  ON coupon_activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coupon_activity_logs_code
  ON coupon_activity_logs(coupon_code, created_at DESC);
