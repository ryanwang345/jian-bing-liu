import { HomeView } from "@/components/views/HomeView";
import { restaurant } from "@/data/restaurant";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: `${restaurant.name} (${restaurant.chineseName}) | Authentic Chinese Street Food in Camden`,
  description: restaurant.description.en,
  path: "/",
});

export default function HomePage() {
  return <HomeView />;
}
