"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import { DietaryBadge } from "@/components/DietaryBadge";
import { ReviewsSection } from "@/components/ReviewsSection";
import { SectionHeading } from "@/components/SectionHeading";
import { featuredMenuItems } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { useLocale, type LocalizedText } from "@/lib/i18n";

const craftGalleryStrip: Array<{
  src: string;
  alt: LocalizedText;
  label: LocalizedText;
}> = [
  {
    src: "/images/veggie-crepe-griddle.jpg",
    alt: {
      en: "Colourful fruit-and-vegetable batter crepe topped with herbs and shredded fillings on the hot griddle",
      zh: "热铁板上天然调色的彩色果蔬面糊煎饼，铺满鲜绿青菜与香葱",
    },
    label: { en: "Fruit & Veg Batter", zh: "天然果蔬面糊" },
  },
  {
    src: "/images/fancy-lace-dessert-cone.jpg",
    alt: {
      en: "Hand-piped pink lace dessert crepe cone with whipped cream, fresh fruit, and biscuit sticks",
      zh: "粉色手工蕾丝边甜筒煎饼，装满奶油、鲜果与抹茶饼干棒",
    },
    label: { en: "Fancy Lace Cones", zh: "花式蕾丝甜筒" },
  },
  {
    src: "/images/veg-spring-rolls.jpg",
    alt: {
      en: "Golden crispy vegetarian spring rolls served on a heart-shaped plate",
      zh: "心形白盘上金黄酥脆的传统素春卷",
    },
    label: { en: "Crispy Street Snacks", zh: "酥香街头小吃" },
  },
  {
    src: "/images/spiced-tea-eggs.jpg",
    alt: {
      en: "Spiced Chinese tea eggs steeping in dark soy and aromatic black tea marinade",
      zh: "浓郁红茶五香卤汁里浸泡的整颗茶叶蛋",
    },
    label: { en: "Traditional Tea Eggs", zh: "古法五香茶叶蛋" },
  },
];

export function HomeView() {
  const { locale, t } = useLocale();
  const isZh = locale === "zh";

  return (
    <>
      {/* Hero Section */}
      <section className="kraft-grain relative overflow-hidden border-b border-kraft-deep/80">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
          <div className="animate-fade-up lg:col-span-6">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cinnabar/25 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-cinnabar shadow-xs">
              <span
                lang="zh-Hans"
                className="font-calligraphy text-base font-normal text-ink"
              >
                {restaurant.chineseTagline}
              </span>
              <span aria-hidden="true" className="text-kraft-deep">
                |
              </span>
              <span className={isZh ? "tracking-wider" : "tracking-wide uppercase"}>
                {isZh ? "伦敦卡姆登" : "Camden, London"}
              </span>
            </div>

            {isZh ? (
              <h1 className="mt-5 font-display text-4xl leading-[1.2] tracking-[0.03em] text-ink sm:text-[3.2rem]">
                铁板现摊，
                <br />
                热乎酥香的<span className="text-cinnabar">果蔬煎饼</span>
              </h1>
            ) : (
              <h1 className="mt-5 font-display text-4xl leading-[1.06] font-medium tracking-[-0.025em] text-ink sm:text-5xl lg:text-[3.6rem]">
                Hot, crisp{" "}
                <em className="italic font-medium text-cinnabar">Jian Bing</em>{" "}
                folded straight off the griddle.
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
                {isZh ? "查看菜单" : "View Menu"}
              </Link>

              <Link
                href="/visit-us"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-parchment px-6 py-3.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-parchment"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {isZh ? "来店指南" : "Visit Us"}
              </Link>

              {restaurant.links.orderOnline && (
                <a
                  href={restaurant.links.orderOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-cinnabar underline decoration-cinnabar/40 underline-offset-4 transition-colors hover:text-cinnabar-dark hover:decoration-cinnabar"
                >
                  {isZh ? "在线点餐" : "Order Online"}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>

            <dl className="mt-10 grid grid-cols-1 gap-4 border-t border-kraft-deep/90 pt-6 sm:grid-cols-[1.25fr_1fr_1fr]">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                  <MapPin className="h-3.5 w-3.5 text-cinnabar" aria-hidden="true" />
                  {isZh ? "门店地址" : "Location"}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {restaurant.address.street}, {restaurant.address.postalCode}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                  <Clock className="h-3.5 w-3.5 text-cinnabar" aria-hidden="true" />
                  {isZh ? "每日营业" : "Open Daily"}
                </dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums text-ink">
                  {isZh ? "11:00 – 21:30" : "11:00 AM – 9:30 PM"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                  <Phone className="h-3.5 w-3.5 text-cinnabar" aria-hidden="true" />
                  {isZh ? "堂食 · 外带 · 配送" : "Dine-In · Takeaway"}
                </dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums text-ink">
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

          {/* Hero Photography */}
          <div className="animate-fade-up-delay-1 relative lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border-2 border-kraft-deep bg-kraft shadow-xl">
              <Image
                src="/images/hero-jianbing-platter.jpg"
                alt={
                  isZh
                    ? "刚出锅对半切开的招牌果蔬咸味煎饼，旁放印有煎饼刘字样的牛皮纸袋"
                    : "Freshly griddled herb-studded savoury Jian Bing crepe cut in half beside the Jian Bing Liu branded kraft sleeve"
                }
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-0 sm:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-lg sm:absolute sm:-bottom-6 sm:-left-6 sm:h-36 sm:w-48">
                <Image
                  src="/images/beef-crepe-sleeve.jpg"
                  alt={
                    isZh
                      ? "撒满黑芝麻、装在牛皮纸袋中的热乎咸味煎饼"
                      : "Warm black-sesame Jian Bing crepe wrapped in a signature kraft sleeve"
                  }
                  fill
                  sizes="(max-width: 640px) 50vw, 192px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-center rounded-2xl border border-kraft-deep bg-ink p-4 text-parchment shadow-lg sm:absolute sm:-right-3 sm:-bottom-6 sm:max-w-[235px]">
                <p
                  lang="zh-Hans"
                  className="font-calligraphy text-2xl text-[#F0C26E]"
                >
                  煎饼刘 · 现做现卖
                </p>
                <p className="mt-1 text-xs leading-relaxed text-parchment/80">
                  {isZh
                    ? "清真牛肉鸡肉煎饼、天然果蔬素食饼皮、手工煎饺与慢炖家常菜，每单现点现做。"
                    : "Halal beef & chicken crepes, natural veg batters, and pan-fried dumplings cooked to order."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Menu Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={isZh ? "当季热卖" : "On the Menu"}
            chineseAccent="招牌美味"
            title={
              isZh
                ? "热乎出锅的地道中式街头好味"
                : "Cooked hot to order on Camden Road"
            }
            description={
              isZh
                ? "精选最受欢迎的现摊咸味煎饼、慢炖牛肉饭、金黄脆底煎饺与花式甜煎饼，菜单均标注清晰实价。"
                : "Our best-selling savoury Jian Bing, slow-braised beef, crispy dumplings, and sweet crepes, all with current in-store prices."
            }
          />
          <Link
            href="/menu"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xs transition-all hover:border-cinnabar hover:text-cinnabar"
          >
            {isZh ? "浏览完整菜单" : "See Full Menu"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredMenuItems.slice(0, 6).map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {item.image && (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
                  <Image
                    src={item.image}
                    alt={item.imageAlt ? t(item.imageAlt) : t(item.name)}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
          ))}
        </div>
      </section>

      {/* Our Story & Craft Editorial Band */}
      <section className="border-y border-kraft-deep/80 bg-kraft/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-22 lg:grid-cols-12 lg:px-8">
          <div className="grid grid-cols-12 gap-4 lg:col-span-6">
            <div className="relative col-span-7 aspect-[3/4] overflow-hidden rounded-3xl border-2 border-parchment bg-kraft shadow-lg">
              <Image
                src="/images/chef-lace-crepe.jpg"
                alt={
                  isZh
                    ? "煎饼刘主厨在卡姆登厨房里微笑展示刚出锅的手工蕾丝煎饼"
                    : "Chef at Jian Bing Liu in Camden smiling while lifting a freshly made lace crepe in the kitchen"
                }
                fill
                sizes="(max-width: 1024px) 60vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="col-span-5 flex flex-col gap-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-md">
                <Image
                  src="/images/brand-kraft-sleeve.jpg"
                  alt={
                    isZh
                      ? "印有煎饼刘毛笔书法与爱民朱红印章的招牌牛皮纸袋"
                      : "Jian Bing Liu kraft crepe wrapper stamped with red script, Chinese calligraphy 煎饼刘, and our 爱民 seal"
                  }
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover"
                />
              </div>
              <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-md">
                <Image
                  src="/images/griddle-batter-egg.jpg"
                  alt={
                    isZh
                      ? "圆铁板上正在摊匀的彩色果蔬面糊与新鲜鸡蛋"
                      : "Swirling colourful vegetable batter and fresh egg on the round Jian Bing griddle"
                  }
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow={isZh ? "品牌故事" : "Our Story"}
              chineseAccent="匠心手作"
              title={t(restaurant.story.headline)}
              description={t(restaurant.story.lead)}
            />

            <div className="mt-8 space-y-4">
              {restaurant.story.pillars.map((pillar) => (
                <div
                  key={pillar.chinese}
                  className="rounded-2xl border border-kraft-deep/80 bg-parchment/90 p-4 shadow-2xs"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-ink">
                      {t(pillar.title)}
                    </h3>
                    <span
                      lang="zh-Hans"
                      className="font-calligraphy text-lg text-cinnabar"
                    >
                      {pillar.chinese}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {t(pillar.description)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/our-story"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar"
              >
                {isZh ? "了解更多故事" : "Read Our Story"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview Strip */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow={isZh ? "后厨实拍" : "From the Kitchen"}
            chineseAccent="色香俱全"
            title={
              isZh
                ? "真实出餐，每一份都热气腾腾"
                : "Real food, straight off the griddle"
            }
            description={
              isZh
                ? "镜头直击伦敦卡姆登厨房——从天然果蔬咸味煎饼到手工花式蕾丝甜筒、金黄春卷与五香茶叶蛋。"
                : "Photos from behind our Camden counter: savoury fruit-and-veg crepes, hand-piped lace cones, crisp spring rolls, and tea eggs."
            }
          />
          <Link
            href="/gallery"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xs transition-all hover:border-cinnabar hover:text-cinnabar"
          >
            {isZh ? "查看全部图集" : "See All Photos"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {craftGalleryStrip.map((photo) => (
            <Link
              key={photo.src}
              href="/gallery"
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-kraft-deep bg-kraft shadow-xs"
            >
              <Image
                src={photo.src}
                alt={t(photo.alt)}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent p-4 pt-12">
                <p className="font-display text-sm font-semibold text-parchment">
                  {t(photo.label)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Verified Google Reviews & Social Community */}
      <ReviewsSection />

      {/* Visit Us CTA Banner */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-12 text-parchment shadow-xl sm:px-12 sm:py-16">
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#F0C26E] uppercase">
                {isZh
                  ? "伦敦卡姆登路 · 堂食、外带与配送"
                  : "Camden Road · Dine-In, Takeaway & Delivery"}
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">
                {isZh
                  ? "欢迎路过卡姆登路 124 号，或线上下单热乎送到家。"
                  : `Drop by ${restaurant.address.street}, or order it hot to your door.`}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-parchment/80 sm:text-base">
                {isZh ? (
                  <>
                    每天 11:00 至 21:30 营业，提供堂食、到店自取与无接触外卖配送。可提前致电{" "}
                    <a
                      href={restaurant.phone.href}
                      className="font-semibold text-[#F0C26E] underline underline-offset-4 hover:text-white"
                    >
                      {restaurant.phone.display}
                    </a>{" "}
                    咨询，或直接通过 {restaurant.links.orderOnlineProvider}{" "}
                    平台在线点单。
                  </>
                ) : (
                  <>
                    Open daily, 11:00 AM to 9:30 PM, for dine-in, takeaway, and
                    no-contact delivery. Ring us on{" "}
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

            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <a
                href={restaurant.links.googleMapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#F0C26E] px-6 py-3.5 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {isZh ? "获取地图导航" : "Get Directions"}
              </a>

              {restaurant.links.orderOnline && (
                <a
                  href={restaurant.links.orderOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-parchment/30 bg-cinnabar px-6 py-3.5 text-sm font-semibold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
                >
                  {isZh ? "在线点餐" : "Order Online"}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
