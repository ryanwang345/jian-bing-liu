import { getMenuImagesBucket, type D1Database } from "@/lib/cf-bindings";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { MenuPhotoError } from "@/lib/menu-photos";

// Run as the first statement of the menu mutation's D1 batch. The previous URL,
// other dishes' references, and the retirement decision share one transaction.
export async function queueRemovedMenuPhotos(
  db: D1Database,
  itemId: string,
  nextUrl: string | null,
  uploadedUrls: string[] = []
) {
  const customBase = (await getRuntimeEnv("R2_PUBLIC_BASE_URL"))?.replace(/\/+$/, "");
  const mediaPrefix = "/api/media/";
  const publicPrefix = customBase ? customBase + "/" : mediaPrefix;
  return db.prepare(`
    WITH candidates(url) AS (
      SELECT image_url FROM menu_items WHERE id = ?1
      UNION SELECT value FROM json_each(?2)
    ), objects(object_key) AS (
      SELECT CASE
        WHEN substr(url, 1, length(?3)) = ?3 THEN substr(url, length(?3) + 1)
        WHEN substr(url, 1, length(?4)) = ?4 THEN substr(url, length(?4) + 1)
      END FROM candidates
    )
    INSERT OR IGNORE INTO menu_photo_removals (object_key, item_id)
    SELECT object_key, ?1 FROM objects
    WHERE object_key GLOB 'dishes/?*'
      AND substr(object_key, 8) NOT GLOB '*[^a-zA-Z0-9_.-]*'
      AND substr(object_key, 8) NOT IN ('.', '..')
      AND substr(COALESCE(?5, ''), -length(object_key) - 1) <> '/' || object_key
      AND NOT EXISTS (
        SELECT 1 FROM menu_items WHERE id <> ?1
          AND substr(image_url, -length(object_key) - 1) = '/' || object_key
      )
  `).bind(itemId, JSON.stringify(uploadedUrls), mediaPrefix, publicPrefix, nextUrl);
}

export async function deleteRetiredMenuPhotos(db: D1Database, itemId: string) {
  // Another menu save can finish an interrupted deletion after the dish is gone.
  const { results } = await db.prepare(`
    SELECT object_key, item_id FROM menu_photo_removals WHERE deleted = 0 AND item_id = ?1
    UNION ALL
    SELECT * FROM (
      SELECT object_key, item_id FROM menu_photo_removals
      WHERE deleted = 0 AND item_id <> ?1 LIMIT 5
    )
  `).bind(itemId).all<{ object_key: string; item_id: string }>();
  if (!results.length) return;

  const bucket = await getMenuImagesBucket();
  let cleanupFailed = false;
  for (const { object_key: key, item_id: owner } of results) {
    try {
      if (!bucket) throw new Error("The MENU_IMAGES R2 binding is unavailable.");
      await bucket.delete(key);
      await db.prepare("UPDATE menu_photo_removals SET deleted = 1 WHERE object_key = ?")
        .bind(key).run();
    } catch {
      console.error("Failed to finish R2 menu photo deletion", key);
      if (owner === itemId) cleanupFailed = true;
    }
  }
  if (cleanupFailed) throw new MenuPhotoError("cleanupFailed", 503);
}
