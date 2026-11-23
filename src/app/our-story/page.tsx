import { StoryView } from "@/components/views/StoryView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Our Story",
  description:
    "The story behind Jian Bing Liu (煎饼刘) on Camden Road: hand-spread savoury Jian Bing, natural fruit-and-veg batters, and crisp lace sweet crepes cooked to order.",
  path: "/our-story",
  image: "/images/chef-lace-crepe.webp",
});

export default function OurStoryPage() {
  return <StoryView />;
}
