import { NextResponse } from "next/server";
import { getDynamicReviews } from "@/lib/reviews-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getDynamicReviews();

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
