"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { FestivalPreset } from "@/data/festivals";
import { useLocale } from "@/lib/i18n";

interface FestivalBannerProps {
  festival: FestivalPreset;
  hasFestiveDishes: boolean;
}

export function FestivalBanner({
  festival,
  hasFestiveDishes,
}: FestivalBannerProps) {
  const { pick } = useLocale();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const targetHref = hasFestiveDishes ? "/menu#festive-specials" : "/menu";

  return (
    <div
      role="region"
      aria-label={pick("节日主题公告", "Festive announcement")}
      className="relative z-40 border-b border-white/10 px-4 py-2 text-xs sm:px-6"
      style={{
        backgroundColor: festival.theme.bannerBg,
        color: festival.theme.bannerText,
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-x-3 gap-y-1 pr-7 text-center">
        <p className="font-medium leading-snug">
          {pick(festival.bannerZh, festival.bannerEn)}
        </p>
        <Link
          href={targetHref}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-current/25 px-2.5 py-0.5 text-[11px] font-bold transition-opacity hover:opacity-85"
          style={{ color: festival.theme.bannerAccent }}
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
        className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
