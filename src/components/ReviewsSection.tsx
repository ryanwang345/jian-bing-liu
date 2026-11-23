"use client";

import Image from "next/image";
import { ExternalLink, Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { SocialIcon } from "@/components/SocialIcon";
import { restaurant } from "@/data/restaurant";
import { customerReviews, googleRating } from "@/data/reviews";
import { useLocale, type LocalizedText } from "@/lib/i18n";

const socialShowcases: Array<{
  platform: "instagram" | "tiktok" | "threads";
  title: LocalizedText;
  handle: string;
  href: string;
  summary: LocalizedText;
  cta: LocalizedText;
  image: string;
  imageAlt: LocalizedText;
}> = [
  {
    platform: "instagram",
    title: { en: "Instagram", zh: "Instagram" },
    handle: "@jian_bing_liu",
    href: "https://www.instagram.com/jian_bing_liu/",
    summary: {
      en: "Daily crepe photos, colourful fruit-and-veg batters, seasonal sweet toppings, and behind-the-counter moments.",
      zh: "每日现摊果蔬煎饼实拍、时令花式甜煎饼新品与卡姆登小店日常。",
    },
    cta: { en: "Follow on Instagram", zh: "关注 Instagram" },
    image: "/images/nutella-strawberry-crepe.jpg",
    imageAlt: {
      en: "Strawberry and banana chocolate crepe featured on Jian Bing Liu Instagram",
      zh: "煎饼刘 Instagram 展示的草莓香蕉巧克力甜煎饼",
    },
  },
  {
    platform: "tiktok",
    title: { en: "TikTok", zh: "TikTok" },
    handle: "@jianbingliu.uk",
    href: "https://www.tiktok.com/@jianbingliu.uk",
    summary: {
      en: "Watch hot griddle pours, hand-piped lace edges, crispy folds, and sizzling street-food clips straight from Camden.",
      zh: "近距离观看圆铁板现摊、手工挤花式蕾丝脆边与热气腾腾的出餐短视频。",
    },
    cta: { en: "Watch on TikTok", zh: "前往 TikTok 观看" },
    image: "/images/fancy-lace-dessert-cone.jpg",
    imageAlt: {
      en: "Hand-piped lace dessert crepe cone featured on Jian Bing Liu TikTok",
      zh: "煎饼刘 TikTok 展示的花式蕾丝甜筒煎饼",
    },
  },
  {
    platform: "threads",
    title: { en: "Threads", zh: "Threads" },
    handle: "@jian_bing_liu",
    href: "https://www.threads.com/@jian_bing_liu",
    summary: {
      en: "Quick kitchen updates, fresh batch announcements, and friendly chats with our London regulars.",
      zh: "门店动态、当日新鲜出品分享，欢迎留言聊聊你最爱的煎饼口味。",
    },
    cta: { en: "Join on Threads", zh: "在 Threads 互动" },
    image: "/images/jianbing-apron-hero.jpg",
    imageAlt: {
      en: "Loaded Jian Bing held in front of the Jian Bing Liu apron",
      zh: "煎饼刘围裙前满满当当的招牌咸味煎饼",
    },
  },
];

export function ReviewsSection() {
  const { locale, t } = useLocale();
  const isZh = locale === "zh";

  return (
    <section className="border-y border-kraft-deep/80 bg-kraft/45">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        {/* Header + Verified Google Rating Summary */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow={isZh ? "顾客真实口碑" : "Loved by Londoners"}
            chineseAccent="食客好评"
            title={
              isZh
                ? "Google 4.9 高分好评与社区分享"
                : "Rated 4.9 on Google by Camden regulars"
            }
            description={
              isZh
                ? "每一条评价都来自真实光临卡姆登路 124 号的食客——欢迎在 Google、Instagram、TikTok 与 Threads 上查看更多分享。"
                : "Real words from guests who visit 124 Camden Road — plus daily griddle clips and updates across Instagram, TikTok, and Threads."
            }
          />

          <a
            href={googleRating.reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-4 rounded-2xl border border-kraft-deep bg-white px-5 py-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-cinnabar/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-ink">
                  {googleRating.score}
                </span>
                <span className="flex items-center gap-0.5 text-[#E59819]" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-ink-muted">
                {isZh
                  ? `基于 Google ${googleRating.count} 条真实评价`
                  : `Based on ${googleRating.count} Google Reviews`}
              </p>
            </div>
            <ExternalLink
              className="h-4 w-4 text-ink-muted transition-colors group-hover:text-cinnabar"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* Verified Google Review Cards */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {customerReviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col justify-between rounded-2xl border border-kraft-deep/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex items-center gap-0.5 text-[#E59819]"
                    aria-label={isZh ? "5 星好评" : "5 out of 5 stars"}
                  >
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <span className="rounded-full bg-kraft/70 px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft">
                    {isZh ? "Google 真实评价" : "Google Review"}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-base font-bold text-ink">
                  {t(review.highlight)}
                </h3>

                <blockquote className="relative mt-2 text-sm leading-relaxed text-ink-muted">
                  <Quote
                    className="mb-1 inline-block h-3.5 w-3.5 -translate-y-0.5 text-cinnabar/50"
                    aria-hidden="true"
                  />{" "}
                  {t(review.quote)}
                </blockquote>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-kraft-deep/60 pt-3.5 text-xs">
                <span className="font-semibold text-ink">{review.author}</span>
                <a
                  href={googleRating.reviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-cinnabar hover:text-cinnabar-dark"
                >
                  {isZh ? "在 Google 查看 →" : "View on Google →"}
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Instagram, TikTok & Threads Community Showcase */}
        <div className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-2xl font-bold text-ink">
              {isZh
                ? "在 Instagram、TikTok 与 Threads 关注煎饼刘"
                : `Follow ${restaurant.name} on Instagram, TikTok & Threads`}
            </h3>
            <p className="text-sm text-ink-muted">
              {isZh
                ? "点击直达官方主页，看最新摊饼视频与食客打卡"
                : "Fresh griddle videos, sweet crepe drops & customer shoutouts"}
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {socialShowcases.map((card) => (
              <a
                key={card.platform}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-cinnabar/40 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-kraft">
                  <Image
                    src={card.image}
                    alt={t(card.imageAlt)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-parchment backdrop-blur-xs">
                    <SocialIcon
                      platform={card.platform}
                      className="h-3.5 w-3.5 text-[#F0C26E]"
                    />
                    {t(card.title)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-xs font-semibold text-cinnabar">
                      {card.handle}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {t(card.summary)}
                    </p>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-cinnabar">
                    {t(card.cta)}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
