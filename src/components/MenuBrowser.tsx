"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { DietaryBadge } from "@/components/DietaryBadge";
import {
  dietaryLabels,
  type DietaryTagKey,
  type MenuCategory,
} from "@/data/menu";
import { useLocale } from "@/lib/i18n";

export type MenuDietaryFilter = "all" | DietaryTagKey;

interface MenuBrowserProps {
  categories: MenuCategory[];
  initialDietary?: MenuDietaryFilter;
}

const dietaryFilters: MenuDietaryFilter[] = [
  "all",
  "halal",
  "vegetarian",
  "vegan",
];

export function MenuBrowser({
  categories,
  initialDietary = "all",
}: MenuBrowserProps) {
  const { isZh, isTraditional, t, zhText, pick } = useLocale();
  const [activeDietary, setActiveDietary] =
    useState<MenuDietaryFilter>(initialDietary);

  const dietaryCounts = useMemo(() => {
    const allItems = categories.flatMap((c) => c.items);
    return {
      all: allItems.length,
      halal: allItems.filter((i) => i.dietary?.includes("halal")).length,
      vegetarian: allItems.filter((i) => i.dietary?.includes("vegetarian"))
        .length,
      vegan: allItems.filter((i) => i.dietary?.includes("vegan")).length,
    };
  }, [categories]);

  const handleSelectDietary = (filter: MenuDietaryFilter) => {
    setActiveDietary(filter);
    try {
      const url = new URL(window.location.href);
      if (filter === "all") {
        url.searchParams.delete("diet");
      } else {
        url.searchParams.set("diet", filter);
      }
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    } catch {
      // Ignore URL update restrictions
    }
  };

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items:
        activeDietary === "all"
          ? category.items
          : category.items.filter((item) =>
              item.dietary?.includes(activeDietary)
            ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div>
      <div className="sticky top-[57px] z-30 -mx-4 border-y border-kraft-deep/80 bg-parchment/95 px-4 py-3 backdrop-blur-md sm:top-[72px] sm:-mx-6 sm:px-6 sm:py-3.5 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2.5 sm:gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div
              role="group"
              aria-label={pick(
                "按饮食偏好筛选菜单",
                "Filter menu by dietary preference"
              )}
              className="no-scrollbar flex w-full min-w-0 max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 sm:w-auto sm:flex-wrap sm:overflow-visible sm:pb-0"
            >
              <span className="mr-1 shrink-0 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                {pick("饮食筛选：", "Dietary:")}
              </span>
              {dietaryFilters.map((filter) => {
                const selected = activeDietary === filter;
                const label =
                  filter === "all"
                    ? pick("全部", "All")
                    : t(dietaryLabels[filter]);
                const count = dietaryCounts[filter];
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => handleSelectDietary(filter)}
                    aria-pressed={selected}
                    className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold tabular-nums transition-all ${
                      selected
                        ? filter === "halal"
                          ? "bg-cinnabar text-parchment shadow-xs"
                          : filter === "vegetarian" || filter === "vegan"
                            ? "bg-jade text-parchment shadow-xs"
                            : "bg-ink text-parchment shadow-xs"
                        : "border border-kraft-deep bg-white/80 text-ink-soft hover:bg-kraft"
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>

            <span className="hidden text-xs font-medium text-ink-muted sm:inline">
              {pick("快速跳转分类：", "Jump to section:")}
            </span>
          </div>

          <nav
            aria-label={pick("菜单分类导航", "Menu categories")}
            className="no-scrollbar flex flex-nowrap gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible sm:pb-0"
          >
            {filteredCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="shrink-0 rounded-full border border-kraft-deep bg-kraft/50 px-3 py-1 text-xs font-semibold text-ink-soft transition-colors hover:border-cinnabar/40 hover:bg-kraft hover:text-cinnabar"
              >
                {t(cat.title)}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {activeDietary === "halal" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-cinnabar/25 bg-cinnabar/[0.06] px-5 py-4 text-sm text-ink-soft">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-cinnabar"
            aria-hidden="true"
          />
          <p className="leading-relaxed">
            {pick(
              "以下为您筛选出采用清真牛肉与清真鸡肉制作的招牌煎饼及手工煎饺。如需了解当日配料或点餐细节，欢迎随时向店员确认。",
              "Showing our signature crepes and pan-fried dumplings made with Halal beef and Halal chicken. Ask our team at the counter if you have any questions about fillings or preparation."
            )}
          </p>
        </div>
      )}

      <div className="mt-12 space-y-16">
        {filteredCategories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            aria-labelledby={`${category.id}-heading`}
            className="scroll-mt-40"
          >
            <div className="border-b border-kraft-deep pb-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id={`${category.id}-heading`}
                  className="font-display text-2xl font-bold text-ink sm:text-3xl"
                >
                  {t(category.title)}
                </h2>
                <span
                  lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                  className="font-calligraphy text-2xl text-cinnabar"
                >
                  {zhText(category.chineseTitle)}
                </span>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm text-ink-muted sm:text-base">
                {t(category.subtitle)}
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {category.items.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white/80 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-kraft-deep hover:shadow-md sm:flex-row"
                >
                  {item.image && (
                    <div className="relative h-48 w-full shrink-0 overflow-hidden bg-kraft sm:h-auto sm:w-40">
                      <Image
                        src={item.image}
                        alt={
                          item.imageAlt ? t(item.imageAlt) : t(item.name)
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, 160px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-lg font-bold text-ink">
                            {t(item.name)}
                          </h3>
                          {!isZh && item.chineseName && (
                            <p
                              lang="zh-Hans"
                              className="text-xs font-medium text-ink-muted"
                            >
                              {item.chineseName}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 text-right">
                          {item.price ? (
                            <span className="inline-block rounded-lg bg-kraft px-2.5 py-1 font-sans text-sm font-semibold tabular-nums text-cinnabar-dark">
                              {item.price}
                            </span>
                          ) : (
                            <span className="inline-block rounded-lg border border-dashed border-cinnabar/40 bg-cinnabar/5 px-2.5 py-1 text-xs font-semibold text-cinnabar-dark">
                              {pick("价格以店内为准", "Price TBC")}
                            </span>
                          )}
                          {item.secondaryPrice && (
                            <p className="mt-1 text-[11px] font-medium text-ink-muted">
                              {t(item.secondaryPrice)}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                        {t(item.description)}
                      </p>
                    </div>

                    {(item.dietary?.length || item.note) && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {item.dietary?.map((tag) => (
                          <DietaryBadge key={tag} tag={tag} />
                        ))}
                        {item.note && (
                          <span className="text-xs italic text-ink-muted">
                            {t(item.note)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {filteredCategories.length === 0 && (
          <div className="rounded-2xl border border-kraft-deep bg-kraft/40 p-10 text-center">
            <p className="font-display text-lg font-semibold text-ink">
              {pick(
                "当前筛选条件下暂无对应菜品。",
                "No dishes match that filter right now."
              )}
            </p>
            <button
              type="button"
              onClick={() => handleSelectDietary("all")}
              className="mt-4 rounded-full bg-cinnabar px-5 py-2 text-sm font-semibold text-parchment hover:bg-cinnabar-dark"
            >
              {pick("查看全部菜单", "Show Full Menu")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
