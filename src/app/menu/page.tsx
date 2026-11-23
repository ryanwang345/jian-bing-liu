import { MenuView } from "@/components/views/MenuView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Menu",
  description:
    "Menu and prices for Jian Bing Liu on Camden Road, London: Halal Beef & Chicken Jian Bing, Veggie Lover crepes, braised beef rice, vegan Japanese curry, dumplings, wonton soups, sweet crepes, and drinks.",
  path: "/menu",
  image: "/images/beef-crepe-sleeve.webp",
});

export default function MenuPage() {
  return <MenuView />;
}
