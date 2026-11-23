"use client";

import Link from "next/link";
import { Clock, ExternalLink, MapPin, Phone, ShoppingBag } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { SocialIcon } from "@/components/SocialIcon";
import { restaurant } from "@/data/restaurant";
import { useLocale, type LocalizedText } from "@/lib/i18n";

const quickLinks: Array<{ href: string; label: LocalizedText }> = [
  { href: "/", label: { en: "Home", zh: "首页" } },
  { href: "/menu", label: { en: "Menu", zh: "精选菜单" } },
  { href: "/our-story", label: { en: "Our Story", zh: "品牌故事" } },
  { href: "/gallery", label: { en: "Gallery", zh: "美食图集" } },
  { href: "/visit-us", label: { en: "Visit Us", zh: "来店指南" } },
];

export function Footer() {
  const { locale, t } = useLocale();
  const isZh = locale === "zh";

  return (
    <footer className="border-t border-ink-soft bg-ink text-parchment/90">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <Link
              href="/"
              className="inline-block rounded-lg"
              aria-label={
                isZh
                  ? `${restaurant.chineseName} — 返回首页`
                  : `${restaurant.name} — Home`
              }
            >
              <BrandMark variant="light" size="md" />
            </Link>
            <p className="text-sm leading-relaxed text-parchment/75">
              {isZh
                ? "位于伦敦卡姆登的正宗中式街头小吃，坚持手工现摊果蔬咸味煎饼、花式蕾丝甜煎饼、酥脆煎饺与家常热菜。"
                : "Northern Chinese savoury Jian Bing, fruit-and-veg batters, pan-fried dumplings, and lacy sweet crepes on Camden Road."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium">
              <span className="rounded-full border border-parchment/20 bg-parchment/10 px-3 py-1 text-parchment/90">
                {isZh ? "提供堂食" : "Dine-in"}
              </span>
              <span className="rounded-full border border-parchment/20 bg-parchment/10 px-3 py-1 text-parchment/90">
                {isZh ? "支持到店自取" : "Takeaway"}
              </span>
              <span className="rounded-full border border-parchment/20 bg-parchment/10 px-3 py-1 text-parchment/90">
                {isZh ? "无接触配送" : "No-contact delivery"}
              </span>
            </div>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-[#F0C26E]">
              {isZh ? "快速导航" : "Explore"}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-parchment/80 transition-colors hover:text-[#F0C26E]"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
              {restaurant.links.orderOnline && (
                <li>
                  <a
                    href={restaurant.links.orderOnline}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[#F0C26E] transition-colors hover:text-white"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                    {isZh
                      ? `在线点餐（${restaurant.links.orderOnlineProvider}）`
                      : `Order Online (${restaurant.links.orderOnlineProvider})`}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-[#F0C26E]">
              {isZh ? "门店信息" : "Visit & Contact"}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-parchment/80">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#F0C26E]"
                  aria-hidden="true"
                />
                <span>
                  {isZh ? (
                    <>
                      {restaurant.address.chineseLine}
                      <br />
                      {restaurant.address.street}, {restaurant.address.locality}{" "}
                      {restaurant.address.postalCode}
                    </>
                  ) : (
                    <>
                      {restaurant.address.street}
                      <br />
                      {restaurant.address.locality}{" "}
                      {restaurant.address.postalCode}
                      <br />
                      {restaurant.address.country}
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  className="h-4 w-4 shrink-0 text-[#F0C26E]"
                  aria-hidden="true"
                />
                <a
                  href={restaurant.phone.href}
                  className="transition-colors hover:text-[#F0C26E]"
                >
                  {restaurant.phone.display}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#F0C26E]"
                  aria-hidden="true"
                />
                <span>{t(restaurant.openingHoursSummary)}</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-[#F0C26E]">
              {isZh ? "关注我们" : "Follow Us"}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {restaurant.verifiedSocialLinks.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-parchment/85 transition-colors hover:text-[#F0C26E]"
                  >
                    <SocialIcon
                      platform={social.platform}
                      className="h-4 w-4 shrink-0 text-[#F0C26E]"
                    />
                    <span>{t(social.label)}</span>
                    <span className="text-xs text-parchment/55 group-hover:text-[#F0C26E]/80">
                      {social.handle}
                    </span>
                    <ExternalLink
                      className="h-3 w-3 opacity-60"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
              {restaurant.links.orderOnline && (
                <li className="pt-1">
                  <a
                    href={restaurant.links.orderOnline}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-[#F0C26E] transition-colors hover:text-white"
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {isZh
                      ? `官方外卖菜单（${restaurant.links.orderOnlineProvider}）`
                      : `Order Online (${restaurant.links.orderOnlineProvider})`}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-parchment/15 pt-6 text-xs text-parchment/60 sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {isZh
              ? `${restaurant.chineseName}（${restaurant.sealText}）`
              : `${restaurant.name} (${restaurant.chineseName} · ${restaurant.sealText})`}
            {" · "}
            {restaurant.address.street}, {restaurant.address.postalCode}
          </p>
          <p>
            {isZh
              ? "堂食、外带与配送 · 菜品供应及价格以门店实际为准"
              : "Dine-in, takeaway & delivery · Prices & availability subject to in-store confirmation."}
          </p>
        </div>
      </div>
    </footer>
  );
}
