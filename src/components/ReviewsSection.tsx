"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Quote,
  Star,
  X,
} from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { SocialIcon } from "@/components/SocialIcon";
import { SocialShowcaseBand } from "@/components/SocialShowcaseBand";
import {
  customerReviews as initialReviews,
  googleRating as initialRating,
  type CustomerReview,
  type ReviewSource,
} from "@/data/reviews";
import type { ReviewsPayload } from "@/lib/reviews-service";
import { useLocale } from "@/lib/i18n";

const REVIEWS_PER_PAGE = 4;

type ReviewFilter = "all" | ReviewSource;

interface ReviewsSectionProps {
  initialData?: ReviewsPayload;
}

export function ReviewsSection({ initialData }: ReviewsSectionProps = {}) {
  const { t, pick } = useLocale();

  const [reviews, setReviews] = useState<CustomerReview[]>(
    initialData?.reviews ?? initialReviews
  );
  const [rating, setRating] = useState(
    initialData?.rating ?? {
      ...initialRating,
      isLive: false,
    }
  );
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewPhoto, setPreviewPhoto] = useState<{
    src: string;
    author: string;
  } | null>(null);

  useEffect(() => {
    if (!previewPhoto) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewPhoto(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewPhoto]);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * REVIEWS_PER_PAGE;
  const pageReviews = filteredReviews.slice(
    startIndex,
    startIndex + REVIEWS_PER_PAGE
  );

  const googleCount = reviews.filter((r) => r.source === "google").length;
  const igCount = reviews.filter((r) => r.source === "instagram").length;
  const ttCount = reviews.filter((r) => r.source === "tiktok").length;
  const redditCount = reviews.filter((r) => r.source === "reddit").length;
  const fantuanCount = reviews.filter((r) => r.source === "fantuan").length;

  const handleReviewFilter = (next: ReviewFilter) => {
    setReviewFilter(next);
    setCurrentPage(1);
  };

  return (
    <section
      id="reviews"
      className="scroll-mt-24 border-y border-kraft-deep/80 bg-kraft/45"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
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
              "以下评价与互动均来自真实光临卡姆登路 124 号的食客——点击任意卡片可直达 Google 地图或对应社媒原帖。",
              "Real reviews and posts from people who've eaten at 124 Camden Road. Click any card to view it on Google Maps, Instagram, TikTok, Reddit, or Fantuan."
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

        {/* Review Source Filter + Count */}
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
                  onClick={() => handleReviewFilter(tab.key)}
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

          <p className="text-xs font-medium text-ink-muted">
            {pick(
              `第 ${startIndex + 1}–${Math.min(
                startIndex + REVIEWS_PER_PAGE,
                filteredReviews.length
              )} 条，共 ${filteredReviews.length} 条精选评价`,
              `Showing ${startIndex + 1}–${Math.min(
                startIndex + REVIEWS_PER_PAGE,
                filteredReviews.length
              )} of ${filteredReviews.length} featured reviews`
            )}
          </p>
        </div>

        {/* Paginated Review Cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {pageReviews.map((review) => (
            <article
              key={review.id}
              className="apple-card group flex flex-col justify-between rounded-2xl border border-kraft-deep/80 bg-white p-6 shadow-xs hover:border-cinnabar/40 hover:shadow-md"
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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-kraft/70 px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft">
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
                    ) : (
                      <>{pick("Google 真实评价", "Google Review")}</>
                    )}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-base font-bold text-ink transition-colors group-hover:text-cinnabar">
                  <a
                    href={review.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {t(review.highlight)}
                  </a>
                </h3>

                <blockquote className="relative mt-2 text-sm leading-relaxed text-ink-muted">
                  <Quote
                    className="mb-1 inline-block h-3.5 w-3.5 -translate-y-0.5 text-cinnabar/50"
                    aria-hidden="true"
                  />{" "}
                  {t(review.quote)}
                </blockquote>

                {/* Customer-uploaded review photos (when available) */}
                {review.photos && review.photos.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted">
                      <Camera className="h-3 w-3 text-cinnabar" aria-hidden="true" />
                      {pick(
                        `顾客实拍照片 (${review.photos.length})`,
                        `Guest photos (${review.photos.length})`
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {review.photos.map((photoSrc, photoIdx) => (
                        <button
                          key={`${review.id}-photo-${photoIdx}`}
                          type="button"
                          onClick={() =>
                            setPreviewPhoto({
                              src: photoSrc,
                              author: review.author,
                            })
                          }
                          aria-label={pick(
                            `放大查看 ${review.author} 的评价照片`,
                            `View review photo by ${review.author}`
                          )}
                          className="relative h-20 w-24 overflow-hidden rounded-xl border border-kraft-deep/80 bg-kraft transition-all hover:scale-[1.03] hover:border-cinnabar hover:shadow-sm"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoSrc}
                            alt={pick(
                              `${review.author} 分享的煎饼刘顾客实拍`,
                              `Review photo shared by ${review.author} at Jian Bing Liu`
                            )}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-kraft-deep/60 pt-3.5 text-xs">
                <span className="inline-flex items-center gap-2 font-semibold text-ink">
                  {review.authorAvatar && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={review.authorAvatar}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-6 w-6 rounded-full border border-kraft-deep object-cover"
                    />
                  )}
                  <span>{review.author}</span>
                </span>
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-cinnabar hover:text-cinnabar-dark"
                >
                  {review.source === "instagram"
                    ? pick("打开 Instagram 原帖", "Open Instagram Reel")
                    : review.source === "tiktok"
                      ? pick("观看 TikTok 原视频", "Watch TikTok Video")
                      : review.source === "reddit"
                        ? pick("在 Reddit 查看原帖", "Read on Reddit")
                        : review.source === "fantuan"
                          ? pick("前往饭团外卖查看", "View on Fantuan")
                          : pick("在 Google 地图查看", "View on Google Maps")}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Review Photo Lightbox */}
        {previewPhoto && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={pick(
              `${previewPhoto.author} 的顾客实拍照片`,
              `Review photo by ${previewPhoto.author}`
            )}
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm sm:p-8"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-parchment/15 bg-ink shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-parchment/15 px-5 py-3 text-xs font-semibold text-parchment">
                <span>
                  {pick(
                    `顾客实拍 · ${previewPhoto.author}`,
                    `Guest Photo · ${previewPhoto.author}`
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  aria-label={pick("关闭图片预览", "Close photo preview")}
                  className="rounded-full bg-parchment/10 p-1.5 text-parchment transition-colors hover:bg-parchment/20"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex max-h-[75vh] items-center justify-center bg-black/50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewPhoto.src}
                  alt={pick(
                    `${previewPhoto.author} 分享的顾客实拍`,
                    `Guest review photo by ${previewPhoto.author}`
                  )}
                  className="max-h-[70vh] w-auto rounded-xl object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Review Pagination Controls */}
        {totalPages > 1 && (
          <nav
            aria-label={pick("评论分页导航", "Reviews pagination")}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 rounded-full border border-kraft-deep bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {pick("上一页", "Previous")}
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (pageNum) => {
                const isCurrent = pageNum === safePage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={isCurrent ? "page" : undefined}
                    aria-label={pick(`第 ${pageNum} 页`, `Page ${pageNum}`)}
                    className={`h-9 w-9 rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-cinnabar text-parchment shadow-xs"
                        : "border border-kraft-deep bg-white text-ink-soft hover:border-cinnabar hover:text-cinnabar"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-kraft-deep bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pick("下一页", "Next")}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>

      {/* Full-Bleed Edge-to-Edge Social Media Showcase Band */}
      <SocialShowcaseBand />
    </section>
  );
}
