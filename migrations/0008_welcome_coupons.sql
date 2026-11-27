-- First-visit welcome coupon & in-store redemption schema for Cloudflare D1 (SQLite)

CREATE TABLE IF NOT EXISTS welcome_coupons (
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
);

CREATE INDEX IF NOT EXISTS idx_welcome_coupons_code
  ON welcome_coupons(coupon_code);

CREATE INDEX IF NOT EXISTS idx_welcome_coupons_created
  ON welcome_coupons(created_at DESC);
