"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { LiveOpenBadge } from "@/components/LiveOpenBadge";
import { ShareSpotButton } from "@/components/ShareSpotButton";
import { phoneToTelHref, useSiteContent } from "@/components/SiteContentProvider";
import { SocialIcon } from "@/components/SocialIcon";
import { useSocialLinks } from "@/components/SocialLinksProvider";
import { restaurant } from "@/data/restaurant";
import { useLocale } from "@/lib/i18n";

export function VisitView() {
  const { isZh, isTraditional, t, zhText, pick } = useLocale();
  const { store, pages } = useSiteContent();
  const visitCopy = pages.visit;
  const socialLinks = useSocialLinks();
  const messagingLinks = socialLinks.filter((link) =>
    ["rednote", "instagram", "tiktok"].includes(link.platform)
  );
  const [mapReady, setMapReady] = useState(false);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${store.googleMapsEmbedQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const phoneHref = phoneToTelHref(store.phoneDisplay);

  useEffect(() => {
    const id = window.setTimeout(() => setMapReady(true), 150);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="pb-20">
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="animate-fade-up max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
              <span>{t(visitCopy.eyebrow)}</span>
              <span aria-hidden="true" className="text-kraft-deep">
                ·
              </span>
              <span
                lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                className="font-calligraphy text-lg font-normal tracking-normal text-ink"
              >
                {zhText(visitCopy.chineseAccent)}
              </span>
            </p>
            <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.025em] text-ink sm:text-5xl">
              {t(visitCopy.title)}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
              {t(visitCopy.description)}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="min-w-0 space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-kraft-deep bg-white p-6 shadow-xs sm:p-7">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    {pick("门店地址", "Address")}
                  </h2>
                  <address className="mt-1.5 not-italic text-sm leading-relaxed text-ink-muted">
                    {isZh ? (
                      <>
                        {zhText(store.nameZh)}（{zhText(store.sealText)}）
                        <br />
                        {zhText(store.addressZh)}
                        <br />
                        {store.street}, {store.locality} {store.postalCode}
                      </>
                    ) : (
                      <>
                        {store.nameEn} (
                        <span lang="zh-Hans">{store.nameZh}</span>)
                        <br />
                        {store.street}
                        <br />
                        {store.locality} {store.postalCode}
                        <br />
                        United Kingdom
                      </>
                    )}
                  </address>

                  <a
                    href={store.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-cinnabar px-5 py-2.5 text-sm font-semibold text-parchment shadow-xs transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    {pick("谷歌地图路线导航", "Get Directions")}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-kraft-deep bg-white p-6 shadow-xs sm:p-7">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-bold text-ink">
                      {pick("营业时间", "Opening Hours")}
                    </h2>
                    <LiveOpenBadge />
                  </div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-kraft-deep/60 pb-2">
                      <dt className="font-medium text-ink-soft">
                        {pick("周一至周三", "Monday – Wednesday")}
                      </dt>
                      <dd className="font-semibold tabular-nums text-ink">
                        {store.monWedOpens} – {store.monWedCloses}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="font-medium text-ink-soft">
                        {pick("周四至周日", "Thursday – Sunday")}
                      </dt>
                      <dd className="font-semibold tabular-nums text-ink">
                        {store.thuSunOpens} – {store.thuSunCloses}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-ink-muted">
                    {t(visitCopy.hoursHint)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-kraft-deep bg-white p-6 shadow-xs sm:p-7">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="w-full">
                  <h2 className="font-display text-lg font-bold text-ink">
                    {pick("联系电话与在线点餐", "Phone & Ordering")}
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    {pick(
                      "欢迎致电咨询菜品或提前预约到店自取：",
                      "Ring the shop for questions or to order for collection:"
                    )}
                  </p>
                  <a
                    href={phoneHref}
                    className="mt-2 inline-block font-display text-xl font-bold text-cinnabar hover:text-cinnabar-dark"
                  >
                    {store.phoneDisplay}
                  </a>

                  {store.orderOnlineUrl && (
                    <div className="mt-4 space-y-2.5 border-t border-kraft-deep/60 pt-4">
                      <a
                        href={store.orderOnlineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-cinnabar"
                      >
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                        {pick(
                          `前往${store.orderProviderZh}在线点餐`,
                          `Order Online via ${store.orderProviderEn}`
                        )}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  )}

                  {messagingLinks.length > 0 && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-kraft-deep/80 bg-parchment p-3 text-xs text-ink-muted">
                      <MessageCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-cinnabar"
                        aria-hidden="true"
                      />
                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                        {pick("也可以通过这些平台给我们留言：", "Message us on")}
                        {messagingLinks.map((link) => (
                          <a
                            key={link.platform}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline underline-offset-2 hover:text-cinnabar"
                          >
                            {t(link.label)} ({link.handle})
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-6 lg:col-span-7">
            {visitCopy.storefrontPhoto && (
              <figure className="relative overflow-hidden rounded-3xl border border-kraft-deep bg-kraft shadow-sm">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={visitCopy.storefrontPhoto}
                    alt={t(visitCopy.storefrontCaption)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent px-5 pt-10 pb-3.5 text-xs font-medium text-parchment sm:text-sm">
                    {t(visitCopy.storefrontCaption)}
                  </figcaption>
                </div>
              </figure>
            )}

            <div className="overflow-hidden rounded-3xl border border-kraft-deep bg-kraft shadow-sm">
              {mapReady ? (
                <iframe
                  title={pick(
                    `煎饼刘地图位置：${store.street}, ${store.postalCode}`,
                    `Map showing ${store.nameEn} at ${store.street}, ${store.postalCode}`
                  )}
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[380px] w-full border-0 sm:h-[440px]"
                />
              ) : (
                <div className="flex h-[380px] w-full items-center justify-center text-sm text-ink-muted sm:h-[440px]">
                  {pick("正在加载卡姆登路地图…", "Loading Camden Road map…")}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-kraft-deep bg-kraft/50 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">
                {pick("取餐与配送方式", "Service Information")}
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                {pick(
                  "煎饼刘现点现做，仅支持到店外带自取与无接触配送，暂不提供堂食座位。",
                  "Everything is cooked fresh to order for takeaway and no-contact delivery (no dine-in seating)."
                )}
              </p>

              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                <li className="flex items-center gap-2.5 rounded-2xl border border-jade/25 bg-white px-4 py-3 text-sm font-semibold text-ink">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-jade"
                    aria-hidden="true"
                  />
                  {pick("支持到店自取", "Takeaway")}
                </li>
                <li className="flex items-center gap-2.5 rounded-2xl border border-jade/25 bg-white px-4 py-3 text-sm font-semibold text-ink">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-jade"
                    aria-hidden="true"
                  />
                  {pick("无接触配送", "No-contact delivery")}
                </li>
                <li className="flex items-center gap-2.5 rounded-2xl border border-kraft-deep bg-white/70 px-4 py-3 text-sm font-semibold text-ink-muted">
                  <XCircle
                    className="h-5 w-5 shrink-0 text-cinnabar/80"
                    aria-hidden="true"
                  />
                  {pick("不提供堂食", "No dine-in")}
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-kraft-deep/80 pt-5 text-sm">
                <span className="text-ink-muted">
                  {pick("人均参考消费：", "Typical spend: ")}
                  <strong className="font-semibold text-ink">
                    {isZh
                      ? restaurant.priceRange
                      : `${restaurant.priceRange} per person`}
                  </strong>
                </span>
                <Link
                  href="/menu"
                  className="font-semibold text-cinnabar underline underline-offset-4 hover:text-cinnabar-dark"
                >
                  {pick("查看完整菜单与价格 →", "See full menu & prices →")}
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-kraft-deep bg-white p-6 shadow-xs sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-ink">
                  {pick("关注我们的官方社交媒体", "Follow Us")}
                </h2>
                <ShareSpotButton variant="light" />
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {pick(
                  "查看最新出餐短视频、当季新品与卡姆登门店日常：",
                  "Daily clips from the griddle, seasonal sweet crepes, and news from Camden Road:"
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {socialLinks
                  .filter((item) => item.platform !== "google-maps")
                  .map((social) => (
                    <a
                      key={social.platform}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-kraft-deep bg-kraft/40 px-4 py-2 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-cinnabar hover:bg-cinnabar hover:text-parchment"
                    >
                      <SocialIcon platform={social.platform} className="h-4 w-4" />
                      <span>{t(social.label)}</span>
                      <span className="text-xs opacity-75">{social.handle}</span>
                      <ExternalLink
                        className="h-3 w-3 opacity-70"
                        aria-hidden="true"
                      />
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
