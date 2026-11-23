import { GalleryView } from "@/components/views/GalleryView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Gallery",
  description:
    "Browse real food and kitchen photography from Jian Bing Liu in Camden, London — savoury Jian Bing crepes, lace dessert cones, crispy dumplings, spring rolls, and hearty rice dishes.",
  path: "/gallery",
  image: "/images/nutella-strawberry-crepe.jpg",
});

export default function GalleryPage() {
  return <GalleryView />;
}
