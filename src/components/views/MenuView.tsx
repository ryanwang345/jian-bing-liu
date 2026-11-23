"use client";

import Link from "next/link";
import { ExternalLink, Info, Phone } from "lucide-react";
import {
  MenuBrowser,
  type MenuDietaryFilter,
} from "@/components/MenuBrowser";
import { menuCategories } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { useLocale } from "@/lib/i18n";

interface MenuViewProps {
  initialDietary?: MenuDietaryFilter;
}

export function MenuView({ initialDietary = "all" }: MenuViewProps = {}) {
  const { isZh, isTraditional, zhText, pick } = useLocale();

  return (
    <div className="pb-20">
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="animate-fade-up flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
                <span>{pick("全部菜品", "Our Menu")}</span>
                <span aria-hidden="true" className="text-kraft-deep">
                  ·
                </span>
                <span
                  lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                  className="font-calligraphy text-lg font-normal tracking-normal text-ink"
                >
                  {zhText("精选菜单")}
                </span>
              </p>
              <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.025em] text-ink sm:text-5xl">
                {pick(
                  "现点现做，地道中式街头风味",
                  "Fresh Chinese street food, cooked to order"
                )}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
                {pick(
                  "从热乎酥脆的招牌咸味煎饼、午市简餐，到慢炖土豆牛肉、纯素日式咖喱、手工煎饺与现磨热饮，满足每一顿的想念。",
                  "Savoury Jian Bing, lighter lunchtime crepes, slow-braised beef with rice, vegan Japanese curry, pan-fried dumplings, and fresh drinks."
                )}
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
                  {pick(
                    `在线点餐（${restaurant.links.orderOnlineProviderZh}）`,
                    `Order Online (${restaurant.links.orderOnlineProvider})`
                  )}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <a
                href={restaurant.phone.href}
                className="inline-flex items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
              >
                <Phone className="h-4 w-4 text-cinnabar" aria-hidden="true" />
                {pick("致电", "Call")} {restaurant.phone.display}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MenuBrowser
          categories={menuCategories}
          initialDietary={initialDietary}
        />

        <aside
          aria-label={pick("过敏原与价格提示", "Allergen and pricing notice")}
          className="mt-16 rounded-2xl border border-kraft-deep bg-kraft/50 p-6 sm:p-8"
        >
          <div className="flex items-start gap-3.5">
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-cinnabar"
              aria-hidden="true"
            />
            <div className="space-y-2 text-sm leading-relaxed text-ink-muted">
              <h2 className="font-display text-base font-bold text-ink">
                {pick(
                  "过敏原提示与价格说明",
                  "Allergens, dietary details & pricing notes"
                )}
              </h2>
              {isZh ? (
                <>
                  <p>
                    {zhText(
                      "清真牛肉煎饼、清真鸡肉煎饼及牛肉煎饺均选用清真肉类食材，并同时供应蛋奶素煎饼、素煎饺与纯素日式咖喱，点单时可通过顶部「饮食筛选」一键查看。"
                    )}
                  </p>
                  <p>
                    {zhText(
                      "本店厨房日常使用小麦/麸质、鸡蛋、芝麻、大豆、乳制品、甲壳类（鲜虾馄饨）及坚果（榛子巧克力酱）。如您对任何食材过敏，请在下单前致电 "
                    )}
                    <a
                      href={restaurant.phone.href}
                      className="font-semibold text-ink underline decoration-cinnabar/40 underline-offset-4 hover:text-cinnabar"
                    >
                      {restaurant.phone.display}
                    </a>{" "}
                    {zhText("或在点单时告知店员。")}
                  </p>
                  <p>
                    {zhText("标注")}
                    <strong>{zhText("「价格以店内为准」")}</strong>
                    {zhText("的实拍菜品，其当日售价请以门店现场或 ")}
                    <a
                      href={restaurant.links.orderOnline}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-cinnabar underline underline-offset-4 hover:text-cinnabar-dark"
                    >
                      {zhText(`${restaurant.links.orderOnlineProviderZh}页面`)}
                    </a>
                    {zhText("为准。如需到店自取，可前往 ")}
                    <Link
                      href="/visit-us"
                      className="font-semibold text-ink underline underline-offset-4 hover:text-cinnabar"
                    >
                      {zhText("查看门店地址与营业时间")}
                    </Link>
                    。
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Our signature Beef &amp; Chicken Jian Bing crepes and
                    pan-fried beef dumplings are made with{" "}
                    <strong>Halal meat</strong>, alongside dedicated vegetarian
                    crepes, veggie dumplings, and vegan Japanese curry. Use the
                    dietary filter bar above to narrow the menu in one tap.
                  </p>
                  <p>
                    Our kitchen handles wheat/gluten, eggs, sesame, soy, dairy,
                    crustaceans (shrimp wontons), and nuts (Nutella). If you
                    have a food allergy or intolerance, please speak with our
                    team on{" "}
                    <a
                      href={restaurant.phone.href}
                      className="font-semibold text-ink underline decoration-cinnabar/40 underline-offset-4 hover:text-cinnabar"
                    >
                      {restaurant.phone.display}
                    </a>{" "}
                    before placing your order.
                  </p>
                  <p>
                    Items marked <strong>Price TBC</strong> vary seasonally or by
                    toppings; please check at the counter or on our{" "}
                    <a
                      href={restaurant.links.orderOnline}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-cinnabar underline underline-offset-4 hover:text-cinnabar-dark"
                    >
                      {restaurant.links.orderOnlineProvider} page
                    </a>
                    . Heading over in person?{" "}
                    <Link
                      href="/visit-us"
                      className="font-semibold text-ink underline underline-offset-4 hover:text-cinnabar"
                    >
                      See our Camden address &amp; opening hours
                    </Link>
                    .
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
