import Link from "next/link";
import { ExternalLink, Info, Phone } from "lucide-react";
import { MenuBrowser } from "@/components/MenuBrowser";
import { menuCategories } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Menu",
  description:
    "Explore the verified menu for Jian Bing Liu in Camden, London — Halal Beef & Chicken Jian Bing crepes, Veggie Lover crepes, braised mains, vegan Japanese curry, dumplings, wonton soups, sweet crepes, and drinks.",
  path: "/menu",
  image: "/images/beef-crepe-sleeve.jpg",
});

export default function MenuPage() {
  return (
    <div className="pb-20">
      {/* Page Hero */}
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
                <span>Our Menu</span>
                <span aria-hidden="true" className="text-kraft-deep">
                  ·
                </span>
                <span
                  lang="zh-Hans"
                  className="font-calligraphy text-lg font-normal tracking-normal text-ink"
                >
                  精选菜单
                </span>
              </p>
              <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Fresh Chinese street food, cooked to order
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
                From crisp savoury Jian Bing and lunchtime specials to hearty
                braised beef, vegan Japanese curry, handmade dumplings, and
                hand-brewed drinks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {restaurant.links.orderOnline && (
                <a
                  href={restaurant.links.orderOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-sm font-semibold text-parchment shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
                >
                  Order Online ({restaurant.links.orderOnlineProvider})
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <a
                href={restaurant.phone.href}
                className="inline-flex items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
              >
                <Phone className="h-4 w-4 text-cinnabar" aria-hidden="true" />
                Call {restaurant.phone.display}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories & Dietary Filter */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MenuBrowser categories={menuCategories} />

        {/* Dietary & Allergen Notice */}
        <aside
          aria-label="Allergen and pricing notice"
          className="mt-16 rounded-2xl border border-kraft-deep bg-kraft/50 p-6 sm:p-8"
        >
          <div className="flex items-start gap-3.5">
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-cinnabar"
              aria-hidden="true"
            />
            <div className="space-y-2 text-sm leading-relaxed text-ink-muted">
              <h2 className="font-display text-base font-bold text-ink">
                Allergens, dietary details &amp; pricing notes
              </h2>
              <p>
                Our kitchen handles wheat/gluten, eggs, sesame, soy, dairy,
                crustaceans (shrimp wontons), and nuts (Nutella). If you have a
                food allergy or intolerance, please speak with our team on{" "}
                <a
                  href={restaurant.phone.href}
                  className="font-semibold text-ink underline decoration-cinnabar/40 underline-offset-4 hover:text-cinnabar"
                >
                  {restaurant.phone.display}
                </a>{" "}
                before placing your order.
              </p>
              <p>
                Items marked <strong>Price TBC</strong> are photographed
                offerings whose current pricing should be confirmed in-store or
                on our{" "}
                <a
                  href={restaurant.links.orderOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cinnabar underline underline-offset-4 hover:text-cinnabar-dark"
                >
                  {restaurant.links.orderOnlineProvider} ordering page
                </a>
                . Want to pick up in person?{" "}
                <Link
                  href="/visit-us"
                  className="font-semibold text-ink underline underline-offset-4 hover:text-cinnabar"
                >
                  See our Camden address &amp; opening hours
                </Link>
                .
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
