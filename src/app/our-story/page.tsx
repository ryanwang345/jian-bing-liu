import { StoryView } from "@/components/views/StoryView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Our Story",
  description:
    "Retired in China, started from zero in London — third time lucky. Hand-spun Jian Bing with natural dragon fruit & beetroot batters on Camden Road, Halal & vegan friendly.",
  path: "/our-story",
  image: "/images/chef-lace-crepe.webp",
});

export default function OurStoryPage() {
  return <StoryView />;
}
