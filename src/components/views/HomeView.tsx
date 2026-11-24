"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Flame,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { DietaryBadge } from "@/components/DietaryBadge";
import { DishSocialActions } from "@/components/DishSocialActions";
import { LiveOpenBadge } from "@/components/LiveOpenBadge";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ShareSpotButton } from "@/components/ShareSpotButton";
import { SocialIcon } from "@/components/SocialIcon";
import { SocialStoryStrip } from "@/components/SocialStoryStrip";
import { featuredMenuItems } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { useLocale, type LocalizedText } from "@/lib/i18n";
import type { ReviewsPayload } from "@/lib/reviews-service";

// Code-split below-the-fold interactive bands out of the critical above-the-fold Hero chunk
const ReviewsSection = dynamic(() =>
  import("@/components/ReviewsSection").then((m) => m.ReviewsSection)
);
const AppleCraftShowcase = dynamic(() =>
  import("@/components/motion/AppleCraftShowcase").then(
    (m) => m.AppleCraftShowcase
  )
);

const craftGalleryStrip: Array<{
  src: string;
  alt: LocalizedText;
  label: LocalizedText;
  hashtag: string;
}> = [
  {
    src: "/images/roast-duck-jianbing.webp",
    alt: {
      en: "Crisp-skinned roast duck sliced generously onto a freshly griddled green vegetable-batter Jian Bing",
      zh: "翠绿果蔬煎饼皮上铺满现切片的金黄脆皮烤鸭",
    },
    label: { en: "Roast Duck Jian Bing · £12", zh: "招牌烤鸭煎饼 · £12" },
    hashtag: "#RoastDuckJianBing",
  },
  {
    src: "/images/creme-brulee-crepe.webp",
    alt: {
      en: "Caramelised Crème Brûlée & Mascarpone sweet crepe cone ringed with fresh strawberries",
      zh: "围满新鲜草莓与巧克力脆卷的现烤焦糖布蕾蛋糕可丽饼",
    },
    label: { en: "Crème Brûlée Crepe · £11", zh: "焦糖布蕾可丽饼 · £11" },
    hashtag: "#CremeBruleeCrepe",
  },
  {
    src: "/images/matcha-pistachio-crepe.webp",
    alt: {
      en: "Green tea matcha crepe cone piled with pistachio crumble and rich matcha dusting",
      zh: "铺满细腻抹茶开心果碎与可爱小兔点缀的抹茶布蕾可丽饼",
    },
    label: { en: "Matcha Pistachio Crepe · £12", zh: "抹茶开心果可丽饼 · £12" },
    hashtag: "#MatchaPistachio",
  },
  {
    src: "/images/brulee-boba-milk-tea.webp",
    alt: {
      en: "Two cups of iced Hong Kong boba milk tea crowned with caramelised pudding and glossy black pearls",
      zh: "两杯顶着焦糖布丁与晶莹黑糖珍珠的冰爽港式奶茶",
    },
    label: { en: "HK Boba Milk Tea · £6", zh: "港式奶茶撞珍珠 · £6" },
    hashtag: "#HKMilkTea",
  },
];

const featuredDishTags: LocalizedText[] = [
  { en: "Crisp roast duck · green batter", zh: "现切脆皮烤鸭 · 果蔬饼皮" },
  { en: "Halal beef · Med £9 / Reg £12", zh: "清真牛肉 · 中份 £9 / 标准 £12" },
  { en: "Fresh fruit & veg batter · 0% dye", zh: "每日鲜榨果蔬皮 · 零色素" },
  { en: "Torched caramelised custard top", zh: "现烤焦糖脆壳 · 鲜草莓" },
  { en: "Matcha & nutty pistachio fluff", zh: "清香抹茶 · 开心果奶油脆" },
  { en: "Slow-braised · £15 / Large £17", zh: "慢火咕嘟炖烂 · 拌饭最香" },
];

const trendingTickerItems: Array<{
  label: LocalizedText;
  dot: string;
}> = [
  { label: { en: "FRESH DRAGON FRUIT & BEETROOT BATTER · NEVER FOOD DYE", zh: "每天现切红心火龙果 · 甜菜根榨汁和面" }, dot: "bg-cinnabar" },
  { label: { en: "ROAST DUCK £12 · HALAL BEEF & CHICKEN FROM £8", zh: "新品烤鸭煎饼 £12 · 清真牛鸡煎饼 £8 起" }, dot: "bg-turmeric" },
  { label: { en: "MEAL DEALS FROM £12 (JIAN BING + DRINK)", zh: "优惠套餐 £12 起（招牌煎饼 + 港式柠檬茶/豆浆）" }, dot: "bg-jade" },
  { label: { en: "CRÈME BRÛLÉE £11 · MATCHA PISTACHIO CREPE £12", zh: "焦糖布蕾可丽饼 £11 · 抹茶开心果可丽饼 £12" }, dot: "bg-turmeric" },
  { label: { en: "PAN-FRIED DUMPLINGS (6 PCS) FROM £5 · WARM SOYA MILK £4", zh: "现煎手工饺子 6 只 £5 起 · 热豆奶 / 黑芝麻糊 £4" }, dot: "bg-cinnabar" },
  { label: { en: "4.9★ ON GOOGLE (287+ REVIEWS) · 124 CAMDEN RD NW1", zh: "Google 4.9★ 街坊口碑 · 卡姆登路 124 号" }, dot: "bg-jade" },
];

interface HomeViewProps {
  initialReviews?: ReviewsPayload;
  featuredItems?: typeof featuredMenuItems;
}

export function HomeView({
  initialReviews,
  featuredItems,
}: HomeViewProps = {}) {
  const { isZh, isTraditional, t, zhText, pick } = useLocale();
  const displayFeatured =
    featuredItems && featuredItems.length > 0
      ? featuredItems
      : featuredMenuItems;

  return (
    <>
      {/* Hero Section — Warm, Homely Food-First Bento Stage */}
      <section className="kraft-grain relative overflow-hidden border-b border-kraft-deep/80">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_22%,rgba(235,176,78,0.16),transparent_55%),radial-gradient(ellipse_at_84%_28%,rgba(184,37,28,0.08),transparent_50%)]"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-5 pb-10 sm:px-6 sm:pt-8 sm:pb-14 lg:px-8 lg:pt-14 lg:pb-16">
          <div className="grid grid-cols-1 items-center gap-7 sm:gap-9 lg:grid-cols-12 lg:gap-12">
            {/* Left Column (Desktop) / Below Photos (Mobile & Tablet): Warm Food-First Hierarchy */}
            <div className="animate-fade-up order-2 min-w-0 lg:order-1 lg:col-span-5">
              {/* Beat 1: Instant Trust + Live Open Status */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="#reviews"
                  className="sticker-shadow inline-flex items-center gap-1.5 rounded-full border border-kraft-deep/90 bg-white/95 px-3.5 py-1.5 text-xs font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-cinnabar/45 hover:text-cinnabar"
                >
                  <Star
                    className="h-3.5 w-3.5 fill-[#E59819] text-[#E59819]"
                    aria-hidden="true"
                  />
                  <span className="tabular-nums">
                    {initialReviews?.rating.score ?? "4.9"}
                  </span>
                  <span className="font-medium text-ink-muted">
                    ({initialReviews?.rating.count ?? 287}{" "}
                    {pick("条 Google 好评", "Google Reviews")})
                  </span>
                </a>
                <LiveOpenBadge />
              </div>

              {/* Beat 2: Warm Iconic Headline + Crisp Appetite Copy */}
              {isZh ? (
                <h1 className="mt-5 font-display text-[2.15rem] leading-[1.18] tracking-[0.02em] text-ink sm:text-5xl lg:text-[2.95rem] xl:text-[3.2rem]">
                  {zhText("鲜榨果蔬皮，")}
                  <br />
                  {zhText("铁板现摊的")}
                  <span className="text-cinnabar sm:whitespace-nowrap">
                    {zhText("热乎煎饼")}
                  </span>
                </h1>
              ) : (
                <h1 className="mt-5 font-display text-4xl leading-[1.06] font-semibold tracking-[-0.03em] text-ink sm:text-5xl lg:text-[3.45rem]">
                  Hot, crisp{" "}
                  <em className="italic font-semibold text-cinnabar">
                    Jian Bing
                  </em>
                  ,
                  <br className="hidden sm:inline" /> spun fresh in Camden.
                </h1>
              )}

              <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted sm:text-[17px]">
                {pick(
                  "新鲜红心火龙果、甜菜根和菠菜直接榨汁和面，出锅就是自然果蔬色。每一张都是现点现摊，磕鲜蛋、刷刘阿姨自家熬的酱、裹上金黄薄脆，捧在手里沉甸甸的，还是国内街口那股热乎香。",
                  "Real dragon fruit, beetroot and spinach go straight into our batter for natural colour. Cooked to order with fresh egg, Mrs Liu's savoury house sauce and a crisp golden cracker folded right into the middle — hearty, comforting street food just like back home."
                )}
              </p>

              {/* Beat 3: Primary Conversion Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/menu"
                  className="sticker-shadow inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3.5 text-sm font-bold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark hover:shadow-lg active:scale-[0.97]"
                >
                  <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                  {pick("查看完整菜单", "View Menu")}
                </Link>

                {restaurant.links.orderOnline && (
                  <a
                    href={restaurant.links.orderOnline}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sticker-shadow inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar active:scale-[0.97]"
                  >
                    {pick("饭团在线点餐", "Order on Fantuan")}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}

                <a
                  href={restaurant.links.googleMapsDirections}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep/90 bg-white/90 px-4 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-cinnabar hover:text-cinnabar"
                >
                  <MapPin className="h-4 w-4 text-cinnabar" aria-hidden="true" />
                  {pick("导航到店", "Directions")}
                </a>
              </div>

              {/* Dietary Quick-Filter Chips */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold">
                <Link
                  href="/menu?diet=halal"
                  className="inline-flex items-center gap-1.5 rounded-full border border-cinnabar/25 bg-cinnabar/[0.08] px-3 py-1.5 text-cinnabar-dark transition-all hover:-translate-y-0.5 hover:bg-cinnabar hover:text-parchment"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {pick("清真牛肉 · 鸡肉", "Halal Beef & Chicken")}
                </Link>
                <Link
                  href="/menu?diet=vegetarian"
                  className="inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade/[0.09] px-3 py-1.5 text-jade transition-all hover:-translate-y-0.5 hover:bg-jade hover:text-parchment"
                >
                  <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                  {pick("素食 · 纯素可选", "Veggie & Vegan")}
                </Link>
                <Link
                  href="/menu#meal-deals"
                  className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-white px-3 py-1.5 tabular-nums text-ink-soft transition-all hover:-translate-y-0.5 hover:border-cinnabar/45 hover:text-cinnabar"
                >
                  {pick("优惠套餐 £12 起", "Meal Deals From £12")}
                </Link>
              </div>

              {/* Beat 4: Interactive Instagram / RedNote Story Highlights Strip */}
              <SocialStoryStrip />

              {/* Beat 5: Bold Brand-Coloured Official Social App Tiles */}
              <div className="mt-6">
                <p className="mb-2.5 text-xs font-bold tracking-wider text-ink-soft uppercase">
                  {pick("关注官方社媒 · 刷最新实拍", "Follow Our Official Socials")}
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  {restaurant.verifiedSocialLinks
                    .filter((s) => s.platform !== "google-maps")
                    .map((social) => {
                      const brandStyle =
                        social.platform === "instagram"
                          ? "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-[0_6px_16px_rgba(238,42,123,0.32)]"
                          : social.platform === "tiktok"
                            ? "bg-[#0f0f10] text-white shadow-[0_6px_16px_rgba(254,44,85,0.28)] ring-1 ring-[#25F4EE]/55"
                            : social.platform === "rednote"
                              ? "bg-[#FF2442] text-white shadow-[0_6px_16px_rgba(255,36,66,0.34)]"
                              : social.platform === "threads"
                                ? "bg-ink text-parchment shadow-[0_6px_16px_rgba(26,22,20,0.25)]"
                                : social.platform === "reddit"
                                  ? "bg-[#FF4500] text-white shadow-[0_6px_16px_rgba(255,69,0,0.32)]"
                                  : "bg-[#0EA5A4] text-white shadow-[0_6px_16px_rgba(14,165,164,0.32)]";

                      const shortLabel =
                        social.platform === "rednote"
                          ? pick("小红书", "RedNote")
                          : social.platform === "fantuan"
                            ? pick("饭团", "Fantuan")
                            : social.platform === "instagram"
                              ? "IG"
                              : social.platform === "tiktok"
                                ? "TikTok"
                                : social.platform === "threads"
                                  ? "Threads"
                                  : "Reddit";

                      return (
                        <a
                          key={social.href}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${t(social.label)} · ${social.handle}`}
                          aria-label={`${t(social.label)} ${social.handle}`}
                          className="group flex flex-col items-center gap-1"
                        >
                          <span
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-lg group-active:scale-95 sm:h-12 sm:w-12 ${brandStyle}`}
                          >
                            <SocialIcon
                              platform={social.platform}
                              className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
                            />
                          </span>
                          <span className="text-[10px] font-bold text-ink-muted transition-colors group-hover:text-ink">
                            {shortLabel}
                          </span>
                        </a>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Right Column (Desktop) / First on Top (Mobile & Tablet): Unobstructed Food-First Bento */}
            <div className="animate-fade-up-delay-1 order-1 min-w-0 lg:order-2 lg:col-span-7">
              <div className="grid min-w-0 gap-3.5 sm:gap-4">
                {/* Main Hero Dish Photo — Full-Bleed Unobstructed Food Showcase */}
                <ParallaxLayer offset={-10}>
                  <Link
                    href="/menu"
                    className="animate-hero-media group relative block aspect-[16/10] w-full overflow-hidden rounded-[28px] border-2 border-white/95 bg-kraft shadow-xl ring-1 ring-kraft-deep/80"
                  >
                    <Image
                      src="/images/hero-jianbing-platter.webp"
                      alt={pick(
                        "刚出锅对半切开的招牌果蔬咸味煎饼，旁放印有煎饼刘字样的牛皮纸袋",
                        "Freshly griddled herb-studded savoury Jian Bing crepe cut in half beside the Jian Bing Liu branded kraft sleeve"
                      )}
                      fill
                      priority
                      fetchPriority="high"
                      sizes="(max-width: 1024px) calc(100vw - 2rem), 56vw"
                      className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent px-5 pt-14 pb-4 text-parchment">
                      <div>
                        <p
                          lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                          className="font-calligraphy text-xl text-[#F0C26E] sm:text-2xl"
                        >
                          {zhText(restaurant.chineseTagline)}
                        </p>
                        <p className="text-xs text-parchment/90 sm:text-sm">
                          {pick(
                            "现点现摊招牌咸味煎饼 · 零色素果蔬皮",
                            "Signature Savoury Jian Bing · Zero Food Dye"
                          )}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#F0C26E]/45 bg-ink/80 px-3.5 py-1 font-sans text-xs font-bold tabular-nums text-[#F0C26E] backdrop-blur-md">
                        £8 – £14
                      </span>
                    </div>
                  </Link>
                </ParallaxLayer>

                {/* Two Flush Unobstructed Supporting Food Photos Underneath */}
                <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                  <Link
                    href="/menu#savoury-crepes"
                    className="apple-card group relative aspect-[16/10] overflow-hidden rounded-[22px] border-2 border-white/95 bg-kraft shadow-md ring-1 ring-kraft-deep/80"
                  >
                    <Image
                      src="/images/roast-duck-jianbing.webp"
                      alt={pick(
                        "翠绿果蔬煎饼皮上铺满现切片的金黄脆皮烤鸭",
                        "Sliced crisp roast duck laid across a freshly griddled natural green Jian Bing crepe"
                      )}
                      fill
                      sizes="(max-width: 1024px) 48vw, 28vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent px-3.5 pt-10 pb-3 text-parchment">
                      <p className="text-xs font-bold text-[#F0C26E]">
                        {pick("新品热卖 · £12", "Roast Duck · £12")}
                      </p>
                      <p className="mt-0.5 text-xs text-parchment/95 sm:text-sm sm:font-semibold">
                        {pick("招牌烤鸭果蔬煎饼", "Roast Duck Jian Bing")}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/menu#sweet-crepes-and-desserts"
                    className="apple-card group relative aspect-[16/10] overflow-hidden rounded-[22px] border-2 border-white/95 bg-kraft shadow-md ring-1 ring-kraft-deep/80"
                  >
                    <Image
                      src="/images/creme-brulee-crepe.webp"
                      alt={pick(
                        "围满新鲜草莓与巧克力脆卷的现烤焦糖布蕾蛋糕可丽饼",
                        "Caramelised Crème Brûlée custard sweet crepe cone ringed with fresh strawberries"
                      )}
                      fill
                      sizes="(max-width: 1024px) 48vw, 28vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent px-3.5 pt-10 pb-3 text-parchment">
                      <p className="text-xs font-bold text-[#F0C26E]">
                        {pick("可丽饼 £5 起 · 布蕾 £11", "Sweet Crepes · From £5")}
                      </p>
                      <p className="mt-0.5 text-xs text-parchment/95 sm:text-sm sm:font-semibold">
                        {pick("焦糖布蕾蛋糕可丽饼", "Crème Brûlée Crepe")}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Full-Width Essential Info Strip */}
          <dl className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-kraft-deep/85 bg-white/90 px-5 py-4 shadow-xs backdrop-blur-xs sm:mt-10 sm:grid-cols-3 sm:divide-x sm:divide-kraft-deep/70 sm:px-6">
            <div className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-cinnabar"
                aria-hidden="true"
              />
              <div>
                <dt className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
                  {pick("门店地址 · 点击导航", "Location · Tap for Map")}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">
                  <a
                    href={restaurant.links.googleMapsDirections}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-kraft-deep underline-offset-4 transition-colors hover:text-cinnabar hover:decoration-cinnabar"
                  >
                    {restaurant.address.street}, London {restaurant.address.postalCode}
                  </a>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:pl-6">
              <Clock
                className="mt-0.5 h-4 w-4 shrink-0 text-cinnabar"
                aria-hidden="true"
              />
              <div>
                <dt className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
                  {pick("营业时间", "Opening Hours")}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                  {isZh
                    ? zhText("周一至三 11:00–21:00 · 周四至日 11:00–21:30")
                    : "Mon–Wed 11:00–21:00 · Thu–Sun 11:00–21:30"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:pl-6">
              <Phone
                className="mt-0.5 h-4 w-4 shrink-0 text-cinnabar"
                aria-hidden="true"
              />
              <div>
                <dt className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
                  {pick("外带自取 · 无接触配送（不提供堂食）", "Takeaway & Delivery Only")}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                  <a
                    href={restaurant.phone.href}
                    className="transition-colors hover:text-cinnabar"
                  >
                    {restaurant.phone.display}
                  </a>
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </section>

      {/* Warm Homely Kitchen Ingredients Marquee Strip */}
      <div
        aria-label={pick("招牌食材与美味亮点", "Fresh kitchen highlights")}
        className="ticker-group overflow-hidden border-b border-kraft-deep/85 bg-kraft/80 py-3 text-ink-soft"
      >
        <div className="animate-ticker flex w-max items-center gap-6">
          {[0, 1].map((dup) => (
            <div
              key={dup}
              aria-hidden={dup === 1 ? true : undefined}
              className="flex shrink-0 items-center gap-6 pr-6"
            >
              {trendingTickerItems.map((item, idx) => (
                <span
                  key={`${dup}-${idx}`}
                  className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.06em] text-ink-soft"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${item.dot}`}
                    aria-hidden="true"
                  />
                  <span>{t(item.label)}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 1. Signature Menu Highlights — Clean Food-First Dish Cards */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow={pick("家的味道 · 热乎现摊", "Fresh Off the Griddle")}
              chineseAccent="招牌美味"
              title={pick(
                "热乎出锅，像在家门口吃的一样踏实",
                "Cooked warm to order, just like back home"
              )}
              description={pick(
                "招牌烤鸭与清真牛鸡煎饼、焦糖布蕾与抹茶开心果可丽饼、萝卜炖牛肉饭与手工煎饺——全线明码实价，现点现做。",
                "From Roast Duck and Halal Beef Jian Bing to torched Crème Brûlée crepes, Matcha Pistachio crepes and slow-braised beef rice — simple, generous food cooked warm to order."
              )}
            />
            <Link
              href="/menu"
              className="sticker-shadow inline-flex shrink-0 items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-2.5 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-cinnabar hover:text-cinnabar"
            >
              {pick("浏览完整菜单", "See Full Menu")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayFeatured.slice(0, 6).map((item, idx) => {
            const dishNote =
              featuredDishTags[idx % featuredDishTags.length];
            return (
              <Reveal key={item.id} delay={(idx % 3) * 95} className="h-full">
                <article className="apple-card social-card-shadow group flex h-full flex-col overflow-hidden rounded-[26px] border border-kraft-deep/80 bg-white hover:border-cinnabar/40 hover:shadow-xl">
                  {item.image && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
                      <Image
                        src={item.image}
                        alt={item.imageAlt ? t(item.imageAlt) : t(item.name)}
                        fill
                        sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 46vw, 356px"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                      />
                      {item.price && (
                        <span className="absolute right-3 bottom-3 rounded-full bg-ink/85 px-3 py-1 font-sans text-sm font-bold tabular-nums text-[#F0C26E] backdrop-blur-xs">
                          {item.price}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-display text-xl font-bold text-ink transition-colors group-hover:text-cinnabar">
                          {t(item.name)}
                        </h3>
                        {!isZh && item.chineseName && (
                          <span
                            lang="zh-Hans"
                            className="text-xs font-medium text-ink-muted"
                          >
                            {item.chineseName}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {t(item.description)}
                      </p>
                      {item.dietary && item.dietary.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {item.dietary.map((tag) => (
                            <DietaryBadge key={tag} tag={tag} />
                          ))}
                        </div>
                      )}
                    </div>

                    <DishSocialActions
                      dishId={item.id}
                      hashtag={t(dishNote)}
                    />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 2. First-Time Ordering Guide — Warm Kitchen Combos */}
      <section className="cv-auto gradient-light-edge relative overflow-hidden border-y border-kraft-deep/80 bg-ink text-parchment">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(240,194,110,0.18),rgba(184,58,34,0.09)_48%,transparent_75%)]"
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.2em] text-[#F0C26E] uppercase">
                <span>{pick("第一次来不知道点啥？", "First Time at the Counter?")}</span>
                <span aria-hidden="true" className="text-parchment/30">
                  ·
                </span>
                <span
                  lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                  className="font-calligraphy text-lg font-normal tracking-normal text-parchment/90 normal-case"
                >
                  {zhText("人气搭配")}
                </span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-parchment sm:text-4xl">
                {pick(
                  "回头客常点的三套家常搭配",
                  "Three orders Camden regulars come back for"
                )}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-parchment/75">
                {pick(
                  "第一次来不知道点什么？照着街坊和老客最常点的这三套搭配来一份，现做现拿，热乎又踏实。",
                  "First time at the counter? Start with one of our regulars' favourites — cooked fresh in front of you and genuinely filling."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <ShareSpotButton variant="dark" />
              <a
                href="https://xhslink.cn/m/24xL12L1i1R"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-parchment/25 bg-white/10 px-4 py-2 text-xs font-semibold text-parchment transition-colors hover:border-[#F0C26E] hover:text-[#F0C26E]"
              >
                <SocialIcon platform="rednote" className="h-3.5 w-3.5" />
                {pick("小红书 1162231947", "RedNote · 1162231947")}
              </a>
              <a
                href="#reviews"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#F0C26E]/40 bg-[#F0C26E]/10 px-4 py-2 text-xs font-semibold text-[#F0C26E] transition-colors hover:bg-[#F0C26E] hover:text-ink"
              >
                <SocialIcon platform="tiktok" className="h-3.5 w-3.5" />
                {pick("1.8万+ 播放热门实拍", "18K+ TikTok Views")}
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                tag: pick("优惠套餐 · 清真可选", "Meal Deal · Halal"),
                title: pick("牛肉 / 鸡肉煎饼 + 港式柠檬茶或豆浆", "Beef or Chicken Jian Bing Meal Deal"),
                price: "£12 – £13",
                desc: pick(
                  "招牌清真鸡肉（£12）或牛肉煎饼（£13），直接配一杯冰爽港式冻柠茶或温润现磨豆浆，热乎顶饱又划算。",
                  "Signature Halal Chicken (£12) or Beef (£13) Jian Bing paired with Hong Kong Iced Lemon Tea or freshly ground house soya milk."
                ),
                image: "/images/beef-jianbing-stack.webp",
                alt: pick(
                  "印有煎饼刘字样的牛皮纸袋下对半切开的满馅招牌牛肉煎饼",
                  "Stacked Halal Beef Jian Bing sliced in half beneath the Jian Bing Liu kraft sleeve"
                ),
                href: "/menu#meal-deals",
                cta: pick("查看优惠套餐", "See Meal Deals"),
              },
              {
                tag: pick("午后甜口", "Sweet Crepes"),
                title: pick("焦糖布蕾 / 抹茶开心果可丽饼", "Crème Brûlée or Matcha Pistachio Crepe"),
                price: "£11 – £12",
                desc: pick(
                  "现烤焦糖脆壳马斯卡彭布蕾配鲜草莓（£11），或茶香浓郁的抹茶开心果布蕾可丽饼（£12）；也有 £5 热乎巧克力可丽饼。",
                  "Torched Crème Brûlée & Mascarpone with fresh strawberries (£11), or rich Matcha & Pistachio Fluff (£12) — plus warm Chocolate Crepes for £5."
                ),
                image: "/images/matcha-pistachio-crepe.webp",
                alt: pick(
                  "铺满细腻抹茶粉与开心果碎的抹茶开心果布蕾蛋糕可丽饼",
                  "Green tea matcha crepe cone topped with generous pistachio crumble"
                ),
                href: "/menu#sweet-crepes-and-desserts",
                cta: pick("看可丽饼菜单", "See Sweet Crepes"),
              },
              {
                tag: pick("暖胃热饭 · 小吃", "Warm Rice & Dumplings"),
                title: pick("卤肉饭 / 萝卜炖牛肉饭 + 6 只煎饺", "Braised Pork or Beef Rice + 6 Dumplings"),
                price: "£10 – £17",
                desc: pick(
                  "油润入味的台湾卤肉饭（£10）或软烂炖牛肉饭（£15/£17），顺手加一份 6 只装脆底素饺（£5）或牛肉煎饺（£6），格外暖胃。",
                  "Taiwanese Braised Pork Rice (£10) or Slow-Braised Beef Rice (£15/£17), paired with 6 golden pan-fried veggie (£5) or Halal beef dumplings (£6)."
                ),
                image: "/images/braised-beef-rice.webp",
                alt: pick(
                  "慢炖萝卜胡萝卜牛肉配热腾腾的白米饭",
                  "Slow-braised beef with radish, carrots, and steamed white rice"
                ),
                href: "/menu#mains-and-rice",
                cta: pick("查看热菜与煎饺", "See Mains & Dumplings"),
              },
            ].map((combo, idx) => (
              <Reveal key={combo.href} delay={idx * 100} className="h-full">
              <Link
                href={combo.href}
                className="apple-card group flex h-full flex-col overflow-hidden rounded-[28px] border border-parchment/15 bg-white/[0.05] hover:border-yolk/55 hover:bg-white/[0.09]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/30">
                  <Image
                    src={combo.image}
                    alt={combo.alt}
                    fill
                    sizes="(max-width: 768px) calc(100vw - 2rem), 356px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-ink/82 px-3 py-1 text-[11px] font-semibold text-[#F0C26E] backdrop-blur-xs">
                    {combo.tag}
                  </span>
                  <span className="absolute right-3 bottom-3 rounded-full bg-parchment/95 px-3 py-1 font-sans text-xs font-bold tabular-nums text-ink shadow-xs">
                    {combo.price}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="font-display text-xl font-medium text-parchment transition-colors group-hover:text-[#F0C26E]">
                      {combo.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-parchment/75">
                      {combo.desc}
                    </p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F0C26E]">
                    {combo.cta}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Verified Google Reviews & Live Full-Bleed Social Proof — Build trust early */}
      <ReviewsSection initialData={initialReviews} />

      {/* 4. Multicultural Audience Highlights: Halal, Asian Street Food, UK Locals & Plant-Based */}
      <section className="border-b border-kraft-deep/80 bg-kraft/35">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {/* Halal Diners */}
            <Reveal delay={0} className="h-full">
            <div className="apple-card flex h-full flex-col justify-between rounded-2xl border border-kraft-deep/80 bg-white/90 p-6 shadow-2xs hover:shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cinnabar/25 bg-cinnabar/10 px-3 py-1 text-xs font-semibold text-cinnabar-dark">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick("清真之选", "Halal Options")}
                  </span>
                  <span
                    lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                    className="font-calligraphy text-lg text-ink-muted"
                  >
                    {zhText("清真美味")}
                  </span>
                </div>
                <h2 className="mt-3.5 font-display text-xl font-semibold text-ink">
                  {pick(
                    "清真牛肉与鸡肉，中份 £8 起",
                    "Halal beef & chicken, medium from £8"
                  )}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {pick(
                    "招牌清真鸡肉煎饼（£8/£11）、清真牛肉煎饼（£9/£12）、优惠套餐（£12 起）、清真牛肉大包（£3.50）与牛肉煎饺（6 个 £6）均选用清真肉类食材。",
                    "Signature Halal Chicken (£8/£11) & Beef Jian Bing (£9/£12), Meal Deals from £12, Halal Beef Buns (£3.50) and 6-piece Beef Dumplings (£6). Filter all Halal dishes in one tap."
                  )}
                </p>
              </div>
              <Link
                href="/menu?diet=halal"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cinnabar transition-colors hover:text-cinnabar-dark"
              >
                {pick("一键查看清真菜单", "Browse Halal Menu")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            </Reveal>

            {/* Asian & Chinese Street Food Lovers */}
            <Reveal delay={110} className="h-full">
            <div className="apple-card flex h-full flex-col justify-between rounded-2xl border border-kraft-deep/80 bg-white/90 p-6 shadow-2xs hover:shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-turmeric/35 bg-turmeric/15 px-3 py-1 text-xs font-semibold text-[#87560d]">
                    <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick("地道家乡味", "Authentic Street Food")}
                  </span>
                  <span
                    lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                    className="font-calligraphy text-lg text-ink-muted"
                  >
                    {zhText("传统手艺")}
                  </span>
                </div>
                <h2 className="mt-3.5 font-display text-xl font-semibold text-ink">
                  {pick(
                    "火龙果现榨果蔬皮，留子中国胃认证",
                    "Natural dragon fruit batter & real crunch"
                  )}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {pick(
                    "不是色素！后厨鲜切红心火龙果、甜菜根现打调糊，配现炸薄脆、自制辣椒油与热豆浆；就在 UCL/CSM 附近，支持饭团外卖（4.5 ★）。",
                    "Zero food dye — fresh dragon fruit and beetroot blended straight into the batter, with crispy cracker, homemade chilli oil, soya milk, and Fantuan (4.5 ★)."
                  )}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/our-story"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-cinnabar"
                >
                  {pick("了解铁板手艺", "See Our Craft")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {restaurant.links.fantuanOrder && (
                  <a
                    href={restaurant.links.fantuanOrder}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-cinnabar transition-colors hover:text-cinnabar-dark"
                  >
                    {pick("饭团下单", "Fantuan")}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
            </Reveal>

            {/* UK Locals, Mixed Groups & Plant-Based Diners */}
            <Reveal delay={220} className="h-full">
            <div className="apple-card flex h-full flex-col justify-between rounded-2xl border border-kraft-deep/80 bg-white/90 p-6 shadow-2xs hover:shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade/10 px-3 py-1 text-xs font-semibold text-jade">
                    <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick("本地与蔬食友好", "Locals & Plant-Based")}
                  </span>
                  <span
                    lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                    className="font-calligraphy text-lg text-ink-muted"
                  >
                    {zhText("蔬食友好")}
                  </span>
                </div>
                <h2 className="mt-3.5 font-display text-xl font-semibold text-ink">
                  {pick(
                    "现买现带超方便，素食与纯素同样丰富",
                    "Quick takeaway for mixed groups & vegans"
                  )}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {pick(
                    "明码实价（小吃 £2.50 起），到店现摊外带或外卖直达；除咸甜煎饼外，还备有素菜煎饼（£9）、菠菜芝士煎饼（£10）、葱油饼（£2.50）与 6 只素煎饺（£5）。",
                    "Clear in-store prices from £2.50 for quick takeaway and delivery, plus Veggie Lover (£9) & Spinach Cheese (£10) Jian Bing, Spring Onion Flatbread (£2.50) and 6-piece Veggie Dumplings (£5)."
                  )}
                </p>
              </div>
              <Link
                href="/menu?diet=vegetarian"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-jade transition-colors hover:text-ink"
              >
                {pick("浏览素食与纯素菜品", "Browse Veggie & Vegan")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. Apple-Style Scroll-Driven Craft Showcase — Deep craft story for engaged visitors */}
      <AppleCraftShowcase />

      {/* 6. Our Story & Craft Editorial Band */}
      <section className="cv-auto border-y border-kraft-deep/80 bg-kraft/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-22 lg:grid-cols-12 lg:px-8">
          <div className="grid min-w-0 grid-cols-12 gap-4 lg:col-span-6">
            <Reveal variant="scale" className="col-span-7">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border-2 border-parchment bg-kraft shadow-lg">
              <Image
                src="/images/mrs-liu-sweet-cones.webp"
                alt={pick(
                  "刘阿姨在卡姆登档口后微笑举起两份刚做好的鲜草莓甜煎饼",
                  "Mrs Liu smiling warmly behind the Camden counter holding two freshly made strawberry sweet crepes"
                )}
                fill
                sizes="(max-width: 1024px) 60vw, 30vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
              />
            </div>
            </Reveal>
            <div className="col-span-5 flex flex-col gap-4">
              <Reveal variant="scale" delay={120}>
              <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-md">
                <Image
                  src="/images/mrs-liu-rainbow-griddle.webp"
                  alt={pick(
                    "刘阿姨身穿煎饼刘围裙在圆铁板上现摊红心火龙果与菠菜双色果蔬煎饼",
                    "Mrs Liu in her Jian Bing Liu apron swirling naturally pink dragon-fruit and green spinach batter on the griddle"
                  )}
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
                />
              </div>
              </Reveal>
              <Reveal variant="scale" delay={220} className="flex flex-1 flex-col">
              <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-md">
                <Image
                  src="/images/dragonfruit-blender-prep.webp"
                  alt={pick(
                    "卡姆登后厨搅拌机里现打的新鲜红心火龙果与甜菜根原汁",
                    "Fresh red dragon fruit and beetroot blended daily in our Camden kitchen with zero food dye"
                  )}
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
                />
              </div>
              </Reveal>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-6">
            <Reveal>
              <SectionHeading
                eyebrow={pick("创业故事", "Our Story")}
                chineseAccent="归零创业"
                title={t(restaurant.story.headline)}
                description={t(restaurant.story.lead)}
              />
            </Reveal>

            <div className="mt-8 space-y-4">
              {restaurant.story.pillars.map((pillar, idx) => (
                <Reveal key={pillar.chinese} delay={idx * 100}>
                <div
                  className="apple-card rounded-2xl border border-kraft-deep/80 bg-parchment/90 p-4 shadow-2xs hover:shadow-md"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-ink">
                      {t(pillar.title)}
                    </h3>
                    <span
                      lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                      className="font-calligraphy text-lg text-cinnabar"
                    >
                      {zhText(pillar.chinese)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {t(pillar.description)}
                  </p>
                </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/our-story"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar"
              >
                {pick("了解更多故事", "Read Our Story")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Gallery Preview Strip — Clean Kitchen Food Showcase */}
      <section className="cv-auto mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={pick("后厨实拍", "From Our Kitchen")}
            chineseAccent="色香俱全"
            title={pick(
              "真实出餐，每一份都热气腾腾",
              "Real food, straight off the griddle"
            )}
            description={pick(
              "镜头直击伦敦卡姆登厨房——从天然果蔬咸味煎饼到手工花式蕾丝甜筒、金黄春卷与五香茶叶蛋。",
              "Straight from our Camden kitchen: natural fruit-and-veg crepes, hand-piped lace cones, crisp spring rolls, and tea eggs."
            )}
          />
          <Link
            href="/gallery"
            className="sticker-shadow inline-flex shrink-0 items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-2.5 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-cinnabar hover:text-cinnabar"
          >
            {pick("查看全部图集", "See All Photos")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {craftGalleryStrip.map((photo, idx) => (
            <Reveal key={photo.src} variant="scale" delay={idx * 85}>
              <Link
                href="/gallery"
                className="apple-card social-card-shadow group relative block aspect-[3/4] overflow-hidden rounded-[24px] border-2 border-white bg-kraft ring-1 ring-kraft-deep/80 hover:ring-cinnabar/45"
              >
                <Image
                  src={photo.src}
                  alt={t(photo.alt)}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent p-4 pt-12">
                  <p className="font-display text-sm font-semibold text-parchment">
                    {t(photo.label)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Visit Us Warm Kitchen Invitation Banner */}
      <section className="cv-auto mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <Reveal variant="scale">
        <div className="gradient-light-edge relative overflow-hidden rounded-[34px] border border-parchment/15 bg-ink px-6 py-12 text-parchment shadow-2xl sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(240,194,110,0.2),rgba(184,58,34,0.1)_50%,transparent_76%)]"
          />
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-7">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#F0C26E] uppercase">
                {pick(
                  "伦敦卡姆登路 · 现摊外带与无接触配送",
                  "Camden Road · Warm Takeaway & Delivery"
                )}
              </p>
              <h2 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">
                {pick(
                  "顺路来卡姆登路 124 号带一份，或饭团外卖热乎送到家。",
                  `Swing by ${restaurant.address.street}, or get it delivered hot on Fantuan.`
                )}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-parchment/80 sm:text-base">
                {isZh ? (
                  <>
                    {zhText("周一至周三 11:00–21:00、周四至周日 11:00–21:30 营业，支持到店自取外带与无接触配送（不提供堂食）。可提前致电 ")}
                    <a
                      href={restaurant.phone.href}
                      className="font-semibold text-[#F0C26E] underline underline-offset-4 hover:text-white"
                    >
                      {restaurant.phone.display}
                    </a>{" "}
                    {zhText(`咨询，或直接通过${restaurant.links.orderOnlineProviderZh}在线点单。`)}
                  </>
                ) : (
                  <>
                    Open Mon–Wed 11:00 AM to 9:00 PM and Thu–Sun 11:00 AM to
                    9:30 PM, for takeaway and no-contact delivery (no dine-in).
                    Ring us on{" "}
                    <a
                      href={restaurant.phone.href}
                      className="font-semibold text-[#F0C26E] underline underline-offset-4 hover:text-white"
                    >
                      {restaurant.phone.display}
                    </a>{" "}
                    or order online on {restaurant.links.orderOnlineProvider}.
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:col-span-5 lg:justify-end">
              <a
                href={restaurant.links.googleMapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#F0C26E] px-6 py-3.5 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {pick("获取地图导航", "Get Directions")}
              </a>

              {restaurant.links.orderOnline && (
                <a
                  href={restaurant.links.orderOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-parchment/30 bg-cinnabar px-6 py-3.5 text-sm font-semibold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
                >
                  {pick("在线点餐", "Order Online")}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}

              <ShareSpotButton variant="dark" />
            </div>
          </div>
        </div>
        </Reveal>
      </section>
    </>
  );
}
