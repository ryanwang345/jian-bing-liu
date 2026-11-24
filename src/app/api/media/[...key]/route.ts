import { NextResponse } from "next/server";
import { getMenuImagesBucket } from "@/lib/cf-bindings";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> }
) {
  const { key: segments } = await context.params;
  if (
    !segments ||
    segments.length === 0 ||
    segments.some(
      (seg) => !seg || seg === "." || seg === ".." || seg.includes("\\")
    )
  ) {
    return new NextResponse("Invalid media key", { status: 400 });
  }

  const objectKey = segments.join("/");
  const bucket = await getMenuImagesBucket();
  if (!bucket) {
    return new NextResponse("R2 bucket not configured", { status: 404 });
  }

  const object = await bucket.get(objectKey);
  if (!object) {
    return new NextResponse("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType || "image/webp"
  );
  headers.set(
    "Cache-Control",
    object.httpMetadata?.cacheControl || "public, max-age=31536000, immutable"
  );
  if (object.httpEtag) {
    headers.set("ETag", object.httpEtag);
  }

  return new NextResponse(object.body, { status: 200, headers });
}
