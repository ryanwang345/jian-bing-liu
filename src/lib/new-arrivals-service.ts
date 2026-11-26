import { getMenuDb, type D1Database } from "@/lib/cf-bindings";

/**
 * Stores which dishes are flagged as "new launches" in the existing
 * `site_settings` key/value table (no schema migration required).
 *
 * Shape: { [menuItemId]: ISO timestamp when it was flagged as new }
 */
const NEW_ARRIVALS_KEY = "new_arrivals_v1";

export type NewArrivalMap = Record<string, string>;

function sanitizeMap(raw: unknown): NewArrivalMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: NewArrivalMap = {};
  for (const [id, since] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof id === "string" && id.trim() && typeof since === "string") {
      out[id] = since;
    }
  }
  return out;
}

export async function readNewArrivalMap(
  providedDb?: D1Database | null
): Promise<NewArrivalMap> {
  const db = providedDb ?? (await getMenuDb());
  if (!db) return {};
  try {
    const row = await db
      .prepare("SELECT value FROM site_settings WHERE key = ?")
      .bind(NEW_ARRIVALS_KEY)
      .first<{ value: string }>();
    if (!row?.value) return {};
    return sanitizeMap(JSON.parse(row.value));
  } catch {
    return {};
  }
}

async function writeNewArrivalMap(db: D1Database, map: NewArrivalMap) {
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
    .bind(NEW_ARRIVALS_KEY, JSON.stringify(map))
    .run();
}

/**
 * Flag or unflag dishes as new launches. Re-flagging an already-new dish keeps
 * its original launch date unless `restartClock` is true.
 */
export async function setMenuItemsNew(
  ids: string[],
  isNew: boolean,
  options: { restartClock?: boolean } = {}
): Promise<void> {
  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }
  const cleanIds = ids.map((id) => id.trim()).filter(Boolean);
  if (cleanIds.length === 0) return;

  const map = await readNewArrivalMap(db);
  const nowIso = new Date().toISOString();
  let changed = false;

  for (const id of cleanIds) {
    if (isNew) {
      if (!map[id] || options.restartClock) {
        map[id] = nowIso;
        changed = true;
      }
    } else if (map[id]) {
      delete map[id];
      changed = true;
    }
  }

  if (changed) await writeNewArrivalMap(db, map);
}
