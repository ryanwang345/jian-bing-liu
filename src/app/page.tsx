import { HomeView } from "@/components/views/HomeView";
import { restaurant } from "@/data/restaurant";
import { getShowcasePosts } from "@/lib/showcase-posts";
import { getFeaturedMenuItems } from "@/lib/menu-service";
import { getInitialReviewsForSsr } from "@/lib/reviews-service";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: `${restaurant.name} (${restaurant.chineseName}) | Authentic Chinese Street Food in Camden`,
  description: restaurant.description.en,
  path: "/",
});

export default async function HomePage() {
  const [initialReviews, featuredItems, { posts }] = await Promise.all([
    getInitialReviewsForSsr(),
    getFeaturedMenuItems(),
    getShowcasePosts(true),
  ]);
  return (
    <HomeView
      initialReviews={initialReviews}
      featuredItems={featuredItems}
      posts={posts}
    />
  );
}
