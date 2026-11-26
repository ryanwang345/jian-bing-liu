"use client";

import Link from "next/link";
import { Clock, ExternalLink, Lock, MapPin, Phone, ShoppingBag } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { phoneToTelHref, useSiteContent } from "@/components/SiteContentProvider";
import { SocialIcon } from "@/components/SocialIcon";
import { useSocialLinks } from "@/components/SocialLinksProvider";
import { useLocale, type LocalizedText } from "@/lib/i18n";

const quickLinks: Array<{ href: string; label: LocalizedText }> = [
  { href: "/", label: { en: "Home", zh: "首页" } },
  { href: "/menu", label: { en: "Menu", zh: "招牌菜单" } },
  { href: "/our-story", label: { en: "Our Story", zh: "品牌故事" } },
  { href: "/gallery", label: { en: "Gallery", zh: "实拍图集" } },
  { href: "/visit-us", label: { en: "Visit Us", zh: "到店导航" } },
];

export function Footer() {
  const { isZh, t, zhText, pick } = useLocale();
  const { store } = useSiteContent();
  const socialLinks = useSocialLinks();
  const instagram = socialLinks.find((link) => link.platform === "instagram");
  const phoneHref = phoneToTelHref(store.phoneDisplay);

  return (
    <footer className="gradient-light-edge relative z-10 border-t border-parchment/12 bg-surface-dark pb-28 text-parchment/90 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <Link
              href="/"
              className="inline-block rounded-lg"
              aria-label={pick(
                `${store.nameZh} — 返回首页`,
                `${store.nameEn} — Home`
              )}
            >
              <BrandMark variant="light" size="md" />
            </Link>
            <p className="text-sm leading-relaxed text-parchment/75">
              {t(store.footerIntro)}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
              {instagram && (
                <span className="rounded-full border border-accent-bright/35 bg-accent-bright/12 px-3 py-1 text-accent-bright">
                  {instagram.handle}
                </span>
              )}
              <span className="rounded-full border border-parchment/20 bg-parchment/10 px-3 py-1 text-parchment/90">
                {pick("支持到店自取", "Takeaway")}
              </span>
              <span className="rounded-full border border-parchment/20 bg-parchment/10 px-3 py-1 text-parchment/90">
                {pick("无接触配送", "No-contact delivery")}
              </span>
              <span className="rounded-full border border-parchment/15 bg-transparent px-3 py-1 text-parchment/60">
                {pick("不提供堂食", "No dine-in")}
              </span>
            </div>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-accent-bright">
              {pick("快速导航", "Explore")}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-parchment/80 transition-colors hover:text-accent-bright"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
              {store.orderOnlineUrl && (
                <li>
                  <a
                    href={store.orderOnlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-accent-bright transition-colors hover:text-white"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick(
                      `在线点餐（${store.orderProviderZh}）`,
                      `Order Online (${store.orderProviderEn})`
                    )}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-accent-bright">
              {pick("门店信息", "Visit & Contact")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-parchment/80">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright"
                  aria-hidden="true"
                />
                <a
                  href={store.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent-bright"
                >
                  {isZh ? (
                    <>
                      {zhText(store.addressZh)}
                      <br />
                      {store.street}, {store.locality} {store.postalCode}
                    </>
                  ) : (
                    <>
                      {store.street}
                      <br />
                      {store.locality} {store.postalCode}
                      <br />
                      United Kingdom
                    </>
                  )}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  className="h-4 w-4 shrink-0 text-accent-bright"
                  aria-hidden="true"
                />
                <a
                  href={phoneHref}
                  className="transition-colors hover:text-accent-bright"
                >
                  {store.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright"
                  aria-hidden="true"
                />
                <span>
                  {pick(store.hoursSummaryZh, store.hoursSummaryEn)}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-accent-bright">
              {pick("关注我们", "Follow Us")}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {socialLinks.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-parchment/85 transition-colors hover:text-accent-bright"
                  >
                    <SocialIcon
                      platform={social.platform}
                      className="h-4 w-4 shrink-0 text-accent-bright"
                    />
                    <span>{t(social.label)}</span>
                    <span className="text-xs text-parchment/55 group-hover:text-accent-bright/80">
                      {social.handle}
                    </span>
                    <ExternalLink
                      className="h-3 w-3 opacity-60"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-parchment/15 pt-6 text-xs text-parchment/60 sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {pick(
              `${store.nameZh}（${store.sealText}）`,
              `${store.nameEn} (${store.nameZh} · ${store.sealText})`
            )}
            {" · "}
            {store.street}, {store.postalCode}
            <span aria-hidden="true" className="text-parchment/25">
              {" · "}
            </span>
            <Link
              href="/admin"
              rel="nofollow"
              className="inline-flex items-center gap-1 rounded py-1 text-parchment/35 transition-colors hover:text-parchment/80 focus-visible:text-parchment/80"
            >
              <Lock className="h-3 w-3" aria-hidden="true" />
              {pick("店主登录", "Staff Login")}
            </Link>
          </p>
          <p>{t(store.footerNote)}</p>
        </div>
      </div>
    </footer>
  );
}
