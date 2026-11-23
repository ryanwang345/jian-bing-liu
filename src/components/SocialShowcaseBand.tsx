"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";
import { SocialWatermarkBackdrop } from "@/components/motion/SocialWatermarkBackdrop";
import { restaurant } from "@/data/restaurant";
import { socialPosts, type SocialPost } from "@/data/reviews";
import { useLocale } from "@/lib/i18n";

type SocialFilter =
  | "all"
  | "rednote"
  | "instagram"
  | "tiktok"
  | "threads"
  | "reddit"
  | "fantuan";

/**
 * Full-bleed edge-to-edge embossed social media showcase.
 * - Spans 100% of the horizontal viewport with letterpress social platform watermarks.
 * - On desktop in "All Posts" mode, vertical scrolling smoothly drives the full horizontal
 *   strip across all 6 platforms (RedNote, Instagram, TikTok, Threads, Reddit, Fantuan).
 * - On mobile, supports effortless native horizontal swipe + snap.
 * - Clicking any platform filter immediately focuses on that platform's posts.
 */
export function SocialShowcaseBand() {
  const { t, zhText, pick } = useLocale();
  const [socialFilter, setSocialFilter] = useState<SocialFilter>("all");
  const [activePlatform, setActivePlatform] =
    useState<SocialPost["platform"]>("rednote");

  const runwayRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const activePlatformRef = useRef<SocialPost["platform"]>("rednote");

  const filteredPosts =
    socialFilter === "all"
      ? socialPosts
      : socialPosts.filter((post) => post.platform === socialFilter);

  const isScrollGallery = socialFilter === "all";

  const rednoteCount = socialPosts.filter((p) => p.platform === "rednote").length;
  const igCount = socialPosts.filter((p) => p.platform === "instagram").length;
  const ttCount = socialPosts.filter((p) => p.platform === "tiktok").length;
  const threadsCount = socialPosts.filter((p) => p.platform === "threads").length;
  const redditCount = socialPosts.filter((p) => p.platform === "reddit").length;
  const fantuanCount = socialPosts.filter((p) => p.platform === "fantuan").length;

  // Desktop vertical-scroll -> horizontal full-bleed track playback
  useEffect(() => {
    const runway = runwayRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!runway || !viewport || !track) return;

    if (!isScrollGallery) {
      track.style.transform = "";
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = "scaleX(1)";
      }
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const isDesktop = window.innerWidth >= 1024;
      if (!isDesktop || reducedMotion) {
        track.style.transform = "";
        return;
      }

      const rect = runway.getBoundingClientRect();
      const scrollable = runway.offsetHeight - window.innerHeight;
      if (scrollable <= 20) return;

      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      const maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const translateX = -progress * maxTranslate;

      track.style.transform = `translate3d(${translateX.toFixed(1)}px, 0, 0)`;

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${Math.max(
          0.08,
          progress
        ).toFixed(3)})`;
      }

      // Highlight which platform is currently cruising past center
      const idx = Math.min(
        filteredPosts.length - 1,
        Math.max(0, Math.round(progress * (filteredPosts.length - 1)))
      );
      const currentPost = filteredPosts[idx];
      if (currentPost && currentPost.platform !== activePlatformRef.current) {
        activePlatformRef.current = currentPost.platform;
        setActivePlatform(currentPost.platform);
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isScrollGallery, filteredPosts]);

  // Nudge horizontally (scrolls the runway on desktop, scrolls container on mobile)
  const nudgeTrack = useCallback((direction: -1 | 1) => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    const runway = runwayRef.current;
    const viewport = viewportRef.current;

    if (
      isDesktop &&
      isScrollGallery &&
      runway &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const scrollable = runway.offsetHeight - window.innerHeight;
      if (scrollable > 20) {
        window.scrollBy({
          top: direction * Math.max(260, scrollable * 0.22),
          behavior: "smooth",
        });
        return;
      }
    }

    if (viewport) {
      viewport.scrollBy({
        left: direction * 360,
        behavior: "smooth",
      });
    }
  }, [isScrollGallery]);

  const handleFilterClick = (next: SocialFilter) => {
    setSocialFilter(next);
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={runwayRef}
      className={`kraft-grain relative w-full border-t border-kraft-deep/90 bg-parchment/85 ${
        isScrollGallery
          ? "lg:h-[260vh] motion-reduce:lg:h-auto"
          : ""
      }`}
    >
      {/* Full-bleed sticky stage on desktop when scrolling all social posts */}
      <div
        className={`relative w-full overflow-x-clip py-12 sm:py-16 ${
          isScrollGallery
            ? "lg:sticky lg:top-[72px] lg:flex lg:min-h-[calc(100vh-72px)] lg:flex-col lg:justify-center lg:py-10 motion-reduce:lg:static motion-reduce:lg:min-h-0"
            : ""
        }`}
      >
        {/* Edge-to-Edge Embossed Social Platform Watermark Backdrop */}
        <SocialWatermarkBackdrop />

        <div className="relative z-10 w-full">
          {/* Header & Quick Official Channel Links (Full-Width Padded Container) */}
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                  {pick(
                    "全平台热门动态与口碑",
                    "On RedNote, Instagram, TikTok, Threads, Reddit & Fantuan"
                  )}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {pick(
                    "小红书 1,830+ 获赞收藏 · TikTok 1,190+ 粉丝 · Reddit r/LondonFood 强推 · 饭团 4.5 ★",
                    "RedNote ID 1162231947 · 1,190+ TikTok followers · r/LondonFood favourite · 4.5 ★ on Fantuan"
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {restaurant.verifiedSocialLinks
                  .filter((s) => s.platform !== "google-maps")
                  .map((social) => {
                    const isCruising =
                      isScrollGallery && activePlatform === social.platform;
                    return (
                      <a
                        key={social.href}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-2xs backdrop-blur-xs transition-all hover:-translate-y-0.5 ${
                          isCruising
                            ? "border-cinnabar bg-cinnabar text-parchment shadow-sm"
                            : "border-kraft-deep bg-white/90 text-ink hover:border-cinnabar hover:text-cinnabar"
                        }`}
                      >
                        <SocialIcon
                          platform={social.platform}
                          className={`h-3.5 w-3.5 ${
                            isCruising ? "text-[#F0C26E]" : "text-cinnabar"
                          }`}
                        />
                        {t(social.label)}
                        <ExternalLink
                          className="h-3 w-3 opacity-60"
                          aria-hidden="true"
                        />
                      </a>
                    );
                  })}
              </div>
            </div>

            {/* Filter Pills + Prev/Next Nudge Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div
                role="group"
                aria-label={pick("按社媒平台筛选帖子", "Filter posts by platform")}
                className="flex flex-wrap gap-2"
              >
                {(
                  [
                    {
                      key: "all",
                      label: pick(
                        `全部动态 (${socialPosts.length})`,
                        `All Posts (${socialPosts.length})`
                      ),
                    },
                    {
                      key: "rednote",
                      label: pick(
                        `小红书 (${rednoteCount})`,
                        `RedNote (${rednoteCount})`
                      ),
                    },
                    {
                      key: "instagram",
                      label: `Instagram (${igCount})`,
                    },
                    {
                      key: "tiktok",
                      label: `TikTok (${ttCount})`,
                    },
                    {
                      key: "threads",
                      label: `Threads (${threadsCount})`,
                    },
                    {
                      key: "reddit",
                      label: `Reddit (${redditCount})`,
                    },
                    {
                      key: "fantuan",
                      label: pick(
                        `饭团 (${fantuanCount})`,
                        `Fantuan (${fantuanCount})`
                      ),
                    },
                  ] as const
                ).map((tab) => {
                  const active = socialFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleFilterClick(tab.key)}
                      aria-pressed={active}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? "bg-cinnabar text-parchment shadow-xs"
                          : "border border-kraft-deep bg-white/85 text-ink-soft hover:bg-kraft"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {isScrollGallery && (
                  <span className="hidden items-center gap-1.5 text-xs font-medium text-ink-muted lg:inline-flex">
                    <ArrowDown
                      className="h-3.5 w-3.5 text-cinnabar"
                      aria-hidden="true"
                    />
                    {pick(
                      "向下滚动自动浏览全部 6 大平台",
                      "Scroll down to glide through all 6 platforms"
                    )}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => nudgeTrack(-1)}
                  aria-label={pick("向左滑动查看", "Scroll left")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-kraft-deep bg-white/90 text-ink shadow-2xs transition-colors hover:border-cinnabar hover:text-cinnabar"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => nudgeTrack(1)}
                  aria-label={pick("向右滑动查看", "Scroll right")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-kraft-deep bg-white/90 text-ink shadow-2xs transition-colors hover:border-cinnabar hover:text-cinnabar"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Edge-to-Edge Full-Width Horizontal Track */}
          <div
            ref={viewportRef}
            className={`mt-7 w-full ${
              isScrollGallery
                ? "overflow-x-auto pb-3 lg:overflow-hidden lg:pb-2"
                : "overflow-x-auto pb-2"
            }`}
          >
            <div
              ref={trackRef}
              className={`flex gap-5 px-4 will-change-transform sm:px-8 lg:px-12 ${
                isScrollGallery
                  ? "w-max snap-x snap-mandatory lg:snap-none"
                  : "mx-auto max-w-[1440px] flex-wrap sm:flex-nowrap"
              }`}
            >
              {filteredPosts.map((post) => (
                <a
                  key={post.id}
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`apple-card group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-kraft-deep/85 bg-white/95 shadow-xs backdrop-blur-xs hover:border-cinnabar/45 hover:shadow-xl ${
                    isScrollGallery
                      ? "w-[300px] sm:w-[340px] lg:w-[355px]"
                      : "w-full sm:w-[330px] lg:w-[355px]"
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-kraft">
                    <Image
                      src={post.image}
                      alt={t(post.imageAlt)}
                      fill
                      sizes="(max-width: 640px) 300px, 355px"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-parchment backdrop-blur-xs">
                      <SocialIcon
                        platform={post.platform}
                        className="h-3.5 w-3.5 text-[#F0C26E]"
                      />
                      {t(post.postType)}
                    </span>
                  </div>

                  <div className="relative flex flex-1 flex-col justify-between overflow-hidden p-5">
                    {/* Per-card embossed platform seal watermark */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-3 -bottom-3 text-ink/[0.045] transition-all duration-500 group-hover:scale-110 group-hover:text-cinnabar/[0.08]"
                    >
                      <SocialIcon platform={post.platform} className="h-20 w-20" />
                    </span>

                    <div className="relative z-10">
                      <p className="text-xs font-semibold text-cinnabar">
                        {zhText(post.handle)}
                      </p>
                      <h4 className="mt-1.5 font-display text-base font-bold text-ink transition-colors group-hover:text-cinnabar">
                        {t(post.title)}
                      </h4>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                        {t(post.caption)}
                      </p>
                    </div>

                    <span className="relative z-10 mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-cinnabar">
                      {post.platform === "rednote"
                        ? pick("去小红书看煎饼刘", "Open on RedNote")
                        : post.platform === "tiktok"
                          ? pick("打开 TikTok 原视频", "Watch TikTok Video")
                          : post.platform === "instagram"
                            ? pick("打开 Instagram 原帖", "Open Instagram Post")
                            : post.platform === "reddit"
                              ? pick("在 Reddit 查看讨论", "Open Reddit Thread")
                              : post.platform === "fantuan"
                                ? pick("前往饭团外卖下单", "Order on Fantuan")
                                : pick("打开 Threads 原帖", "Open Threads Post")}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Horizontal Scroll Progress Rail (Desktop All-Posts Mode) */}
          {isScrollGallery && (
            <div className="mx-auto mt-5 hidden max-w-[1440px] items-center gap-4 px-12 lg:flex">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-kraft-deep/60">
                <span
                  ref={progressBarRef}
                  className="block h-full w-full origin-left rounded-full bg-gradient-to-r from-cinnabar via-turmeric to-[#E59819] will-change-transform"
                  style={{ transform: "scaleX(0.08)" }}
                />
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-muted">
                {pick(
                  `共 ${socialPosts.length} 条全平台精选`,
                  `${socialPosts.length} featured posts`
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
