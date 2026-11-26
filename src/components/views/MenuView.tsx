"use client";

import Link from "next/link";
import { ExternalLink, Info, Phone } from "lucide-react";
import {
  MenuBrowser,
  type MenuDietaryFilter,
} from "@/components/MenuBrowser";
import { phoneToTelHref, useSiteContent } from "@/components/SiteContentProvider";
import { menuCategories as defaultMenuCategories, type MenuCategory } from "@/data/menu";
import { useLocale } from "@/lib/i18n";

interface MenuViewProps {
  categories?: MenuCategory[];
  initialDietary?: MenuDietaryFilter;
}

export function MenuView({
  categories = defaultMenuCategories,
  initialDietary = "all",
}: MenuViewProps = {}) {
  const { isTraditional, t, zhText, pick } = useLocale();
  const { store, pages } = useSiteContent();
  const menuCopy = pages.menu;
  const phoneHref = phoneToTelHref(store.phoneDisplay);

  return (
    <div className="pb-20">
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="animate-fade-up flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
                <span>{t(menuCopy.eyebrow)}</span>
                <span aria-hidden="true" className="text-kraft-deep">
                  ·
                </span>
                <span
                  lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                  className="font-calligraphy text-lg font-normal tracking-normal text-ink"
                >
                  {zhText(menuCopy.chineseAccent)}
                </span>
              </p>
              <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.025em] text-ink sm:text-5xl">
                {t(menuCopy.title)}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
                {t(menuCopy.description)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {store.orderOnlineUrl && (
                <a
                  href={store.orderOnlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-sm font-semibold text-parchment shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
                >
                  {pick(
                    `在线点餐（${store.orderProviderZh}）`,
                    `Order Online (${store.orderProviderEn})`
                  )}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <a
                href={phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
              >
                <Phone className="h-4 w-4 text-cinnabar" aria-hidden="true" />
                {pick("致电", "Call")} {store.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MenuBrowser
          categories={categories}
          initialDietary={initialDietary}
        />

        <aside
          aria-label={t(menuCopy.allergenTitle)}
          className="mt-16 rounded-2xl border border-kraft-deep bg-kraft/50 p-6 sm:p-8"
        >
          <div className="flex items-start gap-3.5">
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-cinnabar"
              aria-hidden="true"
            />
            <div className="space-y-2 text-sm leading-relaxed text-ink-muted">
              <h2 className="font-display text-base font-bold text-ink">
                {t(menuCopy.allergenTitle)}
              </h2>
              <p>{t(menuCopy.dietaryNote)}</p>
              <p>
                {t(menuCopy.allergenNote)}{" "}
                <a
                  href={phoneHref}
                  className="font-semibold text-ink underline decoration-cinnabar/40 underline-offset-4 hover:text-cinnabar"
                >
                  {store.phoneDisplay}
                </a>
              </p>
              <p>
                {t(menuCopy.pricingNote)}{" "}
                <Link
                  href="/visit-us"
                  className="font-semibold text-ink underline underline-offset-4 hover:text-cinnabar"
                >
                  {pick("查看门店地址与营业时间 →", "See address & opening hours →")}
                </Link>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
