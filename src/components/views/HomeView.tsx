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
import { phoneToTelHref, useSiteContent } from "@/components/SiteContentProvider";
import { SocialIcon } from "@/components/SocialIcon";
import { useSocialLinks } from "@/components/SocialLinksProvider";
import { SocialStoryStrip } from "@/components/SocialStoryStrip";
import { NewBadge } from "@/components/NewBadge";
import { SoldOutBadge } from "@/components/SoldOutBadge";
import { WelcomeCouponSection } from "@/components/WelcomeCouponSection";
import { featuredMenuItems } from "@/data/menu";
import type { SocialPost } from "@/data/reviews";
import type { HomeSectionId } from "@/data/site-content";
import { useLocale, type LocalizedText } from "@/lib/i18n";
import type { ReviewsPayload } from "@/lib/reviews-service";

const ReviewsSection = dynamic(() =>
  import("@/components/ReviewsSection").then((m) => m.ReviewsSection)
);
const AppleCraftShowcase = dynamic(() =>
  import("@/components/motion/AppleCraftShowcase").then(
    (m) => m.AppleCraftShowcase
  )
);

const featuredDishTags: LocalizedText[] = [
  { en: "Crisp roast duck · green batter", zh: "现切脆皮烤鸭 · 果蔬饼皮" },
  { en: "Halal beef · Med £9 / Reg £12", zh: "清真牛肉 · 中份 £9 / 标准 £12" },
  { en: "Fresh fruit & veg batter · 0% dye", zh: "每日鲜榨果蔬皮 · 零色素" },
  { en: "Torched caramelised custard top", zh: "现烤焦糖脆壳 · 鲜草莓" },
  { en: "Matcha & nutty pistachio fluff", zh: "清香抹茶 · 开心果奶油脆" },
  { en: "Slow-braised · £15 / Large £17", zh: "慢火咕嘟炖烂 · 拌饭最香" },
];

const TICKER_DOTS = ["bg-cinnabar", "bg-turmeric", "bg-jade"];

interface HomeViewProps {
  posts: SocialPost[];
  initialReviews?: ReviewsPayload;
  featuredItems?: typeof featuredMenuItems;
}

export function HomeView({
  initialReviews,
  featuredItems,
  posts,
}: HomeViewProps) {
  const { isZh, isTraditional, t, zhText, pick } = useLocale();
  const { store, home } = useSiteContent();
  const socialLinks = useSocialLinks();
  const rednote = socialLinks.find((link) => link.platform === "rednote");
  const displayFeatured =
    featuredItems && featuredItems.length > 0
      ? featuredItems
      : featuredMenuItems;
  const phoneHref = phoneToTelHref(store.phoneDisplay);

  const heroTextOrderClass = `${
    home.hero.mobilePhotoFirst ? "order-2" : "order-1"
  } ${home.hero.desktopPhotoRight ? "lg:order-1" : "lg:order-2"}`;

  const heroMediaOrderClass = `${
    home.hero.mobilePhotoFirst ? "order-1" : "order-2"
  } ${home.hero.desktopPhotoRight ? "lg:order-2" : "lg:order-1"}`;

  const renderSection = (sectionId: HomeSectionId) => {
    switch (sectionId) {
      case "hero":
        return (
          <section
            key="hero"
            className="kraft-grain relative overflow-hidden border-b border-kraft-deep/80"
          >
            <div
              aria-hidden="true"
              data-festival-decorative="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-44"
              style={{
                background:
                  "radial-gradient(ellipse 75% 70% at 50% 0%, var(--theme-glow-a), transparent 72%)",
              }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-5 pb-10 sm:px-6 sm:pt-8 sm:pb-14 lg:px-8 lg:pt-14 lg:pb-16">
              <div className="grid grid-cols-1 items-center gap-7 sm:gap-9 lg:grid-cols-12 lg:gap-12">
                {/* Text Column */}
                <div
                  className={`animate-fade-up min-w-0 lg:col-span-5 ${heroTextOrderClass}`}
                >
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

                  {isZh ? (
                    <h1 className="mt-5 font-display text-[2.15rem] leading-[1.18] tracking-[0.02em] text-ink sm:text-5xl lg:text-[2.95rem] xl:text-[3.2rem]">
                      {zhText(home.hero.headlineZhLine1)}
                      <br />
                      {zhText(home.hero.headlineZhLine2)}
                      <span className="text-cinnabar sm:whitespace-nowrap">
                        {zhText(home.hero.headlineZhHighlight)}
                      </span>
                    </h1>
                  ) : (
                    <h1 className="mt-5 font-display text-4xl leading-[1.06] font-semibold tracking-[-0.03em] text-ink sm:text-5xl lg:text-[3.45rem]">
                      {home.hero.headlineEnPrefix}{" "}
                      <em className="font-semibold text-cinnabar italic">
                        {home.hero.headlineEnHighlight}
                      </em>
                      {home.hero.headlineEnSuffix ? (
                        <>
                          , <br className="hidden sm:inline" />
                          {home.hero.headlineEnSuffix}
                        </>
                      ) : null}
                    </h1>
                  )}

                  <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted sm:text-[17px]">
                    {t(home.hero.description)}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href="/menu"
                      className="sticker-shadow inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3.5 text-sm font-bold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark hover:shadow-lg active:scale-[0.97]"
                    >
                      <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                      {t(home.hero.primaryCta)}
                    </Link>

                    {store.orderOnlineUrl && (
                      <a
                        href={store.orderOnlineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sticker-shadow inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar active:scale-[0.97]"
                      >
                        {t(home.hero.orderCta)}
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </a>
                    )}

                    <a
                      href={store.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep/90 bg-white/90 px-4 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-cinnabar hover:text-cinnabar"
                    >
                      <MapPin
                        className="h-4 w-4 text-cinnabar"
                        aria-hidden="true"
                      />
                      {t(home.hero.directionsCta)}
                    </a>
                  </div>

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

                  <SocialStoryStrip />

                  <div className="mt-6">
                    <p className="mb-2.5 text-xs font-bold tracking-wider text-ink-soft uppercase">
                      {pick(
                        "关注官方社媒 · 刷最新实拍",
                        "Follow Our Official Socials"
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {socialLinks
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
                              key={social.platform}
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

                {/* Photo Bento Column */}
                <div
                  className={`animate-fade-up-delay-1 min-w-0 lg:col-span-7 ${heroMediaOrderClass}`}
                >
                  <div className="grid min-w-0 gap-3.5 sm:gap-4">
                    <ParallaxLayer offset={-10}>
                      <Link
                        href="/menu"
                        className="animate-hero-media group relative isolate block aspect-[16/10] w-full overflow-hidden rounded-[28px] border-2 border-white/95 bg-[#1a1614] shadow-xl ring-1 ring-kraft-deep/80"
                      >
                        <Image
                          src={home.hero.mainPhoto}
                          alt={t(home.hero.mainPhotoCaption)}
                          fill
                          priority
                          fetchPriority="high"
                          sizes="(max-width: 1024px) calc(100vw - 2rem), 56vw"
                          className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                        />

                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#1a1614]/88 via-[#1a1614]/35 to-transparent px-5 pt-14 pb-4 text-white">
                          <div>
                            <p
                              lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                              className="font-calligraphy text-xl text-[#F0C26E] sm:text-2xl"
                            >
                              {zhText(store.taglineZh)}
                            </p>
                            <p className="text-xs text-white/95 sm:text-sm">
                              {t(home.hero.mainPhotoCaption)}
                            </p>
                          </div>
                          {home.hero.mainPhotoPrice && (
                            <span className="shrink-0 rounded-full border border-[#F0C26E]/45 bg-[#1a1614]/82 px-3.5 py-1 font-sans text-xs font-bold tabular-nums text-[#F0C26E] backdrop-blur-md">
                              {home.hero.mainPhotoPrice}
                            </span>
                          )}
                        </div>
                      </Link>
                    </ParallaxLayer>

                    <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                      <Link
                        href="/menu#savoury-crepes"
                        className="apple-card group relative isolate aspect-[16/10] overflow-hidden rounded-[22px] border-2 border-white/95 bg-[#1a1614] shadow-md ring-1 ring-kraft-deep/80"
                      >
                        <Image
                          src={home.hero.subPhotoLeft}
                          alt={t(home.hero.subPhotoLeftTitle)}
                          fill
                          sizes="(max-width: 1024px) 48vw, 28vw"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1614]/88 via-[#1a1614]/35 to-transparent px-3.5 pt-10 pb-3 text-white">
                          <p className="text-xs font-bold text-[#F0C26E]">
                            {t(home.hero.subPhotoLeftSub)}
                          </p>
                          <p className="mt-0.5 text-xs text-white/95 sm:text-sm sm:font-semibold">
                            {t(home.hero.subPhotoLeftTitle)}
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/menu#sweet-crepes-and-desserts"
                        className="apple-card group relative isolate aspect-[16/10] overflow-hidden rounded-[22px] border-2 border-white/95 bg-[#1a1614] shadow-md ring-1 ring-kraft-deep/80"
                      >
                        <Image
                          src={home.hero.subPhotoRight}
                          alt={t(home.hero.subPhotoRightTitle)}
                          fill
                          sizes="(max-width: 1024px) 48vw, 28vw"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1614]/88 via-[#1a1614]/35 to-transparent px-3.5 pt-10 pb-3 text-white">
                          <p className="text-xs font-bold text-[#F0C26E]">
                            {t(home.hero.subPhotoRightSub)}
                          </p>
                          <p className="mt-0.5 text-xs text-white/95 sm:text-sm sm:font-semibold">
                            {t(home.hero.subPhotoRightTitle)}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "infoStrip":
        return (
          <section
            key="infoStrip"
            className="border-b border-kraft-deep/75 bg-parchment px-4 py-6 sm:px-6 lg:px-8"
          >
            <dl className="mx-auto grid max-w-6xl grid-cols-1 gap-4 rounded-2xl border border-kraft-deep/85 bg-white/90 px-5 py-4 shadow-xs sm:grid-cols-3 sm:divide-x sm:divide-kraft-deep/70 sm:px-6">
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
                      href={store.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-kraft-deep underline-offset-4 transition-colors hover:text-cinnabar hover:decoration-cinnabar"
                    >
                      {store.street}, {store.locality} {store.postalCode}
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
                      ? zhText(store.hoursSummaryZh)
                      : store.hoursSummaryEn}
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
                    {pick(
                      "外带自取 · 无接触配送（不提供堂食）",
                      "Takeaway & Delivery Only"
                    )}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">
                    <a
                      href={phoneHref}
                      className="transition-colors hover:text-cinnabar"
                    >
                      {store.phoneDisplay}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </section>
        );

      case "ticker":
        if (!home.tickerItems || home.tickerItems.length === 0) return null;
        return (
          <div
            key="ticker"
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
                  {home.tickerItems.map((item, idx) => (
                    <span
                      key={`${dup}-${idx}`}
                      className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.06em] text-ink-soft"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          TICKER_DOTS[idx % TICKER_DOTS.length]
                        }`}
                        aria-hidden="true"
                      />
                      <span>{t(item)}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case "featuredMenu":
        return (
          <section
            key="featuredMenu"
            className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          >
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <SectionHeading
                  eyebrow={t(home.featuredMenu.eyebrow)}
                  chineseAccent={home.featuredMenu.chineseAccent}
                  title={t(home.featuredMenu.title)}
                  description={t(home.featuredMenu.description)}
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

            <div
              className={`mt-10 grid gap-6 sm:grid-cols-2 ${
                home.featuredMenu.columns === 2
                  ? "lg:grid-cols-2"
                  : "lg:grid-cols-3"
              }`}
            >
              {displayFeatured.slice(0, 6).map((item, idx) => {
                const dishNote =
                  featuredDishTags[idx % featuredDishTags.length];
                return (
                  <Reveal
                    key={item.id}
                    delay={(idx % 3) * 95}
                    className="h-full"
                  >
                    <article className="apple-card social-card-shadow group flex h-full flex-col overflow-hidden rounded-[26px] border border-kraft-deep/80 bg-white hover:border-cinnabar/40 hover:shadow-xl">
                      {item.image && (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
                          <Image
                            src={item.image}
                            alt={
                              item.imageAlt ? t(item.imageAlt) : t(item.name)
                            }
                            fill
                            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) 46vw, 356px"
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                          />
                          {item.price && (
                            <span className="absolute right-3 bottom-3 rounded-full bg-[#1a1614]/85 px-3 py-1 font-sans text-sm font-bold tabular-nums text-[#F0C26E] backdrop-blur-xs">
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
                            {item.isNew && <NewBadge />}
                            {item.isAvailable === false && <SoldOutBadge />}
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
        );

      case "combos":
        return (
          <section
            key="combos"
            className="cv-auto gradient-light-edge relative overflow-hidden border-y border-kraft-deep/80 bg-surface-dark text-[#F7F5F2]"
          >
            <div
              aria-hidden="true"
              data-festival-decorative="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-44"
              style={{
                background:
                  "radial-gradient(ellipse 68% 65% at 50% 0%, var(--theme-glow-a), transparent 72%)",
              }}
            />
            <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.2em] text-accent-bright uppercase">
                    <span>{t(home.combos.eyebrow)}</span>
                    <span aria-hidden="true" className="text-white/30">
                      ·
                    </span>
                    <span
                      lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                      className="font-calligraphy text-lg font-normal tracking-normal text-[#F7F5F2] normal-case"
                    >
                      {zhText(home.combos.chineseAccent)}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] text-white sm:text-4xl">
                    {t(home.combos.title)}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-[#E8E4DE]">
                    {t(home.combos.description)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <ShareSpotButton variant="dark" />
                  {rednote && (
                    <a
                      href={rednote.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-accent-bright hover:text-accent-bright"
                    >
                      <SocialIcon platform="rednote" className="h-3.5 w-3.5" />
                      {t(rednote.label)} · {rednote.handle}
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {home.combos.cards.map((combo, idx) => (
                  <Reveal key={combo.id || idx} delay={idx * 100} className="h-full">
                    <Link
                      href={combo.href}
                      className="apple-card group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.05] hover:border-accent-bright/60 hover:bg-white/[0.09]"
                    >
                      <div className="relative isolate aspect-[16/10] w-full overflow-hidden bg-[#1a1614]">
                        <Image
                          src={combo.image}
                          alt={t(combo.title)}
                          fill
                          sizes="(max-width: 768px) calc(100vw - 2rem), 356px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-[#1a1614]/84 px-3 py-1 text-[11px] font-semibold text-[#F0C26E] backdrop-blur-xs">
                          {t(combo.tag)}
                        </span>
                        <span className="absolute right-3 bottom-3 rounded-full bg-white/95 px-3 py-1 font-sans text-xs font-bold tabular-nums text-[#1a1614] shadow-xs">
                          {combo.price}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <h3 className="font-display text-xl font-medium text-white transition-colors group-hover:text-accent-bright">
                            {t(combo.title)}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-[#E8E4DE]">
                            {t(combo.desc)}
                          </p>
                        </div>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-bright">
                          {t(combo.cta)}
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
        );

      case "reviews":
        return (
          <ReviewsSection
            key="reviews"
            initialData={initialReviews}
            posts={posts}
          />
        );

      case "audience": {
        const icons = [ShieldCheck, Flame, Leaf];
        const badgeStyles = [
          "border-cinnabar/25 bg-cinnabar/10 text-cinnabar-dark",
          "border-turmeric/35 bg-turmeric/15 text-[#87560d]",
          "border-jade/30 bg-jade/10 text-jade",
        ];
        return (
          <section
            key="audience"
            className="border-b border-kraft-deep/80 bg-kraft/35"
          >
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
              <div className="grid gap-5 md:grid-cols-3">
                {home.audience.cards.map((card, idx) => {
                  const Icon = icons[idx % icons.length];
                  return (
                    <Reveal key={idx} delay={idx * 110} className="h-full">
                      <div className="apple-card flex h-full flex-col justify-between rounded-2xl border border-kraft-deep/80 bg-white/90 p-6 shadow-2xs hover:shadow-lg">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                                badgeStyles[idx % badgeStyles.length]
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                              {t(card.badge)}
                            </span>
                            <span
                              lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                              className="font-calligraphy text-lg text-ink-muted"
                            >
                              {zhText(card.accentZh)}
                            </span>
                          </div>
                          <h2 className="mt-3.5 font-display text-xl font-semibold text-ink">
                            {t(card.title)}
                          </h2>
                          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                            {t(card.description)}
                          </p>
                        </div>
                        <Link
                          href={card.href}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cinnabar transition-colors hover:text-cinnabar-dark"
                        >
                          {t(card.cta)}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case "craftShowcase":
        return <AppleCraftShowcase key="craftShowcase" />;

      case "storyBand":
        return (
          <section
            key="storyBand"
            className="cv-auto border-y border-kraft-deep/80 bg-kraft/60"
          >
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-22 lg:grid-cols-12 lg:px-8">
              <div className="grid min-w-0 grid-cols-12 gap-4 lg:col-span-6">
                <Reveal variant="scale" className="col-span-7">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border-2 border-parchment bg-kraft shadow-lg">
                    <Image
                      src={home.storyBand.photoMain}
                      alt={t(home.storyBand.title)}
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
                        src={home.storyBand.photoTopRight}
                        alt={t(home.storyBand.eyebrow)}
                        fill
                        sizes="(max-width: 1024px) 40vw, 20vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
                      />
                    </div>
                  </Reveal>
                  <Reveal
                    variant="scale"
                    delay={220}
                    className="flex flex-1 flex-col"
                  >
                    <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-md">
                      <Image
                        src={home.storyBand.photoBottomRight}
                        alt={t(home.storyBand.eyebrow)}
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
                    eyebrow={t(home.storyBand.eyebrow)}
                    chineseAccent={home.storyBand.chineseAccent}
                    title={t(home.storyBand.title)}
                    description={t(home.storyBand.lead)}
                  />
                </Reveal>

                <div className="mt-8 space-y-4">
                  {home.storyBand.pillars.map((pillar, idx) => (
                    <Reveal key={idx} delay={idx * 100}>
                      <div className="apple-card rounded-2xl border border-kraft-deep/80 bg-parchment/90 p-4 shadow-2xs hover:shadow-md">
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
        );

      case "galleryStrip":
        return (
          <section
            key="galleryStrip"
            className="cv-auto mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8"
          >
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                eyebrow={t(home.galleryStrip.eyebrow)}
                chineseAccent={home.galleryStrip.chineseAccent}
                title={t(home.galleryStrip.title)}
                description={t(home.galleryStrip.description)}
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
              {home.galleryStrip.photos.map((photo, idx) => (
                <Reveal key={idx} variant="scale" delay={idx * 85}>
                  <Link
                    href="/gallery"
                    className="apple-card social-card-shadow group relative block aspect-[3/4] overflow-hidden rounded-[24px] border-2 border-white bg-kraft ring-1 ring-kraft-deep/80 hover:ring-cinnabar/45"
                  >
                    <Image
                      src={photo.src}
                      alt={t(photo.label)}
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
        );

      case "ctaBanner":
        return (
          <section
            key="ctaBanner"
            className="cv-auto mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 lg:px-8"
          >
            <Reveal variant="scale">
              <div className="gradient-light-edge relative overflow-hidden rounded-[34px] border border-white/15 bg-surface-dark px-6 py-12 text-[#F7F5F2] shadow-2xl sm:px-12 sm:py-16">
                <div
                  aria-hidden="true"
                  data-festival-decorative="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-36"
                  style={{
                    background:
                      "radial-gradient(ellipse 68% 70% at 50% 0%, var(--theme-glow-a), transparent 72%)",
                  }}
                />
                <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                  <div className="min-w-0 lg:col-span-7">
                    <p className="text-xs font-semibold tracking-[0.2em] text-accent-bright uppercase">
                      {t(home.ctaBanner.eyebrow)}
                    </p>
                    <h2 className="mt-2.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      {t(home.ctaBanner.title)}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#E8E4DE] sm:text-base">
                      {t(home.ctaBanner.description)}{" "}
                      <a
                        href={phoneHref}
                        className="font-semibold text-accent-bright underline underline-offset-4 hover:text-white"
                      >
                        {store.phoneDisplay}
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:col-span-5 lg:justify-end">
                    <a
                      href={store.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-accent-bright px-6 py-3.5 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-white"
                    >
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      {pick("获取地图导航", "Get Directions")}
                    </a>

                    {store.orderOnlineUrl && (
                      <a
                        href={store.orderOnlineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-parchment/30 bg-cinnabar px-6 py-3.5 text-sm font-semibold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
                      >
                        {pick("在线点餐", "Order Online")}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
        );
    }
  };

  return (
    <>
      {home.sections
        .filter((sec) => sec.visible)
        .map((sec) => renderSection(sec.id))}
      <WelcomeCouponSection />
    </>
  );
}
