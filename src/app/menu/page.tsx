import { MenuView } from "@/components/views/MenuView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Menu",
  description:
    "Explore the verified menu for Jian Bing Liu in Camden, London — Halal Beef & Chicken Jian Bing crepes, Veggie Lover crepes, braised mains, vegan Japanese curry, dumplings, wonton soups, sweet crepes, and drinks.",
  path: "/menu",
  image: "/images/beef-crepe-sleeve.jpg",
});

export default function MenuPage() {
  return <MenuView />;
}
