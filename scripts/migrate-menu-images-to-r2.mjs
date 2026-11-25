#!/usr/bin/env node
// Normalize every referenced menu photo. --check decodes the sources without writing.
// For custom R2 URLs set R2_PUBLIC_BASE_URL to the same base used by the Worker.
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const mode = process.argv.includes("--remote") ? "--remote" : process.argv.includes("--local") ? "--local" : null;
if (!mode) throw new Error("Pass --local or --remote, optionally followed by --check.");
const check = process.argv.includes("--check");
const bucket = "jian-bing-liu-images";
const customBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, "");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jbl-menu-webp-"));

function wrangler(args) {
  return execFileSync(process.execPath, [path.join(root, "node_modules/wrangler/bin/wrangler.js"), ...args], {
    cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  });
}

function d1(command) {
  const result = wrangler(["d1", "execute", "MENU_DB", mode, "--json", "--command", command]);
  return JSON.parse(result)[0].results;
}

const quote = (value) => "'" + value.replaceAll("'", "''") + "'";

async function migrate(url) {
  const base = ["/api/media", customBase].find((prefix) => prefix && url.startsWith(prefix + "/dishes/"));
  const key = base && url.slice(base.length + 1);
  let source;
  if (key && /^dishes\/[\w.-]+$/.test(key)) {
    source = path.join(tmp, "source");
    wrangler(["r2", "object", "get", bucket + "/" + key, "--file", source, mode]);
  } else if (/^\/images\/[\w.-]+$/.test(url)) {
    source = path.join(root, "public", url.slice(1));
  } else {
    throw new Error("Unrecognized photo location. Check R2_PUBLIC_BASE_URL or upload the original in admin.");
  }

  const image = sharp(source, { failOn: "warning" });
  const { format } = await image.metadata();
  if (format === "webp") {
    // metadata() alone only checks the header. Decode pixels to detect corrupt images.
    await image.stats();
    if (key?.endsWith(".webp")) return "verified";
  }
  if (check) throw new Error("Needs migration to a WebP object in R2.");

  const bytes = format === "webp" ? fs.readFileSync(source) : await image
    .autoOrient().resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 }).toBuffer();
  const hash = createHash("sha256").update(bytes).digest("hex");
  const hashKey = `dishes/${hash}.webp`;
  const retired = d1(`SELECT 1 FROM menu_photo_removals WHERE object_key = ${quote(hashKey)}`);
  const target = retired.length ? `dishes/${randomUUID()}.webp` : hashKey;
  const output = path.join(tmp, "photo.webp");
  fs.writeFileSync(output, bytes);
  wrangler(["r2", "object", "put", bucket + "/" + target, "--file", output, "--content-type", "image/webp",
    "--cache-control", "public, max-age=31536000, immutable", mode]);
  // Leave old objects accessible. Only update references still pointing at this source.
  d1(`UPDATE menu_items SET image_url = ${quote("/api/media/" + target)}, updated_at = datetime('now') WHERE image_url = ${quote(url)}`);
  return "migrated";
}

try {
  const sourceFilter = process.argv.includes("--static-only") ? "image_url LIKE '/images/%'" : "COALESCE(image_url, '') <> ''";
  const urls = d1(`SELECT DISTINCT image_url FROM menu_items WHERE ${sourceFilter} ORDER BY image_url`);
  let verified = 0;
  let migrated = 0;
  let failures = 0;
  for (const { image_url: url } of urls) {
    try {
      const status = await migrate(url);
      if (status === "verified") verified++;
      else migrated++;
      console.log(status, url);
    } catch (error) {
      failures++;
      console.error(url, error.message);
    }
  }
  console.log(`${verified} verified, ${migrated} migrated, ${failures} failed (${mode.slice(2)}).`);
  if (failures) process.exitCode = 1;
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
