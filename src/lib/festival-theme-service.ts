import {
  getFestivalPresetById,
  matchFestivalPresetId,
  type FestivalPreset,
} from "@/data/festivals";
import { getMenuDb } from "@/lib/cf-bindings";

const SETTING_KEY = "active_festival_theme";

export interface ActiveFestivalThemeState {
  /** Stored setting: "auto" | "default" | <festivalPreset.id> */
  setting: string;
  /** Resolved active festival theme, or null for the classic Jian Bing Liu theme */
  activeFestival: FestivalPreset | null;
  /** Whether there is at least one dish in the Festive Specials category */
  hasFestiveDishes: boolean;
}

export function isValidFestivalThemeSetting(value: string): boolean {
  if (value === "auto" || value === "default") return true;
  return Boolean(getFestivalPresetById(value));
}

export async function getActiveFestivalThemeState(): Promise<ActiveFestivalThemeState> {
  const db = await getMenuDb();
  if (!db) {
    return { setting: "auto", activeFestival: null, hasFestiveDishes: false };
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
    return { setting, activeFestival: null, hasFestiveDishes };
  }

  if (setting !== "auto") {
    return {
      setting,
      activeFestival: getFestivalPresetById(setting),
      hasFestiveDishes,
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
      return { setting, activeFestival: preset, hasFestiveDishes };
    }
  }

  return { setting, activeFestival: null, hasFestiveDishes };
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
