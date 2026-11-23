"use client";

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
import { SocialIcon } from "@/components/SocialIcon";
import { restaurant } from "@/data/restaurant";
import { useLocale } from "@/lib/i18n";

export function VisitView() {
  const { locale, t } = useLocale();
  const isZh = locale === "zh";
  const mapEmbedUrl = `https://maps.google.com/maps?q=${restaurant.links.googleMapsEmbedQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="pb-20">
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
              <span>{isZh ? "位置与联系" : "Visit & Contact"}</span>
              <span aria-hidden="true" className="text-kraft-deep">
                ·
              </span>
              <span
                lang="zh-Hans"
                className="font-calligraphy text-lg font-normal tracking-normal text-ink"
              >
                来店指南
              </span>
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {isZh ? "在伦敦卡姆登路找到我们" : "Find us on Camden Road"}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
              {isZh
                ? "欢迎直接到店外带热乎现摊煎饼，也支持卡姆登及周边伦敦区域无接触配送。"
                : "Drop by for freshly griddled takeaway or order no-contact delivery across Camden and surrounding North London neighbourhoods."}
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
                    {isZh ? "门店地址" : "Address"}
                  </h2>
                  <address className="mt-1.5 not-italic text-sm leading-relaxed text-ink-muted">
                    {isZh ? (
                      <>
                        {restaurant.chineseName}（{restaurant.sealText}）
                        <br />
                        {restaurant.address.chineseLine}
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
                    {isZh ? "谷歌地图路线导航" : "Get Directions"}
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
                    {isZh ? "营业时间" : "Opening Hours"}
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
                    {isZh
                      ? "节假日营业时间可能略有调整，如临近打烊前来店，建议提前致电确认。"
                      : "Hours may occasionally vary on public holidays — call ahead if visiting close to closing time."}
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
                    {isZh ? "联系电话与在线点餐" : "Phone & Ordering"}
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    {isZh
                      ? "欢迎致电咨询菜品或提前预约到店自取："
                      : "Call the kitchen directly for enquiries or pickup orders:"}
                  </p>
                  <a
                    href={restaurant.phone.href}
                    className="mt-2 inline-block font-display text-xl font-bold text-cinnabar hover:text-cinnabar-dark"
                  >
                    {restaurant.phone.display}
                  </a>

                  {restaurant.links.orderOnline && (
                    <div className="mt-4 border-t border-kraft-deep/60 pt-4">
                      <a
                        href={restaurant.links.orderOnline}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-cinnabar"
                      >
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                        {isZh
                          ? `前往 ${restaurant.links.orderOnlineProvider} 在线点餐`
                          : `Order Online via ${restaurant.links.orderOnlineProvider}`}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
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
                          也可以在{" "}
                          <a
                            href="https://www.instagram.com/jian_bing_liu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline underline-offset-2 hover:text-cinnabar"
                          >
                            Instagram (@jian_bing_liu)
                          </a>{" "}
                          或{" "}
                          <a
                            href="https://www.tiktok.com/@jianbingliu.uk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-ink underline underline-offset-2 hover:text-cinnabar"
                          >
                            TikTok (@jianbingliu.uk)
                          </a>{" "}
                          给我们留言咨询。
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
              <iframe
                title={
                  isZh
                    ? "煎饼刘地图位置：124 Camden Rd, London NW1 9EE"
                    : "Map showing Jian Bing Liu at 124 Camden Rd, London NW1 9EE"
                }
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[380px] w-full border-0 sm:h-[440px]"
              />
            </div>

            <div className="rounded-3xl border border-kraft-deep bg-kraft/50 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">
                {isZh ? "用餐与配送方式" : "Service Information"}
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                {isZh
                  ? "煎饼刘专注中式街头小吃外带与外卖配送，现点现做，不设堂食座位。"
                  : "Jian Bing Liu operates as a dedicated Chinese street-food takeaway and delivery counter."}
              </p>

              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                <li className="flex items-center gap-2.5 rounded-2xl border border-jade/25 bg-white px-4 py-3 text-sm font-semibold text-ink">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-jade"
                    aria-hidden="true"
                  />
                  {isZh ? "支持到店自取" : "Takeaway"}
                </li>
                <li className="flex items-center gap-2.5 rounded-2xl border border-jade/25 bg-white px-4 py-3 text-sm font-semibold text-ink">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-jade"
                    aria-hidden="true"
                  />
                  {isZh ? "无接触配送" : "No-contact delivery"}
                </li>
                <li className="flex items-center gap-2.5 rounded-2xl border border-kraft-deep bg-white/70 px-4 py-3 text-sm font-medium text-ink-muted">
                  <XCircle
                    className="h-5 w-5 shrink-0 text-cinnabar/70"
                    aria-hidden="true"
                  />
                  {isZh ? "暂不提供堂食" : "No dine-in seating"}
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-kraft-deep/80 pt-5 text-sm">
                <span className="text-ink-muted">
                  {isZh ? "人均参考消费：" : "Typical spend: "}
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
                  {isZh
                    ? "查看完整菜单与价格 →"
                    : "Browse verified menu & prices →"}
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-kraft-deep bg-white p-6 shadow-xs sm:p-7">
              <h2 className="font-display text-lg font-bold text-ink">
                {isZh ? "关注我们的官方社交媒体" : "Follow Us on Social Media"}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {isZh
                  ? "查看最新出餐短视频、当季新品与卡姆登门店日常："
                  : "See fresh griddle clips, seasonal sweet crepes, and daily Camden kitchen updates:"}
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
