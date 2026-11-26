import {
  defaultSiteContent,
  mergeSiteContent,
  type SiteContentConfig,
} from "@/data/site-content";
import { getMenuDb } from "@/lib/cf-bindings";

const SITE_CONTENT_KEY = "site_content_v1";

export async function getSiteContent(): Promise<SiteContentConfig> {
  const db = await getMenuDb();
  if (!db) {
    return defaultSiteContent;
  }

  try {
    const row = await db
      .prepare("SELECT value FROM site_settings WHERE key = ?")
      .bind(SITE_CONTENT_KEY)
      .first<{ value: string }>();

    if (!row?.value) {
      return defaultSiteContent;
    }

    const parsed = JSON.parse(row.value) as unknown;
    return mergeSiteContent(parsed);
  } catch {
    return defaultSiteContent;
  }
}

export async function saveSiteContent(
  nextContent: unknown
): Promise<SiteContentConfig> {
  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  const normalized = mergeSiteContent(nextContent);

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    )
    .run();

  await db
    .prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = datetime('now')`
    )
    .bind(SITE_CONTENT_KEY, JSON.stringify(normalized))
    .run();

  return normalized;
}
