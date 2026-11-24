"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  ArrowDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Quote,
  Star,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";
import { REDNOTE_PROFILE_URL, socialPosts as curatedPosts, type SocialPost } from "@/data/reviews";
import { useSocialLinks } from "@/components/SocialLinksProvider";
import { useLocale } from "@/lib/i18n";

// Client-only lazy decorative watermarks: strips ~28 KB of SVG DOM out of initial SSR HTML
const SocialWatermarkBackdrop = dynamic(
  () =>
    import("@/components/motion/SocialWatermarkBackdrop").then(
      (m) => m.SocialWatermarkBackdrop
    ),
  { ssr: false }
);

type SocialFilter =
  | "all"
  | "rednote"
  | "instagram"
  | "tiktok"
  | "threads"
  | "reddit"
  | "fantuan";

interface LiveEmbedCardProps {
  post: SocialPost;
  shouldMount: boolean;
  cardWidth: string;
  actionText: string;
}

/**
 * Live embed card with instant rich preview underneath and smooth onLoad cross-fade.
 * Never shows an empty blank box while third-party social players initialize.
 */
function LiveEmbedCard({
  post,
  shouldMount,
  cardWidth,
  actionText,
}: LiveEmbedCardProps) {
  const { t, pick } = useLocale();
  const [loaded, setLoaded] = useState(false);

  return (
    <article
      className={`apple-card flex h-[440px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-kraft-deep/85 bg-white shadow-sm hover:border-cinnabar/45 hover:shadow-xl sm:h-[460px] lg:h-[430px] xl:h-[500px] ${cardWidth}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-kraft-deep/60 bg-parchment/70 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
          <SocialIcon
            platform={post.platform}
            className="h-3.5 w-3.5 text-cinnabar"
          />
          {t(post.postType)}
        </span>
        <span className="truncate text-[11px] font-medium text-ink-muted">
          {post.handle}
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden bg-parchment/60">
        {/* Instant rich fallback preview shown immediately until iframe finishes painting */}
        <div
          aria-hidden={loaded}
          className={`absolute inset-0 flex flex-col justify-between p-5 transition-opacity duration-500 ${
            loaded ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-cinnabar">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cinnabar" />
            <span>
              {shouldMount
                ? pick("正在连接原平台内容…", "Connecting to live post…")
                : pick("滑动靠近自动加载原帖", "Loads automatically as you scroll")}
            </span>
          </div>

          <div className="my-auto rounded-2xl border border-kraft-deep/70 bg-white/90 p-4 shadow-2xs">
            <p className="text-xs font-semibold text-cinnabar">{post.handle}</p>
            <h4 className="mt-1 font-display text-base font-bold text-ink">
              {t(post.title)}
            </h4>
            <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-ink-muted">
              {t(post.caption)}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <SocialIcon
              platform={post.platform}
              className="h-6 w-6 text-ink/20"
            />
          </div>
        </div>

        {/* Live official embed iframe — mounted progressively in small waves (no native lazy delay) */}
        {shouldMount && post.embedUrl && (
          <iframe
            src={post.embedUrl}
            title={`${post.handle} — ${t(post.title)}`}
            onLoad={() => setLoaded(true)}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            className={`relative z-10 h-full w-full border-0 bg-white transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      <a
        href={post.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between border-t border-kraft-deep/60 bg-white px-4 py-3 text-xs font-semibold text-ink transition-colors hover:bg-parchment hover:text-cinnabar"
      >
        <span className="truncate pr-2">{t(post.title)}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-cinnabar">
          {actionText}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </span>
      </a>
    </article>
  );
}

/**
 * Full-bleed edge-to-edge embossed social media showcase rendering REAL platform content:
 * - Pre-warms the first visible embeds 1400px before reaching the section so they're ready on arrival.
 * - Progressively mounts remaining embeds in small waves as you scroll horizontally (never choking bandwidth with 10 simultaneous iframes).
 * - Displays rich instant previews underneath with silky onLoad cross-fade.
 */
export function SocialShowcaseBand() {
  const { t, zhText, pick } = useLocale();
  const socialLinks = useSocialLinks();
  const rednote = socialLinks.find((link) => link.platform === "rednote");
  const socialPosts = useMemo(() => curatedPosts.flatMap((post) => {
    if (post.href !== REDNOTE_PROFILE_URL) return [post];
    return rednote ? [{ ...post, handle: rednote.handle, href: rednote.href }] : [];
  }), [rednote]);
  const [socialFilter, setSocialFilter] = useState<SocialFilter>("all");
  const [activePlatform, setActivePlatform] =
    useState<SocialPost["platform"]>("rednote");
  const [sectionNear, setSectionNear] = useState(false);
  // Start with first 4 cards (2 RedNote + first 2 live embeds), then unlock +3 ahead as user scrolls
  const [loadedUpTo, setLoadedUpTo] = useState(3);

  const runwayRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const activePlatformRef = useRef<SocialPost["platform"]>("rednote");
  const loadedUpToRef = useRef(3);

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

  // Defer live social iframes until visitor scrolls within 480px AND initial LCP paint settles
  useEffect(() => {
    const el = runwayRef.current;
    if (!el || sectionNear) return;

    let idleTimer: number | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          // Small idle deferral ensures above-the-fold Hero LCP finishes uncontested
          idleTimer = window.setTimeout(() => {
            setSectionNear(true);
          }, window.scrollY > 120 ? 0 : 900);
          observer.disconnect();
        }
      },
      { rootMargin: "480px 0px 480px 0px" }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (idleTimer !== null) window.clearTimeout(idleTimer);
    };
  }, [sectionNear]);

  // Also unlock additional cards on mobile horizontal swipe
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !sectionNear) return;

    const onHorizontalScroll = () => {
      const approxCard = Math.floor(viewport.scrollLeft / 340) + 4;
      if (approxCard > loadedUpToRef.current) {
        loadedUpToRef.current = approxCard;
        setLoadedUpTo(approxCard);
      }
    };

    viewport.addEventListener("scroll", onHorizontalScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onHorizontalScroll);
  }, [sectionNear]);

  // Desktop vertical-scroll -> horizontal full-bleed track playback + progressive wave loading
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

      const idx = Math.min(
        filteredPosts.length - 1,
        Math.max(0, Math.round(progress * (filteredPosts.length - 1)))
      );

      // Progressively mount 4 cards ahead of current scroll index (avoids 10-iframe network pileup)
      const neededUpTo = Math.min(filteredPosts.length - 1, idx + 4);
      if (neededUpTo > loadedUpToRef.current) {
        loadedUpToRef.current = neededUpTo;
        setLoadedUpTo(neededUpTo);
      }

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

  const nudgeTrack = useCallback(
    (direction: -1 | 1) => {
      const isDesktop =
        typeof window !== "undefined" && window.innerWidth >= 1024;
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
            top: direction * Math.max(280, scrollable * 0.2),
            behavior: "smooth",
          });
          return;
        }
      }

      if (viewport) {
        viewport.scrollBy({
          left: direction * 365,
          behavior: "smooth",
        });
      }
    },
    [isScrollGallery]
  );

  const handleFilterClick = (next: SocialFilter) => {
    setSocialFilter(next);
    setSectionNear(true);
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const actionLabel = (platform: SocialPost["platform"]) =>
    platform === "rednote"
      ? pick("去小红书看煎饼刘", "Open on RedNote")
      : platform === "tiktok"
        ? pick("在 TikTok 观看原视频", "Watch on TikTok")
        : platform === "instagram"
          ? pick("在 Instagram 打开原帖", "Open on Instagram")
          : platform === "reddit"
            ? pick("在 Reddit 查看原帖", "Read on Reddit")
            : platform === "fantuan"
              ? pick("前往饭团外卖下单", "Order on Fantuan")
              : pick("在 Threads 查看原帖", "Open on Threads");

  return (
    <div
      ref={runwayRef}
      className={`kraft-grain relative w-full border-t border-kraft-deep/90 bg-parchment/85 ${
        isScrollGallery ? "lg:h-[280vh] motion-reduce:lg:h-auto" : ""
      }`}
    >
      <div
        className={`relative w-full overflow-x-clip py-12 sm:py-16 ${
          isScrollGallery
            ? "lg:sticky lg:top-[72px] lg:flex lg:min-h-[calc(100svh-72px)] lg:flex-col lg:justify-center lg:py-5 xl:py-8 motion-reduce:lg:static motion-reduce:lg:min-h-0"
            : ""
        }`}
      >
        <SocialWatermarkBackdrop />

        <div className="relative z-10 w-full">
          {/* Header & Official Channel Links */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                  {pick(
                    "全平台真实动态与社媒直连",
                    "Live From RedNote, Instagram, TikTok, Threads, Reddit & Fantuan"
                  )}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {pick(
                    "直连官方 TikTok 实时视频、Instagram / Threads 原帖嵌入、小红书实拍笔记与社区热帖",
                    "Real embedded TikTok videos, live Instagram & Threads posts, RedNote notes, r/LondonFood threads & Fantuan"
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {socialLinks
                  .filter((s) => s.platform !== "google-maps")
                  .map((social) => {
                    const isCruising =
                      isScrollGallery && activePlatform === social.platform;
                    return (
                      <a
                        key={social.platform}
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

            {/* Filter Pills + Horizontal Nudge Controls */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
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
                ).filter((tab) => tab.key !== "rednote" || rednoteCount > 0).map((tab) => {
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
                      "向下滚动自动浏览全部 6 大平台真实内容",
                      "Scroll down to glide through live content from all 6 platforms"
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

          {/* Real Social Content Track — aligned to the exact max-w-[1440px] width of the Reviews carousel above */}
          <div className="relative mx-auto mt-6 max-w-[1440px]">
            {isScrollGallery && (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-[#faf5eb] to-transparent lg:block"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-[#faf5eb] to-transparent lg:block"
                />
              </>
            )}

            <div
              ref={viewportRef}
              className={`no-scrollbar w-full ${
                isScrollGallery
                  ? "overflow-x-auto pb-3 lg:overflow-hidden lg:pb-2"
                  : "overflow-x-auto pb-2"
              }`}
            >
              <div
                ref={trackRef}
                className={`flex gap-5 px-4 will-change-transform sm:px-6 lg:px-10 ${
                  isScrollGallery
                    ? "w-max snap-x snap-mandatory lg:snap-none"
                    : "flex-wrap sm:flex-nowrap"
                }`}
              >
              {filteredPosts.map((post, idx) => {
                const cardWidth = isScrollGallery
                  ? "w-[min(84vw,320px)] sm:w-[345px]"
                  : "w-full sm:w-[345px]";

                // 1) LIVE EMBED CARDS: Instagram Reels/Posts, TikTok Video Player, Threads Posts
                if (post.embedUrl) {
                  const shouldMount =
                    sectionNear && (!isScrollGallery || idx <= loadedUpTo);
                  return (
                    <LiveEmbedCard
                      key={post.id}
                      post={post}
                      shouldMount={shouldMount}
                      cardWidth={cardWidth}
                      actionText={actionLabel(post.platform)}
                    />
                  );
                }

                // 2) REAL REDNOTE (小红书) NOTE CARDS using actual cropped RedNote covers
                if (post.platform === "rednote" && post.image) {
                  return (
                    <a
                      key={post.id}
                      href={post.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`apple-card group relative flex h-[440px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-kraft-deep/85 bg-white shadow-sm hover:border-[#FF2442]/50 hover:shadow-xl sm:h-[460px] lg:h-[430px] xl:h-[500px] ${cardWidth}`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-kraft-deep/60 bg-[#FF2442]/[0.06] px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF2442]">
                          <SocialIcon platform="rednote" className="h-3.5 w-3.5" />
                          {t(post.postType)}
                        </span>
                        <span className="text-[11px] font-semibold text-ink-muted">
                          {zhText(post.handle)}
                        </span>
                      </div>

                      <div className="relative h-[220px] w-full overflow-hidden bg-kraft sm:h-[240px] lg:h-[215px] xl:h-[275px]">
                        <Image
                          src={post.image}
                          alt={post.imageAlt ? t(post.imageAlt) : t(post.title)}
                          fill
                          sizes="345px"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                        />
                        <span className="absolute right-3 bottom-3 rounded-full bg-[#FF2442] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                          {pick("小红书原图实拍", "Real RedNote Note")}
                        </span>
                      </div>

                      <div className="relative flex flex-1 flex-col justify-between overflow-hidden p-5">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-3 -bottom-3 text-[#FF2442]/[0.06]"
                        >
                          <SocialIcon platform="rednote" className="h-20 w-20" />
                        </span>
                        <div className="relative z-10">
                          <h4 className="font-display text-base font-bold text-ink transition-colors group-hover:text-[#FF2442]">
                            {t(post.title)}
                          </h4>
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-muted">
                            {t(post.caption)}
                          </p>
                        </div>
                        <span className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF2442]">
                          {actionLabel(post.platform)}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </div>
                    </a>
                  );
                }

                // 3) AUTHENTIC NATIVE REDDIT & FANTUAN COMMUNITY CARDS
                const isFantuan = post.platform === "fantuan";
                return (
                  <a
                    key={post.id}
                    href={post.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`apple-card group relative flex h-[440px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-kraft-deep/85 bg-white shadow-sm hover:border-cinnabar/45 hover:shadow-xl sm:h-[460px] lg:h-[430px] xl:h-[500px] ${cardWidth}`}
                  >
                    <div
                      className={`flex items-center justify-between gap-2 border-b border-kraft-deep/60 px-4 py-3 ${
                        isFantuan
                          ? "bg-[#0EA5A4]/[0.09] text-[#0D7B7A]"
                          : "bg-[#FF4500]/[0.07] text-[#C83700]"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                        <SocialIcon platform={post.platform} className="h-4 w-4" />
                        {t(post.postType)}
                      </span>
                      <span className="text-[11px] font-semibold opacity-85">
                        {post.handle}
                      </span>
                    </div>

                    <div className="relative flex flex-1 flex-col justify-between overflow-hidden p-6">
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute -right-4 -bottom-4 ${
                          isFantuan ? "text-[#0EA5A4]/[0.07]" : "text-[#FF4500]/[0.07]"
                        }`}
                      >
                        <SocialIcon platform={post.platform} className="h-28 w-28" />
                      </span>

                      <div className="relative z-10">
                        {isFantuan && (
                          <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-[#0EA5A4]/12 px-3 py-1 text-xs font-bold text-[#0D7B7A]">
                            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                            <span>4.5 ★ Fantuan Camden</span>
                          </div>
                        )}

                        <h4 className="font-display text-xl leading-snug font-bold text-ink transition-colors group-hover:text-cinnabar">
                          {t(post.title)}
                        </h4>

                        <blockquote className="mt-4 rounded-2xl border border-kraft-deep/70 bg-parchment/75 p-4 text-sm leading-relaxed text-ink-soft">
                          <Quote
                            className="mb-1 inline-block h-3.5 w-3.5 -translate-y-0.5 text-cinnabar/60"
                            aria-hidden="true"
                          />{" "}
                          {t(post.caption)}
                        </blockquote>

                        {post.highlights && post.highlights.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {post.highlights.map((hl, hIdx) => (
                              <li
                                key={hIdx}
                                className="flex items-start gap-2 text-xs text-ink-muted"
                              >
                                <CheckCircle2
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jade"
                                  aria-hidden="true"
                                />
                                <span>{t(hl)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <span className="relative z-10 mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cinnabar">
                        {actionLabel(post.platform)}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
            </div>
          </div>

          {/* Horizontal Scroll Progress Rail */}
          {isScrollGallery && (
            <div className="mx-auto mt-4 hidden max-w-[1440px] items-center gap-4 px-10 lg:flex">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-kraft-deep/60">
                <span
                  ref={progressBarRef}
                  className="block h-full w-full origin-left rounded-full bg-gradient-to-r from-cinnabar via-turmeric to-[#E59819] will-change-transform"
                  style={{ transform: "scaleX(0.08)" }}
                />
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-muted">
                {pick(
                  `共 ${socialPosts.length} 条全平台真实动态`,
                  `${socialPosts.length} live & verified posts`
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
