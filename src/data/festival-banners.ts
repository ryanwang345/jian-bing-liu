import type { FestivalPreset } from "@/data/festivals";

export const FESTIVAL_BANNER_MAX_LENGTH = 300;

export interface FestivalBannerText {
  bannerZh: string;
  bannerEn: string;
}

export type FestivalBannerOverrides = Record<string, FestivalBannerText>;

export function isValidFestivalBannerText(value: unknown): value is FestivalBannerText {
  if (!value || typeof value !== "object") return false;
  const text = value as Partial<FestivalBannerText>;
  return [text.bannerZh, text.bannerEn].every(
    (title) => typeof title === "string" && title.length <= FESTIVAL_BANNER_MAX_LENGTH
  );
}

export function resolveFestivalBanner(
  preset: FestivalPreset,
  overrides: FestivalBannerOverrides
): FestivalPreset {
  const custom = overrides[preset.id];
  return {
    ...preset,
    bannerZh: custom?.bannerZh.trim() || preset.bannerZh,
    bannerEn: custom?.bannerEn.trim() || preset.bannerEn,
  };
}
