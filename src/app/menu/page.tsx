import type { MenuDietaryFilter } from "@/components/MenuBrowser";
import { MenuView } from "@/components/views/MenuView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Menu",
  description:
    "2026 menu and prices for Jian Bing Liu on Camden Road, London: Roast Duck, Halal Beef & Chicken Jian Bing, Crème Brûlée & Matcha Pistachio sweet crepes, meal deals from £12, braised rice bowls, dumplings, wontons, and drinks.",
  path: "/menu",
  image: "/images/roast-duck-jianbing.webp",
});

function parseDietParam(raw: string | string[] | undefined): MenuDietaryFilter {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (val === "halal" || val === "vegetarian" || val === "vegan") {
    return val;
  }
  return "all";
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ diet?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialDietary = parseDietParam(params.diet);
  return <MenuView initialDietary={initialDietary} />;
}
