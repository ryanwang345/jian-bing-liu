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
    src: "/images/veggie-crepe-griddle.webp",
    alt: {
      en: "Colourful fruit-and-vegetable batter crepe topped with herbs and shredded fillings on the hot griddle",
      zh: "热铁板上天然调色的彩色果蔬面糊煎饼，铺满鲜绿青菜与香葱",
    },
    label: { en: "Fruit & Veg Batter", zh: "天然果蔬面糊" },
    hashtag: "#ZeroFoodDye",
  },
  {
    src: "/images/fancy-lace-dessert-cone.webp",
    alt: {
      en: "Hand-piped pink lace dessert crepe cone with whipped cream, fresh fruit, and biscuit sticks",
      zh: "粉色手工蕾丝边甜筒煎饼，装满奶油、鲜果与抹茶饼干棒",
    },
    label: { en: "Fancy Lace Cones", zh: "花式蕾丝甜筒" },
    hashtag: "#PinkLaceCrepe",
  },
  {
    src: "/images/veg-spring-rolls.webp",
    alt: {
      en: "Golden crispy vegetarian spring rolls served on a heart-shaped plate",
      zh: "心形白盘上金黄酥脆的传统素春卷",
    },
    label: { en: "Crispy Street Snacks", zh: "酥香街头小吃" },
    hashtag: "#CamdenSnacks",
  },
  {
    src: "/images/spiced-tea-eggs.webp",
    alt: {
      en: "Spiced Chinese tea eggs steeping in dark soy and aromatic black tea marinade",
      zh: "浓郁红茶五香卤汁里浸泡的整颗茶叶蛋",
    },
    label: { en: "Traditional Tea Eggs", zh: "古法五香茶叶蛋" },
    hashtag: "#ChineseStreetFood",
  },
];

const featuredDishStickers: Array<{
  badge: LocalizedText;
  hashtag: string;
  tone: string;
}> = [
  {
    badge: { en: "Top Pick", zh: "人气 Top 1" },
    hashtag: "#CamdenJianBing",
    tone: "bg-cinnabar text-parchment",
  },
  {
    badge: { en: "Zero Dye", zh: "火龙果现榨" },
    hashtag: "#DragonFruitCrepe",
    tone: "bg-dragonfruit text-white",
  },
  {
    badge: { en: "Photo Hit", zh: "出片甜品" },
    hashtag: "#LaceCrepeCone",
    tone: "bg-yolk text-ink",
  },
  {
    badge: { en: "From £1", zh: "£1 脆底煎饺" },
    hashtag: "#CrispyDumplings",
    tone: "bg-ink text-yolk",
  },
  {
    badge: { en: "Comfort Bowl", zh: "暖胃热饭" },
    hashtag: "#UCLFoodie",
    tone: "bg-jade text-parchment",
  },
  {
    badge: { en: "Vegan Hit", zh: "纯素口碑" },
    hashtag: "#LondonVegan",
    tone: "bg-jade text-parchment",
  },
];

const trendingTickerItems: Array<{
  label: LocalizedText;
  dot: string;
}> = [
  { label: { en: "4.9★ GOOGLE (287+ REVIEWS)", zh: "Google 4.9★ · 287+ 真实好评" }, dot: "bg-yolk" },
  { label: { en: "REAL DRAGON FRUIT & BEETROOT BATTER", zh: "鲜榨红心火龙果 · 甜菜根零色素饼皮" }, dot: "bg-dragonfruit" },
  { label: { en: "HALAL BEEF & CHICKEN", zh: "清真牛肉 & 鸡肉 · 素食全都有" }, dot: "bg-jade" },
  { label: { en: "18K+ VIEWS ON TIKTOK", zh: "TikTok 单条 1.8万+ 播放" }, dot: "bg-yolk" },
  { label: { en: "REDNOTE ID: 1162231947", zh: "小红书官方号 1162231947" }, dot: "bg-dragonfruit" },
  { label: { en: "124 CAMDEN RD · NW1 9EE", zh: "伦敦卡姆登路 124 号 · 铁板现摊" }, dot: "bg-cinnabar" },
  { label: { en: "ORDER HOT ON FANTUAN (4.5★)", zh: "饭团外卖 4.5★ 热乎直达" }, dot: "bg-[#2dd4bf]" },
];

interface HomeViewProps {
  initialReviews?: ReviewsPayload;
}

export function HomeView({ initialReviews }: HomeViewProps = {}) {
  const { isZh, isTraditional, t, zhText, pick } = useLocale();

  return (
    <>
      {/* Hero Section — Vibrant Social-First Street-Food Bento Stage */}
      <section className="kraft-grain relative overflow-hidden border-b border-kraft-deep/80">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_14%_20%,rgba(244,178,60,0.16),transparent_52%),radial-gradient(ellipse_at_84%_22%,rgba(225,45,102,0.11),transparent_48%),radial-gradient(ellipse_at_68%_85%,rgba(43,89,60,0.08),transparent_48%)]"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14 lg:px-8 lg:pt-14 lg:pb-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Crisp Social-First Hierarchy */}
            <div className="animate-fade-up min-w-0 lg:col-span-5">
              {/* Beat 1: Instant Trust + Live Open Status */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="#reviews"
                  className="sticker-shadow inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 py-1.5 text-xs font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-dragonfruit/45 hover:text-cinnabar"
                >
                  <Star
                    className="h-3.5 w-3.5 fill-yolk text-yolk"
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

              {/* Beat 2: Iconic Headline + Crisp Appetite Copy */}
              {isZh ? (
                <h1 className="mt-5 font-display text-[2.15rem] leading-[1.18] tracking-[0.02em] text-ink sm:text-5xl lg:text-[2.95rem] xl:text-[3.2rem]">
                  {zhText("鲜榨果蔬皮，")}
                  <br />
                  {zhText("铁板现摊的")}
                  <span className="bg-gradient-to-r from-cinnabar via-dragonfruit to-turmeric bg-clip-text text-transparent sm:whitespace-nowrap">
                    {zhText("热乎煎饼")}
                  </span>
                </h1>
              ) : (
                <h1 className="mt-5 font-display text-4xl leading-[1.06] font-semibold tracking-[-0.03em] text-ink sm:text-5xl lg:text-[3.45rem]">
                  Hot, crisp{" "}
                  <em className="bg-gradient-to-r from-cinnabar via-dragonfruit to-turmeric bg-clip-text italic font-semibold text-transparent">
                    Jian Bing
                  </em>
                  ,
                  <br className="hidden sm:inline" /> spun fresh in Camden.
                </h1>
              )}

              <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted sm:text-[17px]">
                {pick(
                  "红心火龙果、甜菜根每天现切榨汁和面，零色素；磕双蛋、刷秘制酱、夹现炸薄脆——清真牛鸡与素食全都有，卡姆登路铁板现摊现带。",
                  "Real dragon fruit & beetroot batters — never food dye. Folded hot off cast iron with crispy wonton cracker, Halal beef or chicken, fresh herbs, and house chilli oil."
                )}
              </p>

              {/* Beat 3: Primary Conversion Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/menu"
                  className="sticker-shadow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cinnabar to-dragonfruit px-6 py-3.5 text-sm font-bold text-parchment transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep/90 bg-white/85 px-4 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-cinnabar hover:text-cinnabar"
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
                  href="/menu#lunchtime-specials"
                  className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-white px-3 py-1.5 tabular-nums text-ink-soft transition-all hover:-translate-y-0.5 hover:border-dragonfruit/40 hover:text-dragonfruit"
                >
                  {pick("午市煎饼 £6.50 起", "Lunch From £6.50")}
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

            {/* Right Column: Social-Feed Bento Visual Stage (3 Unobstructed Signature Photos + Floating Tags) */}
            <div className="animate-fade-up-delay-1 min-w-0 lg:col-span-7">
              <div className="grid min-w-0 gap-3.5 sm:gap-4">
                {/* Main Hero Dish Photo — Full-Bleed Unobstructed Showcase */}
                <ParallaxLayer offset={-10}>
                  <Link
                    href="/menu"
                    className="animate-hero-media group relative block aspect-[16/10] w-full overflow-hidden rounded-[28px] border-2 border-white/90 bg-kraft shadow-xl ring-1 ring-kraft-deep/80"
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
                    {/* Top-left floating social location tag */}
                    <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-bold text-parchment backdrop-blur-md">
                        <MapPin className="h-3 w-3 text-yolk" aria-hidden="true" />
                        {pick("124 Camden Rd · 伦敦必打卡", "124 Camden Rd · NW1 Viral Spot")}
                      </span>
                    </div>
                    {/* Top-right viral TikTok pill */}
                    <span className="absolute top-3.5 right-3.5 hidden items-center gap-1 rounded-full bg-dragonfruit px-3 py-1 text-[11px] font-bold text-white shadow-sm sm:inline-flex">
                      <SocialIcon platform="tiktok" className="h-3 w-3" />
                      {pick("TikTok 1.8万+ 播放", "18K+ on TikTok")}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/88 via-ink/35 to-transparent px-5 pt-14 pb-4 text-parchment">
                      <div>
                        <p
                          lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                          className="font-calligraphy text-xl text-yolk sm:text-2xl"
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
                      <span className="shrink-0 rounded-full border border-yolk/45 bg-ink/80 px-3.5 py-1 font-sans text-xs font-bold tabular-nums text-yolk backdrop-blur-md">
                        £6.50 – £10
                      </span>
                    </div>
                  </Link>
                </ParallaxLayer>

                {/* Two Flush Bento Supporting Visual Tiles Underneath */}
                <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                  <Link
                    href="/menu?diet=halal"
                    className="apple-card group relative aspect-[16/10] overflow-hidden rounded-[22px] border-2 border-white/90 bg-kraft shadow-md ring-1 ring-kraft-deep/80"
                  >
                    <Image
                      src="/images/veggie-crepe-griddle.webp"
                      alt={pick(
                        "热铁板上天然红心火龙果与菠菜调色的果蔬煎饼",
                        "Naturally pink and green fruit-and-vegetable Jian Bing batter sizzling on the griddle"
                      )}
                      fill
                      sizes="(max-width: 1024px) 48vw, 28vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-dragonfruit px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      {pick("鲜榨零色素", "ZERO DYE")}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/88 via-ink/35 to-transparent px-3.5 pt-10 pb-3 text-parchment">
                      <p className="text-xs font-bold text-yolk">
                        {pick("鲜切火龙果 · 甜菜根", "Real Dragon Fruit & Veg")}
                      </p>
                      <p className="mt-0.5 text-xs text-parchment/95 sm:text-sm sm:font-semibold">
                        {pick("天然果蔬饼皮现摊", "Natural Colour Batters")}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/menu#sweet-crepes-and-desserts"
                    className="apple-card group relative aspect-[16/10] overflow-hidden rounded-[22px] border-2 border-white/90 bg-kraft shadow-md ring-1 ring-kraft-deep/80"
                  >
                    <Image
                      src="/images/fancy-lace-dessert-cone.webp"
                      alt={pick(
                        "粉色手工蕾丝边甜筒煎饼，装满奶油、鲜果与抹茶饼干棒",
                        "Hand-piped pink lace sweet crepe cone with cream and fresh strawberries"
                      )}
                      fill
                      sizes="(max-width: 1024px) 48vw, 28vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-yolk px-2.5 py-0.5 text-[10px] font-bold text-ink shadow-xs">
                      {pick("出片甜品", "PHOTO HIT")}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/88 via-ink/35 to-transparent px-3.5 pt-10 pb-3 text-parchment">
                      <p className="text-xs font-bold text-yolk">
                        {pick("甜煎饼 £4 起", "Sweet Crepes · From £4")}
                      </p>
                      <p className="mt-0.5 text-xs text-parchment/95 sm:text-sm sm:font-semibold">
                        {pick("手工花式蕾丝甜筒", "Hand-Piped Lace Cones")}
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

      {/* Trending Street-Food Social Marquee Ticker */}
      <div
        aria-label={pick("热门打卡亮点", "Trending highlights")}
        className="ticker-group overflow-hidden border-b border-ink-soft bg-ink py-3 text-parchment"
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
                  className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.08em] text-parchment/95 uppercase"
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

      {/* 1. Signature Menu Highlights — RedNote / Instagram Feed Style Dish Cards */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow={pick("招牌种草榜", "What's Trending on the Griddle")}
              chineseAccent="招牌美味"
              title={pick(
                "铁板现摊，出片又管饱的实在味道",
                "Cooked hot to order on Camden Road"
              )}
              description={pick(
                "点亮小红心先种草！招牌果蔬咸煎饼、慢炖土豆牛肉饭、金黄脆底煎饺与花式甜筒，全线明码实价。",
                "Tap the heart to save your cravings — savoury dragon-fruit Jian Bing, braised beef rice, £1 dumplings, and hand-piped lace cones."
              )}
            />
            <Link
              href="/menu"
              className="sticker-shadow inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-dragonfruit hover:text-cinnabar"
            >
              {pick("浏览完整菜单", "See Full Menu")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredMenuItems.slice(0, 6).map((item, idx) => {
            const sticker =
              featuredDishStickers[idx % featuredDishStickers.length];
            return (
              <Reveal key={item.id} delay={(idx % 3) * 95} className="h-full">
                <article className="apple-card social-card-shadow group flex h-full flex-col overflow-hidden rounded-[26px] border border-kraft-deep/80 bg-white hover:border-dragonfruit/35 hover:shadow-xl">
                  {item.image && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
                      <Image
                        src={item.image}
                        alt={item.imageAlt ? t(item.imageAlt) : t(item.name)}
                        fill
                        sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 46vw, 356px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span
                        className={`absolute top-3 left-3 -rotate-2 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm transition-transform duration-300 group-hover:rotate-0 ${sticker.tone}`}
                      >
                        {t(sticker.badge)}
                      </span>
                      {item.price && (
                        <span className="absolute right-3 bottom-3 rounded-full bg-ink/88 px-3 py-1 font-sans text-sm font-bold tabular-nums text-yolk backdrop-blur-xs">
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
                      hashtag={sticker.hashtag}
                    />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 2. First-Time Ordering Cheat Sheet — Viral Street-Food Combos */}
      <section className="cv-auto relative overflow-hidden border-y border-kraft-deep/80 bg-ink text-parchment">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_18%,rgba(225,45,102,0.22),transparent_50%),radial-gradient(ellipse_at_88%_82%,rgba(244,178,60,0.18),transparent_50%)]"
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
                  "三套回头客闭眼点的神仙搭配",
                  "Three orders Camden regulars swear by"
                )}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-parchment/75">
                {pick(
                  "不管你是刷到小红书、TikTok、Instagram 还是 Reddit 找过来的，照着这三套点准没错。",
                  "Spotted us on TikTok, Instagram, RedNote, or r/LondonFood? Start with one of these regulars' favourites — all spun hot to order."
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
                tag: pick("招牌咸口 · 清真可选", "The Classic · Halal"),
                title: pick("牛肉 / 鸡肉煎饼 + 热豆浆", "Beef or Chicken Jian Bing + Soya Milk"),
                price: "£10 + £2",
                desc: pick(
                  "双蛋果蔬饼皮刷自家秘制酱，配酥脆薄脆与清真肉馅，再捧一杯温热现磨豆浆，最地道的街头组合。",
                  "Two-egg savoury crepe brushed with house sauce, crispy fried onions, Halal beef or chicken, and hot classic soya milk."
                ),
                image: "/images/beef-crepe-sleeve.webp",
                alt: pick(
                  "牛皮纸袋里撒满黑芝麻的热乎招牌牛肉煎饼",
                  "Warm black-sesame Halal Beef Jian Bing crepe in a brown paper sleeve"
                ),
                href: "/menu?diet=halal",
                cta: pick("查看清真煎饼", "See Halal Crepes"),
              },
              {
                tag: pick("高颜值打卡甜品", "The Sweet Hit"),
                title: pick("花式蕾丝甜筒 / 榛子巧克力甜煎饼", "Fancy Lace Cone or Nutella Crepe"),
                price: pick("£4 起", "From £4"),
                desc: pick(
                  "手工挤制粉色蕾丝脆边卷成甜筒，装满绵密奶油与鲜果，或来一份热乎拉丝的榛子巧克力草莓甜煎饼。",
                  "Hand-piped pink lace crepe cone packed with whipped cream and fruit, or a warm Nutella crepe straight off the iron."
                ),
                image: "/images/fancy-lace-dessert-cone.webp",
                alt: pick(
                  "粉色手工蕾丝边甜筒煎饼，装满奶油、鲜果与饼干棒",
                  "Hand-piped pink lace sweet crepe cone with cream, strawberries, and biscuit sticks"
                ),
                href: "/menu#sweet-crepes-and-desserts",
                cta: pick("看甜煎饼菜单", "See Sweet Crepes"),
              },
              {
                tag: pick("暖胃热菜 · 含纯素", "Hot Bowls & Dumplings"),
                title: pick("慢炖牛肉饭 / 纯素咖喱 + 脆底煎饺", "Braised Beef or Vegan Curry + Dumplings"),
                price: "£7.95 – £12.95",
                desc: pick(
                  "软烂入味的土豆胡萝卜炖牛肉或醇香纯素日式咖喱配白米饭，再加几只 £1 起的金黄脆底煎饺，管饱又暖胃。",
                  "Slow-braised beef or Vegan Japanese Curry with steamed white rice, plus golden pan-fried beef or veggie dumplings from £1."
                ),
                image: "/images/braised-beef-rice.webp",
                alt: pick(
                  "慢炖土豆胡萝卜牛肉配热腾腾的白米饭",
                  "Slow-braised beef with potatoes, carrots, and steamed white rice"
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
                  <span
                    className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm ${
                      idx === 0
                        ? "bg-dragonfruit text-white"
                        : idx === 1
                          ? "bg-yolk text-ink"
                          : "bg-jade text-parchment"
                    }`}
                  >
                    #{String(idx + 1).padStart(2, "0")} · {combo.tag}
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
                    "清真牛肉与鸡肉，午市 £6.5 起",
                    "Halal beef & chicken, lunch from £6.50"
                  )}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {pick(
                    "招牌牛肉煎饼、鸡肉煎饼（£10）、午市简餐（£6.5）及脆底牛肉煎饺（£1/只）均采用清真肉类食材，支持一键筛选全部清真菜品。",
                    "Signature Halal Beef & Chicken Jian Bing (£10), £6.50 lunch crepes, and £1 pan-fried beef dumplings. Filter all Halal dishes in one tap."
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
                    "价格透明（£1 起），到店现摊外带或外卖直达；除经典咸甜煎饼外，还提供素食果蔬煎饼、菠菜芝士煎饼、素煎饺与纯素日式咖喱。",
                    "Clear in-store prices from £1 for quick takeaway and delivery, plus Veggie Lover crepes, veg dumplings, and Vegan Japanese Curry."
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
                src="/images/chef-lace-crepe.webp"
                alt={pick(
                  "煎饼刘主厨在卡姆登厨房里微笑展示刚出锅的手工蕾丝煎饼",
                  "Chef at Jian Bing Liu in Camden smiling while lifting a freshly made lace crepe in the kitchen"
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
                  src="/images/brand-kraft-sleeve.webp"
                  alt={pick(
                    "印有煎饼刘毛笔书法与爱民朱红印章的招牌牛皮纸袋",
                    "Jian Bing Liu kraft crepe wrapper stamped with red script, Chinese calligraphy 煎饼刘, and our 爱民 seal"
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
                  src="/images/griddle-batter-egg.webp"
                  alt={pick(
                    "圆铁板上正在摊匀的彩色果蔬面糊与新鲜鸡蛋",
                    "Swirling colourful vegetable batter and fresh egg on the round Jian Bing griddle"
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

      {/* 7. Gallery Preview Strip — Social Feed Grid */}
      <section className="cv-auto mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={pick("@jian_bing_liu 后厨实拍", "@jian_bing_liu · Feed")}
            chineseAccent="色香俱全"
            title={pick(
              "真实出餐，随手一拍都很出片",
              "Real food, camera-ready off the griddle"
            )}
            description={pick(
              "镜头直击伦敦卡姆登厨房——从天然果蔬咸味煎饼到手工花式蕾丝甜筒、金黄春卷与五香茶叶蛋。",
              "Straight from our Camden counter: rainbow dragon-fruit crepes, hand-piped pink lace cones, crispy spring rolls, and tea eggs."
            )}
          />
          <Link
            href="/gallery"
            className="sticker-shadow inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-dragonfruit hover:text-cinnabar"
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
                className="apple-card social-card-shadow group relative block aspect-[3/4] overflow-hidden rounded-[24px] border-2 border-white bg-kraft ring-1 ring-kraft-deep/80 hover:ring-dragonfruit/50"
              >
                <Image
                  src={photo.src}
                  alt={t(photo.alt)}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                {/* Top social post handle chip */}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-bold text-parchment backdrop-blur-xs">
                  @jian_bing_liu
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-4 pt-12">
                  <span className="inline-block rounded-full bg-dragonfruit/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    {photo.hashtag}
                  </span>
                  <p className="mt-1.5 font-display text-sm font-semibold text-parchment">
                    {t(photo.label)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Visit Us Social Street-Food Poster CTA Banner */}
      <section className="cv-auto mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <Reveal variant="scale">
        <div className="relative overflow-hidden rounded-[34px] border border-parchment/15 bg-ink px-6 py-12 text-parchment shadow-2xl sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_15%,rgba(225,45,102,0.28),transparent_48%),radial-gradient(ellipse_at_90%_85%,rgba(244,178,60,0.22),transparent_48%)]"
          />
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-dragonfruit px-3 py-1 text-[11px] font-bold text-white">
                  @jian_bing_liu
                </span>
                <span className="rounded-full border border-yolk/40 bg-yolk/15 px-3 py-1 text-[11px] font-bold text-yolk">
                  #JianBingLiu · #CamdenEats
                </span>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">
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
