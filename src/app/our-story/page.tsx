import { StoryView } from "@/components/views/StoryView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Our Story",
  description:
    "Meet Jian Bing Liu (煎饼刘) in Camden, London — celebrating traditional Chinese savoury Jian Bing, vibrant fruit-and-vegetable batters, and handcrafted lace sweet crepes.",
  path: "/our-story",
  image: "/images/chef-lace-crepe.jpg",
});

export default function OurStoryPage() {
  return <StoryView />;
}
