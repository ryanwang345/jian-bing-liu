"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, Star } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { useSiteContent } from "@/components/SiteContentProvider";
import { SocialIcon } from "@/components/SocialIcon";
import { useSocialLinks } from "@/components/SocialLinksProvider";
import { ParallaxLayer } from "@/components/motion/ParallaxLayer";
import { Reveal } from "@/components/motion/Reveal";
import { googleRating } from "@/data/reviews";
import { useLocale } from "@/lib/i18n";

export function StoryView() {
  const { isTraditional, t, zhText, pick } = useLocale();
  const { store, pages } = useSiteContent();
  const story = pages.story;
  const socialLinks = useSocialLinks();

  return (
    <div className="pb-20">
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:px-8">
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
              <span>{t(story.eyebrow)}</span>
              <span aria-hidden="true" className="text-kraft-deep">
                ·
              </span>
              <span
                lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                className="font-calligraphy text-lg font-normal tracking-normal text-ink"
              >
                {zhText(story.chineseAccent)}
              </span>
            </p>
            <h1 className="mt-2 font-display text-4xl leading-[1.12] font-medium tracking-[-0.025em] text-ink sm:text-5xl">
              {t(story.headline)}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
              {t(story.lead)}
            </p>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-muted sm:text-base">
              {story.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{t(paragraph)}</p>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-kraft-deep bg-white/90 p-5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-extrabold text-ink">
                    {googleRating.score}
                  </span>
                  <span
                    className="flex items-center gap-0.5 text-[#E59819]"
                    aria-hidden="true"
                  >
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
                  {socialLinks
                    .filter((s) => s.platform !== "google-maps")
                    .map((social) => (
                      <a
                        key={social.platform}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t(social.label)} ${social.handle}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-kraft-deep bg-kraft/50 text-ink transition-colors hover:border-cinnabar hover:bg-cinnabar hover:text-parchment"
                      >
                        <SocialIcon
                          platform={social.platform}
                          className="h-3.5 w-3.5"
                        />
                      </a>
                    ))}
                </div>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">
                {pick(
                  "每一张煎饼都由刘阿姨亲手现摊，配鲜榨果蔬面糊与自制辣椒油。欢迎关注我们的官方社媒看厨房日常。",
                  "Every crepe is spun by hand with natural fruit-and-veg batters and homemade chilli oil. Follow our official socials for daily clips from the griddle."
                )}
              </p>
            </div>
          </div>

          <div className="animate-fade-up-delay-1 order-1 min-w-0 lg:order-2 lg:col-span-6">
            <ParallaxLayer offset={-18}>
              <div className="animate-hero-media relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border-2 border-kraft-deep bg-kraft shadow-xl">
                <Image
                  src={story.heroPhoto}
                  alt={t(story.headline)}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 544px"
                  className="object-cover"
                />
              </div>
            </ParallaxLayer>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={pick("铁板手艺", "On the Griddle")}
            chineseAccent="匠心工艺"
            title={t(story.stepsTitle)}
            description={t(story.stepsDescription)}
          />
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {story.steps.map((item, idx) => (
            <Reveal key={idx} delay={idx * 110} className="h-full">
              <article className="apple-card flex h-full flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white shadow-xs hover:shadow-xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
                  <Image
                    src={item.image}
                    alt={t(item.title)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-surface-dark/88 px-3 py-1 font-display text-xs font-bold text-accent-bright">
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
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-kraft-deep/80 bg-kraft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={pick("品牌印记", "The Details")}
            chineseAccent="正宗风味"
            title={t(story.detailsTitle)}
            description={t(story.detailsDescription)}
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {story.detailCards.map((card, idx) => (
              <figure
                key={idx}
                className="overflow-hidden rounded-2xl border border-kraft-deep bg-white shadow-xs"
              >
                <div className="relative aspect-square w-full bg-kraft">
                  <Image
                    src={card.image}
                    alt={t(card.caption)}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="p-4 text-sm font-medium text-ink-muted">
                  {t(card.caption)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-kraft-deep bg-white p-8 shadow-sm sm:p-10 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {pick("想来一份刚出锅的热乎煎饼吗？", "Fancy a hot Jian Bing?")}
            </h2>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              {pick(
                `浏览全部菜单，或于营业时间（${store.hoursSummaryZh}）顺路光临 ${store.street}。`,
                `Take a look at the menu, or pop into ${store.street} (${store.hoursSummaryEn}).`
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
            {store.orderOnlineUrl && (
              <a
                href={store.orderOnlineUrl}
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
