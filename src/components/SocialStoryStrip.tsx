"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { useLocale, type LocalizedText } from "@/lib/i18n";

interface StoryHighlight {
  id: string;
  label: LocalizedText;
  tag: LocalizedText;
  headline: LocalizedText;
  caption: LocalizedText;
  hashtag: string;
  image: string;
  ctaLabel: LocalizedText;
  href: string;
  external?: boolean;
}

const storyHighlights: StoryHighlight[] = [
  {
    id: "dragonfruit",
    label: { en: "Fresh Batter", zh: "鲜榨果蔬皮" },
    tag: { en: "Never Food Dye", zh: "现切鲜榨 · 零色素" },
    headline: {
      en: "Real Red Dragon Fruit & Spinach Batters",
      zh: "红心火龙果与菠菜，每天现榨和面",
    },
    caption: {
      en: "Never artificial colouring — every morning Mrs Liu juices fresh red dragon fruit, beetroot and spinach straight into our batter for a naturally colourful, crisp-edged Jian Bing.",
      zh: "不用一滴食用色素。每天清晨刘阿姨在后厨现切红心火龙果、甜菜根和菠菜榨汁调糊，摊出来的煎饼皮带着自然清香，外圈微脆、里头软韧。",
    },
    hashtag: "124 Camden Rd · NW1",
    image: "/images/mrs-liu-rainbow-griddle.webp",
    ctaLabel: { en: "Explore Crepe Menu", zh: "查看果蔬煎饼菜单" },
    href: "/menu",
  },
  {
    id: "roast-duck",
    label: { en: "Roast Duck", zh: "招牌烤鸭" },
    tag: { en: "New · £12", zh: "新品热卖 · £12" },
    headline: {
      en: "Crisp Roast Duck & Halal Jian Bing",
      zh: "招牌脆皮烤鸭煎饼与清真牛鸡煎饼",
    },
    caption: {
      en: "Carved warm roast duck (£12), Halal Chicken (£8 Med / £11 Reg) and Halal Beef (£9 Med / £12 Reg) — or grab a Meal Deal with a drink from £12.",
      zh: "现切脆皮烤鸭煎饼 £12、清真鸡肉（中份 £8 / 标准 £11）、清真牛肉（中份 £9 / 标准 £12），搭配港式柠檬茶或豆浆套餐 £12 起。",
    },
    hashtag: "Medium from £8 · Meal Deals £12+",
    image: "/images/roast-duck-jianbing.webp",
    ctaLabel: { en: "See Savoury Jian Bing", zh: "看招牌咸味煎饼" },
    href: "/menu#savoury-crepes",
  },
  {
    id: "creme-brulee",
    label: { en: "Crème Brûlée", zh: "焦糖布蕾" },
    tag: { en: "Limited Edition · £11", zh: "人气限定 · £11" },
    headline: {
      en: "Torched Crème Brûlée & Mascarpone Crepe",
      zh: "现烤焦糖布蕾蛋糕可丽饼",
    },
    caption: {
      en: "Silky custard cream and mascarpone torched golden with fresh strawberries (£11), Cute Character Strawberry/Banana crepes (£10), or warm Chocolate Crepes (£5).",
      zh: "丝滑马斯卡彭奶油布蕾现烤焦糖脆壳配鲜草莓（£11），还有 £10 小动物鲜果可丽饼与 £5 热乎巧克力可丽饼。",
    },
    hashtag: "Sweet crepes from £5",
    image: "/images/creme-brulee-crepe.webp",
    ctaLabel: { en: "See Sweet Crepes", zh: "看花式可丽饼" },
    href: "/menu#sweet-crepes-and-desserts",
  },
  {
    id: "matcha-pistachio",
    label: { en: "Matcha Crepe", zh: "抹茶开心果" },
    tag: { en: "Matcha & Pistachio · £12", zh: "招牌甜口 · £12" },
    headline: {
      en: "Matcha & Pistachio Crème Brûlée Crepe",
      zh: "抹茶开心果布蕾蛋糕可丽饼",
    },
    caption: {
      en: "Fragrant green tea matcha crepe layered with creamy brûlée custard, nutty pistachio fluff and a generous dusting of matcha (£12).",
      zh: "茶香清苦回甘的抹茶饼皮，层层叠入绵密布蕾与香浓开心果奶油脆（£12），香醇不腻。",
    },
    hashtag: "Matcha · Pistachio · £12",
    image: "/images/matcha-pistachio-crepe.webp",
    ctaLabel: { en: "View Sweet Crepes", zh: "查看可丽饼菜单" },
    href: "/menu#sweet-crepes-and-desserts",
  },
  {
    id: "boba-drinks",
    label: { en: "HK Milk Tea", zh: "港式奶茶" },
    tag: { en: "Special Drinks · £6", zh: "特色手调饮品 · £6" },
    headline: {
      en: "Hong Kong Boba Milk Tea & Warm Soya Milk",
      zh: "港式奶茶撞珍珠（£6）与热豆奶 / 黑芝麻糊（£4）",
    },
    caption: {
      en: "Silky Hong Kong Boba Milk Tea (£6), Mango Pomelo Sago (£6), Pistachio Matcha Boba (£6), or cosy warm House Soya Milk & Toasted Black Sesame Paste (£4).",
      zh: "港式奶茶撞珍珠 £6、杨枝甘露 £6、开心抹茶珍珠奶茶 £6，还有暖手热豆奶与手磨黑芝麻糊 £4。",
    },
    hashtag: "Drinks from £2 · Specials £6",
    image: "/images/brulee-boba-milk-tea.webp",
    ctaLabel: { en: "Browse Drinks Menu", zh: "查看饮品菜单" },
    href: "/menu#drinks",
  },
  {
    id: "camden-shop",
    label: { en: "Camden Shop", zh: "卡姆登门店" },
    tag: { en: "124 Camden Rd · NW1", zh: "认准红旗门面" },
    headline: {
      en: "Pop In to Take Away or Order on Fantuan",
      zh: "卡姆登路 124 号现做带走 · 饭团外卖直达",
    },
    caption: {
      en: "Takeaway and no-contact delivery only (no dine-in). Look for our hanging red Jian Bing banner at 124 Camden Rd NW1 9EE, or order warm on Fantuan.",
      zh: "仅限到店外带与无接触配送（不提供堂食）。认准卡姆登路 124 号门口红底果蔬煎饼旗帜，或上饭团外卖直接下单。",
    },
    hashtag: "Takeaway & Delivery",
    image: "/images/storefront-camden.webp",
    ctaLabel: { en: "Order on Fantuan", zh: "去饭团外卖下单" },
    href: restaurant.links.orderOnline || "/menu",
    external: Boolean(restaurant.links.orderOnline),
  },
];

export function SocialStoryStrip() {
  const { t, pick } = useLocale();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => new Set());
  const [isPaused, setIsPaused] = useState(false);

  const openStory = useCallback((index: number) => {
    setActiveIndex(index);
    const id = storyHighlights[index]?.id;
    if (id) {
      setViewedIds((prev) => new Set(prev).add(id));
    }
  }, []);

  // Body scroll lock + keyboard navigation while Story Viewer is open
  useEffect(() => {
    if (activeIndex === null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      } else if (event.key === "ArrowRight") {
        if (activeIndex < storyHighlights.length - 1) {
          openStory(activeIndex + 1);
        } else {
          setActiveIndex(null);
        }
      } else if (event.key === "ArrowLeft") {
        openStory(Math.max(0, activeIndex - 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, openStory]);

  // Auto-advance active story every 5.5s unless paused by hover/hold
  useEffect(() => {
    if (activeIndex === null || isPaused) return;

    const timer = window.setTimeout(() => {
      if (activeIndex < storyHighlights.length - 1) {
        openStory(activeIndex + 1);
      } else {
        setActiveIndex(null);
      }
    }, 5500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeIndex, isPaused, openStory]);

  const activeStory =
    activeIndex !== null ? storyHighlights[activeIndex] : null;

  return (
    <>
      <div className="mt-6 w-full min-w-0">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-turmeric" aria-hidden="true" />
            <span className="truncate">
              {pick("点开看今日现做实拍", "Fresh From Our Kitchen")}
            </span>
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-cinnabar">
            @jian_bing_liu
          </span>
        </div>

        <div className="no-scrollbar flex w-full max-w-full items-center gap-3 overflow-x-auto pb-1">
          {storyHighlights.map((story, idx) => {
            const isViewed = viewedIds.has(story.id);
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => openStory(idx)}
                className="group flex shrink-0 flex-col items-center gap-1.5 text-center focus-visible:outline-none"
              >
                <span
                  className={`rounded-full p-[2.5px] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 ${
                    isViewed
                      ? "bg-kraft-deep"
                      : "story-ring shadow-[0_4px_12px_rgba(184,37,28,0.18)]"
                  }`}
                >
                  <span className="relative block h-14 w-14 overflow-hidden rounded-full border-2 border-parchment bg-kraft sm:h-[60px] sm:w-[60px]">
                    <Image
                      src={story.image}
                      alt={t(story.headline)}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </span>
                </span>
                <span className="max-w-[70px] truncate text-[11px] font-semibold text-ink-soft transition-colors group-hover:text-cinnabar">
                  {t(story.label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instagram / RedNote Style Vertical Story Viewer Modal — Portaled to document.body */}
      {activeStory &&
        activeIndex !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(activeStory.headline)}
            onClick={() => setActiveIndex(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-md"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onPointerDown={() => setIsPaused(true)}
              onPointerUp={() => setIsPaused(false)}
              className="relative flex h-[min(86dvh,680px)] w-full max-w-[390px] flex-col justify-between overflow-hidden rounded-[30px] border border-parchment/20 bg-ink text-parchment shadow-2xl"
            >
            {/* Full-bleed Story Image */}
            <Image
              src={activeStory.image}
              alt={t(activeStory.headline)}
              fill
              sizes="390px"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/15 to-ink/92"
            />

            {/* Top Progress Bars + Author Header */}
            <div className="relative z-20 p-4">
              <div className="flex gap-1.5">
                {storyHighlights.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openStory(i)}
                    aria-label={t(s.label)}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-parchment/30"
                  >
                    <span
                      className={`block h-full rounded-full bg-parchment transition-all duration-300 ${
                        i < activeIndex
                          ? "w-full"
                          : i === activeIndex
                            ? "w-full bg-gradient-to-r from-yolk to-cinnabar"
                            : "w-0"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="story-ring rounded-full p-[1.5px]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-yolk">
                      刘
                    </span>
                  </span>
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-parchment">
                      @jian_bing_liu
                    </p>
                    <p className="inline-flex items-center gap-1 text-[10px] text-parchment/75">
                      <MapPin className="h-2.5 w-2.5 text-yolk" aria-hidden="true" />
                      124 Camden Rd, NW1
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  aria-label={pick("关闭快拍", "Close story")}
                  className="rounded-full bg-ink/60 p-1.5 text-parchment backdrop-blur-xs transition-colors hover:bg-ink"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Tap Left/Right Navigation Zones */}
            <div className="relative z-10 flex flex-1 items-center justify-between px-2">
              <button
                type="button"
                onClick={() =>
                  activeIndex > 0 ? openStory(activeIndex - 1) : setActiveIndex(null)
                }
                aria-label={pick("上一个快拍", "Previous story")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/45 text-parchment backdrop-blur-xs transition-colors hover:bg-ink/80"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  activeIndex < storyHighlights.length - 1
                    ? openStory(activeIndex + 1)
                    : setActiveIndex(null)
                }
                aria-label={pick("下一个快拍", "Next story")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/45 text-parchment backdrop-blur-xs transition-colors hover:bg-ink/80"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Bottom Caption + Hashtag + CTA */}
            <div className="relative z-20 p-5">
              <span className="inline-flex items-center rounded-full bg-cinnabar px-3 py-1 text-[11px] font-bold text-parchment shadow-sm">
                {t(activeStory.tag)}
              </span>
              <h3 className="mt-2.5 font-display text-2xl leading-snug font-semibold text-parchment">
                {t(activeStory.headline)}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment/85">
                {t(activeStory.caption)}
              </p>
              <p className="mt-2 text-[11px] font-semibold text-yolk">
                {activeStory.hashtag}
              </p>

              <div className="mt-4">
                {activeStory.external ? (
                  <a
                    href={activeStory.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setActiveIndex(null)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-parchment px-5 py-3 text-xs font-bold text-ink shadow-md transition-transform active:scale-[0.98] hover:bg-yolk"
                  >
                    {t(activeStory.ctaLabel)}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    href={activeStory.href}
                    onClick={() => setActiveIndex(null)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-parchment px-5 py-3 text-xs font-bold text-ink shadow-md transition-transform active:scale-[0.98] hover:bg-yolk"
                  >
                    {t(activeStory.ctaLabel)}
                  </Link>
                )}
              </div>
            </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
