#!/usr/bin/env node
/**
 * Uploads every menu photo currently referenced in D1 (`/images/...`) to the
 * R2 bucket under `dishes/<file>`, then rewrites `menu_items.image_url` to the
 * R2-backed `/api/media/dishes/<file>` route.
 *
 * Usage:
 *   node scripts/migrate-menu-images-to-r2.mjs --local
 *   node scripts/migrate-menu-images-to-r2.mjs --remote
 *
 * Idempotent: rows already pointing at /api/media/ are skipped.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const BUCKET = "jian-bing-liu-images";
const DB_BINDING = "MENU_DB";
const KEY_PREFIX = "dishes";

const mode = process.argv.includes("--remote")
  ? "--remote"
  : process.argv.includes("--local")
    ? "--local"
    : null;

if (!mode) {
  console.error("Please pass --local or --remote");
  process.exit(1);
}

const CONTENT_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

function wrangler(args, { json = false } = {}) {
  const out = execFileSync("pnpm", ["exec", "wrangler", ...args], {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (!json) return out;
  const start = out.indexOf("[");
  return JSON.parse(out.slice(start));
}

console.log(`\n▶ Reading menu image references from D1 (${mode})...`);
const result = wrangler(
  [
    "d1",
    "execute",
    DB_BINDING,
    mode,
    "--json",
    "--command",
    "SELECT DISTINCT image_url FROM menu_items WHERE image_url LIKE '/images/%' ORDER BY image_url;",
  ],
  { json: true }
);

const urls = (result[0]?.results ?? []).map((r) => r.image_url);
if (urls.length === 0) {
  console.log("✔ Nothing to migrate — all menu images already use R2.");
  process.exit(0);
}

console.log(`  Found ${urls.length} distinct local image(s).\n`);

const updates = [];
const missing = [];

for (const url of urls) {
  const fileName = url.replace(/^\/images\//, "");
  if (!fileName || fileName.includes("..") || fileName.includes("/")) {
    missing.push(`${url} (unsafe path, skipped)`);
    continue;
  }

  const localPath = path.join(rootDir, "public", "images", fileName);
  if (!fs.existsSync(localPath)) {
    missing.push(`${url} (file not found)`);
    continue;
  }

  const ext = path.extname(fileName).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const key = `${KEY_PREFIX}/${fileName}`;

  process.stdout.write(`  ↑ ${fileName} → r2://${BUCKET}/${key} ... `);
  wrangler([
    "r2",
    "object",
    "put",
    `${BUCKET}/${key}`,
    "--file",
    localPath,
    "--content-type",
    contentType,
    "--cache-control",
    "public, max-age=31536000, immutable",
    mode,
  ]);
  console.log("done");

  const newUrl = `/api/media/${key}`;
  updates.push(
    `UPDATE menu_items SET image_url = '${newUrl.replace(/'/g, "''")}', updated_at = datetime('now') WHERE image_url = '${url.replace(/'/g, "''")}';`
  );
}

if (updates.length > 0) {
  const sqlPath = path.join(os.tmpdir(), `jbl-r2-image-migration-${Date.now()}.sql`);
  fs.writeFileSync(sqlPath, updates.join("\n") + "\n", "utf8");
  console.log(`\n▶ Rewriting ${updates.length} image URL(s) in D1 (${mode})...`);
  wrangler(["d1", "execute", DB_BINDING, mode, "--file", sqlPath, "-y"]);
  fs.unlinkSync(sqlPath);
}

console.log(`\n✔ Migrated ${updates.length} image(s) to R2.`);
if (missing.length > 0) {
  console.log("⚠ Skipped:");
  for (const m of missing) console.log(`   - ${m}`);
}
