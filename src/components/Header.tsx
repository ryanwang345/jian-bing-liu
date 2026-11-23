"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Globe, MapPin, Menu, Phone, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { restaurant } from "@/data/restaurant";
import { useLocale, type LocalizedText } from "@/lib/i18n";

const navItems: Array<{ href: string; label: LocalizedText }> = [
  { href: "/", label: { en: "Home", zh: "首页" } },
  { href: "/menu", label: { en: "Menu", zh: "精选菜单" } },
  { href: "/our-story", label: { en: "Our Story", zh: "品牌故事" } },
  { href: "/gallery", label: { en: "Gallery", zh: "美食图集" } },
  { href: "/visit-us", label: { en: "Visit Us", zh: "来店指南" } },
];

function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label={locale === "zh" ? "切换语言" : "Switch language"}
      className="inline-flex items-center rounded-full border border-kraft-deep bg-kraft/60 p-0.5 text-xs font-semibold"
    >
      <Globe
        className="mx-1.5 hidden h-3.5 w-3.5 text-ink-muted sm:block"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "en"
            ? "bg-ink text-parchment shadow-2xs"
            : "text-ink-soft hover:text-ink"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        aria-pressed={locale === "zh"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          locale === "zh"
            ? "bg-ink text-parchment shadow-2xs"
            : "text-ink-soft hover:text-ink"
        }`}
      >
        中文
      </button>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-kraft-deep/70 bg-parchment/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group rounded-lg py-0.5 transition-opacity hover:opacity-90"
          aria-label={
            locale === "zh"
              ? `${restaurant.chineseName}（${restaurant.sealText}）— 返回首页`
              : `${restaurant.name} — Home`
          }
        >
          <BrandMark size="md" variant="dark" />
        </Link>

        <nav
          aria-label={locale === "zh" ? "主导航" : "Primary navigation"}
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-kraft text-cinnabar"
                    : "text-ink-soft hover:bg-kraft/60 hover:text-ink"
                }`}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <LanguageToggle />
          {restaurant.links.orderOnline && (
            <a
              href={restaurant.links.orderOnline}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                locale === "zh"
                  ? `前往 ${restaurant.links.orderOnlineProvider} 在线点餐（新窗口打开）`
                  : `Order Online via ${restaurant.links.orderOnlineProvider} (opens in a new tab)`
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-cinnabar px-4 py-2 text-sm font-semibold text-parchment shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark hover:shadow-md"
            >
              {locale === "zh" ? "在线点餐" : "Order Online"}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Mobile language toggle + menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={
              mobileOpen
                ? locale === "zh"
                  ? "关闭导航菜单"
                  : "Close navigation menu"
                : locale === "zh"
                  ? "打开导航菜单"
                  : "Open navigation menu"
            }
            className="inline-flex items-center justify-center rounded-full border border-kraft-deep bg-kraft/70 p-2.5 text-ink transition-colors hover:bg-kraft"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-navigation-drawer"
          className="border-t border-kraft-deep bg-parchment px-4 pt-3 pb-6 shadow-lg md:hidden"
        >
          <nav
            aria-label={locale === "zh" ? "移动端导航" : "Mobile navigation"}
            className="flex flex-col gap-1"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-kraft text-cinnabar"
                      : "text-ink hover:bg-kraft/60"
                  }`}
                >
                  {t(item.label)}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 space-y-3 border-t border-kraft-deep/70 pt-4">
            {restaurant.links.orderOnline && (
              <a
                href={restaurant.links.orderOnline}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-cinnabar px-5 py-3 text-sm font-semibold text-parchment shadow-sm transition-colors hover:bg-cinnabar-dark"
              >
                {locale === "zh"
                  ? `前往 ${restaurant.links.orderOnlineProvider} 在线点餐`
                  : `Order Online via ${restaurant.links.orderOnlineProvider}`}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted">
              <a
                href={restaurant.phone.href}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-kraft-deep bg-kraft/50 px-3 py-2.5 font-medium text-ink"
              >
                <Phone className="h-3.5 w-3.5 text-cinnabar" aria-hidden="true" />
                {restaurant.phone.display}
              </a>
              <a
                href={restaurant.links.googleMapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-kraft-deep bg-kraft/50 px-3 py-2.5 font-medium text-ink"
              >
                <MapPin className="h-3.5 w-3.5 text-cinnabar" aria-hidden="true" />
                {locale === "zh" ? "路线导航" : "Directions"}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
