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
    image: "/images/veggie-crepe-griddle.webp",
    alt: {
      en: "Naturally coloured fruit-and-vegetable batter crepe cooking on a hot round griddle",
      zh: "热铁板上天然红心火龙果与菠菜调色的果蔬煎饼",
    },
    glow: "radial-gradient(ellipse at 25% 30%, rgba(214, 58, 92, 0.24), transparent 62%)",
    href: "/menu",
    cta: { en: "Explore Savoury Crepes", zh: "查看招牌咸煎饼" },
  },
  {
    id: "the-crunch",
    number: "02",
    tabLabel: { en: "Halal & Crunch", zh: "清真与脆料" },
    eyebrow: { en: "Halal, Veggie & Vegan", zh: "清真牛鸡 · 素食皆全" },
    title: {
      en: "Cracked egg, house chilli oil, and proper crunch.",
      zh: "双蛋刷秘制酱，一口咬出薄脆咔嚓声",
    },
    description: {
      en: "Homemade savoury sauce, crispy fried onions, fresh greens, and your choice of Halal beef, Halal chicken, or plant-based fillings folded together while piping hot.",
      zh: "自家慢熬咸香酱与秘制辣椒油，铺满酥脆薄脆、炸洋葱与鲜绿时蔬，清真牛肉、鸡肉与素食口味现点现摊。",
    },
    metricValue: { en: "From £6.50", zh: "£6.50 起" },
    metricLabel: { en: "Halal lunch crepes · £10 full size", zh: "午市清真煎饼 · 经典大份 £10" },
    image: "/images/folded-rainbow-crepe.webp",
    alt: {
      en: "Colourful Jian Bing crepe layered with herbs and folded warm on the griddle",
      zh: "热铁板上铺满鲜蔬与秘制酱、正在折叠的果蔬煎饼",
    },
    glow: "radial-gradient(ellipse at 30% 35%, rgba(201, 134, 31, 0.24), transparent 62%)",
    href: "/menu?diet=halal",
    cta: { en: "Browse Halal Menu", zh: "一键看清真菜单" },
  },
  {
    id: "hand-piped-lace",
    number: "03",
    tabLabel: { en: "Lace Sweet Cones", zh: "手工蕾丝甜筒" },
    eyebrow: { en: "Hand-Piped Dessert", zh: "铁板手挤花边" },
    title: {
      en: "Delicate pink lace, piped by hand on hot iron.",
      zh: "滚烫铁板上，一笔一画挤出粉色蕾丝",
    },
    description: {
      en: "Crisp lattice edges rolled into a cone and packed with whipped cream, fresh strawberries, banana, and Nutella — made right in front of you.",
      zh: "铁板上现挤花式粉色脆边卷成甜筒，装满绵密奶油、鲜切草莓香蕉或拉丝榛子巧克力酱，好看又解馋。",
    },
    metricValue: { en: "From £4", zh: "£4 起" },
    metricLabel: { en: "Hand-piped lace & Nutella crepes", zh: "手工蕾丝甜筒与榛子巧克力甜饼" },
    image: "/images/fancy-lace-dessert-cone.webp",
    alt: {
      en: "Hand-piped pink lace dessert crepe cone with cream and fresh fruit",
      zh: "手工粉色蕾丝边甜筒煎饼，装满奶油与新鲜水果",
    },
    glow: "radial-gradient(ellipse at 30% 45%, rgba(232, 114, 152, 0.24), transparent 62%)",
    href: "/menu#sweet-crepes-and-desserts",
    cta: { en: "See Sweet Crepes", zh: "看花式甜煎饼" },
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
    image: "/images/hero-jianbing-platter.webp",
    alt: {
      en: "Freshly sliced Jian Bing beside the branded kraft paper sleeve",
      zh: "刚出锅对半切开的招牌果蔬煎饼与牛皮纸袋",
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
  const activeIdxRef = useRef(0);
  const pillFillRef = useRef<HTMLSpanElement>(null);
  const photoZoomRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const total = highlights.length;
  const current = highlights[activeIndex] ?? highlights[0];

  // Scroll-scrubbed playback loop (pure rAF + direct DOM refs for 60/120fps)
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
      className="relative border-y border-kraft-deep/80 bg-ink text-parchment motion-reduce:h-auto lg:h-[250vh]"
    >
      {/* Natural swipeable flow on iPhone & iPad portrait; sticky single-screen scrub on lg+ (iPad landscape & Desktop) */}
      <div className="relative flex items-center overflow-x-clip motion-reduce:static motion-reduce:min-h-0 lg:sticky lg:top-[72px] lg:min-h-[calc(100svh-72px)]">
        {/* Subtle ambient glow that shifts with active slide */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{ backgroundImage: current.glow }}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-6 xl:py-10">
          {/* Top Row: Heading + 4 Instant Step Tabs */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end lg:gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#F0C26E] uppercase">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{pick("滑动浏览后厨亮点", "Scroll to Explore")}</span>
                <span aria-hidden="true" className="text-parchment/30">
                  ·
                </span>
                <span
                  lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                  className="font-calligraphy text-lg font-normal tracking-normal text-parchment/90 normal-case"
                >
                  {zhText("匠心工艺")}
                </span>
              </p>
              <h2 className="mt-1.5 font-display text-2xl leading-[1.15] font-medium tracking-[-0.025em] text-parchment sm:text-4xl">
                {pick(
                  "一口铁板，四件让人排队的理由。",
                  "One cast-iron griddle. Four reasons people queue."
                )}
              </h2>
            </div>

            {/* Always-Readable Pill Tabs */}
            <div
              role="tablist"
              aria-label={pick("选择查看亮点", "Choose a highlight")}
              className="flex flex-wrap gap-1.5 sm:gap-2"
            >
              {highlights.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => jumpToIndex(idx)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 sm:px-3.5 sm:py-2 ${
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
            className="mt-5 overflow-hidden rounded-[24px] border border-parchment/15 bg-white/[0.04] shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xs sm:mt-7 sm:rounded-[28px]"
          >
            <div className="grid items-stretch lg:grid-cols-12">
              {/* Full-Bleed Visual Stage with Live Scroll-Scrubbed Zoom */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/50 lg:col-span-7 lg:aspect-auto lg:min-h-[360px] xl:min-h-[420px]">
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
                <span className="absolute top-3.5 left-3.5 z-10 rounded-full border border-white/15 bg-ink/70 px-3 py-1 font-sans text-xs font-semibold tabular-nums text-parchment/90 backdrop-blur-md">
                  {current.number} / 0{total}
                </span>
              </div>

              {/* Crisp Editorial Content Column */}
              <div className="flex flex-col justify-between p-5 sm:p-8 lg:col-span-5 lg:p-7 xl:p-10">
                <div key={current.id} className="animate-fade-up">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#F0C26E] uppercase">
                    {t(current.eyebrow)}
                  </p>

                  <h3 className="mt-2 font-display text-xl leading-snug font-medium text-parchment sm:mt-3 sm:text-[1.85rem]">
                    {t(current.title)}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-parchment/80 sm:mt-4 sm:text-[15px]">
                    {t(current.description)}
                  </p>

                  {/* Key Stat Callout */}
                  <div className="mt-4 rounded-2xl border border-parchment/12 bg-white/[0.05] px-4 py-3 sm:mt-6 sm:py-3.5">
                    <p className="font-display text-lg font-semibold tabular-nums text-[#F0C26E] sm:text-xl">
                      {t(current.metricValue)}
                    </p>
                    <p className="mt-0.5 text-xs text-parchment/70">
                      {t(current.metricLabel)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-parchment/12 pt-4 sm:mt-7 sm:pt-5">
                  <Link
                    href={current.href}
                    className="inline-flex items-center gap-2 rounded-full bg-parchment px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F0C26E]"
                  >
                    {t(current.cta)}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>

                  {/* Quick Prev / Next Arrows */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label={pick("上一条亮点", "Previous highlight")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-parchment/20 bg-white/[0.06] text-parchment transition-colors hover:border-[#F0C26E] hover:bg-white/[0.14] hover:text-[#F0C26E] sm:h-10 sm:w-10"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label={pick("下一条亮点", "Next highlight")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-parchment/20 bg-white/[0.06] text-parchment transition-colors hover:border-[#F0C26E] hover:bg-white/[0.14] hover:text-[#F0C26E] sm:h-10 sm:w-10"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll-Scrubbed Capsule Progress Dock */}
          <div className="mt-4 flex items-center justify-center gap-3 sm:mt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-parchment/15 bg-white/[0.07] px-4 py-2 backdrop-blur-md">
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
                        ? "w-12 bg-parchment/25"
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

            <span className="hidden items-center gap-1 text-xs font-medium text-parchment/55 sm:inline-flex">
              <ArrowDown className="h-3.5 w-3.5 animate-bounce" aria-hidden="true" />
              {pick("继续向下滑动切换", "Scroll to play")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
