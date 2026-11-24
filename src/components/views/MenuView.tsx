"use client";

import Link from "next/link";
import { ExternalLink, Info, Phone } from "lucide-react";
import {
  MenuBrowser,
  type MenuDietaryFilter,
} from "@/components/MenuBrowser";
import { menuCategories as defaultMenuCategories, type MenuCategory } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { useLocale } from "@/lib/i18n";

interface MenuViewProps {
  categories?: MenuCategory[];
  initialDietary?: MenuDietaryFilter;
}

export function MenuView({
  categories = defaultMenuCategories,
  initialDietary = "all",
}: MenuViewProps = {}) {
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
                  "现点现做，热乎踏实的家常街头味",
                  "Warm street food, cooked fresh to order"
                )}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
                {pick(
                  "招牌烤鸭、清真牛鸡与素菜果蔬煎饼（中份 £8 起）、优惠套餐（£12 起）、焦糖布蕾与抹茶开心果可丽饼、卤肉/炖牛肉盖饭、手工煎饺馄饨与港式特色饮品——价格以门店最新菜单为准。",
                  "Roast Duck, Halal beef & chicken and veggie Jian Bing (medium from £8), £12+ Meal Deals, Crème Brûlée & Matcha Pistachio crepes, braised beef & pork rice bowls, pan-fried dumplings and Hong Kong milk teas."
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
          categories={categories}
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
                      "清真牛肉煎饼、清真鸡肉煎饼、清真牛肉夹馍、牛肉煎饺及牛肉馄饨均选用清真肉类食材，并同时供应蛋奶素果蔬煎饼、菠菜芝士煎饼、素煎饺及纯素春卷与多款饮品，点单时可通过顶部「饮食筛选」一键查看。"
                    )}
                  </p>
                  <p>
                    {zhText(
                      "本店厨房日常使用小麦/麸质、鸡蛋、芝麻、大豆、乳制品、甲壳类（鲜虾馄饨、芝麻虾多士）及坚果（榛子巧克力酱、开心果）。如您对任何食材过敏，请在下单前致电 "
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
                    {zhText("本页所有菜品与售价均已同步门店 2026 最新菜单。线上外卖可直接前往 ")}
                    <a
                      href={restaurant.links.orderOnline}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-cinnabar underline underline-offset-4 hover:text-cinnabar-dark"
                    >
                      {zhText(`${restaurant.links.orderOnlineProviderZh}页面`)}
                    </a>
                    {zhText("下单；如需到店自取，可前往 ")}
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
                    Our Beef &amp; Chicken Jian Bing crepes, Beef Stuffed Bun,
                    pan-fried beef dumplings, and beef wontons are made with{" "}
                    <strong>Halal meat</strong>, alongside vegetarian crepes
                    (Veggie Lover &amp; Spinach &amp; Cheese), veggie dumplings,
                    and vegan spring rolls &amp; drinks. Use the dietary filter
                    bar above to narrow the menu in one tap.
                  </p>
                  <p>
                    Our kitchen handles wheat/gluten, eggs, sesame, soy, dairy,
                    crustaceans (prawn wontons &amp; prawn toast), and nuts
                    (Nutella &amp; pistachio). If you have a food allergy or
                    intolerance, please speak with our team on{" "}
                    <a
                      href={restaurant.phone.href}
                      className="font-semibold text-ink underline decoration-cinnabar/40 underline-offset-4 hover:text-cinnabar"
                    >
                      {restaurant.phone.display}
                    </a>{" "}
                    before placing your order.
                  </p>
                  <p>
                    All prices match our current Camden Road counter menu. Order
                    for delivery on our{" "}
                    <a
                      href={restaurant.links.orderOnline}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-cinnabar underline underline-offset-4 hover:text-cinnabar-dark"
                    >
                      {restaurant.links.orderOnlineProvider} page
                    </a>
                    , or heading over in person?{" "}
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
