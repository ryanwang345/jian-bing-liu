import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getMenuImagesBucket } from "@/lib/cf-bindings";
import { getRuntimeEnv } from "@/lib/runtime-env";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
};

export async function POST(request: Request) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucket = await getMenuImagesBucket();
  if (!bucket) {
    return NextResponse.json(
      {
        error:
          "Cloudflare R2 binding MENU_IMAGES is not available in this environment.",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    const ext = ALLOWED_MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "仅支持 WebP / JPG / PNG / AVIF 图片格式" },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "图片不能超过 8MB" },
        { status: 400 }
      );
    }

    const rawName = (file.name || "dish")
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32);

    const uniqueId = crypto.randomUUID().slice(0, 8);
    const key = `dishes/${rawName || "dish"}-${Date.now().toString(36)}-${uniqueId}.${ext}`;
    const bytes = await file.arrayBuffer();

    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    const customBase = await getRuntimeEnv("R2_PUBLIC_BASE_URL");
    const url = customBase
      ? `${customBase.replace(/\/+$/, "")}/${key}`
      : `/api/media/${key}`;

    return NextResponse.json({ ok: true, key, url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
