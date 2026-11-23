"use client";

import { restaurant } from "@/data/restaurant";
import { useLocale } from "@/lib/i18n";

interface BrandMarkProps {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export function BrandMark({ variant = "dark", size = "md" }: BrandMarkProps) {
  const { locale, isZh, isTraditional, zhText, pick } = useLocale();
  const isLight = variant === "light";

  const sizeStyles = {
    sm: {
      top: isZh ? "text-[10px] tracking-[0.22em]" : "text-[11px] tracking-[0.14em]",
      chinese: "text-xl leading-none",
      seal: "px-1 py-0.5 text-[10px]",
    },
    md: {
      top: isZh ? "text-[11px] tracking-[0.24em]" : "text-xs tracking-[0.16em]",
      chinese: "text-2xl sm:text-[26px] leading-none",
      seal: "px-1.5 py-0.5 text-[11px]",
    },
    lg: {
      top: isZh ? "text-xs tracking-[0.26em]" : "text-sm tracking-[0.18em]",
      chinese: "text-3xl sm:text-4xl leading-none",
      seal: "px-1.5 py-1 text-xs",
    },
  }[size];

  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex flex-col">
        <span
          className={`font-display font-semibold ${
            locale === "en" ? "uppercase" : ""
          } ${sizeStyles.top} ${
            isLight ? "text-[#F0C26E]" : "text-cinnabar"
          }`}
        >
          {pick("正宗果蔬煎饼", restaurant.name)}
        </span>
        <span
          className={`mt-0.5 font-calligraphy ${sizeStyles.chinese} ${
            isLight ? "text-parchment" : "text-ink"
          }`}
          lang={isTraditional ? "zh-Hant" : "zh-Hans"}
        >
          {zhText(restaurant.chineseName)}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`inline-flex flex-col items-center justify-center rounded-[5px] border font-calligraphy leading-tight ${sizeStyles.seal} ${
          isLight
            ? "border-[#E04D42] bg-cinnabar text-parchment"
            : "border-cinnabar bg-cinnabar text-parchment"
        } shadow-xs`}
        style={{ writingMode: "vertical-rl" }}
      >
        {zhText(restaurant.sealText)}
      </span>
    </span>
  );
}
