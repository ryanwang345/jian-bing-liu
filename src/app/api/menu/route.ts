import { NextResponse } from "next/server";
import { getPublicMenuCategories } from "@/lib/menu-service";

export async function GET() {
  const categories = await getPublicMenuCategories();
  return NextResponse.json(
    { categories },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
