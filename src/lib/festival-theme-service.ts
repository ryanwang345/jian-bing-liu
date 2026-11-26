import {
  getFestivalPresetById,
  matchFestivalPresetId,
  type FestivalPreset,
} from "@/data/festivals";
import { getMenuDb } from "@/lib/cf-bindings";
import {
  isValidFestivalBannerText,
  resolveFestivalBanner,
  type FestivalBannerOverrides,
  type FestivalBannerText,
} from "@/data/festival-banners";

const SETTING_KEY = "active_festival_theme";
const BANNER_KEY_PREFIX = "festival_banner:";

export interface ActiveFestivalThemeState {
  /** Stored setting: "auto" | "default" | <festivalPreset.id> */
  setting: string;
  /** Resolved active festival theme, or null for the classic Jian Bing Liu theme */
  activeFestival: FestivalPreset | null;
  /** Whether there is at least one dish in the Festive Specials category */
  hasFestiveDishes: boolean;
  bannerOverrides: FestivalBannerOverrides;
}

export function isValidFestivalThemeSetting(value: string): boolean {
  if (value === "auto" || value === "default") return true;
  return Boolean(getFestivalPresetById(value));
}

export async function getActiveFestivalThemeState(): Promise<ActiveFestivalThemeState> {
  const db = await getMenuDb();
  if (!db) {
    return { setting: "auto", activeFestival: null, hasFestiveDishes: false, bannerOverrides: {} };
  }

  let setting = "auto";
  try {
    const row = await db
      .prepare("SELECT value FROM site_settings WHERE key = ?")
      .bind(SETTING_KEY)
      .first<{ value: string }>();
    if (row?.value && isValidFestivalThemeSetting(row.value)) {
      setting = row.value;
    }
  } catch {
    // site_settings table may not be migrated yet; default cleanly to "auto"
  }

  const bannerOverrides: FestivalBannerOverrides = {};
  try {
    const stored = await db
      .prepare("SELECT key, value FROM site_settings WHERE key LIKE ?")
      .bind(`${BANNER_KEY_PREFIX}%`)
      .all<{ key: string; value: string }>();
    for (const row of stored.results ?? []) {
      const id = row.key.slice(BANNER_KEY_PREFIX.length);
      if (!getFestivalPresetById(id)) continue;
      try {
        const value: unknown = JSON.parse(row.value);
        if (isValidFestivalBannerText(value)) bannerOverrides[id] = value;
      } catch {
        // A malformed override must not hide other festivals' saved titles.
      }
    }
  } catch {
    // Older databases can continue using the built-in banner titles.
  }

  let firstFestiveNote: { note_zh: string | null; note_en: string | null } | null =
    null;
  let hasFestiveDishes = false;

  try {
    const festiveRows = await db
      .prepare(
        `SELECT note_zh, note_en, is_available
         FROM menu_items
         WHERE category_id = 'festive-specials'
         ORDER BY is_available DESC, sort_order ASC, id ASC
         LIMIT 5`
      )
      .all<{ note_zh: string | null; note_en: string | null; is_available: number }>();

    const rows = festiveRows?.results ?? [];
    hasFestiveDishes = rows.length > 0;
    firstFestiveNote = rows.find((r) => r.is_available !== 0) ?? rows[0] ?? null;
  } catch {
    // Ignore if menu_items is unavailable
  }

  if (setting === "default") {
    return { setting, activeFestival: null, hasFestiveDishes, bannerOverrides };
  }

  if (setting !== "auto") {
    return {
      setting,
      activeFestival: resolveFestivalBanner(getFestivalPresetById(setting)!, bannerOverrides),
      hasFestiveDishes,
      bannerOverrides,
    };
  }

  // "auto": follow the active Festive Specials menu item if it has a recognized holiday tag
  if (firstFestiveNote) {
    const matchedId = matchFestivalPresetId(
      firstFestiveNote.note_zh,
      firstFestiveNote.note_en
    );
    const preset = getFestivalPresetById(matchedId);
    if (preset) {
      return { setting, activeFestival: resolveFestivalBanner(preset, bannerOverrides), hasFestiveDishes, bannerOverrides };
    }
  }

  return { setting, activeFestival: null, hasFestiveDishes, bannerOverrides };
}

export async function setActiveFestivalThemeSetting(
  value: string
): Promise<ActiveFestivalThemeState> {
  if (!isValidFestivalThemeSetting(value)) {
    throw new Error("Invalid festival theme value");
  }

  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  // Ensure table exists defensively even if migration hasn't run yet
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
    .bind(SETTING_KEY, value)
    .run();

  return getActiveFestivalThemeState();
}

export async function setFestivalBannerText(
  festivalId: string,
  text: FestivalBannerText
): Promise<ActiveFestivalThemeState> {
  if (!getFestivalPresetById(festivalId) || !isValidFestivalBannerText(text)) {
    throw new Error("Invalid festival banner text");
  }
  const db = await getMenuDb();
  if (!db) throw new Error("Cloudflare D1 binding MENU_DB is not available.");

  await db.prepare(
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ).run();

  const preset = getFestivalPresetById(festivalId)!;
  const bannerZh = text.bannerZh.trim() === preset.bannerZh ? "" : text.bannerZh.trim();
  const bannerEn = text.bannerEn.trim() === preset.bannerEn ? "" : text.bannerEn.trim();
  if (!bannerZh && !bannerEn) {
    await db.prepare("DELETE FROM site_settings WHERE key = ?")
      .bind(`${BANNER_KEY_PREFIX}${festivalId}`).run();
  } else {
    await db.prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    ).bind(`${BANNER_KEY_PREFIX}${festivalId}`, JSON.stringify({ bannerZh, bannerEn })).run();
  }
  return getActiveFestivalThemeState();
}
