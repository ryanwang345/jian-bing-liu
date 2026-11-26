"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";
import type { FestivalPreset } from "@/data/festivals";
import { useLocale } from "@/lib/i18n";

interface FestivalBannerProps {
  festival: FestivalPreset;
  hasFestiveDishes: boolean;
}

function splitLeadingEmoji(text: string): { emoji: string | null; rest: string } {
  const trimmed = text.trim();
  const match = trimmed.match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s*/u);
  if (!match) return { emoji: null, rest: trimmed };
  return { emoji: match[1], rest: trimmed.slice(match[0].length) };
}

export function FestivalBanner({
  festival,
  hasFestiveDishes,
}: FestivalBannerProps) {
  const { pick } = useLocale();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const targetHref = hasFestiveDishes ? "/menu#festive-specials" : "/menu";
  const rawMessage = pick(festival.bannerZh, festival.bannerEn);
  const { emoji: msgEmoji, rest: messageBody } = splitLeadingEmoji(rawMessage);
  const fallbackEmoji = splitLeadingEmoji(festival.zh).emoji;
  const badgeEmoji = msgEmoji || fallbackEmoji;

  return (
    <div
      role="region"
      aria-label={pick("节日主题公告", "Festive announcement")}
      className="relative z-40 overflow-hidden px-4 py-2.5 text-xs sm:px-6 sm:py-3 sm:text-[13px]"
      style={{
        backgroundImage: `linear-gradient(105deg, ${festival.theme.bannerBg} 0%, ${festival.theme.bannerBgEnd} 55%, ${festival.theme.bannerBg} 100%)`,
        color: festival.theme.bannerText,
      }}
    >
      {/* Subtle festive lattice pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(${festival.theme.bannerAccent} 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      />

      {/* Animated celebratory shimmer sweep */}
      <div
        aria-hidden="true"
        className="festival-banner-shimmer pointer-events-none absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-transparent via-white/18 to-transparent"
      />

      {/* Luminous bottom holiday hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent 0%, ${festival.theme.bannerAccent} 25%, #ffffff 50%, ${festival.theme.bannerAccent} 75%, transparent 100%)`,
          opacity: 0.75,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pr-7 text-center">
        <span
          aria-hidden="true"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm shadow-xs ring-1 ring-white/25 backdrop-blur-xs"
        >
          {badgeEmoji ?? (
            <Sparkles
              className="h-3.5 w-3.5"
              style={{ color: festival.theme.bannerAccent }}
            />
          )}
        </span>

        <p className="font-semibold tracking-[0.01em] leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
          {messageBody || rawMessage}
        </p>

        <Link
          href={targetHref}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold text-[#1a1614] shadow-[0_2px_10px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-105 active:scale-95"
          style={{
            backgroundColor: festival.theme.bannerAccent,
          }}
        >
          <span>
            {hasFestiveDishes
              ? pick("看节日限定", "Festive Menu")
              : pick("浏览菜单", "View Menu")}
          </span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={pick("关闭节日横幅", "Dismiss festive banner")}
        className="absolute top-1/2 right-2.5 z-10 -translate-y-1/2 rounded-full p-1.5 opacity-75 transition-all hover:bg-white/15 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
