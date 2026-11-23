"use client";

import { useState } from "react";
import Image from "next/image";
import { DietaryBadge } from "@/components/DietaryBadge";
import type { DietaryTag, MenuCategory } from "@/data/menu";

interface MenuBrowserProps {
  categories: MenuCategory[];
}

const dietaryFilters: Array<"All" | DietaryTag> = [
  "All",
  "Halal",
  "Vegetarian",
  "Vegan",
];

export function MenuBrowser({ categories }: MenuBrowserProps) {
  const [activeDietary, setActiveDietary] = useState<"All" | DietaryTag>("All");

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items:
        activeDietary === "All"
          ? category.items
          : category.items.filter((item) =>
              item.dietary?.includes(activeDietary)
            ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div>
      {/* Sticky filter & category jump bar */}
      <div className="sticky top-[69px] z-30 -mx-4 border-y border-kraft-deep/80 bg-parchment/95 px-4 py-3.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Filter menu by dietary preference"
              className="flex flex-wrap items-center gap-1.5"
            >
              <span className="mr-1 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                Dietary:
              </span>
              {dietaryFilters.map((filter) => {
                const selected = activeDietary === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveDietary(filter)}
                    aria-pressed={selected}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                      selected
                        ? "bg-ink text-parchment shadow-xs"
                        : "border border-kraft-deep bg-white/80 text-ink-soft hover:bg-kraft"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-medium text-ink-muted">
              Jump to section:
            </span>
          </div>

          <nav
            aria-label="Menu categories"
            className="flex flex-wrap gap-1.5"
          >
            {filteredCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="rounded-full border border-kraft-deep bg-kraft/50 px-3 py-1 text-xs font-semibold text-ink-soft transition-colors hover:border-cinnabar/40 hover:bg-kraft hover:text-cinnabar"
              >
                {cat.title}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Category sections */}
      <div className="mt-12 space-y-16">
        {filteredCategories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            aria-labelledby={`${category.id}-heading`}
            className="scroll-mt-36"
          >
            <div className="border-b border-kraft-deep pb-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id={`${category.id}-heading`}
                  className="font-display text-2xl font-bold text-ink sm:text-3xl"
                >
                  {category.title}
                </h2>
                <span
                  lang="zh-Hans"
                  className="font-calligraphy text-2xl text-cinnabar"
                >
                  {category.chineseTitle}
                </span>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm text-ink-muted sm:text-base">
                {category.subtitle}
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
                        alt={item.imageAlt || item.name}
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
                            {item.name}
                          </h3>
                          {item.chineseName && (
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
                            <span className="inline-block rounded-lg bg-kraft px-2.5 py-1 font-display text-base font-bold text-cinnabar-dark">
                              {item.price}
                            </span>
                          ) : (
                            <span className="inline-block rounded-lg border border-dashed border-cinnabar/40 bg-cinnabar/5 px-2.5 py-1 text-xs font-semibold text-cinnabar-dark">
                              Price TBC
                            </span>
                          )}
                          {item.secondaryPrice && (
                            <p className="mt-1 text-[11px] font-medium text-ink-muted">
                              {item.secondaryPrice}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                        {item.description}
                      </p>
                    </div>

                    {(item.dietary?.length || item.note) && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {item.dietary?.map((tag) => (
                          <DietaryBadge key={tag} tag={tag} />
                        ))}
                        {item.note && (
                          <span className="text-xs italic text-ink-muted">
                            {item.note}
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
              No dishes match that filter right now.
            </p>
            <button
              type="button"
              onClick={() => setActiveDietary("All")}
              className="mt-4 rounded-full bg-cinnabar px-5 py-2 text-sm font-semibold text-parchment hover:bg-cinnabar-dark"
            >
              Show Full Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
