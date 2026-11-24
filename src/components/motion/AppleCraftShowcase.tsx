"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useLocale, type LocalizedText } from "@/lib/i18n";

interface CraftHighlight {
  id: string;
  number: string;
  tabLabel: LocalizedText;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  metricValue: LocalizedText;
  metricLabel: LocalizedText;
  image: string;
  alt: LocalizedText;
  glow: string;
  href: string;
  cta: LocalizedText;
}

const highlights: CraftHighlight[] = [
  {
    id: "natural-batter",
    number: "01",
    tabLabel: { en: "Natural Batters", zh: "鲜榨果蔬皮" },
    eyebrow: { en: "Zero Artificial Dye", zh: "鲜切现榨 · 零色素" },
    title: {
      en: "Real dragon fruit & beetroot, spun onto cast iron.",
      zh: "红心火龙果与甜菜根，现榨调色上铁板",
    },
    description: {
      en: "No bottled colouring. Every morning we blend fresh red dragon fruit, beetroot, and spinach straight into our batter for a delicate crisp edge and clean, natural aroma.",
      zh: "绝不用食用色素。后厨每天现切新鲜红心火龙果、甜菜根与菠菜榨汁和面，淋上滚烫圆铁板一转成圆，外圈焦脆、里头软韧。",
    },
    metricValue: { en: "0% Dye", zh: "0 食用色素" },
    metricLabel: { en: "Fresh fruit & veg blended daily", zh: "每日现切果蔬鲜榨调糊" },
    image: "/images/mrs-liu-rainbow-griddle.webp",
    alt: {
      en: "Mrs Liu in her Jian Bing Liu apron spreading naturally pink dragon-fruit and green spinach batter on the hot cast-iron griddle",
      zh: "刘阿姨在圆铁板上现摊红心火龙果粉与菠菜绿双色果蔬煎饼皮",
    },
    glow: "radial-gradient(ellipse at 25% 30%, rgba(214, 58, 92, 0.24), transparent 62%)",
    href: "/menu",
    cta: { en: "Explore Savoury Crepes", zh: "查看招牌咸煎饼" },
  },
  {
    id: "the-crunch",
    number: "02",
    tabLabel: { en: "Halal & Roast Duck", zh: "清真与烤鸭" },
    eyebrow: { en: "Halal, Roast Duck & Veggie", zh: "清真牛鸡 · 烤鸭 · 素食" },
    title: {
      en: "Cracked egg, house chilli oil, and proper crunch.",
      zh: "热锅磕蛋刷秘制酱，一口咬出薄脆咔嚓声",
    },
    description: {
      en: "Homemade savoury sauce, crispy fried shallots, fresh greens, and your choice of Roast Duck, Halal beef or chicken, Char Siu, Pork Hock, or Veggie Lover.",
      zh: "自家慢熬咸香酱与秘制辣椒油，铺满酥脆薄脆与鲜绿时蔬，招牌烤鸭、清真牛鸡、叉烧、猪酱肘子与素菜任选。",
    },
    metricValue: { en: "From £8", zh: "£8 起" },
    metricLabel: { en: "Medium £8–£9 · Regular £11–£12 · Meal Deals £12+", zh: "中份 £8–£9 · 标准份 £11–£12 · 优惠套餐 £12 起" },
    image: "/images/dragonfruit-pink-jianbing.webp",
    alt: {
      en: "Naturally pink dragon-fruit batter Jian Bing stacked generously with fresh greens and savoury fillings",
      zh: "热铁板上红心火龙果粉色果蔬皮煎饼的扎实切面",
    },
    glow: "radial-gradient(ellipse at 30% 35%, rgba(201, 134, 31, 0.24), transparent 62%)",
    href: "/menu?diet=halal",
    cta: { en: "Browse Halal Menu", zh: "一键看清真菜单" },
  },
  {
    id: "hand-piped-lace",
    number: "03",
    tabLabel: { en: "Crème Brûlée Crepes", zh: "布蕾可丽饼" },
    eyebrow: { en: "Sweet Crepes & Matcha", zh: "现烤布蕾 · 抹茶开心果" },
    title: {
      en: "Torched Crème Brûlée & Matcha Pistachio crepes.",
      zh: "现烤焦糖布蕾与抹茶开心果可丽饼",
    },
    description: {
      en: "Crackly caramelised mascarpone custard with fresh strawberries (£11), Matcha & Pistachio Fluff (£12), Cute Character cones (£10), or warm Chocolate Crepes (£5).",
      zh: "丝滑马斯卡彭焦糖布蕾配鲜草莓（£11）、抹茶开心果布蕾（£12）、小动物鲜果可丽饼（£10）及热乎巧克力可丽饼（£5）。",
    },
    metricValue: { en: "From £5", zh: "£5 起" },
    metricLabel: { en: "Chocolate £5 · Crème Brûlée £11 · Matcha £12", zh: "巧克力 £5 · 焦糖布蕾 £11 · 抹茶开心果 £12" },
    image: "/images/creme-brulee-crepe.webp",
    alt: {
      en: "Torched Crème Brûlée sweet crepe cone surrounded by fresh strawberries and chocolate wafer rolls",
      zh: "围满新鲜草莓与巧克力脆卷的现烤焦糖布蕾蛋糕可丽饼",
    },
    glow: "radial-gradient(ellipse at 30% 45%, rgba(232, 114, 152, 0.24), transparent 62%)",
    href: "/menu#sweet-crepes-and-desserts",
    cta: { en: "See Sweet Crepes", zh: "看花式可丽饼" },
  },
  {
    id: "camden-craft",
    number: "04",
    tabLabel: { en: "4.9★ Camden", zh: "4.9★ 好评口碑" },
    eyebrow: { en: "124 Camden Rd · NW1", zh: "伦敦卡姆登 · 现做外带" },
    title: {
      en: "Folded hot into our 爱民 sleeve, ready to go.",
      zh: "趁热装入「爱民」牛皮纸袋，一口暖到心",
    },
    description: {
      en: "Retired in China, started from zero in London — third time lucky. Loved by Camden locals, UCL & CSM students, and London foodies for takeaway and Fantuan delivery.",
      zh: "国内退休后赴英第三次归零创业，扎根卡姆登路收获众多回头客。现点现摊外带或饭团外卖直达，每一口都热乎实在。",
    },
    metricValue: { en: "4.9 ★", zh: "4.9 ★" },
    metricLabel: { en: "287 verified Google reviews", zh: "Google 287 条真实好评" },
    image: "/images/beef-jianbing-stack.webp",
    alt: {
      en: "Generously stacked savoury Jian Bing sliced beneath the Jian Bing Liu branded kraft sleeve",
      zh: "煎饼刘牛皮纸袋下对半切开的满馅招牌煎饼",
    },
    glow: "radial-gradient(ellipse at 25% 50%, rgba(184, 37, 28, 0.26), transparent 62%)",
    href: "/our-story",
    cta: { en: "Read Our Story", zh: "了解创业故事" },
  },
];

/**
 * Apple scroll-scrubbed sticky showcase.
 * Uses a compact sticky scroll runway so scrolling down/up continuously scrubs
 * through all 4 chapters (optical cross-fade, subtle zoom, real-time progress bar),
 * while also staying 100% interactive via tabs, arrows, keyboard, and touch swipe.
 */
export function AppleCraftShowcase() {
  const { isTraditional, t, zhText, pick } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const runwayRef = useRef<HTMLElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabBtnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIdxRef = useRef(0);
  const pillFillRef = useRef<HTMLSpanElement>(null);
  const photoZoomRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const total = highlights.length;
  const current = highlights[activeIndex] ?? highlights[0];

  // Keep the active pill tab centered inside the mobile horizontal strip without affecting vertical scroll
  useEffect(() => {
    const list = tabListRef.current;
    const btn = tabBtnRefs.current[activeIndex];
    if (!list || !btn || list.scrollWidth <= list.clientWidth) return;
    const targetLeft =
      btn.offsetLeft - (list.clientWidth - btn.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
  }, [activeIndex]);

  // Scroll-scrubbed playback loop across Desktop, iPad, and iPhone (pure rAF + direct DOM refs)
  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let rafId = 0;

    const updateFromScroll = () => {
      rafId = 0;
      const rect = runway.getBoundingClientRect();
      const scrollable = runway.offsetHeight - window.innerHeight;

      if (scrollable <= 20) return;

      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      const scaled = Math.min(total - 0.0001, progress * total);
      const nextIndex = Math.floor(scaled);
      const localProgress = scaled - nextIndex; // 0..1 within active chapter

      if (nextIndex !== activeIdxRef.current) {
        activeIdxRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }

      if (pillFillRef.current) {
        // Fill smoothly from 14% to 100% as user scrolls through this chapter
        const pct = Math.min(100, Math.max(14, localProgress * 100));
        pillFillRef.current.style.transform = `scaleX(${(pct / 100).toFixed(3)})`;
      }

      if (photoZoomRef.current) {
        // Subtle Apple optical zoom-out (1.05 -> 1.00) while scrubbing through the slide
        const scale = 1.05 - localProgress * 0.05;
        photoZoomRef.current.style.transform = `scale(${scale.toFixed(4)})`;
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateFromScroll);
      }
    };

    updateFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [total]);

  const jumpToIndex = useCallback(
    (index: number) => {
      const clamped = ((index % total) + total) % total;
      activeIdxRef.current = clamped;
      setActiveIndex(clamped);

      const runway = runwayRef.current;
      if (!runway) return;

      const scrollable = runway.offsetHeight - window.innerHeight;
      if (
        scrollable > 20 &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        const runwayTop = runway.getBoundingClientRect().top + window.scrollY;
        const targetY = runwayTop + ((clamped + 0.15) / total) * scrollable;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    },
    [total]
  );

  const goNext = useCallback(
    () => jumpToIndex(activeIdxRef.current + 1),
    [jumpToIndex]
  );
  const goPrev = useCallback(
    () => jumpToIndex(activeIdxRef.current - 1),
    [jumpToIndex]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;
    touchStartX.current = null;
    if (Math.abs(delta) > 42) {
      if (delta > 0) goNext();
      else goPrev();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
  };

  return (
    <section
      ref={runwayRef}
      aria-label={pick("铁板匠心亮点", "Crafted on the Griddle")}
      onKeyDown={handleKeyDown}
      className="gradient-light-edge relative h-[235svh] border-y border-kraft-deep/80 bg-ink text-parchment motion-reduce:h-auto lg:h-[250vh]"
    >
      {/* Compact sticky single-viewport stage across iPhone, iPad, and Desktop (clears MobileActionBar at bottom!) */}
      <div className="sticky top-[57px] flex min-h-[calc(100svh-57px)] items-center overflow-x-clip pb-[74px] motion-reduce:static motion-reduce:min-h-0 sm:top-[72px] sm:min-h-[calc(100svh-72px)] md:pb-6">
        {/* Subtle ambient glow that shifts with active slide */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{ backgroundImage: current.glow }}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-6 xl:py-10">
          {/* Top Row: Heading + 4 Instant Step Tabs */}
          <div className="flex flex-col justify-between gap-2.5 sm:gap-4 lg:flex-row lg:items-end lg:gap-6">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[#F0C26E] uppercase sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{pick("滑动浏览后厨亮点", "Scroll to Explore")}</span>
                <span aria-hidden="true" className="text-parchment/30">
                  ·
                </span>
                <span
                  lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                  className="font-calligraphy text-base font-normal tracking-normal text-parchment/90 normal-case sm:text-lg"
                >
                  {zhText("匠心工艺")}
                </span>
              </p>
              <h2 className="mt-1 font-display text-xl leading-[1.16] font-medium tracking-[-0.025em] text-parchment sm:mt-1.5 sm:text-3xl lg:text-4xl">
                {pick(
                  "一口铁板，四件让人排队的理由。",
                  "One cast-iron griddle. Four reasons people queue."
                )}
              </h2>
            </div>

            {/* Single-row horizontal strip on mobile so tabs never crowd out the photo; wraps nicely on sm+ */}
            <div
              ref={tabListRef}
              role="tablist"
              aria-label={pick("选择查看亮点", "Choose a highlight")}
              className="no-scrollbar flex w-full max-w-full flex-nowrap gap-1.5 overflow-x-auto pb-0.5 sm:w-auto sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-0"
            >
              {highlights.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      tabBtnRefs.current[idx] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => jumpToIndex(idx)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 sm:px-3.5 sm:py-2 sm:text-xs ${
                      isActive
                        ? "bg-[#F0C26E] text-ink shadow-md"
                        : "border border-parchment/20 bg-white/[0.06] text-parchment/85 hover:border-parchment/40 hover:bg-white/[0.12] hover:text-parchment"
                    }`}
                  >
                    <span className="tabular-nums opacity-70">{item.number}</span>
                    <span>{t(item.tabLabel)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Single-Viewport Split Showcase Card */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="mt-3 overflow-hidden rounded-[22px] border border-parchment/15 bg-white/[0.04] shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xs sm:mt-6 sm:rounded-[28px]"
          >
            <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
              {/* Full-Bleed Visual Stage with Live Scroll-Scrubbed Zoom */}
              <div className="relative aspect-[16/9] w-full min-w-0 overflow-hidden bg-black/50 sm:aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[360px] xl:min-h-[420px]">
                <div
                  ref={photoZoomRef}
                  className="absolute inset-0 will-change-transform"
                >
                  {highlights.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <div
                        key={item.id}
                        aria-hidden={!isActive}
                        className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isActive
                            ? "opacity-100"
                            : "pointer-events-none opacity-0"
                        }`}
                      >
                        <Image
                          src={item.image}
                          alt={t(item.alt)}
                          fill
                          sizes="(max-width: 1024px) calc(100vw - 2rem), 58vw"
                          className="object-cover"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Minimal Corner Counter */}
                <span className="absolute top-3 left-3 z-10 rounded-full border border-white/15 bg-ink/70 px-2.5 py-0.5 font-sans text-[11px] font-semibold tabular-nums text-parchment/90 backdrop-blur-md sm:top-3.5 sm:left-3.5 sm:px-3 sm:py-1 sm:text-xs">
                  {current.number} / 0{total}
                </span>

                {/* Compact Mobile Stat Pill over bottom-right of image so mobile card stays crisp and fits 100% in viewport */}
                <span className="absolute right-3 bottom-3 z-10 rounded-full border border-[#F0C26E]/35 bg-ink/80 px-3 py-1 font-display text-xs font-semibold tabular-nums text-[#F0C26E] backdrop-blur-md sm:hidden">
                  {t(current.metricValue)}
                </span>
              </div>

              {/* Crisp Editorial Content Column */}
              <div className="flex min-w-0 flex-col justify-between p-4 sm:p-7 lg:col-span-5 lg:p-7 xl:p-10">
                <div key={current.id} className="animate-fade-up">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[#F0C26E] uppercase sm:text-xs">
                    {t(current.eyebrow)}
                  </p>

                  <h3 className="mt-1.5 font-display text-lg leading-snug font-medium text-parchment sm:mt-3 sm:text-[1.85rem]">
                    {t(current.title)}
                  </h3>

                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-parchment/80 sm:mt-4 sm:line-clamp-none sm:text-[15px]">
                    {t(current.description)}
                  </p>

                  {/* Full Key Stat Callout on sm+ (compact pill shown on photo for mobile) */}
                  <div className="mt-4 hidden rounded-2xl border border-parchment/12 bg-white/[0.05] px-4 py-3 sm:mt-6 sm:block sm:py-3.5">
                    <p className="font-display text-lg font-semibold tabular-nums text-[#F0C26E] sm:text-xl">
                      {t(current.metricValue)}
                    </p>
                    <p className="mt-0.5 text-xs text-parchment/70">
                      {t(current.metricLabel)}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 border-t border-parchment/12 pt-3 sm:mt-7 sm:gap-3 sm:pt-5">
                  <Link
                    href={current.href}
                    className="inline-flex items-center gap-2 rounded-full bg-parchment px-4 py-2 text-xs font-semibold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F0C26E] sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    {t(current.cta)}
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  </Link>

                  {/* Quick Prev / Next Arrows */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label={pick("上一条亮点", "Previous highlight")}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-parchment/20 bg-white/[0.06] text-parchment transition-colors hover:border-[#F0C26E] hover:bg-white/[0.14] hover:text-[#F0C26E] sm:h-10 sm:w-10"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label={pick("下一条亮点", "Next highlight")}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-parchment/20 bg-white/[0.06] text-parchment transition-colors hover:border-[#F0C26E] hover:bg-white/[0.14] hover:text-[#F0C26E] sm:h-10 sm:w-10"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll-Scrubbed Capsule Progress Dock (Visible on Mobile & Desktop!) */}
          <div className="mt-3 flex items-center justify-center gap-2.5 sm:mt-5 sm:gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-parchment/15 bg-white/[0.07] px-3.5 py-1.5 backdrop-blur-md sm:px-4 sm:py-2">
              {highlights.map((item, idx) => {
                const isActive = idx === activeIndex;
                const isPassed = idx < activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => jumpToIndex(idx)}
                    aria-label={`${item.number} ${t(item.tabLabel)}`}
                    aria-current={isActive ? "step" : undefined}
                    className={`relative h-2 overflow-hidden rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? "w-10 bg-parchment/25 sm:w-12"
                        : isPassed
                          ? "w-2.5 bg-[#F0C26E]/65 hover:bg-[#F0C26E]"
                          : "w-2 bg-parchment/35 hover:bg-parchment/65"
                    }`}
                  >
                    {isActive && (
                      <span
                        ref={pillFillRef}
                        className="block h-full w-full origin-left rounded-full bg-[#F0C26E] will-change-transform"
                        style={{ transform: "scaleX(0.2)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-parchment/60 sm:text-xs">
              <ArrowDown className="h-3 w-3 animate-bounce sm:h-3.5 sm:w-3.5" aria-hidden="true" />
              {pick("上下滑动切换", "Scroll to play")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
