"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";
import { restaurant } from "@/data/restaurant";
import { useLocale } from "@/lib/i18n";

export function VisitView() {
  const { isZh, isTraditional, t, zhText, pick } = useLocale();
  const [mapReady, setMapReady] = useState(false);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${restaurant.links.googleMapsEmbedQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  useEffect(() => {
    const id = window.setTimeout(() => setMapReady(true), 150);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="pb-20">
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
              <span>{pick("位置与联系", "Visit & Contact")}</span>
              <span aria-hidden="true" className="text-kraft-deep">
                ·
              </span>
              <span
                lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                className="font-calligraphy text-lg font-normal tracking-normal text-ink"
              >
                {zhText("来店指南")}
              </span>
            </p>
            <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.025em] text-ink sm:text-5xl">
              {pick("在伦敦卡姆登路找到我们", "Find us on Camden Road")}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
              {pick(
                "欢迎到店堂食或外带热乎现摊煎饼，也支持卡姆登及周边伦敦区域无接触配送。",
                "Pop in for a seat, pick up a hot takeaway, or order no-contact delivery across Camden and nearby North London."
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
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
                        {zhText(restaurant.chineseName)}（
                        {zhText(restaurant.sealText)}）
                        <br />
                        {zhText(restaurant.address.chineseLine)}
                        <br />
                        {restaurant.address.street},{" "}
                        {restaurant.address.locality}{" "}
                        {restaurant.address.postalCode}
                      </>
                    ) : (
                      <>
                        {restaurant.name} (
                        <span lang="zh-Hans">{restaurant.chineseName}</span>)
                        <br />
                        {restaurant.address.street}
                        <br />
                        {restaurant.address.locality}{" "}
                        {restaurant.address.postalCode}
                        <br />
                        {restaurant.address.country}
                      </>
                    )}
                  </address>

                  <a
                    href={restaurant.links.googleMapsDirections}
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
                  <h2 className="font-display text-lg font-bold text-ink">
                    {pick("营业时间", "Opening Hours")}
                  </h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    {restaurant.openingHours.map((row) => (
                      <div
                        key={row.days.en}
                        className="flex items-center justify-between gap-4 border-b border-kraft-deep/60 pb-2 last:border-0 last:pb-0"
                      >
                        <dt className="font-medium text-ink-soft">
                          {t(row.days)}
                        </dt>
                        <dd className="font-semibold text-ink">
                          {t(row.hours)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-ink-muted">
                    {pick(
                      "节假日营业时间可能略有调整，如临近打烊前来店，建议提前致电确认。",
                      "Bank holiday hours can vary, so give us a quick ring if you're heading over late."
                    )}
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
                    href={restaurant.phone.href}
                    className="mt-2 inline-block font-display text-xl font-bold text-cinnabar hover:text-cinnabar-dark"
                  >
                    {restaurant.phone.display}
                  </a>

                  {restaurant.links.orderOnline && (
                    <div className="mt-4 space-y-2.5 border-t border-kraft-deep/60 pt-4">
                      <a
                        href={restaurant.links.orderOnline}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-cinnabar"
                      >
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                        {pick(
                          `前往 ${restaurant.links.orderOnlineProvider} 在线点餐`,
                          `Order Online via ${restaurant.links.orderOnlineProvider}`
                        )}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                      {restaurant.links.fantuanOrder && (
                        <a
                          href={restaurant.links.fantuanOrder}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-kraft-deep bg-kraft/50 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
                        >
                          <ShoppingBag className="h-4 w-4 text-cinnabar" aria-hidden="true" />
                          {pick("前往饭团外卖下单", "Order on Fantuan Delivery")}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-kraft-deep/80 bg-parchment p-3 text-xs text-ink-muted">
                    <MessageCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-cinnabar"
                      aria-hidden="true"
                    />
                    <span>
                      {isZh ? (
                        <>
                          {zhText("也可以在 ")}
                          <a
                            href="https://www.instagram.com/jian_bing_liu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline underline-offset-2 hover:text-cinnabar"
                          >
                            Instagram (@jian_bing_liu)
                          </a>{" "}
                          {zhText("或 ")}
                          <a
                            href="https://www.tiktok.com/@jianbingliu.uk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline underline-offset-2 hover:text-cinnabar"
                          >
                            TikTok (@jianbingliu.uk)
                          </a>{" "}
                          {zhText("给我们留言咨询。")}
                        </>
                      ) : (
                        <>
                          Prefer messaging? Reach us on{" "}
                          <a
                            href="https://www.instagram.com/jian_bing_liu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline underline-offset-2 hover:text-cinnabar"
                          >
                            Instagram (@jian_bing_liu)
                          </a>{" "}
                          or{" "}
                          <a
                            href="https://www.tiktok.com/@jianbingliu.uk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline underline-offset-2 hover:text-cinnabar"
                          >
                            TikTok (@jianbingliu.uk)
                          </a>
                          .
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-kraft-deep bg-kraft shadow-sm">
              {mapReady ? (
                <iframe
                  title={pick(
                    "煎饼刘地图位置：124 Camden Rd, London NW1 9EE",
                    "Map showing Jian Bing Liu at 124 Camden Rd, London NW1 9EE"
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
                {pick("用餐与配送方式", "Service Information")}
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                {pick(
                  "煎饼刘现点现做，欢迎到店堂食趁热享用，也支持到店外带与无接触配送。",
                  "Walk in for a seat, grab a takeaway on the go, or order no-contact delivery. Everything is cooked fresh to order."
                )}
              </p>

              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                <li className="flex items-center gap-2.5 rounded-2xl border border-jade/25 bg-white px-4 py-3 text-sm font-semibold text-ink">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-jade"
                    aria-hidden="true"
                  />
                  {pick("提供堂食", "Dine-in")}
                </li>
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
              <h2 className="font-display text-lg font-bold text-ink">
                {pick("关注我们的官方社交媒体", "Follow Us")}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {pick(
                  "查看最新出餐短视频、当季新品与卡姆登门店日常：",
                  "Daily clips from the griddle, seasonal sweet crepes, and news from Camden Road:"
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {restaurant.verifiedSocialLinks
                  .filter((item) => item.platform !== "google-maps")
                  .map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-kraft-deep bg-kraft/40 px-4 py-2 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-cinnabar hover:bg-cinnabar hover:text-parchment"
                    >
                      <SocialIcon platform={social.platform} className="h-4 w-4" />
                      <span>{t(social.label)}</span>
                      <span className="text-xs opacity-75">{social.handle}</span>
                      <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
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
