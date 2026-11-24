"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Globe, MapPin, Menu, Phone, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { restaurant } from "@/data/restaurant";
import { useLocale, type LocalizedText } from "@/lib/i18n";

const navItems: Array<{ href: string; label: LocalizedText }> = [
  { href: "/", label: { en: "Home", zh: "首页" } },
  { href: "/menu", label: { en: "Menu", zh: "招牌菜单" } },
  { href: "/our-story", label: { en: "Our Story", zh: "品牌故事" } },
  { href: "/gallery", label: { en: "Gallery", zh: "实拍图集" } },
  { href: "/visit-us", label: { en: "Visit Us", zh: "到店导航" } },
];

const localeOptions: Array<{
  code: "en" | "zh" | "zh-Hant";
  label: string;
  title: string;
}> = [
  { code: "en", label: "EN", title: "English" },
  { code: "zh", label: "简", title: "简体中文" },
  { code: "zh-Hant", label: "繁", title: "繁體中文" },
];

function LanguageToggle() {
  const { locale, setLocale, pick } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const [spinCount, setSpinCount] = useState(0);

  const activeIndex = Math.max(
    0,
    localeOptions.findIndex((o) => o.code === locale)
  );

  const measurePill = useCallback(() => {
    const track = trackRef.current;
    const activeBtn = btnRefs.current[activeIndex];
    if (!track || !activeBtn || activeBtn.offsetWidth === 0) {
      setPill(null);
      return;
    }
    setPill({
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
    });
  }, [activeIndex]);

  useEffect(() => {
    measurePill();
  }, [measurePill]);

  useEffect(() => {
    window.addEventListener("resize", measurePill);
    return () => window.removeEventListener("resize", measurePill);
  }, [measurePill]);

  const handleSelect = (code: "en" | "zh" | "zh-Hant") => {
    if (code !== locale) {
      setSpinCount((c) => c + 1);
      setLocale(code);
    }
  };

  return (
    <div
      role="group"
      aria-label={pick("切换语言", "Switch language")}
      className="inline-flex items-center rounded-full border border-kraft-deep/90 bg-kraft/65 p-0.5 text-xs font-semibold shadow-2xs"
    >
      <Globe
        className="mx-1.5 hidden h-3.5 w-3.5 text-ink-muted transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:block"
        style={{ transform: `rotate(${spinCount * 180}deg)` }}
        aria-hidden="true"
      />
      <div ref={trackRef} className="relative inline-flex items-center">
        {/* Sliding Dark-Ink Active Capsule */}
        {pill && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-full bg-ink shadow-xs transition-[transform,width] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${pill.width}px`,
              transform: `translate3d(${pill.left}px, 0, 0)`,
            }}
          />
        )}
        {localeOptions.map((opt, idx) => {
          const isSelected = locale === opt.code;
          return (
            <button
              key={opt.code}
              ref={(el) => {
                btnRefs.current[idx] = el;
              }}
              type="button"
              title={opt.title}
              onClick={() => handleSelect(opt.code)}
              aria-pressed={isSelected}
              className={`relative z-10 rounded-full px-2 py-1 transition-colors duration-250 sm:px-2.5 ${
                isSelected
                  ? pill
                    ? "text-parchment"
                    : "bg-ink text-parchment shadow-2xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { locale, t, pick } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [activePill, setActivePill] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [hoverPill, setHoverPill] = useState<{
    left: number;
    width: number;
    visible: boolean;
  }>({ left: 0, width: 0, visible: false });

  const activeNavIndex = navItems.findIndex((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  const measureActiveNav = useCallback(() => {
    const activeEl =
      activeNavIndex >= 0 ? linkRefs.current[activeNavIndex] : null;
    if (!activeEl || activeEl.offsetWidth === 0) {
      setActivePill(null);
      return;
    }
    setActivePill({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
    });
  }, [activeNavIndex]);

  // Re-measure active indicator whenever route OR language changes (text widths shift smoothly!)
  useEffect(() => {
    measureActiveNav();
  }, [measureActiveNav, locale]);

  useEffect(() => {
    const onResize = () => measureActiveNav();
    window.addEventListener("resize", onResize);
    // Re-measure once webfonts finish loading to keep pill centered accurately
    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready.then(measureActiveNav).catch(() => {});
    }
    return () => window.removeEventListener("resize", onResize);
  }, [measureActiveNav]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const handleTabHover = (idx: number) => {
    const el = linkRefs.current[idx];
    if (!el) return;
    setHoverPill({
      left: el.offsetLeft,
      width: el.offsetWidth,
      visible: true,
    });
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-parchment/92 backdrop-blur-md transition-[box-shadow,border-color,background-color] duration-300 ${
        scrolled
          ? "border-kraft-deep/90 bg-parchment/96 shadow-[0_6px_24px_rgba(26,22,20,0.06)]"
          : "border-kraft-deep/65"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
        <Link
          href="/"
          className="group shrink-0 rounded-lg py-0.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.015]"
          aria-label={pick(
            `${restaurant.chineseName}（${restaurant.sealText}）— 返回首页`,
            `${restaurant.name} — Home`
          )}
        >
          <BrandMark size="md" variant="dark" />
        </Link>

        {/* Desktop Nav (lg+ so iPad portrait never squeezes or wraps tabs) */}
        <nav
          ref={navRef}
          aria-label={pick("主导航", "Primary navigation")}
          onMouseLeave={() =>
            setHoverPill((prev) => ({ ...prev, visible: false }))
          }
          className="relative hidden items-center gap-0.5 rounded-full border border-kraft-deep/55 bg-white/55 p-1 backdrop-blur-xs lg:flex"
        >
          {/* Hover Ghost Capsule */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-kraft/55 transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              hoverPill.visible ? "opacity-100" : "opacity-0"
            }`}
            style={{
              width: `${hoverPill.width}px`,
              transform: `translate3d(${hoverPill.left}px, 0, 0)`,
            }}
          />

          {/* Sliding Active Tab Capsule + Vermilion Accent Dot */}
          {activePill && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-full border border-kraft-deep/80 bg-kraft shadow-2xs transition-[transform,width] duration-420 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: `${activePill.width}px`,
                transform: `translate3d(${activePill.left}px, 0, 0)`,
              }}
            >
              <span className="absolute bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-cinnabar" />
            </span>
          )}

          {navItems.map((item, idx) => {
            const isActive = idx === activeNavIndex;

            return (
              <Link
                key={item.href}
                ref={(el) => {
                  linkRefs.current[idx] = el;
                }}
                href={item.href}
                onMouseEnter={() => handleTabHover(idx)}
                aria-current={isActive ? "page" : undefined}
                className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-250 ${
                  isActive
                    ? activePill
                      ? "font-semibold text-cinnabar"
                      : "bg-kraft font-semibold text-cinnabar"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <LanguageToggle />
          {restaurant.links.orderOnline && (
            <a
              href={restaurant.links.orderOnline}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={pick(
                `前往${restaurant.links.orderOnlineProviderZh}在线点餐（新窗口打开）`,
                `Order Online via ${restaurant.links.orderOnlineProvider} (opens in a new tab)`
              )}
              className="sticker-shadow inline-flex items-center gap-1.5 rounded-full bg-cinnabar px-4 py-2 text-sm font-bold text-parchment transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-cinnabar-dark hover:shadow-md active:scale-[0.97]"
            >
              {pick("饭团点餐", "Order Online")}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Mobile & iPad Portrait: Language toggle + iPad Order button + Menu drawer trigger */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5 lg:hidden">
          <LanguageToggle />
          {restaurant.links.orderOnline && (
            <a
              href={restaurant.links.orderOnline}
              target="_blank"
              rel="noopener noreferrer"
              className="sticker-shadow hidden items-center gap-1.5 rounded-full bg-cinnabar px-3.5 py-1.5 text-xs font-bold text-parchment transition-all hover:bg-cinnabar-dark active:scale-[0.97] sm:inline-flex"
            >
              {pick("饭团点餐", "Order")}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={
              mobileOpen
                ? pick("关闭导航菜单", "Close navigation menu")
                : pick("打开导航菜单", "Open navigation menu")
            }
            className="inline-flex items-center justify-center rounded-full border border-kraft-deep bg-kraft/70 p-2 text-ink transition-transform duration-250 active:scale-95 hover:bg-kraft sm:p-2.5"
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
          className="animate-drawer-down border-t border-kraft-deep bg-parchment px-4 pt-3 pb-6 shadow-lg lg:hidden"
        >
          <nav
            aria-label={pick("移动端导航", "Mobile navigation")}
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
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-kraft font-semibold text-cinnabar"
                      : "text-ink hover:bg-kraft/60"
                  }`}
                >
                  <span>{t(item.label)}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-cinnabar"
                    />
                  )}
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
                {pick(
                  `前往${restaurant.links.orderOnlineProviderZh}在线点餐`,
                  `Order Online via ${restaurant.links.orderOnlineProvider}`
                )}
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
                {pick("路线导航", "Directions")}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
