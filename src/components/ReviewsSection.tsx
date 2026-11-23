"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Quote,
  Star,
} from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { SocialIcon } from "@/components/SocialIcon";
import { restaurant } from "@/data/restaurant";
import {
  customerReviews as initialReviews,
  googleRating as initialRating,
  socialPosts,
  type CustomerReview,
  type ReviewSource,
} from "@/data/reviews";
import type { ReviewsPayload } from "@/lib/reviews-service";
import { useLocale } from "@/lib/i18n";

const REVIEWS_PER_PAGE = 4;
const POSTS_PER_PAGE = 3;

type ReviewFilter = "all" | ReviewSource;
type SocialFilter =
  | "all"
  | "instagram"
  | "tiktok"
  | "threads"
  | "reddit"
  | "fantuan";

export function ReviewsSection() {
  const { locale, t } = useLocale();
  const isZh = locale === "zh";

  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews);
  const [rating, setRating] = useState({
    ...initialRating,
    isLive: false,
  });
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [socialFilter, setSocialFilter] = useState<SocialFilter>("all");
  const [socialPage, setSocialPage] = useState(1);

  useEffect(() => {
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
  }, []);

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

  const filteredPosts =
    socialFilter === "all"
      ? socialPosts
      : socialPosts.filter((post) => post.platform === socialFilter);

  const totalSocialPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  );
  const safeSocialPage = Math.min(socialPage, totalSocialPages);
  const socialStartIndex = (safeSocialPage - 1) * POSTS_PER_PAGE;
  const pagePosts = filteredPosts.slice(
    socialStartIndex,
    socialStartIndex + POSTS_PER_PAGE
  );

  const googleCount = reviews.filter((r) => r.source === "google").length;
  const igCount = reviews.filter((r) => r.source === "instagram").length;
  const ttCount = reviews.filter((r) => r.source === "tiktok").length;
  const redditCount = reviews.filter((r) => r.source === "reddit").length;
  const fantuanCount = reviews.filter((r) => r.source === "fantuan").length;

  const igPostsCount = socialPosts.filter((p) => p.platform === "instagram").length;
  const ttPostsCount = socialPosts.filter((p) => p.platform === "tiktok").length;
  const threadsPostsCount = socialPosts.filter((p) => p.platform === "threads").length;
  const redditPostsCount = socialPosts.filter((p) => p.platform === "reddit").length;
  const fantuanPostsCount = socialPosts.filter((p) => p.platform === "fantuan").length;

  const handleReviewFilter = (next: ReviewFilter) => {
    setReviewFilter(next);
    setCurrentPage(1);
  };

  const handleSocialFilter = (next: SocialFilter) => {
    setSocialFilter(next);
    setSocialPage(1);
  };

  return (
    <section
      id="reviews"
      className="scroll-mt-24 border-y border-kraft-deep/80 bg-kraft/45"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        {/* Header + Verified Google Rating Summary */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow={isZh ? "顾客真实口碑" : "Loved by Londoners"}
            chineseAccent="食客好评"
            title={
              isZh
                ? "Google 4.9 高分好评与社区分享"
                : "Rated 4.9 on Google by Camden regulars"
            }
            description={
              isZh
                ? "以下评价与互动均来自真实光临卡姆登路 124 号的食客——点击任意卡片可直达 Google 地图或对应社媒原帖。"
                : "Verified reviews and comments from guests visiting 124 Camden Road — click any review or post to open it directly on Google Maps, Instagram, TikTok, or Threads."
            }
          />

          <a
            href={rating.reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-4 rounded-2xl border border-kraft-deep bg-white px-5 py-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-cinnabar/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-ink">
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
                  {isZh
                    ? `基于 Google ${rating.count} 条真实评价`
                    : `Based on ${rating.count} Google Reviews`}
                </span>
                {rating.isLive && (
                  <span className="rounded-full bg-jade/15 px-1.5 py-0.5 text-[10px] font-semibold text-jade">
                    {isZh ? "实时同步" : "Live"}
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
            aria-label={isZh ? "按平台筛选评论" : "Filter reviews by source"}
            className="flex flex-wrap gap-2"
          >
            {(
              [
                {
                  key: "all",
                  label: isZh
                    ? `全部评价 (${reviews.length})`
                    : `All Reviews (${reviews.length})`,
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
                  label: isZh
                    ? `饭团 (${fantuanCount})`
                    : `Fantuan (${fantuanCount})`,
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
            {isZh
              ? `第 ${startIndex + 1}–${Math.min(
                  startIndex + REVIEWS_PER_PAGE,
                  filteredReviews.length
                )} 条，共 ${filteredReviews.length} 条精选评价`
              : `Showing ${startIndex + 1}–${Math.min(
                  startIndex + REVIEWS_PER_PAGE,
                  filteredReviews.length
                )} of ${filteredReviews.length} featured reviews`}
          </p>
        </div>

        {/* Paginated Review Cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {pageReviews.map((review) => (
            <a
              key={review.id}
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-2xl border border-kraft-deep/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-cinnabar/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex items-center gap-0.5 text-[#E59819]"
                    aria-label={
                      isZh
                        ? `${review.rating} 星好评`
                        : `${review.rating} out of 5 stars`
                    }
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
                        {isZh ? "Instagram 评论" : "Instagram"}
                      </>
                    ) : review.source === "tiktok" ? (
                      <>
                        <SocialIcon
                          platform="tiktok"
                          className="h-3 w-3 text-cinnabar"
                        />
                        {isZh ? "TikTok 评论" : "TikTok"}
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
                        {isZh ? "饭团外卖评价" : "Fantuan Review"}
                      </>
                    ) : (
                      <>{isZh ? "Google 真实评价" : "Google Review"}</>
                    )}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-base font-bold text-ink transition-colors group-hover:text-cinnabar">
                  {t(review.highlight)}
                </h3>

                <blockquote className="relative mt-2 text-sm leading-relaxed text-ink-muted">
                  <Quote
                    className="mb-1 inline-block h-3.5 w-3.5 -translate-y-0.5 text-cinnabar/50"
                    aria-hidden="true"
                  />{" "}
                  {t(review.quote)}
                </blockquote>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-kraft-deep/60 pt-3.5 text-xs">
                <span className="font-semibold text-ink">{review.author}</span>
                <span className="inline-flex items-center gap-1 font-medium text-cinnabar group-hover:text-cinnabar-dark">
                  {review.source === "instagram"
                    ? isZh
                      ? "打开 Instagram 原帖"
                      : "Open Instagram Reel"
                    : review.source === "tiktok"
                      ? isZh
                        ? "观看 TikTok 原视频"
                        : "Watch TikTok Video"
                      : review.source === "reddit"
                        ? isZh
                          ? "在 Reddit 查看原帖"
                          : "Read on Reddit"
                        : review.source === "fantuan"
                          ? isZh
                            ? "前往饭团外卖查看"
                            : "View on Fantuan"
                          : isZh
                            ? "在 Google 地图查看"
                            : "View on Google Maps"}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Review Pagination Controls */}
        {totalPages > 1 && (
          <nav
            aria-label={isZh ? "评论分页导航" : "Reviews pagination"}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 rounded-full border border-kraft-deep bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {isZh ? "上一页" : "Previous"}
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
                    aria-label={
                      isZh ? `第 ${pageNum} 页` : `Page ${pageNum}`
                    }
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
              {isZh ? "下一页" : "Next"}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </nav>
        )}

        {/* Direct-Linked Instagram, TikTok & Threads Posts (Paginated) */}
        <div className="mt-16 border-t border-kraft-deep/80 pt-14">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h3 className="font-display text-2xl font-bold text-ink">
                {isZh
                  ? "精选社媒、Reddit 讨论与饭团外卖"
                  : "Featured Posts on Instagram, TikTok, Threads, Reddit & Fantuan"}
              </h3>
              <p className="mt-1 text-sm text-ink-muted">
                {isZh
                  ? "TikTok 1,190+ 粉丝 · Reddit r/LondonFood 强推 · 饭团 4.5 ★ · 点击直达原帖或门店"
                  : "1,190+ TikTok followers · r/LondonFood favourite · 4.5 ★ on Fantuan · Click any card to open directly"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {restaurant.verifiedSocialLinks
                .filter((s) => s.platform !== "google-maps")
                .map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
                  >
                    <SocialIcon
                      platform={social.platform}
                      className="h-3.5 w-3.5 text-cinnabar"
                    />
                    {t(social.label)}
                    <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                  </a>
                ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label={isZh ? "按社媒平台筛选帖子" : "Filter posts by platform"}
              className="flex flex-wrap gap-2"
            >
              {(
                [
                  {
                    key: "all",
                    label: isZh
                      ? `全部动态 (${socialPosts.length})`
                      : `All Posts (${socialPosts.length})`,
                  },
                  {
                    key: "instagram",
                    label: `Instagram (${igPostsCount})`,
                  },
                  {
                    key: "tiktok",
                    label: `TikTok (${ttPostsCount})`,
                  },
                  {
                    key: "threads",
                    label: `Threads (${threadsPostsCount})`,
                  },
                  {
                    key: "reddit",
                    label: `Reddit (${redditPostsCount})`,
                  },
                  {
                    key: "fantuan",
                    label: isZh
                      ? `饭团 (${fantuanPostsCount})`
                      : `Fantuan (${fantuanPostsCount})`,
                  },
                ] as const
              ).map((tab) => {
                const active = socialFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleSocialFilter(tab.key)}
                    aria-pressed={active}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "bg-cinnabar text-parchment shadow-xs"
                        : "border border-kraft-deep bg-white/80 text-ink-soft hover:bg-kraft"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-medium text-ink-muted">
              {isZh
                ? `第 ${socialStartIndex + 1}–${Math.min(
                    socialStartIndex + POSTS_PER_PAGE,
                    filteredPosts.length
                  )} 条，共 ${filteredPosts.length} 条精选动态`
                : `Showing ${socialStartIndex + 1}–${Math.min(
                    socialStartIndex + POSTS_PER_PAGE,
                    filteredPosts.length
                  )} of ${filteredPosts.length} posts`}
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {pagePosts.map((post) => (
              <a
                key={post.id}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-cinnabar/40 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-kraft">
                  <Image
                    src={post.image}
                    alt={t(post.imageAlt)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-parchment backdrop-blur-xs">
                    <SocialIcon
                      platform={post.platform}
                      className="h-3.5 w-3.5 text-[#F0C26E]"
                    />
                    {t(post.postType)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-xs font-semibold text-cinnabar">
                      {post.handle}
                    </p>
                    <h4 className="mt-1.5 font-display text-base font-bold text-ink transition-colors group-hover:text-cinnabar">
                      {t(post.title)}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {t(post.caption)}
                    </p>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-cinnabar">
                    {post.platform === "tiktok"
                      ? isZh
                        ? "打开 TikTok 原视频"
                        : "Watch TikTok Video"
                      : post.platform === "instagram"
                        ? isZh
                          ? "打开 Instagram 原帖"
                          : "Open Instagram Post"
                        : post.platform === "reddit"
                          ? isZh
                            ? "在 Reddit 查看讨论"
                            : "Open Reddit Thread"
                          : post.platform === "fantuan"
                            ? isZh
                              ? "前往饭团外卖下单"
                              : "Order on Fantuan"
                            : isZh
                              ? "打开 Threads 原帖"
                              : "Open Threads Post"}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
          </div>

          {totalSocialPages > 1 && (
            <nav
              aria-label={isZh ? "社媒动态分页导航" : "Social posts pagination"}
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                type="button"
                onClick={() => setSocialPage((p) => Math.max(1, p - 1))}
                disabled={safeSocialPage === 1}
                className="inline-flex items-center gap-1 rounded-full border border-kraft-deep bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                {isZh ? "上一页" : "Previous"}
              </button>

              {Array.from({ length: totalSocialPages }, (_, idx) => idx + 1).map(
                (pageNum) => {
                  const isCurrent = pageNum === safeSocialPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setSocialPage(pageNum)}
                      aria-current={isCurrent ? "page" : undefined}
                      aria-label={
                        isZh ? `动态第 ${pageNum} 页` : `Posts page ${pageNum}`
                      }
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
                onClick={() =>
                  setSocialPage((p) => Math.min(totalSocialPages, p + 1))
                }
                disabled={safeSocialPage === totalSocialPages}
                className="inline-flex items-center gap-1 rounded-full border border-kraft-deep bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isZh ? "下一页" : "Next"}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
}
