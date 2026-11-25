import { getCfEnv } from "@/lib/cf-bindings";
import { getRuntimeEnv } from "@/lib/runtime-env";
import menuPhotoSources from "@/data/menu-photo-sources.json";
import { SITE_URL } from "@/data/restaurant";

const photoErrors = {
  cleanupFailed: {
    en: "The menu change was saved, but R2 photo cleanup is pending.",
    zh: "菜单已更新，旧照片仍待清理。请重试刚才的操作。",
  },
  invalidSize: {
    en: "Menu photo must be non-empty and at most 8 MB.",
    zh: "请选择非空且不超过 8 MB 的照片。",
  },
  missingImageServices: {
    en: "The Images or MENU_IMAGES binding is unavailable.",
    zh: "未连接图片转换服务或 R2 图库。",
  },
  decodeFailed: {
    en: "The image decoder could not read the menu photo.",
    zh: "无法读取这张照片，请选择可打开的图片。",
  },
  conversionFailed: {
    en: "The image service failed to convert the menu photo.",
    zh: "照片转换失败，请重试。",
  },
  invalidWebp: {
    en: "The image service returned invalid WebP data.",
    zh: "图片服务未返回有效的 WebP 照片。",
  },
  missingBucket: {
    en: "The MENU_IMAGES R2 binding is unavailable.",
    zh: "未连接 R2 图库。",
  },
  missingAssets: {
    en: "The ASSETS binding is unavailable.",
    zh: "未连接网站图片目录。",
  },
  assetNotFound: {
    en: "The menu photo was not found in site assets.",
    zh: "找不到指定的菜品照片。",
  },
  invalidPath: {
    en: "Invalid menu photo path.",
    zh: "请上传照片，或填写图库中已有的菜品图片路径。",
  },
  objectNotFound: {
    en: "The menu photo was not found in R2.",
    zh: "R2 中找不到这张照片，请重新上传。",
  },
} as const;

export class MenuPhotoError extends Error {
  constructor(readonly reason: keyof typeof photoErrors, readonly status = 400) {
    super(photoErrors[reason].en);
    this.name = "MenuPhotoError";
  }

  get userMessage() {
    return photoErrors[this.reason].zh;
  }
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const webpType = "image/webp";

function isWebp(bytes: ArrayBuffer) {
  if (bytes.byteLength < 20) return false;
  const header = new DataView(bytes);
  return header.getUint32(0) === 0x52494646 && // RIFF
    header.getUint32(4, true) + 8 === bytes.byteLength &&
    header.getUint32(8) === 0x57454250 && // WEBP
    [0x56503820, 0x5650384c, 0x56503858].includes(header.getUint32(12)); // VP8 / VP8L / VP8X
}

export async function storeMenuPhoto(photo: Blob) {
  if (!photo.size || photo.size > MAX_UPLOAD_BYTES) {
    throw new MenuPhotoError("invalidSize");
  }

  const env = await getCfEnv();
  if (!env?.IMAGES || !env.MENU_IMAGES) {
    throw new MenuPhotoError("missingImageServices", 503);
  }

  // The decoder reads the actual upload bytes, independent of its name or MIME label.
  let response: Response;
  try {
    const result = await env.IMAGES.input(photo.stream())
      .transform({ width: 1280, height: 1280, fit: "scale-down" })
      .output({ format: webpType, quality: 84 });
    response = result.response();
  } catch (error) {
    if (error instanceof Error && "code" in error && Number(error.code) === 9412) {
      throw new MenuPhotoError("decodeFailed");
    }
    throw error;
  }
  if (!response.ok) throw new MenuPhotoError("conversionFailed", 502);
  const bytes = await response.arrayBuffer();
  if (!isWebp(bytes)) throw new MenuPhotoError("invalidWebp", 502);

  // A new upload gets its own key, even if another editor is clearing identical bytes.
  const key = `dishes/${crypto.randomUUID()}.webp`;
  await env.MENU_IMAGES.put(key, bytes, {
    httpMetadata: { contentType: webpType, cacheControl: "public, max-age=31536000, immutable" },
  });
  const base = (await getRuntimeEnv("R2_PUBLIC_BASE_URL"))?.replace(/\/+$/, "") || "/api/media";
  return { key, url: `${base}/${key}` };
}

// Also normalize images supplied through the menu editor's existing-path field.
export async function resolveMenuPhotoUrl(value?: string | null): Promise<string | null> {
  const url = value?.trim();
  if (!url) return null;
  const env = await getCfEnv();
  if (!env?.MENU_IMAGES) throw new MenuPhotoError("missingBucket", 503);
  if (/^\/images\/[\w.-]+\.(?:webp|jpe?g|png|avif|heic|heif)$/i.test(url)) {
    const sources: Record<string, string> = menuPhotoSources;
    const source = sources[url];
    if (source) {
      const key = new URL(source).pathname.slice("/api/media/".length);
      const object = await env.MENU_IMAGES.get(key);
      if (object) return (await storeMenuPhoto(new Blob([await object.arrayBuffer()]))).url;
      // Local development buckets may not have the permanent site assets.
      const response = await fetch(source);
      if (!response.ok) throw new MenuPhotoError("assetNotFound");
      return (await storeMenuPhoto(await response.blob())).url;
    }
    if (!env.ASSETS) throw new MenuPhotoError("missingAssets", 503);
    const response = await env.ASSETS.fetch(new Request(new URL(url, SITE_URL)));
    if (!response.ok) throw new MenuPhotoError("assetNotFound");
    return (await storeMenuPhoto(await response.blob())).url;
  }

  const customBase = (await getRuntimeEnv("R2_PUBLIC_BASE_URL"))?.replace(/\/+$/, "");
  const base = ["/api/media", customBase].find((prefix) => prefix && url.startsWith(prefix + "/dishes/"));
  const key = base && url.slice(base.length + 1);
  if (!key || !/^dishes\/[a-zA-Z0-9_.-]+$/.test(key)) {
    throw new MenuPhotoError("invalidPath");
  }

  const object = await env.MENU_IMAGES.get(key);
  if (!object) throw new MenuPhotoError("objectNotFound");
  const bytes = await object.arrayBuffer();
  if (key.endsWith(".webp") && object.httpMetadata?.contentType === webpType && isWebp(bytes)) return url;
  return (await storeMenuPhoto(new Blob([bytes]))).url;
}
