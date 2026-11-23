"use client";

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
import { LiveOpenBadge } from "@/components/LiveOpenBadge";
import { AppleCraftShowcase } from "@/components/motion/AppleCraftShowcase";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { Reveal } from "@/components/motion/Reveal";
import { ReviewsSection } from "@/components/ReviewsSection";
import { SectionHeading } from "@/components/SectionHeading";
import { ShareSpotButton } from "@/components/ShareSpotButton";
import { SocialIcon } from "@/components/SocialIcon";
import { featuredMenuItems } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { useLocale, type LocalizedText } from "@/lib/i18n";
import type { ReviewsPayload } from "@/lib/reviews-service";

const craftGalleryStrip: Array<{
  src: string;
  alt: LocalizedText;
  label: LocalizedText;
}> = [
  {
    src: "/images/veggie-crepe-griddle.webp",
    alt: {
      en: "Colourful fruit-and-vegetable batter crepe topped with herbs and shredded fillings on the hot griddle",
      zh: "热铁板上天然调色的彩色果蔬面糊煎饼，铺满鲜绿青菜与香葱",
    },
    label: { en: "Fruit & Veg Batter", zh: "天然果蔬面糊" },
  },
  {
    src: "/images/fancy-lace-dessert-cone.webp",
    alt: {
      en: "Hand-piped pink lace dessert crepe cone with whipped cream, fresh fruit, and biscuit sticks",
      zh: "粉色手工蕾丝边甜筒煎饼，装满奶油、鲜果与抹茶饼干棒",
    },
    label: { en: "Fancy Lace Cones", zh: "花式蕾丝甜筒" },
  },
  {
    src: "/images/veg-spring-rolls.webp",
    alt: {
      en: "Golden crispy vegetarian spring rolls served on a heart-shaped plate",
      zh: "心形白盘上金黄酥脆的传统素春卷",
    },
    label: { en: "Crispy Street Snacks", zh: "酥香街头小吃" },
  },
  {
    src: "/images/spiced-tea-eggs.webp",
    alt: {
      en: "Spiced Chinese tea eggs steeping in dark soy and aromatic black tea marinade",
      zh: "浓郁红茶五香卤汁里浸泡的整颗茶叶蛋",
    },
    label: { en: "Traditional Tea Eggs", zh: "古法五香茶叶蛋" },
  },
];

interface HomeViewProps {
  initialReviews?: ReviewsPayload;
}

export function HomeView({ initialReviews }: HomeViewProps = {}) {
  const { isZh, isTraditional, t, zhText, pick } = useLocale();

  return (
    <>
      {/* Hero Section */}
      <section className="kraft-grain relative overflow-hidden border-b border-kraft-deep/80">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
          <div className="animate-fade-up lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-cinnabar/25 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-cinnabar shadow-xs">
                <span
                  lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                  className="font-calligraphy text-base font-normal text-ink"
                >
                  {zhText(restaurant.chineseTagline)}
                </span>
                <span aria-hidden="true" className="text-kraft-deep">
                  |
                </span>
                <span
                  className={isZh ? "tracking-wider" : "tracking-wide uppercase"}
                >
                  {pick("伦敦卡姆登", "Camden, London")}
                </span>
              </div>
              <LiveOpenBadge />
            </div>

            {isZh ? (
              <h1 className="mt-5 font-display text-4xl leading-[1.2] tracking-[0.03em] text-ink sm:text-[3.2rem]">
                {zhText("鲜榨果蔬皮，")}
                <br />
                {zhText("铁板现摊的")}
                <span className="text-cinnabar">{zhText("热乎煎饼")}</span>
              </h1>
            ) : (
              <h1 className="mt-5 font-display text-4xl leading-[1.06] font-medium tracking-[-0.025em] text-ink sm:text-5xl lg:text-[3.55rem]">
                Hot, crisp{" "}
                <em className="italic font-medium text-cinnabar">Jian Bing</em>,
                spun fresh with real fruit &amp; veg.
              </h1>
            )}

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              {t(restaurant.shortIntro)}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3.5 text-sm font-semibold text-parchment shadow-md transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark hover:shadow-lg"
              >
                <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                {pick("查看菜单", "View Menu")}
              </Link>

              <Link
                href="/visit-us"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-parchment px-6 py-3.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-parchment"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {pick("来店指南", "Visit Us")}
              </Link>

              {restaurant.links.orderOnline && (
                <a
                  href={restaurant.links.orderOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-cinnabar underline decoration-cinnabar/40 underline-offset-4 transition-colors hover:text-cinnabar-dark hover:decoration-cinnabar"
                >
                  {pick("在线点餐", "Order Online")}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* Instant Trust & Dietary Quick Links */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <a
                href="#reviews"
                className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-white/85 px-3 py-1 text-ink shadow-2xs transition-colors hover:border-cinnabar/40 hover:text-cinnabar"
              >
                <Star
                  className="h-3.5 w-3.5 fill-[#E59819] text-[#E59819]"
                  aria-hidden="true"
                />
                <span className="tabular-nums">
                  {initialReviews?.rating.score ?? "4.9"}
                </span>
                <span className="text-ink-muted">
                  ({initialReviews?.rating.count ?? 287}{" "}
                  {pick("Google 好评", "Google Reviews")})
                </span>
              </a>
              <Link
                href="/menu?diet=halal"
                className="inline-flex items-center gap-1.5 rounded-full border border-cinnabar/25 bg-cinnabar/[0.07] px-3 py-1 text-cinnabar-dark transition-colors hover:bg-cinnabar hover:text-parchment"
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {pick("清真牛肉 · 鸡肉", "Halal Beef & Chicken")}
              </Link>
              <Link
                href="/menu?diet=vegetarian"
                className="inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade/[0.08] px-3 py-1 text-jade transition-colors hover:bg-jade hover:text-parchment"
              >
                <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                {pick("素食 · 纯素可选", "Veggie & Vegan")}
              </Link>
            </div>

            {/* Official Social Icon Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-ink-muted">
                {pick("关注我们", "Follow us")}
              </span>
              {restaurant.verifiedSocialLinks
                .filter((s) => s.platform !== "google-maps")
                .map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${t(social.label)} · ${social.handle}`}
                    aria-label={`${t(social.label)} ${social.handle}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-kraft-deep bg-white/85 text-ink shadow-2xs transition-all hover:-translate-y-0.5 hover:border-cinnabar hover:bg-cinnabar hover:text-parchment"
                  >
                    <SocialIcon platform={social.platform} className="h-4 w-4" />
                  </a>
                ))}
            </div>

            <dl className="mt-7 grid grid-cols-1 gap-4 border-t border-kraft-deep/90 pt-6 sm:grid-cols-[1.25fr_1fr_1.15fr]">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider whitespace-nowrap text-ink-muted uppercase">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-cinnabar" aria-hidden="true" />
                  {pick("门店地址", "Location")}
                </dt>
                <dd className="mt-1 text-sm font-semibold whitespace-nowrap text-ink">
                  <a
                    href={restaurant.links.googleMapsDirections}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-kraft-deep underline-offset-4 transition-colors hover:text-cinnabar hover:decoration-cinnabar"
                  >
                    {restaurant.address.street}, {restaurant.address.postalCode}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider whitespace-nowrap text-ink-muted uppercase">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-cinnabar" aria-hidden="true" />
                  {pick("每日营业", "Open Daily")}
                </dt>
                <dd className="mt-1 text-xs leading-snug font-semibold tabular-nums text-ink sm:text-[13px]">
                  {isZh ? (
                    <>
                      {zhText("周一至三 11:00–21:00")}
                      <br />
                      {zhText("周四至日 11:00–21:30")}
                    </>
                  ) : (
                    <>
                      Mon–Wed 11am–9pm
                      <br />
                      Thu–Sun 11am–9:30pm
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider whitespace-nowrap text-ink-muted uppercase">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-cinnabar" aria-hidden="true" />
                  {pick("外带 · 无接触配送", "Takeaway · Delivery")}
                </dt>
                <dd className="mt-1 text-sm font-semibold whitespace-nowrap tabular-nums text-ink">
                  <a
                    href={restaurant.phone.href}
                    className="hover:text-cinnabar"
                  >
                    {restaurant.phone.display}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Hero Photography with Apple-style multi-plane scroll parallax */}
          <div className="animate-fade-up-delay-1 relative lg:col-span-6">
            <ParallaxLayer offset={-16}>
              <div className="animate-hero-media relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border-2 border-kraft-deep bg-kraft shadow-xl">
                <Image
                  src="/images/hero-jianbing-platter.webp"
                  alt={pick(
                    "刚出锅对半切开的招牌果蔬咸味煎饼，旁放印有煎饼刘字样的牛皮纸袋",
                    "Freshly griddled herb-studded savoury Jian Bing crepe cut in half beside the Jian Bing Liu branded kraft sleeve"
                  )}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 544px"
                  className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03]"
                />
              </div>
            </ParallaxLayer>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-0 sm:block">
              <ParallaxLayer
                offset={22}
                className="sm:absolute sm:-bottom-6 sm:-left-6 sm:z-10"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-lg sm:h-36 sm:w-48">
                  <Image
                    src="/images/beef-crepe-sleeve.webp"
                    alt={pick(
                      "撒满黑芝麻、装在牛皮纸袋中的热乎咸味煎饼",
                      "Warm black-sesame Jian Bing crepe wrapped in a signature kraft sleeve"
                    )}
                    fill
                    sizes="(max-width: 640px) 50vw, 192px"
                    className="object-cover"
                  />
                </div>
              </ParallaxLayer>

              <ParallaxLayer
                offset={14}
                className="sm:absolute sm:-right-3 sm:-bottom-6 sm:z-10 sm:max-w-[245px]"
              >
                <div className="flex h-full flex-col justify-center rounded-2xl border border-kraft-deep bg-ink p-4 text-parchment shadow-lg">
                  <p
                    lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                    className="font-calligraphy text-xl whitespace-nowrap text-[#F0C26E] sm:text-[22px]"
                  >
                    {zhText("煎饼刘 · 现做现卖")}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-parchment/80">
                    {pick(
                      "零色素！新鲜红心火龙果与甜菜根现榨果蔬皮，清真牛鸡与素食每单现摊。",
                      "Zero food dye — fresh dragon fruit & beetroot batters, Halal beef & chicken, spun to order."
                    )}
                  </p>
                </div>
              </ParallaxLayer>
            </div>
          </div>
        </div>
      </section>

      {/* Multicultural Audience Highlights: Halal, Asian Street Food, UK Locals & Plant-Based */}
      <section className="border-b border-kraft-deep/80 bg-kraft/35">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
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

      {/* Apple-Style Sticky Scroll Craft Showcase */}
      <AppleCraftShowcase />

      {/* Signature Menu Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow={pick("当季热卖", "On the Menu")}
              chineseAccent="招牌美味"
              title={pick(
                "热乎出锅的地道中式街头好味",
                "Cooked hot to order on Camden Road"
              )}
              description={pick(
                "精选最受欢迎的现摊咸味煎饼、慢炖牛肉饭、金黄脆底煎饺与花式甜煎饼，菜单均标注清晰实价。",
                "Our best-selling savoury Jian Bing, slow-braised beef, crispy dumplings, and sweet crepes, all with current in-store prices."
              )}
            />
            <Link
              href="/menu"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xs transition-all hover:border-cinnabar hover:text-cinnabar"
            >
              {pick("浏览完整菜单", "See Full Menu")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredMenuItems.slice(0, 6).map((item, idx) => (
            <Reveal key={item.id} delay={(idx % 3) * 95} className="h-full">
            <article
              className="apple-card group flex h-full flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white shadow-xs hover:shadow-xl"
            >
              {item.image && (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
                  <Image
                    src={item.image}
                    alt={item.imageAlt ? t(item.imageAlt) : t(item.name)}
                    fill
                    sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 46vw, 356px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.price && (
                    <span className="absolute right-3 bottom-3 rounded-full bg-ink/85 px-3 py-1 font-sans text-sm font-semibold tabular-nums text-[#F0C26E] backdrop-blur-xs">
                      {item.price}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl font-bold text-ink">
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
                </div>

                {item.dietary && item.dietary.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.dietary.map((tag) => (
                      <DietaryBadge key={tag} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Editorial Dark-Lacquer Band: First-Time Ordering Guide & Social Buzz */}
      <section className="cv-auto relative overflow-hidden border-y border-kraft-deep/80 bg-ink text-parchment">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(201,134,31,0.16),transparent_55%),radial-gradient(ellipse_at_85%_85%,rgba(184,37,28,0.14),transparent_50%)]"
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.2em] text-[#F0C26E] uppercase">
                <span>{pick("进店必点指南", "First Time Here?")}</span>
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
                  "不知道怎么点？三套人气搭配直接抄作业",
                  "Three ways Londoners order at the counter"
                )}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-parchment/75">
                {pick(
                  "不管你是刷到小红书、TikTok、Instagram 还是 Reddit 慕名而来，这三套高人气组合闭眼点都不会出错。",
                  "Spotted us on TikTok, Instagram, RedNote, or r/LondonFood? Start with one of these crowd favourites — all spun hot to order."
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
                className="apple-card group flex h-full flex-col overflow-hidden rounded-3xl border border-parchment/15 bg-white/[0.04] hover:border-[#F0C26E]/50 hover:bg-white/[0.07]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/30">
                  <Image
                    src={combo.image}
                    alt={combo.alt}
                    fill
                    sizes="(max-width: 768px) calc(100vw - 2rem), 356px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-ink/85 px-3 py-1 text-[11px] font-semibold text-[#F0C26E] backdrop-blur-xs">
                    {combo.tag}
                  </span>
                  <span className="absolute right-3 bottom-3 rounded-full bg-parchment/95 px-2.5 py-1 font-sans text-xs font-semibold tabular-nums text-ink">
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

      {/* Our Story & Craft Editorial Band */}
      <section className="cv-auto border-y border-kraft-deep/80 bg-kraft/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-22 lg:grid-cols-12 lg:px-8">
          <div className="grid grid-cols-12 gap-4 lg:col-span-6">
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

          <div className="lg:col-span-6">
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

      {/* Gallery Preview Strip */}
      <section className="cv-auto mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={pick("后厨实拍", "From the Kitchen")}
            chineseAccent="色香俱全"
            title={pick(
              "真实出餐，每一份都热气腾腾",
              "Real food, straight off the griddle"
            )}
            description={pick(
              "镜头直击伦敦卡姆登厨房——从天然果蔬咸味煎饼到手工花式蕾丝甜筒、金黄春卷与五香茶叶蛋。",
              "Photos from behind our Camden counter: savoury fruit-and-veg crepes, hand-piped lace cones, crisp spring rolls, and tea eggs."
            )}
          />
          <Link
            href="/gallery"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xs transition-all hover:border-cinnabar hover:text-cinnabar"
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
              className="apple-card group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-kraft-deep bg-kraft shadow-xs hover:shadow-xl"
            >
              <Image
                src={photo.src}
                alt={t(photo.alt)}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent p-4 pt-12">
                <p className="font-display text-sm font-semibold text-parchment">
                  {t(photo.label)}
                </p>
              </div>
            </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Verified Google Reviews & Social Community */}
      <ReviewsSection initialData={initialReviews} />

      {/* Visit Us CTA Banner */}
      <section className="cv-auto mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <Reveal variant="scale">
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-12 text-parchment shadow-xl sm:px-12 sm:py-16">
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#F0C26E] uppercase">
                {pick(
                  "伦敦卡姆登路 · 外带与无接触配送",
                  "Camden Road · Takeaway & Delivery"
                )}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">
                {pick(
                  "欢迎路过卡姆登路 124 号外带，或线上下单热乎送到家。",
                  `Grab a takeaway at ${restaurant.address.street}, or order it hot to your door.`
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
