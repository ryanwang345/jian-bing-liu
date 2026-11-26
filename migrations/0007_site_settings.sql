-- Key-value settings table for site-wide admin controls (e.g. active_festival_theme)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO site_settings (key, value)
VALUES ('active_festival_theme', 'auto');
