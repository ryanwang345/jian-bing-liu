import type { MenuDietaryFilter } from "@/components/MenuBrowser";
import { MenuView } from "@/components/views/MenuView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Menu",
  description:
    "Menu and prices for Jian Bing Liu on Camden Road, London: Halal Beef & Chicken Jian Bing, Veggie Lover crepes, braised beef rice, vegan Japanese curry, dumplings, wonton soups, sweet crepes, and drinks.",
  path: "/menu",
  image: "/images/beef-crepe-sleeve.webp",
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
