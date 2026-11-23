import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GalleryGrid } from "@/components/GalleryGrid";
import { galleryCategories, galleryItems } from "@/data/gallery";
import { restaurant } from "@/data/restaurant";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Gallery",
  description:
    "Browse real food and kitchen photography from Jian Bing Liu in Camden, London — savoury Jian Bing crepes, lace dessert cones, crispy dumplings, spring rolls, and hearty rice dishes.",
  path: "/gallery",
  image: "/images/nutella-strawberry-crepe.jpg",
});

export default function GalleryPage() {
  return (
    <div className="pb-20">
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
                <span>Photo Gallery</span>
                <span aria-hidden="true" className="text-kraft-deep">
                  ·
                </span>
                <span
                  lang="zh-Hans"
                  className="font-calligraphy text-lg font-normal tracking-normal text-ink"
                >
                  美食图集
                </span>
              </p>
              <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Straight from our Camden kitchen
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
                Every photo here is captured from our own griddle, counter, and
                packaging. Select any image to view it full-screen.
              </p>
            </div>

            <Link
              href="/menu"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-sm font-semibold text-parchment shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
            >
              See Prices &amp; Menu
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <GalleryGrid categories={galleryCategories} items={galleryItems} />

        <p className="mt-10 text-center text-xs text-ink-muted">
          All dishes shown are prepared fresh at {restaurant.name} (
          {restaurant.address.street}, {restaurant.address.postalCode}).
          Seasonal garnishes and toppings may vary.
        </p>
      </section>
    </div>
  );
}
