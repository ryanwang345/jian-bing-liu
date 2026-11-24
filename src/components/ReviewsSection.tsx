"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pause,
  Play,
  Quote,
  Star,
  X,
} from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { SocialIcon } from "@/components/SocialIcon";
import {
  customerReviews as initialReviews,
  googleRating as initialRating,
  type CustomerReview,
  type SocialPost,
  type ReviewSource,
} from "@/data/reviews";
import type { ReviewsPayload } from "@/lib/reviews-service";
import { useLocale } from "@/lib/i18n";

// Code-split the heavy full-bleed social embed showcase into its own async chunk
const SocialShowcaseBand = dynamic(() =>
  import("@/components/SocialShowcaseBand").then((m) => m.SocialShowcaseBand)
);

function mergeLiveAndFallback(
  liveReviews: CustomerReview[] | undefined
): CustomerReview[] {
  if (!liveReviews || liveReviews.length === 0) return initialReviews;
  const seen = new Set<string>();
  const seenIds = new Set<string>();
  const merged: CustomerReview[] = [];

  for (const list of [liveReviews, initialReviews]) {
    for (const review of list) {
      if (seenIds.has(review.id)) continue;
      const authorKey = review.author.trim().toLowerCase();
      if (review.isLivePhotoCard) {
        const photoKey = `photo:${review.source}:${authorKey}`;
        if (seen.has(photoKey)) continue;
        seen.add(photoKey);
        seenIds.add(review.id);
        merged.push(review);
        continue;
      }

      const snippetKey = review.quote.en
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "")
        .slice(0, 36);
      const key = `${review.source}:${authorKey}:${snippetKey}`;
      if (seen.has(key)) continue;
      seen.add(key);
      seenIds.add(review.id);
      merged.push(review);
    }
  }
  return merged;
}

type ReviewFilter = "all" | ReviewSource;

interface ReviewsSectionProps {
  posts: SocialPost[];
  initialData?: ReviewsPayload;
}

interface PreviewLightboxState {
  photos: string[];
  index: number;
  author: string;
}

/**
 * Embedded photo stage inside a review card.
 * Automatically cycles smoothly when a review has 2+ photos, and opens full-screen lightbox on click.
 */
function ReviewCardPhotos({
  photos,
  author,
  isLivePhotoCard,
  onOpenLightbox,
  pick,
}: {
  photos: string[];
  author: string;
  isLivePhotoCard?: boolean;
  onOpenLightbox: (index: number) => void;
  pick: (zh: string, en: string) => string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (photos.length <= 1 || hovered) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % photos.length);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [photos.length, hovered]);

  const safeIdx = activeIdx % photos.length;

  return (
    <div
      className="relative mt-3.5 overflow-hidden rounded-xl border border-kraft-deep/80 bg-kraft"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => onOpenLightbox(safeIdx)}
        aria-label={pick(
          `放大查看 ${author} 的评价实拍照片`,
          `View review photo by ${author}`
        )}
        className="group/photo relative block h-44 w-full overflow-hidden text-left sm:h-48"
      >
        {photos.map((photoSrc, idx) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={`${photoSrc}-${idx}`}
            src={photoSrc}
            alt={pick(
              `${author} 在 Google 地图分享的煎饼刘顾客实拍`,
              `Guest review photo shared by ${author} at Jian Bing Liu`
            )}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover/photo:scale-105 ${
              idx === safeIdx
                ? "opacity-100 scale-100"
                : "pointer-events-none opacity-0 scale-[1.03]"
            }`}
          />
        ))}

        {/* Top-left live photo badge */}
        <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-ink/75 px-2.5 py-1 text-[10px] font-semibold text-parchment backdrop-blur-xs">
          <Camera className="h-3 w-3 text-turmeric" aria-hidden="true" />
          {isLivePhotoCard
            ? pick("Google 实时实拍", "Live Google Photo")
            : pick("顾客实拍", "Guest Photo")}
          {photos.length > 1 && (
            <span className="ml-0.5 tabular-nums text-parchment/80">
              {safeIdx + 1}/{photos.length}
            </span>
          )}
        </span>

        {/* Subtle bottom gradient for dots legibility */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink/50 to-transparent"
        />
      </button>

      {/* Multi-photo dot switcher + mini arrows */}
      {photos.length > 1 && (
        <>
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(idx);
                }}
                aria-label={pick(
                  `查看第 ${idx + 1} 张照片`,
                  `View photo ${idx + 1}`
                )}
                className={`h-1.5 rounded-full transition-all ${
                  idx === safeIdx
                    ? "w-4 bg-parchment shadow-xs"
                    : "w-1.5 bg-parchment/55 hover:bg-parchment/85"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIdx((prev) => (prev - 1 + photos.length) % photos.length);
            }}
            aria-label={pick("上一张照片", "Previous photo")}
            className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-parchment opacity-0 backdrop-blur-xs transition-opacity hover:bg-ink/85 group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIdx((prev) => (prev + 1) % photos.length);
            }}
            aria-label={pick("下一张照片", "Next photo")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-parchment opacity-0 backdrop-blur-xs transition-opacity hover:bg-ink/85 group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

export function ReviewsSection({ initialData, posts }: ReviewsSectionProps) {
  const { t, pick } = useLocale();

  const [reviews, setReviews] = useState<CustomerReview[]>(() =>
    mergeLiveAndFallback(initialData?.reviews)
  );
  const [rating, setRating] = useState(
    initialData?.rating ?? {
      ...initialRating,
      isLive: false,
    }
  );
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [previewLightbox, setPreviewLightbox] =
    useState<PreviewLightboxState | null>(null);
  const [isUserPaused, setIsUserPaused] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isInViewRef = useRef(false);
  const isInteractingRef = useRef(false);
  const interactionResumeTimerRef = useRef<number | null>(null);

  // Keyboard navigation + body scroll lock inside photo lightbox
  useEffect(() => {
    if (!previewLightbox) {
      isInteractingRef.current = false;
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewLightbox(null);
      } else if (
        event.key === "ArrowRight" &&
        previewLightbox.photos.length > 1
      ) {
        setPreviewLightbox((prev) =>
          prev
            ? { ...prev, index: (prev.index + 1) % prev.photos.length }
            : null
        );
      } else if (
        event.key === "ArrowLeft" &&
        previewLightbox.photos.length > 1
      ) {
        setPreviewLightbox((prev) =>
          prev
            ? {
                ...prev,
                index:
                  (prev.index - 1 + prev.photos.length) % prev.photos.length,
              }
            : null
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewLightbox]);

  // Client-side hydration fallback if SSR initialData wasn't supplied
  useEffect(() => {
    if (initialData) return;
    let active = true;
    fetch("/api/reviews")
      .then((res) => (res.ok ? (res.json() as Promise<ReviewsPayload>) : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
        if (data.rating) {
          setRating(data.rating);
        }
      })
      .catch(() => {
        // Keep initial verified reviews on transient network errors
      });
    return () => {
      active = false;
    };
  }, [initialData]);

  const filteredReviews =
    reviewFilter === "all"
      ? reviews
      : reviews.filter((r) => r.source === reviewFilter);

  const shouldLoop = filteredReviews.length >= 3;

  // Pause auto-scroll when section is off-screen to protect battery & GPU
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      isInViewRef.current = true;
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        isInViewRef.current = Boolean(entries[0]?.isIntersecting);
      },
      { rootMargin: "120px 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Reset scroll track to start when switching platform filter
  useEffect(() => {
    const el = trackRef.current;
    if (el) {
      el.scrollLeft = 0;
    }
  }, [reviewFilter]);

  // Smooth continuous auto-scrolling playback (滚动播放)
  useEffect(() => {
    if (!shouldLoop || isUserPaused || previewLightbox) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let rafId = 0;
    let lastTime = performance.now();
    let carryPx = 0;
    const SPEED_PX_PER_SEC = 38;

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 64);
      lastTime = now;

      const el = trackRef.current;
      if (el && isInViewRef.current && !isInteractingRef.current) {
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > el.clientWidth) {
          carryPx += (SPEED_PX_PER_SEC * dt) / 1000;
          if (carryPx >= 1) {
            const step = Math.floor(carryPx);
            carryPx -= step;
            let nextLeft = el.scrollLeft + step;
            if (nextLeft >= halfWidth) {
              nextLeft -= halfWidth;
            }
            el.scrollLeft = nextLeft;
          }
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [shouldLoop, isUserPaused, previewLightbox, reviewFilter]);

  const pauseBrieflyForManualAction = useCallback((ms = 2400) => {
    isInteractingRef.current = true;
    if (interactionResumeTimerRef.current) {
      window.clearTimeout(interactionResumeTimerRef.current);
    }
    interactionResumeTimerRef.current = window.setTimeout(() => {
      isInteractingRef.current = false;
      interactionResumeTimerRef.current = null;
    }, ms);
  }, []);

  useEffect(() => {
    return () => {
      if (interactionResumeTimerRef.current) {
        window.clearTimeout(interactionResumeTimerRef.current);
      }
    };
  }, []);

  const stepTrack = useCallback(
    (direction: -1 | 1) => {
      const el = trackRef.current;
      if (!el) return;
      pauseBrieflyForManualAction(2800);

      const cardStride = Math.min(400, Math.max(300, el.clientWidth * 0.72));
      const halfWidth = el.scrollWidth / 2;

      if (shouldLoop && direction === -1 && el.scrollLeft < cardStride * 0.5) {
        el.scrollLeft += halfWidth;
      } else if (shouldLoop && direction === 1 && el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      }

      el.scrollBy({
        left: direction * cardStride,
        behavior: "smooth",
      });
    },
    [pauseBrieflyForManualAction, shouldLoop]
  );

  const googleCount = reviews.filter((r) => r.source === "google").length;
  const igCount = reviews.filter((r) => r.source === "instagram").length;
  const ttCount = reviews.filter((r) => r.source === "tiktok").length;
  const redditCount = reviews.filter((r) => r.source === "reddit").length;
  const fantuanCount = reviews.filter((r) => r.source === "fantuan").length;

  const renderReviewCard = (
    review: CustomerReview,
    keySuffix: string,
    isDuplicate = false
  ) => (
    <article
      key={`${review.id}-${keySuffix}`}
      aria-hidden={isDuplicate ? true : undefined}
      className="apple-card group flex w-[min(84vw,310px)] shrink-0 flex-col justify-between rounded-2xl border border-kraft-deep/80 bg-white p-5 shadow-xs hover:border-cinnabar/45 hover:shadow-md sm:w-[355px] sm:p-6 lg:w-[385px]"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-0.5 text-[#E59819]"
            aria-label={pick(
              `${review.rating} 星好评`,
              `${review.rating} out of 5 stars`
            )}
          >
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-current"
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-kraft/75 px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft">
            {review.source === "instagram" ? (
              <>
                <SocialIcon
                  platform="instagram"
                  className="h-3 w-3 text-cinnabar"
                />
                {pick("Instagram 评论", "Instagram")}
              </>
            ) : review.source === "tiktok" ? (
              <>
                <SocialIcon
                  platform="tiktok"
                  className="h-3 w-3 text-cinnabar"
                />
                {pick("TikTok 评论", "TikTok")}
              </>
            ) : review.source === "reddit" ? (
              <>
                <SocialIcon
                  platform="reddit"
                  className="h-3 w-3 text-cinnabar"
                />
                Reddit · r/LondonFood
              </>
            ) : review.source === "fantuan" ? (
              <>
                <SocialIcon
                  platform="fantuan"
                  className="h-3 w-3 text-cinnabar"
                />
                {pick("饭团外卖评价", "Fantuan Review")}
              </>
            ) : review.isLivePhotoCard ? (
              <>
                <Camera
                  className="h-3 w-3 text-cinnabar"
                  aria-hidden="true"
                />
                {pick("Google 地图实拍", "Google Maps Photo")}
              </>
            ) : (
              <>{pick("Google 真实评价", "Google Review")}</>
            )}
          </span>
        </div>

        {/* Embedded real customer photos directly inside the corresponding review card */}
        {review.photos && review.photos.length > 0 && (
          <ReviewCardPhotos
            photos={review.photos}
            author={review.author}
            isLivePhotoCard={review.isLivePhotoCard}
            pick={pick}
            onOpenLightbox={(photoIndex) =>
              setPreviewLightbox({
                photos: review.photos!,
                index: photoIndex,
                author: review.author,
              })
            }
          />
        )}

        <h3 className="mt-3.5 font-display text-base font-bold text-ink transition-colors group-hover:text-cinnabar">
          <a
            href={review.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={isDuplicate ? -1 : undefined}
            className="hover:underline"
          >
            {t(review.highlight)}
          </a>
        </h3>

        <blockquote
          className={`relative mt-2 text-sm leading-relaxed text-ink-muted ${
            review.photos && review.photos.length > 0
              ? "line-clamp-3"
              : "line-clamp-6"
          }`}
        >
          {!review.isLivePhotoCard && (
            <>
              <Quote
                className="mb-1 inline-block h-3.5 w-3.5 -translate-y-0.5 text-cinnabar/50"
                aria-hidden="true"
              />{" "}
            </>
          )}
          {t(review.quote)}
        </blockquote>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-kraft-deep/60 pt-3.5 text-xs">
        <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-ink">
          {review.authorAvatar && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={review.authorAvatar}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-6 w-6 shrink-0 rounded-full border border-kraft-deep object-cover"
            />
          )}
          <span className="truncate">{review.author}</span>
        </span>
        <a
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={isDuplicate ? -1 : undefined}
          className="inline-flex shrink-0 items-center gap-1 font-medium text-cinnabar hover:text-cinnabar-dark"
        >
          {review.source === "instagram"
            ? pick("打开原帖", "Instagram")
            : review.source === "tiktok"
              ? pick("看原视频", "TikTok")
              : review.source === "reddit"
                ? pick("看 Reddit", "Reddit")
                : review.source === "fantuan"
                  ? pick("去饭团看", "Fantuan")
                  : pick("Google 地图", "Google Maps")}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </article>
  );

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="scroll-mt-24 border-y border-kraft-deep/80 bg-kraft/45"
    >
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        {/* Header + Verified Google Rating Summary */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow={pick("顾客真实口碑", "What Guests Say")}
            chineseAccent="食客好评"
            title={pick(
              "Google 4.9 高分好评与社区分享",
              "4.9 on Google from Camden locals"
            )}
            description={pick(
              "以下评价与食客实拍均来自真实光临卡姆登路 124 号的顾客——悬停卡片可暂停浏览，点击实拍图可放大查看。",
              "Real reviews and guest photos from diners at 124 Camden Road. Hover to pause the live carousel, or tap any photo to zoom."
            )}
          />

          <a
            href={rating.reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-4 rounded-2xl border border-kraft-deep bg-white px-5 py-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-cinnabar/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold tabular-nums text-ink">
                  {rating.score}
                </span>
                <span
                  className="flex items-center gap-0.5 text-[#E59819]"
                  aria-hidden="true"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                <span>
                  {pick(
                    `基于 Google ${rating.count} 条真实评价`,
                    `Based on ${rating.count} Google Reviews`
                  )}
                </span>
                {rating.isLive && (
                  <span className="rounded-full bg-jade/15 px-1.5 py-0.5 text-[10px] font-semibold text-jade">
                    {pick("实时同步", "Live")}
                  </span>
                )}
              </p>
            </div>
            <ExternalLink
              className="h-4 w-4 text-ink-muted transition-colors group-hover:text-cinnabar"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* Review Source Filter + Playback Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label={pick("按平台筛选评论", "Filter reviews by source")}
            className="flex flex-wrap gap-2"
          >
            {(
              [
                {
                  key: "all",
                  label: pick(
                    `全部评价 (${reviews.length})`,
                    `All Reviews (${reviews.length})`
                  ),
                },
                {
                  key: "google",
                  label: `Google (${googleCount})`,
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
              const active = reviewFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setReviewFilter(tab.key)}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-ink text-parchment shadow-xs"
                      : "border border-kraft-deep bg-white/80 text-ink-soft hover:bg-kraft"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scroll playback controls */}
          <div className="flex items-center gap-2">
            {shouldLoop && (
              <button
                type="button"
                onClick={() => setIsUserPaused((p) => !p)}
                aria-pressed={isUserPaused}
                className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-ink-soft shadow-2xs transition-colors hover:border-cinnabar hover:text-cinnabar"
              >
                {isUserPaused ? (
                  <>
                    <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                    {pick("继续滚动", "Play")}
                  </>
                ) : (
                  <>
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade"
                      aria-hidden="true"
                    />
                    <Pause className="h-3 w-3" aria-hidden="true" />
                    {pick("滚动播放中", "Auto-scrolling")}
                  </>
                )}
              </button>
            )}

            {filteredReviews.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => stepTrack(-1)}
                  aria-label={pick("向左滚动查看上一条评价", "Scroll reviews left")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-kraft-deep bg-white text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => stepTrack(1)}
                  aria-label={pick("向右滚动查看下一条评价", "Scroll reviews right")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-kraft-deep bg-white text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Width Continuous Auto-Scrolling Review Carousel with Embedded Photos */}
      <div className="relative mx-auto mt-6 max-w-[1440px] pb-16 sm:pb-20">
        {/* Edge fade masks on wide screens */}
        {shouldLoop && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-[#f7efe0] to-transparent lg:block"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-[#f7efe0] to-transparent lg:block"
            />
          </>
        )}

        <div
          ref={trackRef}
          onMouseEnter={() => {
            isInteractingRef.current = true;
          }}
          onMouseLeave={() => {
            isInteractingRef.current = false;
          }}
          onFocusCapture={() => {
            isInteractingRef.current = true;
          }}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              isInteractingRef.current = false;
            }
          }}
          onTouchStart={() => {
            isInteractingRef.current = true;
          }}
          onTouchEnd={() => pauseBrieflyForManualAction(2200)}
          onWheel={() => pauseBrieflyForManualAction(2200)}
          className="no-scrollbar flex items-stretch gap-5 overflow-x-auto px-4 py-2 sm:px-6 lg:px-10"
        >
          {filteredReviews.map((review) => renderReviewCard(review, "a", false))}
          {shouldLoop &&
            filteredReviews.map((review) => renderReviewCard(review, "b", true))}
        </div>
      </div>

      {/* Review Photo Lightbox — Portaled to document.body so it is always centered in the viewport above Header */}
      {previewLightbox &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={pick(
              `${previewLightbox.author} 的顾客实拍照片`,
              `Review photo by ${previewLightbox.author}`
            )}
            onClick={() => setPreviewLightbox(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm sm:p-8"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90dvh] w-full max-w-3xl overflow-hidden rounded-3xl border border-parchment/15 bg-ink shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-parchment/15 px-5 py-3 text-xs font-semibold text-parchment">
                <span>
                  {pick(
                    `顾客实拍 · ${previewLightbox.author}`,
                    `Guest Photo · ${previewLightbox.author}`
                  )}
                  {previewLightbox.photos.length > 1 && (
                    <span className="ml-2 tabular-nums text-parchment/70">
                      ({previewLightbox.index + 1}/
                      {previewLightbox.photos.length})
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewLightbox(null)}
                  aria-label={pick("关闭图片预览", "Close photo preview")}
                  className="rounded-full bg-parchment/10 p-1.5 text-parchment transition-colors hover:bg-parchment/20"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="relative flex max-h-[75dvh] items-center justify-center bg-black/50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewLightbox.photos[previewLightbox.index]}
                  alt={pick(
                    `${previewLightbox.author} 分享的顾客实拍`,
                    `Guest review photo by ${previewLightbox.author}`
                  )}
                  className="max-h-[70dvh] w-auto rounded-xl object-contain"
                />

                {previewLightbox.photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewLightbox((prev) =>
                          prev
                            ? {
                                ...prev,
                                index:
                                  (prev.index - 1 + prev.photos.length) %
                                  prev.photos.length,
                              }
                            : null
                        )
                      }
                      aria-label={pick("上一张照片", "Previous photo")}
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/75 text-parchment transition-colors hover:bg-ink"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewLightbox((prev) =>
                          prev
                            ? {
                                ...prev,
                                index: (prev.index + 1) % prev.photos.length,
                              }
                            : null
                        )
                      }
                      aria-label={pick("下一张照片", "Next photo")}
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/75 text-parchment transition-colors hover:bg-ink"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Full-Bleed Edge-to-Edge Social Media Showcase Band */}
      <SocialShowcaseBand posts={posts} />
    </section>
  );
}
