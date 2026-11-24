-- Jian Bing Liu (煎饼刘) Menu Database Schema for Cloudflare D1 (SQLite)

CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  chinese_title TEXT NOT NULL,
  subtitle_en TEXT NOT NULL DEFAULT '',
  subtitle_zh TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  chinese_name TEXT NOT NULL DEFAULT '',
  desc_en TEXT NOT NULL DEFAULT '',
  desc_zh TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  image_alt_en TEXT,
  image_alt_zh TEXT,
  dietary_tags TEXT NOT NULL DEFAULT '[]',
  note_en TEXT,
  note_zh TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_available INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS menu_variants (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  size_en TEXT NOT NULL,
  size_zh TEXT NOT NULL,
  price_pence INTEGER NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category
  ON menu_items(category_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_menu_variants_item
  ON menu_variants(item_id, sort_order);
