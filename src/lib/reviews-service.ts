import {
  customerReviews as fallbackReviews,
  GOOGLE_MAPS_PLACE_URL,
  googleRating as fallbackRating,
  type CustomerReview,
} from "@/data/reviews";

export interface ReviewsPayload {
  rating: {
    score: string;
    count: number;
    reviewsUrl: string;
    isLive: boolean;
  };
  reviews: CustomerReview[];
  sources: {
    googlePlacesConfigured: boolean;
    customFeedConfigured: boolean;
  };
  updatedAt: string;
}

interface GooglePlaceReview {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
  };
  publishTime?: string;
  googleMapsUri?: string;
}

interface GooglePlaceDetailsResponse {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GooglePlaceReview[];
}

interface GoogleTextSearchResponse {
  places?: Array<{ id?: string }>;
}

const DEFAULT_MIN_RATING = 4;
const CACHE_REVALIDATE_SECONDS = 3600; // 1 hour
const CACHE_TTL_MS = CACHE_REVALIDATE_SECONDS * 1000;
const FETCH_TIMEOUT_MS = 3500;

let cachedPlaceId: string | null = null;
let memoryCache: { payload: ReviewsPayload; expiresAt: number } | null = null;
let inFlightRefresh: Promise<ReviewsPayload> | null = null;

async function resolveGooglePlaceId(apiKey: string): Promise<string | null> {
  if (process.env.GOOGLE_PLACE_ID?.trim()) {
    return process.env.GOOGLE_PLACE_ID.trim();
  }
  if (cachedPlaceId) {
    return cachedPlaceId;
  }

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({
        textQuery: "Jian Bing Liu 124 Camden Rd London NW1 9EE",
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: 86400 },
    }
  );

  if (!res.ok) return null;
  const data = (await res.json()) as GoogleTextSearchResponse;
  const placeId = data.places?.[0]?.id?.trim() || null;
  if (placeId) {
    cachedPlaceId = placeId;
  }
  return placeId;
}

async function fetchGooglePlacesReviews(): Promise<{
  rating?: { score: string; count: number; reviewsUrl: string };
  reviews: CustomerReview[];
} | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const placeId = await resolveGooglePlaceId(apiKey);
    if (!placeId) return null;

    const fieldMask = [
      "rating",
      "userRatingCount",
      "googleMapsUri",
      "reviews.name",
      "reviews.rating",
      "reviews.text",
      "reviews.originalText",
      "reviews.authorAttribution",
      "reviews.relativePublishTimeDescription",
      "reviews.publishTime",
      "reviews.googleMapsUri",
    ].join(",");

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask,
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        next: { revalidate: CACHE_REVALIDATE_SECONDS },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as GooglePlaceDetailsResponse;
    const placeUrl = data.googleMapsUri || GOOGLE_MAPS_PLACE_URL;
    const minRating = Number(
      process.env.REVIEWS_MIN_RATING || DEFAULT_MIN_RATING
    );

    const liveReviews: CustomerReview[] = (data.reviews || [])
      .filter((r) => {
        const text = (r.text?.text || r.originalText?.text || "").trim();
        return (r.rating ?? 0) >= minRating && text.length >= 12;
      })
      .map((r, index) => {
        const author =
          r.authorAttribution?.displayName?.trim() || "Google Reviewer";
        const rawText = (r.text?.text || r.originalText?.text || "").trim();
        const relativeTime = r.relativePublishTimeDescription?.trim();
        const safeRating = Math.min(5, Math.max(4, Math.round(r.rating ?? 5))) as
          | 4
          | 5;

        return {
          id: `google-live-${r.publishTime || index}-${author
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}`,
          author,
          rating: safeRating,
          source: "google",
          url: r.googleMapsUri || r.authorAttribution?.uri || placeUrl,
          publishedLabel: relativeTime
            ? { en: relativeTime, zh: relativeTime }
            : undefined,
          highlight: {
            en: relativeTime
              ? `Verified Google Review · ${relativeTime}`
              : "Verified Google Review",
            zh: relativeTime
              ? `Google 最新真实好评 · ${relativeTime}`
              : "Google 最新真实好评",
          },
          quote: {
            en: rawText,
            zh: rawText,
          },
        };
      });

    return {
      rating:
        typeof data.rating === "number" &&
        typeof data.userRatingCount === "number"
          ? {
              score: data.rating.toFixed(1),
              count: data.userRatingCount,
              reviewsUrl: placeUrl,
            }
          : undefined,
      reviews: liveReviews,
    };
  } catch {
    return null;
  }
}

async function fetchCustomFeedReviews(): Promise<CustomerReview[]> {
  const feedUrl = process.env.REVIEWS_FEED_URL?.trim();
  if (!feedUrl) return [];

  try {
    const res = await fetch(feedUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: CACHE_REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as unknown;
    const rawList = Array.isArray(json)
      ? json
      : Array.isArray((json as { reviews?: unknown[] })?.reviews)
        ? (json as { reviews: unknown[] }).reviews
        : [];

    const valid: CustomerReview[] = [];
    for (const entry of rawList) {
      if (!entry || typeof entry !== "object") continue;
      const item = entry as Partial<CustomerReview>;
      if (
        typeof item.id === "string" &&
        typeof item.author === "string" &&
        typeof item.url === "string" &&
        item.quote?.en &&
        (item.rating ?? 5) >= DEFAULT_MIN_RATING
      ) {
        const source =
          item.source === "instagram" ||
          item.source === "tiktok" ||
          item.source === "reddit" ||
          item.source === "fantuan"
            ? item.source
            : "google";
        valid.push({
          id: item.id,
          author: item.author,
          rating: item.rating === 4 ? 4 : 5,
          source,
          url: item.url,
          publishedLabel: item.publishedLabel,
          highlight: item.highlight || {
            en: "Customer Review",
            zh: "食客真实评价",
          },
          quote: {
            en: item.quote.en,
            zh: item.quote.zh || item.quote.en,
          },
        });
      }
    }
    return valid;
  } catch {
    return [];
  }
}

function deduplicateReviews(lists: CustomerReview[][]): CustomerReview[] {
  const seenKeys = new Set<string>();
  const seenSnippets = new Set<string>();
  const merged: CustomerReview[] = [];

  for (const list of lists) {
    for (const review of list) {
      const authorKey = review.author.trim().toLowerCase();
      const snippetKey = review.quote.en
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "")
        .slice(0, 48);
      const compositeKey = `${review.source}:${authorKey}:${snippetKey}`;

      if (
        seenKeys.has(compositeKey) ||
        (snippetKey && seenSnippets.has(snippetKey))
      ) {
        continue;
      }
      seenKeys.add(compositeKey);
      if (snippetKey) seenSnippets.add(snippetKey);
      merged.push(review);
    }
  }

  return merged;
}

async function computeDynamicReviews(): Promise<ReviewsPayload> {
  const [googleData, customFeed] = await Promise.all([
    fetchGooglePlacesReviews(),
    fetchCustomFeedReviews(),
  ]);

  const mergedReviews = deduplicateReviews([
    googleData?.reviews || [],
    customFeed,
    fallbackReviews,
  ]);

  const payload: ReviewsPayload = {
    rating: {
      score: googleData?.rating?.score || fallbackRating.score,
      count: googleData?.rating?.count || fallbackRating.count,
      reviewsUrl: googleData?.rating?.reviewsUrl || fallbackRating.reviewsUrl,
      isLive: Boolean(googleData?.rating || googleData?.reviews.length),
    },
    reviews: mergedReviews,
    sources: {
      googlePlacesConfigured: Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim()),
      customFeedConfigured: Boolean(process.env.REVIEWS_FEED_URL?.trim()),
    },
    updatedAt: new Date().toISOString(),
  };

  memoryCache = {
    payload,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
  return payload;
}

export async function getDynamicReviews(): Promise<ReviewsPayload> {
  const now = Date.now();

  // Fast path: fresh in-memory cache (< 0.1ms)
  if (memoryCache && now < memoryCache.expiresAt) {
    return memoryCache.payload;
  }

  // Stale-while-revalidate: serve stale immediately while refreshing in background
  if (memoryCache) {
    if (!inFlightRefresh) {
      inFlightRefresh = computeDynamicReviews().finally(() => {
        inFlightRefresh = null;
      });
    }
    return memoryCache.payload;
  }

  // Cold boot: coalesce concurrent requests into one upstream fetch
  if (!inFlightRefresh) {
    inFlightRefresh = computeDynamicReviews().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}
