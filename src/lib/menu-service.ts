import {
  deriveVariantsFromStaticItem,
  formatPricePence,
  menuCategories as staticMenuCategories,
  type DietaryTagKey,
  type MenuCategory,
  type MenuItem,
  type MenuVariant,
} from "@/data/menu";
import { queueRemovedMenuPhotos, deleteRetiredMenuPhotos } from "@/lib/menu-photo-cleanup";
import { resolveMenuPhotoUrl } from "@/lib/menu-photos";
import { getMenuDb, getMenuImagesBucket, type D1Database } from "@/lib/cf-bindings";
import { isNewArrivalActive, type NewArrivalSummary } from "@/lib/new-arrivals";
import { readNewArrivalMap, setMenuItemsNew } from "@/lib/new-arrivals-service";
import { getSiteContent } from "@/lib/site-content-service";

interface CategoryRow {
  id: string;
  title_en: string;
  title_zh: string;
  chinese_title: string;
  subtitle_en: string;
  subtitle_zh: string;
  sort_order: number;
}

interface ItemRow {
  id: string;
  category_id: string;
  name_en: string;
  name_zh: string;
  chinese_name: string;
  desc_en: string;
  desc_zh: string;
  image_url: string | null;
  image_alt_en: string | null;
  image_alt_zh: string | null;
  dietary_tags: string;
  note_en: string | null;
  note_zh: string | null;
  is_featured: number;
  is_available: number;
  sort_order: number;
}

interface VariantRow {
  id: string;
  item_id: string;
  size_en: string;
  size_zh: string;
  price_pence: number;
  is_default: number;
  sort_order: number;
}

export interface AdminMenuSnapshot {
  categories: MenuCategory[];
  source: "d1" | "fallback";
  hasDb: boolean;
  hasR2: boolean;
}

export interface MenuItemUpsertInput {
  id?: string;
  categoryId: string;
  nameEn: string;
  nameZh: string;
  chineseName?: string;
  descEn: string;
  descZh: string;
  imageUrl?: string | null;
  uploadedPhotoUrls?: string[];
  imageAltEn?: string | null;
  imageAltZh?: string | null;
  dietary: DietaryTagKey[];
  noteEn?: string | null;
  noteZh?: string | null;
  featured: boolean;
  isAvailable: boolean;
  sortOrder?: number;
  variants: Array<{
    id?: string;
    sizeEn: string;
    sizeZh: string;
    pricePence: number;
    isDefault?: boolean;
  }>;
}

const VALID_DIETARY: ReadonlySet<DietaryTagKey> = new Set([
  "halal",
  "vegetarian",
  "vegan",
]);

function parseDietaryTags(raw: string | null | undefined): DietaryTagKey[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (tag): tag is DietaryTagKey =>
        typeof tag === "string" && VALID_DIETARY.has(tag as DietaryTagKey)
    );
  } catch {
    return [];
  }
}

function hydrateStaticCategories(): MenuCategory[] {
  return staticMenuCategories.map((cat) => ({
    ...cat,
    items: cat.items.map((item, idx) => ({
      ...item,
      isAvailable: item.isAvailable ?? true,
      sortOrder: item.sortOrder ?? idx,
      variants: deriveVariantsFromStaticItem(item),
    })),
  }));
}

function rowsToMenuCategories(
  catRows: CategoryRow[],
  itemRows: ItemRow[],
  variantRows: VariantRow[]
): MenuCategory[] {
  const variantsByItem = new Map<string, MenuVariant[]>();
  for (const row of variantRows) {
    const list = variantsByItem.get(row.item_id) ?? [];
    list.push({
      id: row.id,
      size: { en: row.size_en, zh: row.size_zh },
      pricePence: row.price_pence,
      isDefault: row.is_default === 1,
      sortOrder: row.sort_order,
    });
    variantsByItem.set(row.item_id, list);
  }

  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const row of itemRows) {
    const variants = (variantsByItem.get(row.id) ?? []).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    const defaultVariant =
      variants.find((v) => v.isDefault) ?? variants[0] ?? null;
    const altVariant =
      variants.find((v) => v !== defaultVariant) ?? null;

    const dietary = parseDietaryTags(row.dietary_tags);

    const item: MenuItem = {
      id: row.id,
      name: { en: row.name_en, zh: row.name_zh },
      chineseName: row.chinese_name || row.name_zh,
      description: { en: row.desc_en, zh: row.desc_zh },
      price: defaultVariant ? formatPricePence(defaultVariant.pricePence) : null,
      secondaryPrice: altVariant
        ? {
            en: `${altVariant.size.en} ${formatPricePence(altVariant.pricePence)}`,
            zh: `${altVariant.size.zh} ${formatPricePence(altVariant.pricePence)}`,
          }
        : undefined,
      variants,
      dietary: dietary.length > 0 ? dietary : undefined,
      featured: row.is_featured === 1,
      isAvailable: row.is_available !== 0,
      sortOrder: row.sort_order,
      image: row.image_url || undefined,
      imageAlt:
        row.image_alt_en || row.image_alt_zh
          ? {
              en: row.image_alt_en || row.name_en,
              zh: row.image_alt_zh || row.name_zh,
            }
          : undefined,
      note:
        row.note_en || row.note_zh
          ? {
              en: row.note_en || "",
              zh: row.note_zh || "",
            }
          : undefined,
    };

    const list = itemsByCategory.get(row.category_id) ?? [];
    list.push(item);
    itemsByCategory.set(row.category_id, list);
  }

  return catRows.map((cat) => ({
    id: cat.id,
    title: { en: cat.title_en, zh: cat.title_zh },
    chineseTitle: cat.chinese_title,
    subtitle: { en: cat.subtitle_en, zh: cat.subtitle_zh },
    items: itemsByCategory.get(cat.id) ?? [],
  }));
}

async function queryMenuFromDb(
  db: D1Database
): Promise<MenuCategory[] | null> {
  try {
    const [catRes, itemRes, varRes] = await db.batch([
      db.prepare(
        "SELECT id, title_en, title_zh, chinese_title, subtitle_en, subtitle_zh, sort_order FROM menu_categories ORDER BY sort_order ASC, id ASC"
      ),
      db.prepare(
        "SELECT id, category_id, name_en, name_zh, chinese_name, desc_en, desc_zh, image_url, image_alt_en, image_alt_zh, dietary_tags, note_en, note_zh, is_featured, is_available, sort_order FROM menu_items ORDER BY sort_order ASC, id ASC"
      ),
      db.prepare(
        "SELECT id, item_id, size_en, size_zh, price_pence, is_default, sort_order FROM menu_variants ORDER BY sort_order ASC, id ASC"
      ),
    ]);

    const catRows = (catRes?.results ?? []) as unknown as CategoryRow[];
    if (catRows.length === 0) return null;

    const itemRows = (itemRes?.results ?? []) as unknown as ItemRow[];
    const variantRows = (varRes?.results ?? []) as unknown as VariantRow[];
    const categories = rowsToMenuCategories(catRows, itemRows, variantRows);
    await annotateNewArrivals(db, categories);
    return categories;
  } catch {
    return null;
  }
}

/** Marks dishes flagged as new launches (respecting the auto-expiry window). */
async function annotateNewArrivals(
  db: D1Database,
  categories: MenuCategory[]
): Promise<void> {
  try {
    const [map, content] = await Promise.all([
      readNewArrivalMap(db),
      getSiteContent(),
    ]);
    if (Object.keys(map).length === 0) return;
    const days = content.newArrivals.autoExpireDays;
    const now = Date.now();
    for (const cat of categories) {
      for (const item of cat.items) {
        const since = map[item.id];
        if (since && isNewArrivalActive(since, days, now)) {
          item.isNew = true;
          item.newSince = since;
        }
      }
    }
  } catch {
    // New-arrival flags are decorative; never break the menu over them
  }
}

/** All dishes currently flagged as new launches, newest first. */
export async function getActiveNewArrivals(): Promise<NewArrivalSummary[]> {
  const db = await getMenuDb();
  if (!db) return [];
  const live = await queryMenuFromDb(db);
  if (!live) return [];
  return live
    .flatMap((cat) =>
      cat.items
        .filter((item) => item.isNew && item.newSince)
        .map((item) => ({
          id: item.id,
          categoryId: cat.id,
          name: { en: item.name.en, zh: item.name.zh },
          image: item.image,
          price: item.price,
          isAvailable: item.isAvailable !== false,
          newSince: item.newSince as string,
        }))
    )
    .sort((a, b) => b.newSince.localeCompare(a.newSince));
}

export async function getPublicMenuCategories(): Promise<MenuCategory[]> {
  const db = await getMenuDb();
  if (db) {
    const live = await queryMenuFromDb(db);
    if (live) {
      return live.filter((category) => category.items.length > 0);
    }
  }
  return hydrateStaticCategories().filter(
    (category) => category.items.length > 0
  );
}

export async function getFeaturedMenuItems(): Promise<MenuItem[]> {
  const categories = await getPublicMenuCategories();
  return categories
    .flatMap((category) => category.items)
    .filter((item) => item.featured && item.image);
}

export async function getAdminMenuSnapshot(): Promise<AdminMenuSnapshot> {
  const [db, bucket] = await Promise.all([getMenuDb(), getMenuImagesBucket()]);
  if (db) {
    const live = await queryMenuFromDb(db);
    if (live && live.length > 0) {
      return {
        categories: live,
        source: "d1",
        hasDb: true,
        hasR2: Boolean(bucket),
      };
    }
  }

  return {
    categories: hydrateStaticCategories(),
    source: "fallback",
    hasDb: Boolean(db),
    hasR2: Boolean(bucket),
  };
}

function slugifyId(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
  const suffix = Math.random().toString(36).slice(2, 6);
  return cleaned ? `${cleaned}-${suffix}` : `dish-${Date.now().toString(36)}`;
}

export async function ensureDefaultCategoriesInDb(db: D1Database): Promise<void> {
  const countRow = await db
    .prepare("SELECT COUNT(*) as total FROM menu_categories")
    .first<{ total: number }>();
  if ((countRow?.total ?? 0) > 0) return;

  await seedDefaultMenuToDb(db);
}

export async function seedDefaultMenuToDb(
  providedDb?: D1Database
): Promise<{ categories: number; items: number; variants: number }> {
  const db = providedDb ?? (await getMenuDb());
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  const existing = await db.prepare("SELECT id FROM menu_items").all<{ id: string }>();
  const existingIds = new Set(existing.results.map((row) => row.id));
  const photoUrls = new Map<string, string | null>();
  const statements = [];
  let itemCount = 0;
  let variantCount = 0;

  for (let catIdx = 0; catIdx < staticMenuCategories.length; catIdx++) {
    const cat = staticMenuCategories[catIdx];
    statements.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO menu_categories
            (id, title_en, title_zh, chinese_title, subtitle_en, subtitle_zh, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          cat.id,
          cat.title.en,
          cat.title.zh,
          cat.chineseTitle,
          cat.subtitle.en,
          cat.subtitle.zh,
          catIdx
        )
    );

    for (let itemIdx = 0; itemIdx < cat.items.length; itemIdx++) {
      const item = cat.items[itemIdx];
      itemCount++;
      if (item.image && !existingIds.has(item.id) && !photoUrls.has(item.image)) {
        photoUrls.set(item.image, await resolveMenuPhotoUrl(item.image));
      }
      statements.push(
        db
          .prepare(
            `INSERT OR IGNORE INTO menu_items
              (id, category_id, name_en, name_zh, chinese_name, desc_en, desc_zh,
               image_url, image_alt_en, image_alt_zh, dietary_tags, note_en, note_zh,
               is_featured, is_available, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            item.id,
            cat.id,
            item.name.en,
            item.name.zh,
            item.chineseName || item.name.zh,
            item.description.en,
            item.description.zh,
            item.image ? photoUrls.get(item.image) ?? null : null,
            item.imageAlt?.en ?? null,
            item.imageAlt?.zh ?? null,
            JSON.stringify(item.dietary ?? []),
            item.note?.en ?? null,
            item.note?.zh ?? null,
            item.featured ? 1 : 0,
            item.isAvailable === false ? 0 : 1,
            itemIdx
          )
      );

      const variants = deriveVariantsFromStaticItem(item);
      for (let vIdx = 0; vIdx < variants.length; vIdx++) {
        const v = variants[vIdx];
        variantCount++;
        statements.push(
          db
            .prepare(
              `INSERT OR IGNORE INTO menu_variants
                (id, item_id, size_en, size_zh, price_pence, is_default, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
              v.id,
              item.id,
              v.size.en,
              v.size.zh,
              Math.round(v.pricePence),
              v.isDefault ? 1 : 0,
              vIdx
            )
        );
      }
    }
  }

  // Execute in chunks of 40 statements for safe D1 batch sizes
  for (let i = 0; i < statements.length; i += 40) {
    await db.batch(statements.slice(i, i + 40));
  }

  return {
    categories: staticMenuCategories.length,
    items: itemCount,
    variants: variantCount,
  };
}

export async function upsertMenuItem(input: MenuItemUpsertInput): Promise<string> {
  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  await ensureDefaultCategoriesInDb(db);

  const itemId = input.id?.trim() || slugifyId(input.nameEn || input.nameZh);
  const cleanDietary = input.dietary.filter((tag) => VALID_DIETARY.has(tag));

  let sortOrder = input.sortOrder;
  if (typeof sortOrder !== "number" || !Number.isFinite(sortOrder)) {
    const existing = await db
      .prepare("SELECT sort_order FROM menu_items WHERE id = ?")
      .bind(itemId)
      .first<{ sort_order: number }>();
    if (existing && typeof existing.sort_order === "number") {
      sortOrder = existing.sort_order;
    } else {
      const maxRow = await db
        .prepare("SELECT COALESCE(MAX(sort_order), -1) as max_order FROM menu_items WHERE category_id = ?")
        .bind(input.categoryId)
        .first<{ max_order: number }>();
      sortOrder = (maxRow?.max_order ?? -1) + 1;
    }
  }

  const normalizedVariants = input.variants
    .filter((v) => Number.isFinite(v.pricePence) && v.pricePence >= 0)
    .map((v, idx) => ({
      id: v.id?.trim() || `${itemId}-v${idx}-${Math.random().toString(36).slice(2, 6)}`,
      sizeEn: v.sizeEn.trim() || "Regular",
      sizeZh: v.sizeZh.trim() || "标准",
      pricePence: Math.round(v.pricePence),
      isDefault: Boolean(v.isDefault),
      sortOrder: idx,
    }));

  if (
    normalizedVariants.length > 0 &&
    !normalizedVariants.some((v) => v.isDefault)
  ) {
    normalizedVariants[0].isDefault = true;
  }

  const imageUrl = await resolveMenuPhotoUrl(input.imageUrl);
  const statements = [
    db
      .prepare(
        `INSERT INTO menu_items
          (id, category_id, name_en, name_zh, chinese_name, desc_en, desc_zh,
           image_url, image_alt_en, image_alt_zh, dietary_tags, note_en, note_zh,
           is_featured, is_available, sort_order, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(id) DO UPDATE SET
           category_id = excluded.category_id,
           name_en = excluded.name_en,
           name_zh = excluded.name_zh,
           chinese_name = excluded.chinese_name,
           desc_en = excluded.desc_en,
           desc_zh = excluded.desc_zh,
           image_url = CASE WHEN ? THEN excluded.image_url ELSE menu_items.image_url END,
           image_alt_en = excluded.image_alt_en,
           image_alt_zh = excluded.image_alt_zh,
           dietary_tags = excluded.dietary_tags,
           note_en = excluded.note_en,
           note_zh = excluded.note_zh,
           is_featured = excluded.is_featured,
           is_available = excluded.is_available,
           sort_order = excluded.sort_order,
           updated_at = datetime('now')`
      )
      .bind(
        itemId,
        input.categoryId,
        input.nameEn.trim(),
        input.nameZh.trim(),
        (input.chineseName?.trim() || input.nameZh.trim()),
        input.descEn.trim(),
        input.descZh.trim(),
        imageUrl,
        input.imageAltEn?.trim() || null,
        input.imageAltZh?.trim() || null,
        JSON.stringify(cleanDietary),
        input.noteEn?.trim() || null,
        input.noteZh?.trim() || null,
        input.featured ? 1 : 0,
        input.isAvailable ? 1 : 0,
        sortOrder,
        input.imageUrl === undefined ? 0 : 1
      ),
    db.prepare("DELETE FROM menu_variants WHERE item_id = ?").bind(itemId),
    ...normalizedVariants.map((v) =>
      db
        .prepare(
          `INSERT INTO menu_variants
            (id, item_id, size_en, size_zh, price_pence, is_default, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          v.id,
          itemId,
          v.sizeEn,
          v.sizeZh,
          v.pricePence,
          v.isDefault ? 1 : 0,
          v.sortOrder
        )
    ),
  ];

  if (input.imageUrl !== undefined) {
    statements.unshift(await queueRemovedMenuPhotos(db, itemId, imageUrl, input.uploadedPhotoUrls));
  }
  await db.batch(statements);
  await deleteRetiredMenuPhotos(db, itemId);
  return itemId;
}

export async function patchMenuItemFlags(
  id: string,
  patch: { isAvailable?: boolean; featured?: boolean }
): Promise<void> {
  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (typeof patch.isAvailable === "boolean") {
    updates.push("is_available = ?");
    values.push(patch.isAvailable ? 1 : 0);
  }
  if (typeof patch.featured === "boolean") {
    updates.push("is_featured = ?");
    values.push(patch.featured ? 1 : 0);
  }
  if (updates.length === 0) return;

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await db
    .prepare(`UPDATE menu_items SET ${updates.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function deleteMenuItem(id: string): Promise<void> {
  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  await db.batch([
    await queueRemovedMenuPhotos(db, id, null),
    db.prepare("DELETE FROM menu_variants WHERE item_id = ?").bind(id),
    db.prepare("DELETE FROM menu_items WHERE id = ?").bind(id),
  ]);
  await deleteRetiredMenuPhotos(db, id);
  try {
    await setMenuItemsNew([id], false);
  } catch {
    // Ignore — stale new-arrival entries are harmless and filtered out
  }
}

export type BulkMenuAction =
  | { type: "set-available"; ids: string[]; isAvailable: boolean }
  | { type: "set-featured"; ids: string[]; featured: boolean }
  | { type: "set-new"; ids: string[]; isNew: boolean }
  | { type: "move-category"; ids: string[]; categoryId: string }
  | { type: "delete"; ids: string[] }
  | { type: "reorder-items"; categoryId: string; orderedIds: string[] }
  | {
      type: "quick-prices";
      itemId: string;
      variants: Array<{
        id?: string;
        sizeEn: string;
        sizeZh: string;
        pricePence: number;
        isDefault?: boolean;
      }>;
    };

export async function bulkMenuItemsAction(action: BulkMenuAction): Promise<void> {
  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  if (action.type === "set-available") {
    const cleanIds = action.ids.map((id) => id.trim()).filter(Boolean);
    if (cleanIds.length === 0) return;
    const val = action.isAvailable ? 1 : 0;
    const stmts = cleanIds.map((id) =>
      db
        .prepare(
          "UPDATE menu_items SET is_available = ?, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(val, id)
    );
    await db.batch(stmts);
    return;
  }

  if (action.type === "set-featured") {
    const cleanIds = action.ids.map((id) => id.trim()).filter(Boolean);
    if (cleanIds.length === 0) return;
    const val = action.featured ? 1 : 0;
    const stmts = cleanIds.map((id) =>
      db
        .prepare(
          "UPDATE menu_items SET is_featured = ?, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(val, id)
    );
    await db.batch(stmts);
    return;
  }

  if (action.type === "set-new") {
    await setMenuItemsNew(action.ids, action.isNew);
    return;
  }

  if (action.type === "move-category") {
    const cleanIds = action.ids.map((id) => id.trim()).filter(Boolean);
    const categoryId = action.categoryId.trim();
    if (cleanIds.length === 0 || !categoryId) return;
    const maxRow = await db
      .prepare(
        "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM menu_items WHERE category_id = ?"
      )
      .bind(categoryId)
      .first<{ max_order: number }>();
    const startOrder = (maxRow?.max_order ?? -1) + 1;
    const stmts = cleanIds.map((id, idx) =>
      db
        .prepare(
          "UPDATE menu_items SET category_id = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(categoryId, startOrder + idx, id)
    );
    await db.batch(stmts);
    return;
  }

  if (action.type === "delete") {
    const cleanIds = action.ids.map((id) => id.trim()).filter(Boolean);
    for (const id of cleanIds) {
      await deleteMenuItem(id);
    }
    return;
  }

  if (action.type === "reorder-items") {
    const categoryId = action.categoryId.trim();
    const cleanIds = action.orderedIds.map((id) => id.trim()).filter(Boolean);
    if (!categoryId || cleanIds.length === 0) return;
    const stmts = cleanIds.map((id, idx) =>
      db
        .prepare(
          "UPDATE menu_items SET sort_order = ?, updated_at = datetime('now') WHERE id = ? AND category_id = ?"
        )
        .bind(idx, id, categoryId)
    );
    await db.batch(stmts);
    return;
  }

  if (action.type === "quick-prices") {
    const itemId = action.itemId.trim();
    if (!itemId) return;
    const normalized = action.variants
      .filter((v) => Number.isFinite(v.pricePence) && v.pricePence >= 0)
      .map((v, idx) => ({
        id:
          v.id?.trim() ||
          `${itemId}-v${idx}-${Math.random().toString(36).slice(2, 6)}`,
        sizeEn: v.sizeEn.trim() || "Regular",
        sizeZh: v.sizeZh.trim() || "标准",
        pricePence: Math.round(v.pricePence),
        isDefault: Boolean(v.isDefault),
        sortOrder: idx,
      }));
    if (normalized.length > 0 && !normalized.some((v) => v.isDefault)) {
      normalized[0].isDefault = true;
    }

    await db.batch([
      db.prepare("DELETE FROM menu_variants WHERE item_id = ?").bind(itemId),
      ...normalized.map((v) =>
        db
          .prepare(
            `INSERT INTO menu_variants
              (id, item_id, size_en, size_zh, price_pence, is_default, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            v.id,
            itemId,
            v.sizeEn,
            v.sizeZh,
            v.pricePence,
            v.isDefault ? 1 : 0,
            v.sortOrder
          )
      ),
      db
        .prepare(
          "UPDATE menu_items SET updated_at = datetime('now') WHERE id = ?"
        )
        .bind(itemId),
    ]);
  }
}

export interface MenuCategoryUpsertInput {
  id?: string;
  titleZh: string;
  titleEn: string;
  chineseTitle?: string;
  subtitleZh?: string;
  subtitleEn?: string;
}

export async function upsertMenuCategory(
  input: MenuCategoryUpsertInput
): Promise<string> {
  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  await ensureDefaultCategoriesInDb(db);

  const id =
    input.id?.trim() ||
    slugifyId(input.titleEn || input.titleZh || "category");

  const existing = await db
    .prepare("SELECT sort_order FROM menu_categories WHERE id = ?")
    .bind(id)
    .first<{ sort_order: number }>();

  let sortOrder = existing?.sort_order;
  if (typeof sortOrder !== "number") {
    const maxRow = await db
      .prepare("SELECT COALESCE(MAX(sort_order), -1) as max_order FROM menu_categories")
      .first<{ max_order: number }>();
    sortOrder = (maxRow?.max_order ?? -1) + 1;
  }

  await db
    .prepare(
      `INSERT INTO menu_categories
        (id, title_en, title_zh, chinese_title, subtitle_en, subtitle_zh, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         title_en = excluded.title_en,
         title_zh = excluded.title_zh,
         chinese_title = excluded.chinese_title,
         subtitle_en = excluded.subtitle_en,
         subtitle_zh = excluded.subtitle_zh,
         updated_at = datetime('now')`
    )
    .bind(
      id,
      input.titleEn.trim(),
      input.titleZh.trim(),
      (input.chineseTitle?.trim() || input.titleZh.trim().slice(0, 6)),
      (input.subtitleEn ?? "").trim(),
      (input.subtitleZh ?? "").trim(),
      sortOrder
    )
    .run();

  return id;
}

export async function reorderMenuCategories(orderedIds: string[]): Promise<void> {
  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  const cleanIds = orderedIds.map((id) => id.trim()).filter(Boolean);
  if (cleanIds.length === 0) return;

  await db.batch(
    cleanIds.map((id, idx) =>
      db
        .prepare(
          "UPDATE menu_categories SET sort_order = ?, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(idx, id)
    )
  );
}

export async function deleteMenuCategory(id: string): Promise<void> {
  const db = await getMenuDb();
  if (!db) {
    throw new Error("Cloudflare D1 binding MENU_DB is not available.");
  }

  const countRow = await db
    .prepare("SELECT COUNT(*) as total FROM menu_items WHERE category_id = ?")
    .bind(id)
    .first<{ total: number }>();

  if ((countRow?.total ?? 0) > 0) {
    throw new Error(
      `该分类下还有 ${countRow?.total} 道菜品，请先将菜品移动到其他分类或删除后再移除分类。`
    );
  }

  await db.prepare("DELETE FROM menu_categories WHERE id = ?").bind(id).run();
}
