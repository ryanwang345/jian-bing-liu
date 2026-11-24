import { HomeView } from "@/components/views/HomeView";
import { restaurant } from "@/data/restaurant";
import { getInitialReviewsForSsr } from "@/lib/reviews-service";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: `${restaurant.name} (${restaurant.chineseName}) | Authentic Chinese Street Food in Camden`,
  description: restaurant.description.en,
  path: "/",
});

export default async function HomePage() {
  const initialReviews = await getInitialReviewsForSsr();
  return <HomeView initialReviews={initialReviews} />;
}
