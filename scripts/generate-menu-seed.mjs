#!/usr/bin/env node
/**
 * Generates migrations/0002_seed_menu.sql from src/data/menu.ts so the
 * Cloudflare D1 database can be initialized with all verified dishes, sizes,
 * prices, and photos in one idempotent migration.
 *
 * Usage: pnpm db:seed:gen
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const menuTsPath = path.join(rootDir, "src/data/menu.ts");
const outSqlPath = path.join(rootDir, "migrations/0002_seed_menu.sql");

// Compile src/data/menu.ts in-memory with TypeScript (zero extra deps)
const source = fs.readFileSync(menuTsPath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});

const mod = { exports: {} };
const fn = new Function("exports", "require", "module", outputText);
fn(mod.exports, () => ({}), mod);

const { menuCategories, deriveVariantsFromStaticItem } = mod.exports;

function sqlStr(val) {
  if (val === null || val === undefined) return "NULL";
  return `'${String(val).replace(/'/g, "''")}'`;
}

const lines = [
  "-- Auto-generated seed migration from src/data/menu.ts",
  "-- Run: pnpm db:seed:gen to regenerate",
  "",
];

menuCategories.forEach((cat, catIdx) => {
  lines.push(
    `INSERT OR IGNORE INTO menu_categories (id, title_en, title_zh, chinese_title, subtitle_en, subtitle_zh, sort_order) VALUES (${[
      sqlStr(cat.id),
      sqlStr(cat.title.en),
      sqlStr(cat.title.zh),
      sqlStr(cat.chineseTitle),
      sqlStr(cat.subtitle.en),
      sqlStr(cat.subtitle.zh),
      catIdx,
    ].join(", ")});`
  );

  cat.items.forEach((item, itemIdx) => {
    lines.push(
      `INSERT OR IGNORE INTO menu_items (id, category_id, name_en, name_zh, chinese_name, desc_en, desc_zh, image_url, image_alt_en, image_alt_zh, dietary_tags, note_en, note_zh, is_featured, is_available, sort_order) VALUES (${[
        sqlStr(item.id),
        sqlStr(cat.id),
        sqlStr(item.name.en),
        sqlStr(item.name.zh),
        sqlStr(item.chineseName || ""),
        sqlStr(item.description.en),
        sqlStr(item.description.zh),
        sqlStr(item.image ?? null),
        sqlStr(item.imageAlt?.en ?? null),
        sqlStr(item.imageAlt?.zh ?? null),
        sqlStr(JSON.stringify(item.dietary ?? [])),
        sqlStr(item.note?.en ?? null),
        sqlStr(item.note?.zh ?? null),
        item.featured ? 1 : 0,
        item.isAvailable === false ? 0 : 1,
        itemIdx,
      ].join(", ")});`
    );

    const variants = deriveVariantsFromStaticItem(item);
    variants.forEach((v, vIdx) => {
      lines.push(
        `INSERT OR IGNORE INTO menu_variants (id, item_id, size_en, size_zh, price_pence, is_default, sort_order) VALUES (${[
          sqlStr(v.id),
          sqlStr(item.id),
          sqlStr(v.size.en),
          sqlStr(v.size.zh),
          Math.round(v.pricePence),
          v.isDefault ? 1 : 0,
          vIdx,
        ].join(", ")});`
      );
    });
  });

  lines.push("");
});

fs.writeFileSync(outSqlPath, lines.join("\n"), "utf8");
console.log(
  `Generated ${outSqlPath} with ${menuCategories.length} categories and ${menuCategories.reduce((s, c) => s + c.items.length, 0)} items.`
);
