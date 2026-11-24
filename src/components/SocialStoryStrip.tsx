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
      en: "Real Red Dragon Fruit & Beetroot Batters",
      zh: "红心火龙果与甜菜根，每天现榨和面",
    },
    caption: {
      en: "Never artificial colouring — every morning we juice fresh red dragon fruit, beetroot and spinach straight into our batter for a naturally colourful, crisp-edged Jian Bing.",
      zh: "不用一滴食用色素。每天清晨在后厨现切红心火龙果、甜菜根和菠菜榨汁调糊，摊出来的煎饼皮带着自然清香，外圈微脆、里头软韧。",
    },
    hashtag: "124 Camden Rd · NW1",
    image: "/images/veggie-crepe-griddle.webp",
    ctaLabel: { en: "Explore Crepe Menu", zh: "查看果蔬煎饼菜单" },
    href: "/menu",
  },
  {
    id: "halal",
    label: { en: "Halal Picks", zh: "清真牛鸡" },
    tag: { en: "Halal Beef & Chicken", zh: "清真牛肉与鸡肉" },
    headline: {
      en: "Properly Filling Halal Beef & Chicken Jian Bing",
      zh: "双蛋薄脆清真牛肉 / 鸡肉煎饼",
    },
    caption: {
      en: "Two cracked eggs, crunchy wonton crisp, fresh greens, fried shallots and Mrs Liu's savoury house sauce — £10 full size or £6.50 for a lighter lunch.",
      zh: "热锅磕双蛋、刷自家慢熬咸香酱、裹满清真牛肉或鸡肉与酥脆配料——大份 £10 沉甸甸特顶饱，午市 £6.50 轻盈刚好。",
    },
    hashtag: "Halal · Cooked to order",
    image: "/images/beef-crepe-sleeve.webp",
    ctaLabel: { en: "Browse Halal Dishes", zh: "一键看全部清真菜品" },
    href: "/menu?diet=halal",
  },
  {
    id: "lace-cone",
    label: { en: "Lace Cones", zh: "蕾丝甜筒" },
    tag: { en: "Sweet Crepes", zh: "铁板手挤甜点" },
    headline: {
      en: "Hand-Piped Pink Lace Crepe Cones",
      zh: "铁板现挤粉色蕾丝甜筒煎饼",
    },
    caption: {
      en: "Crisp pink lace batter piped by hand on the hot griddle, rolled into a cone with whipped cream, fresh strawberries, banana and biscuit sticks. Sweet crepes from £4.",
      zh: "滚烫铁板上手工挤出轻脆粉色蕾丝边，趁热卷成甜筒，装满绵密奶油、鲜草莓、香蕉和小饼干棒，甜而不腻。",
    },
    hashtag: "Sweet crepes from £4",
    image: "/images/fancy-lace-dessert-cone.webp",
    ctaLabel: { en: "See Sweet Crepes", zh: "看甜煎饼与甜品" },
    href: "/menu#sweet-crepes-and-desserts",
  },
  {
    id: "dumplings",
    label: { en: "£1 Dumplings", zh: "£1 脆底煎饺" },
    tag: { en: "Pan-Fried Fresh", zh: "金黄脆底现煎" },
    headline: {
      en: "Golden Pan-Fried Dumplings From £1",
      zh: "现煎金黄脆底牛肉 / 素菜煎饺 £1 起",
    },
    caption: {
      en: "Crisp and golden underneath, juicy inside — add a few Halal beef or veggie dumplings alongside your Jian Bing or slow-braised beef rice.",
      zh: "底部煎得焦黄酥脆、咬开鲜嫩多汁，清真牛肉与清香素馅任选，£1 一只随手加几个最解馋。",
    },
    hashtag: "Halal Beef & Veggie",
    image: "/images/beef-dumplings-plate.webp",
    ctaLabel: { en: "View Dumplings & Snacks", zh: "查看煎饺与小吃" },
    href: "/menu#snacks-and-dumplings",
  },
  {
    id: "rednote",
    label: { en: "Mrs Liu's Kitchen", zh: "后厨日常" },
    tag: { en: "RedNote · 1162231947", zh: "小红书官方号" },
    headline: {
      en: "Retired in China, Starting Over in London",
      zh: "退休后在伦敦从零起步 · 每日铁板烟火",
    },
    caption: {
      en: "Follow Mrs Liu behind the griddle at 124 Camden Road on RedNote (ID: 1162231947) for morning fruit prep, freshly spun crepes and warm neighbourhood moments.",
      zh: "关注小红书「煎饼刘 · ID: 1162231947」，看刘阿姨每天清晨现切果蔬、热锅摊饼与卡姆登街坊的暖心日常。",
    },
    hashtag: "RedNote ID: 1162231947",
    image: "/images/social-xhs-founder.jpg",
    ctaLabel: { en: "Open RedNote Profile", zh: "打开小红书主页" },
    href: "https://xhslink.cn/m/24xL12L1i1R",
    external: true,
  },
  {
    id: "fantuan",
    label: { en: "Order Warm", zh: "饭团外卖" },
    tag: { en: "4.5 ★ Fantuan", zh: "热乎送到家" },
    headline: {
      en: "Pop In to Take Away or Order on Fantuan",
      zh: "顺路现做带走 · 或饭团外卖热乎直达",
    },
    caption: {
      en: "Takeaway and no-contact delivery only (no dine-in). Order ahead on Fantuan Delivery or pop by 124 Camden Rd NW1 9EE for a hot crepe straight off the iron.",
      zh: "仅限到店外带与无接触配送（不提供堂食）。直接在饭团外卖下单，或顺路来卡姆登路 124 号捧一份刚出锅的热煎饼带走。",
    },
    hashtag: "Takeaway & Delivery",
    image: "/images/hero-jianbing-platter.webp",
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
