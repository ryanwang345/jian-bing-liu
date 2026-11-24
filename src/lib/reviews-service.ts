import {
  customerReviews as fallbackReviews,
  GOOGLE_MAPS_PLACE_URL,
  googleRating as fallbackRating,
  type CustomerReview,
} from "@/data/reviews";
import { getRuntimeEnv } from "@/lib/runtime-env";

export interface LiveGooglePhoto {
  id: string;
  src: string;
  author: string;
  authorUrl?: string;
  authorAvatar?: string;
}

export interface ReviewsPayload {
  rating: {
    score: string;
    count: number;
    reviewsUrl: string;
    isLive: boolean;
  };
  reviews: CustomerReview[];
  googlePhotos: LiveGooglePhoto[];
  sources: {
    googlePlacesConfigured: boolean;
    customFeedConfigured: boolean;
    googleStatus: "ok" | "missing_key" | "place_not_found" | "api_error";
  };
  updatedAt: string;
}

interface GoogleAuthorAttribution {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

interface GooglePlaceReview {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  authorAttribution?: GoogleAuthorAttribution;
  publishTime?: string;
  googleMapsUri?: string;
}

interface GooglePlacePhoto {
  name?: string;
  authorAttributions?: GoogleAuthorAttribution[];
}

interface GooglePlaceDetailsResponse {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GooglePlaceReview[];
  photos?: GooglePlacePhoto[];
}

interface GoogleTextSearchResponse {
  places?: Array<{ id?: string }>;
}

const DEFAULT_MIN_RATING = 4;
const CACHE_REVALIDATE_SECONDS = 3600; // 1 hour
const CACHE_TTL_MS = CACHE_REVALIDATE_SECONDS * 1000;
const FETCH_TIMEOUT_MS = 2200;

let cachedPlaceId: string | null = null;
let memoryCache: { payload: ReviewsPayload; expiresAt: number } | null = null;
let inFlightRefresh: Promise<ReviewsPayload> | null = null;

async function resolveGooglePlaceId(apiKey: string): Promise<string | null> {
  const configuredPlaceId = await getRuntimeEnv("GOOGLE_PLACE_ID");
  if (configuredPlaceId) {
    return configuredPlaceId;
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

function normalizeGoogleAvatarUri(uri?: string): string | undefined {
  const trimmed = uri?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  return undefined;
}

function isShopOwnerAuthor(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    !normalized ||
    normalized === "google maps guest" ||
    normalized.includes("jian bing liu") ||
    normalized.includes("jianbingliu") ||
    normalized.includes("煎饼刘") ||
    normalized.includes("煎餅劉")
  );
}

function interleaveReviews(
  primary: CustomerReview[],
  secondary: CustomerReview[]
): CustomerReview[] {
  const result: CustomerReview[] = [];
  const maxLen = Math.max(primary.length, secondary.length);
  for (let i = 0; i < maxLen; i += 1) {
    if (i < primary.length) result.push(primary[i]);
    if (i < secondary.length) result.push(secondary[i]);
  }
  return result;
}

async function fetchGooglePlacesReviews(): Promise<{
  status: "ok" | "missing_key" | "place_not_found" | "api_error";
  rating?: { score: string; count: number; reviewsUrl: string };
  reviews: CustomerReview[];
  photoReviews: CustomerReview[];
  photosByAuthor: Map<string, string[]>;
  photos: LiveGooglePhoto[];
}> {
  const apiKey = await getRuntimeEnv("GOOGLE_PLACES_API_KEY");
  if (!apiKey) {
    return {
      status: "missing_key",
      reviews: [],
      photoReviews: [],
      photosByAuthor: new Map(),
      photos: [],
    };
  }

  try {
    const placeId = await resolveGooglePlaceId(apiKey);
    if (!placeId) {
      return {
        status: "place_not_found",
        reviews: [],
        photoReviews: [],
        photosByAuthor: new Map(),
        photos: [],
      };
    }

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
      "photos.name",
      "photos.authorAttributions",
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
      return {
        status: "api_error",
        reviews: [],
        photoReviews: [],
        photosByAuthor: new Map(),
        photos: [],
      };
    }

    const data = (await res.json()) as GooglePlaceDetailsResponse;
    const placeUrl = data.googleMapsUri || GOOGLE_MAPS_PLACE_URL;
    const minRatingRaw = await getRuntimeEnv("REVIEWS_MIN_RATING");
    const minRating = Number(minRatingRaw || DEFAULT_MIN_RATING);

    // Index Google Maps photos by reviewer attribution so photos attach directly to matching review cards
    const photosByAuthor = new Map<string, string[]>();
    const livePhotos: LiveGooglePhoto[] = [];
    const guestGroups = new Map<
      string,
      {
        author: string;
        authorUrl: string;
        authorAvatar?: string;
        keys: string[];
        photos: string[];
      }
    >();

    for (const [idx, photo] of (data.photos || []).slice(0, 10).entries()) {
      const photoName = photo.name?.trim();
      if (!photoName) continue;
      const proxiedUrl = `/api/place-photo?name=${encodeURIComponent(photoName)}&w=720`;
      const primaryAttr = photo.authorAttributions?.[0];
      const authorName = primaryAttr?.displayName?.trim() || "Google Maps Guest";
      const authorUrl = primaryAttr?.uri?.trim() || placeUrl;
      const authorAvatar = normalizeGoogleAvatarUri(primaryAttr?.photoUri);

      livePhotos.push({
        id: `gphoto-${idx}-${photoName.slice(-10)}`,
        src: proxiedUrl,
        author: authorName,
        authorUrl,
        authorAvatar,
      });

      const attrKeys: string[] = [];
      for (const attr of photo.authorAttributions || []) {
        const keys = [
          attr.uri?.trim().toLowerCase(),
          attr.displayName?.trim().toLowerCase(),
        ].filter((k): k is string => Boolean(k));

        for (const key of keys) {
          if (!attrKeys.includes(key)) attrKeys.push(key);
          const existing = photosByAuthor.get(key) || [];
          if (!existing.includes(proxiedUrl) && existing.length < 4) {
            existing.push(proxiedUrl);
            photosByAuthor.set(key, existing);
          }
        }
      }

      // Group real customer photos (excluding shop owner uploads) by author for live photo cards
      if (!isShopOwnerAuthor(authorName)) {
        const groupKey =
          primaryAttr?.uri?.trim().toLowerCase() || authorName.toLowerCase();
        const existingGroup = guestGroups.get(groupKey);
        if (existingGroup) {
          if (
            !existingGroup.photos.includes(proxiedUrl) &&
            existingGroup.photos.length < 4
          ) {
            existingGroup.photos.push(proxiedUrl);
          }
        } else {
          guestGroups.set(groupKey, {
            author: authorName,
            authorUrl,
            authorAvatar,
            keys: attrKeys.length > 0 ? attrKeys : [groupKey],
            photos: [proxiedUrl],
          });
        }
      }
    }

    const matchedPhotoAuthorKeys = new Set<string>();

    const liveReviews: CustomerReview[] = (data.reviews || [])
      .filter((r) => {
        const text = (r.text?.text || r.originalText?.text || "").trim();
        return (r.rating ?? 0) >= minRating && text.length >= 12;
      })
      .map((r, index) => {
        const author =
          r.authorAttribution?.displayName?.trim() || "Google Reviewer";
        const authorUri = r.authorAttribution?.uri?.trim().toLowerCase();
        const authorNameKey = author.toLowerCase();
        const matchedPhotos =
          (authorUri && photosByAuthor.get(authorUri)) ||
          photosByAuthor.get(authorNameKey) ||
          undefined;

        if (matchedPhotos && matchedPhotos.length > 0) {
          if (authorUri) matchedPhotoAuthorKeys.add(authorUri);
          matchedPhotoAuthorKeys.add(authorNameKey);
        }

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
          authorAvatar: normalizeGoogleAvatarUri(r.authorAttribution?.photoUri),
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
          photos:
            matchedPhotos && matchedPhotos.length > 0
              ? matchedPhotos
              : undefined,
        };
      });

    // Also record fallback Google reviewers that match any live Google photo by author name
    for (const fb of fallbackReviews) {
      if (fb.source !== "google") continue;
      const key = fb.author.trim().toLowerCase();
      if (photosByAuthor.has(key)) {
        matchedPhotoAuthorKeys.add(key);
      }
    }

    // Any remaining live Google Maps customer photos (whose author isn't among the 5 Places API text reviews)
    // become verified Google Maps Guest Photo cards embedded directly in the reviews carousel
    const photoReviews: CustomerReview[] = [];
    let photoIdx = 0;
    for (const group of guestGroups.values()) {
      const alreadyAttached = group.keys.some((k) =>
        matchedPhotoAuthorKeys.has(k)
      );
      if (alreadyAttached) continue;

      const count = group.photos.length;
      const slug =
        group.author
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `guest-${photoIdx}`;

      photoReviews.push({
        id: `google-photo-${photoIdx}-${slug}`,
        author: group.author,
        authorAvatar: group.authorAvatar,
        rating: 5,
        source: "google",
        url: group.authorUrl || placeUrl,
        isLivePhotoCard: true,
        highlight: {
          en:
            count > 1
              ? `${count} Live Guest Photos on Google Maps`
              : "Live Guest Photo on Google Maps",
          zh:
            count > 1
              ? `Google 地图食客实拍 (${count} 张)`
              : "Google 地图食客实拍打卡",
        },
        quote: {
          en: `Real dish & counter photo shared by ${group.author} on Google Maps for Jian Bing Liu at 124 Camden Road.`,
          zh: `来自食客 ${group.author} 在 Google 地图上传的卡姆登煎饼刘真实实拍。`,
        },
        photos: group.photos,
      });
      photoIdx += 1;
    }

    return {
      status: "ok",
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
      photoReviews,
      photosByAuthor,
      photos: livePhotos,
    };
  } catch {
    return {
      status: "api_error",
      reviews: [],
      photoReviews: [],
      photosByAuthor: new Map(),
      photos: [],
    };
  }
}

async function fetchCustomFeedReviews(): Promise<CustomerReview[]> {
  const feedUrl = await getRuntimeEnv("REVIEWS_FEED_URL");
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
        const safePhotos = Array.isArray(item.photos)
          ? item.photos
              .filter(
                (p): p is string =>
                  typeof p === "string" &&
                  (p.startsWith("https://") || p.startsWith("/"))
              )
              .slice(0, 4)
          : undefined;
        valid.push({
          id: item.id,
          author: item.author,
          authorAvatar:
            typeof item.authorAvatar === "string" &&
            item.authorAvatar.startsWith("https://")
              ? item.authorAvatar
              : undefined,
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
          photos: safePhotos && safePhotos.length > 0 ? safePhotos : undefined,
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
      if (review.isLivePhotoCard) {
        const photoKey = `photo:${review.source}:${authorKey}`;
        if (seenKeys.has(photoKey)) continue;
        seenKeys.add(photoKey);
        merged.push(review);
        continue;
      }

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
  const [googleData, customFeed, feedUrl] = await Promise.all([
    fetchGooglePlacesReviews(),
    fetchCustomFeedReviews(),
    getRuntimeEnv("REVIEWS_FEED_URL"),
  ]);

  const enrichedFallbackReviews = fallbackReviews.map((review) => {
    if (review.source !== "google" || (review.photos && review.photos.length > 0)) {
      return review;
    }
    const matched = googleData.photosByAuthor.get(
      review.author.trim().toLowerCase()
    );
    return matched && matched.length > 0
      ? { ...review, photos: matched }
      : review;
  });

  const liveStream = interleaveReviews(
    googleData.reviews,
    googleData.photoReviews
  );

  const mergedReviews = deduplicateReviews([
    liveStream,
    customFeed,
    enrichedFallbackReviews,
  ]);

  const payload: ReviewsPayload = {
    rating: {
      score: googleData.rating?.score || fallbackRating.score,
      count: googleData.rating?.count || fallbackRating.count,
      reviewsUrl: googleData.rating?.reviewsUrl || fallbackRating.reviewsUrl,
      isLive: Boolean(
        googleData.rating ||
          googleData.reviews.length > 0 ||
          googleData.photos.length > 0
      ),
    },
    reviews: mergedReviews,
    googlePhotos: googleData.photos,
    sources: {
      googlePlacesConfigured: googleData.status !== "missing_key",
      customFeedConfigured: Boolean(feedUrl),
      googleStatus: googleData.status,
    },
    updatedAt: new Date().toISOString(),
  };

  // Only cache for the full 1h TTL when live data succeeded or no key is configured;
  // cache transient API errors briefly (2 minutes) so recovery is quick.
  const ttl =
    googleData.status === "api_error" || googleData.status === "place_not_found"
      ? 120_000
      : CACHE_TTL_MS;

  memoryCache = {
    payload,
    expiresAt: Date.now() + ttl,
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

/**
 * Slim SSR payload for HomePage: strips static fallback reviews from the RSC wire payload
 * (ReviewsSection already bundles fallbackReviews on the client), cutting ~20 KB off every HTML response.
 */
export async function getInitialReviewsForSsr(): Promise<ReviewsPayload> {
  const full = await getDynamicReviews();
  const liveOnlyReviews = full.reviews.filter(
    (r) =>
      r.id.startsWith("google-live-") ||
      r.id.startsWith("google-photo-") ||
      Boolean(r.photos && r.photos.length > 0)
  );
  return {
    ...full,
    reviews: liveOnlyReviews,
  };
}
