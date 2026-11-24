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
    label: { en: "Dragon Fruit", zh: "火龙果皮" },
    tag: { en: "Zero Food Dye", zh: "零色素鲜榨" },
    headline: {
      en: "Real Red Dragon Fruit & Beetroot Batters",
      zh: "红心火龙果与甜菜根每天现榨和面",
    },
    caption: {
      en: "Never artificial colouring — we slice fresh dragon fruit, beetroot, and spinach in our Camden kitchen every morning for our signature rainbow Jian Bing.",
      zh: "绝不加一滴食用色素！每天清晨在卡姆登后厨现切红心火龙果、甜菜根与新鲜菠菜榨汁调糊，摊出软韧带果香的彩色煎饼皮。",
    },
    hashtag: "#ZeroFoodDye #DragonFruitCrepe",
    image: "/images/veggie-crepe-griddle.webp",
    ctaLabel: { en: "Explore Crepe Menu", zh: "查看果蔬煎饼菜单" },
    href: "/menu",
  },
  {
    id: "halal",
    label: { en: "Halal Picks", zh: "清真牛鸡" },
    tag: { en: "Halal Beef & Chicken", zh: "清真认证肉馅" },
    headline: {
      en: "Loaded Halal Beef & Chicken Jian Bing",
      zh: "双蛋薄脆清真牛肉 / 鸡肉煎饼",
    },
    caption: {
      en: "Two eggs, crispy wonton cracker, coriander, homemade sauce & chilli oil — £10 full size or £6.50 lunch special.",
      zh: "磕双蛋、刷秘制酱、夹现炸薄脆与秘制清真牛肉/鸡肉，午市 £6.50 起，满口酥香超满足。",
    },
    hashtag: "#HalalLondon #CamdenEats",
    image: "/images/beef-crepe-sleeve.webp",
    ctaLabel: { en: "Filter Halal Dishes", zh: "一键看全部清真菜品" },
    href: "/menu?diet=halal",
  },
  {
    id: "lace-cone",
    label: { en: "Lace Cones", zh: "花式甜筒" },
    tag: { en: "Camden Sweet Hit", zh: "出片甜品担当" },
    headline: {
      en: "Hand-Piped Pink Lace Sweet Crepes",
      zh: "手工挤花粉色蕾丝甜筒煎饼",
    },
    caption: {
      en: "Piped freehand on the hot griddle into crisp lace, rolled with whipped cream, fresh strawberries, banana & Nutella. From £4.",
      zh: "铁板手绘粉色脆蕾丝卷成甜筒，装满绵密奶油、新鲜草莓、香蕉与榛子巧克力酱，£4 起颜值拉满！",
    },
    hashtag: "#LondonDessert #SweetCrepe",
    image: "/images/fancy-lace-dessert-cone.webp",
    ctaLabel: { en: "See Sweet Crepes", zh: "看甜煎饼与甜品" },
    href: "/menu#sweet-crepes-and-desserts",
  },
  {
    id: "dumplings",
    label: { en: "£1 Dumplings", zh: "£1 脆底煎饺" },
    tag: { en: "Crispy Skirt", zh: "金黄脆底" },
    headline: {
      en: "Golden Pan-Fried Dumplings From £1",
      zh: "现煎脆底牛肉 / 素菜煎饺 £1 起",
    },
    caption: {
      en: "Crispy lace-skirt bottoms, juicy fillings — grab a few Halal beef or veggie dumplings alongside your Jian Bing or braised beef rice.",
      zh: "外皮煎得金黄焦脆、咬开汁水满满，清真牛肉与素食馅料任选，£1 一只随心加配。",
    },
    hashtag: "#UCLFoodie #LondonStreetFood",
    image: "/images/beef-dumplings-plate.webp",
    ctaLabel: { en: "View Dumplings & Snacks", zh: "查看煎饺与小吃" },
    href: "/menu#mains-and-rice",
  },
  {
    id: "rednote",
    label: { en: "RedNote Vlog", zh: "小红书实拍" },
    tag: { en: "RedNote · 1162231947", zh: "小红书官方号" },
    headline: {
      en: "Mrs Liu's Camden Griddle Diary",
      zh: "退休后在伦敦归零创业 · 每日铁板日常",
    },
    caption: {
      en: "1,830+ likes & saves on RedNote! Follow Mrs Liu behind the griddle at 124 Camden Road for fresh kitchen vlogs and seasonal specials.",
      zh: "小红书 1,830+ 获赞收藏！关注「煎饼刘 · ID: 1162231947」，直击卡姆登后厨现切火龙果与铁板日常。",
    },
    hashtag: "#小红书1162231947 #伦敦中餐",
    image: "/images/social-xhs-founder.jpg",
    ctaLabel: { en: "Open RedNote Profile", zh: "打开小红书主页" },
    href: "https://xhslink.cn/m/24xL12L1i1R",
    external: true,
  },
  {
    id: "fantuan",
    label: { en: "Order Hot", zh: "饭团外卖" },
    tag: { en: "4.5 ★ Fantuan", zh: "热乎送到家" },
    headline: {
      en: "Order Online on Fantuan or Grab to Go",
      zh: "卡姆登现做外带 · 饭团外卖直达",
    },
    caption: {
      en: "Takeaway & no-contact delivery only (no dine-in). Order ahead on Fantuan Delivery or walk up to 124 Camden Rd NW1 9EE.",
      zh: "仅限外带与无接触配送（不提供堂食）。直接上饭团外卖热乎下单，或顺路来卡姆登路 124 号现点现带！",
    },
    hashtag: "#FantuanDelivery #NW1Eats",
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
