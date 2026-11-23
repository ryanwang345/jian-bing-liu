"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, Star } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { SocialIcon } from "@/components/SocialIcon";
import { restaurant } from "@/data/restaurant";
import { googleRating } from "@/data/reviews";
import { useLocale, type LocalizedText } from "@/lib/i18n";

const griddleSteps: Array<{
  step: LocalizedText;
  title: LocalizedText;
  chinese: string;
  description: LocalizedText;
  image: string;
  alt: LocalizedText;
}> = [
  {
    step: { en: "Step 01", zh: "第一步" },
    title: { en: "Swirled on Cast Iron", zh: "热铁板手工摊饼" },
    chinese: "摊面糊",
    description: {
      en: "Fresh savoury or naturally coloured fruit-and-veg batter is poured onto a hot round griddle and spread paper-thin with cracked egg.",
      zh: "在烧至恰到好处的圆铁板上淋入鲜调面糊或天然果蔬面糊，迅速均匀摊开并打入鲜蛋，激出焦香。",
    },
    image: "/images/griddle-batter-egg.jpg",
    alt: {
      en: "Fresh vegetable batter and cracked egg cooking evenly across a seasoned cast-iron Jian Bing griddle",
      zh: "圆铁板上正在均匀摊开的彩色果蔬面糊与鲜蛋",
    },
  },
  {
    step: { en: "Step 02", zh: "第二步" },
    title: { en: "Brushed & Layered", zh: "刷秘制酱铺满料" },
    chinese: "刷酱加料",
    description: {
      en: "We brush on our savoury homemade sauce and pile on crisp lettuce, spring onions, crispy fried onions, and your choice of Halal beef, chicken, or veggies.",
      zh: "刷上自家调制的咸香酱汁，铺满脆生菜、香葱、酥脆炸洋葱，再按口味加入清真牛肉、鸡肉或爽脆时蔬。",
    },
    image: "/images/folded-rainbow-crepe.jpg",
    alt: {
      en: "Colourful savoury Jian Bing crepe layered with fresh greens and folded warm on the griddle",
      zh: "热铁板上刷好酱、铺满青菜并折起一半的果蔬煎饼",
    },
  },
  {
    step: { en: "Step 03", zh: "第三步" },
    title: { en: "Folded Warm to Go", zh: "趁热装袋酥脆入口" },
    chinese: "趁热享用",
    description: {
      en: "Folded straight into our 煎饼刘 (爱民) brown paper sleeve while the eggy crepe is still soft and the centre is piping hot and crisp.",
      zh: "迅速折好装入印有「煎饼刘 · 爱民」印章的暖黄牛皮纸袋，每一口都是外柔内脆的热乎满足。",
    },
    image: "/images/jianbing-apron-hero.jpg",
    alt: {
      en: "Generously filled Jian Bing wrapped in a kraft sleeve held in front of the embroidered Jian Bing Liu apron",
      zh: "装在牛皮纸袋里饱满厚实的咸味煎饼，背景为印有煎饼刘与爱民印章的黑色围裙",
    },
  },
];

export function StoryView() {
  const { isTraditional, t, zhText, pick } = useLocale();

  return (
    <div className="pb-20">
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
              <span>{pick("品牌故事", "Our Story")}</span>
              <span aria-hidden="true" className="text-kraft-deep">
                ·
              </span>
              <span
                lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                className="font-calligraphy text-lg font-normal tracking-normal text-ink"
              >
                {zhText("关于煎饼刘")}
              </span>
            </p>
            <h1 className="mt-2 font-display text-4xl leading-[1.12] font-medium tracking-[-0.025em] text-ink sm:text-5xl">
              {t(restaurant.story.headline)}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
              {t(restaurant.story.lead)}
            </p>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-muted sm:text-base">
              {restaurant.story.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{t(paragraph)}</p>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-kraft-deep bg-white/90 p-5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-extrabold text-ink">
                    {googleRating.score}
                  </span>
                  <span className="flex items-center gap-0.5 text-[#E59819]" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </span>
                  <span className="text-xs font-semibold text-ink-muted">
                    {pick(
                      `Google ${googleRating.count} 条好评`,
                      `${googleRating.count} Google Reviews`
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {restaurant.verifiedSocialLinks
                    .filter((s) => s.platform !== "google-maps")
                    .map((social) => (
                      <a
                        key={social.href}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t(social.label)} ${social.handle}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-kraft-deep bg-kraft/50 text-ink transition-colors hover:border-cinnabar hover:bg-cinnabar hover:text-parchment"
                      >
                        <SocialIcon platform={social.platform} className="h-3.5 w-3.5" />
                      </a>
                    ))}
                </div>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">
                {pick(
                  "每一张煎饼都由店主亲手现摊，配自家熬制酱料与秘制辣椒油，欢迎在 Instagram（@jian_bing_liu）、TikTok（@jianbingliu.uk）与 Threads 关注我们的日常出餐。",
                  "Every crepe is cooked to order by hand with homemade sauces and chilli oil. Follow @jian_bing_liu on Instagram & Threads and @jianbingliu.uk on TikTok for daily clips from the counter."
                )}
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border-2 border-kraft-deep bg-kraft shadow-xl">
              <Image
                src="/images/chef-lace-crepe.jpg"
                alt={pick(
                  "煎饼刘主厨身穿印有煎饼刘字样的围裙，面带微笑展示刚出锅的手工粉色蕾丝煎饼",
                  "Jian Bing Liu chef smiling in branded black apron and red sleeve while holding a freshly griddled pink lace crepe"
                )}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 544px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <SectionHeading
          eyebrow={pick("铁板手艺", "On the Griddle")}
          chineseAccent="匠心工艺"
          title={pick(
            "三步出锅，从滚烫面糊到酥香纸袋",
            "Three steps from hot batter to brown paper sleeve"
          )}
          description={pick(
            "正宗中式煎饼讲究火候、手速与配料层次，热腾腾现摊现叠，趁热咬下去最香。",
            "Proper Jian Bing comes down to heat, speed, and crunch. Cooked right in front of you and best eaten hot."
          )}
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {griddleSteps.map((item) => (
            <article
              key={item.chinese}
              className="flex flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white shadow-xs"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
                <Image
                  src={item.image}
                  alt={t(item.alt)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 rounded-full bg-ink/85 px-3 py-1 font-display text-xs font-bold text-[#F0C26E]">
                  {t(item.step)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl font-bold text-ink">
                    {t(item.title)}
                  </h3>
                  <span
                    lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                    className="font-calligraphy text-xl text-cinnabar"
                  >
                    {zhText(item.chinese)}
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                  {t(item.description)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-kraft-deep/80 bg-kraft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={pick("品牌印记", "The Details")}
            chineseAccent="正宗风味"
            title={pick(
              "手写书法、爱民朱印与多彩果蔬煎饼",
              "Brush calligraphy, our 爱民 seal & colourful crepes"
            )}
            description={pick(
              "从印着毛笔字「煎饼刘」与「爱民」朱印的牛皮纸袋，到门口红底流苏的果蔬煎饼旗帜，每一处细节都延续着地道亲切的中国市井温度。",
              "From the brush-lettered 煎饼刘 paper sleeves and red 爱民 stamp to the fringed banner out front and hand-piped lace crepes, we keep the feel of a traditional Chinese street stall."
            )}
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <figure className="overflow-hidden rounded-2xl border border-kraft-deep bg-white shadow-xs">
              <div className="relative aspect-square w-full bg-kraft">
                <Image
                  src="/images/brand-kraft-sleeve.jpg"
                  alt={pick(
                    "印有毛笔书法煎饼刘与朱红爱民印章的牛皮纸袋",
                    "Jian Bing Liu kraft crepe wrapper stamped with red script, black brush calligraphy 煎饼刘, and our vermilion 爱民 seal"
                  )}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-4 text-sm font-medium text-ink-muted">
                {pick(
                  "招牌牛皮纸袋，印有手写书法「煎饼刘」与「爱民」朱红印章。",
                  "Our brown paper sleeve stamped with 煎饼刘 calligraphy and the red 爱民 seal."
                )}
              </figcaption>
            </figure>

            <figure className="overflow-hidden rounded-2xl border border-kraft-deep bg-white shadow-xs">
              <div className="relative aspect-square w-full bg-kraft">
                <Image
                  src="/images/banner-fruit-veg-crepe.jpg"
                  alt={pick(
                    "正宗风味果蔬煎饼传统红旗前手捧热气腾腾的现摊煎饼",
                    "Freshly folded savoury Jian Bing held in front of the traditional red and gold 果蔬煎饼 banner"
                  )}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-4 text-sm font-medium text-ink-muted">
                {pick(
                  "门店悬挂的传统红金流苏旗帜——「正宗风味 · 果蔬煎饼」。",
                  "Our traditional red banner for fruit-and-vegetable crepes (果蔬煎饼)."
                )}
              </figcaption>
            </figure>

            <figure className="overflow-hidden rounded-2xl border border-kraft-deep bg-white shadow-xs">
              <div className="relative aspect-square w-full bg-kraft">
                <Image
                  src="/images/lace-crepe-sheet.jpg"
                  alt={pick(
                    "刚摊好的金黄甜饼皮，边缘手工挤满粉色花式蕾丝脆边",
                    "Freshly griddled golden crepe trimmed with delicate hand-piped pink lattice lace"
                  )}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-4 text-sm font-medium text-ink-muted">
                {pick(
                  "手工挤制的花式蕾丝脆边，卷成高颜值的甜筒煎饼。",
                  "Hand-piped lace edges made on the griddle for our sweet crepe cones."
                )}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-kraft-deep bg-white p-8 shadow-sm sm:p-10 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {pick(
                "想来一份刚出锅的热乎煎饼吗？",
                "Fancy a hot Jian Bing?"
              )}
            </h2>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              {pick(
                "浏览全部菜单，或每天 11:00 – 21:30 顺路光临伦敦卡姆登路 124 号。",
                `Take a look at the menu, or pop into ${restaurant.address.street} any day between 11:00 AM and 9:30 PM.`
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-cinnabar-dark"
            >
              {pick("查看菜单", "View Menu")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/visit-us"
              className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-parchment"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {pick("来店指南", "Visit Us")}
            </Link>
            {restaurant.links.orderOnline && (
              <a
                href={restaurant.links.orderOnline}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-kraft/60 px-5 py-3 text-sm font-semibold text-ink hover:border-cinnabar hover:text-cinnabar"
              >
                {pick("在线点餐", "Order Online")}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
