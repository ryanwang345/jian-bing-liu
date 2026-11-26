import { GalleryView } from "@/components/views/GalleryView";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Gallery",
  description:
    "Photos from our Camden Road kitchen: savoury Jian Bing crepes, lacy dessert cones, pan-fried dumplings, spring rolls, and hot rice dishes.",
  path: "/gallery",
  image: "/images/nutella-strawberry-crepe.webp",
});

export default function GalleryPage() {
  return <GalleryView />;
}
