import {
  deriveVariantsFromStaticItem,
  formatPricePence,
  menuCategories as staticMenuCategories,
  type DietaryTagKey,
  type MenuCategory,
  type MenuItem,
  type MenuVariant,
} from "@/data/menu";
import { getMenuDb, getMenuImagesBucket, type D1Database } from "@/lib/cf-bindings";

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
  variantRows: VariantRow[],
  includeUnavailable: boolean
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
    if (!includeUnavailable && row.is_available === 0) continue;

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

  return catRows
    .map((cat) => ({
      id: cat.id,
      title: { en: cat.title_en, zh: cat.title_zh },
      chineseTitle: cat.chinese_title,
      subtitle: { en: cat.subtitle_en, zh: cat.subtitle_zh },
      items: itemsByCategory.get(cat.id) ?? [],
    }))
    .filter((cat) => includeUnavailable || cat.items.length > 0);
}

async function queryMenuFromDb(
  db: D1Database,
  includeUnavailable: boolean
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
    return rowsToMenuCategories(catRows, itemRows, variantRows, includeUnavailable);
  } catch {
    return null;
  }
}

export async function getPublicMenuCategories(): Promise<MenuCategory[]> {
  const db = await getMenuDb();
  if (db) {
    const live = await queryMenuFromDb(db, false);
    if (live && live.length > 0) {
      return live;
    }
  }
  return hydrateStaticCategories();
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
    const live = await queryMenuFromDb(db, true);
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
            item.image ?? null,
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
           image_url = excluded.image_url,
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
        input.imageUrl?.trim() || null,
        input.imageAltEn?.trim() || null,
        input.imageAltZh?.trim() || null,
        JSON.stringify(cleanDietary),
        input.noteEn?.trim() || null,
        input.noteZh?.trim() || null,
        input.featured ? 1 : 0,
        input.isAvailable ? 1 : 0,
        sortOrder
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

  await db.batch(statements);
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
    db.prepare("DELETE FROM menu_variants WHERE item_id = ?").bind(id),
    db.prepare("DELETE FROM menu_items WHERE id = ?").bind(id),
  ]);
}
