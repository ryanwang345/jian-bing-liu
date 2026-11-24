import { NextResponse } from "next/server";
import { getRuntimeEnv } from "@/lib/runtime-env";

const PHOTO_NAME_RE = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

/**
 * Secure edge-cached proxy for Google Places API (New) v1 photo media.
 * Keeps GOOGLE_PLACES_API_KEY server-only and caches customer review photos for 24h.
 */
export async function GET(request: Request) {
  const apiKey = await getRuntimeEnv("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    return new NextResponse("Not configured", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const photoName = searchParams.get("name")?.trim() || "";
  if (!PHOTO_NAME_RE.test(photoName)) {
    return new NextResponse("Invalid photo reference", { status: 400 });
  }

  const rawWidth = Number(searchParams.get("w") || 720);
  const maxWidthPx = Number.isFinite(rawWidth)
    ? Math.min(1200, Math.max(240, Math.round(rawWidth)))
    : 720;

  try {
    const upstream = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
        },
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!upstream.ok || !upstream.body) {
      return new NextResponse("Photo unavailable", { status: 404 });
    }

    const contentType =
      upstream.headers.get("content-type") || "image/jpeg";

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Upstream timeout", { status: 504 });
  }
}
