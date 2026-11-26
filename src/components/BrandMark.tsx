"use client";

import Image from "next/image";
import { useSiteContent } from "@/components/SiteContentProvider";
import { useLocale } from "@/lib/i18n";

interface BrandMarkProps {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export function BrandMark({ variant = "dark", size = "md" }: BrandMarkProps) {
  const { locale, isZh, isTraditional, zhText, pick } = useLocale();
  const { store } = useSiteContent();
  const isLight = variant === "light";

  const sizeStyles = {
    sm: {
      logo: "h-9 w-9",
      logoPx: 36,
      top: isZh ? "text-[10px] tracking-[0.22em]" : "text-[11px] tracking-[0.14em]",
      chinese: "text-xl leading-none",
      seal: "px-1 py-0.5 text-[10px]",
    },
    md: {
      logo: "h-9 w-9 sm:h-12 sm:w-12",
      logoPx: 48,
      top: isZh
        ? "text-[10px] tracking-[0.18em] sm:text-[11px] sm:tracking-[0.24em]"
        : "text-[10px] tracking-[0.12em] sm:text-xs sm:tracking-[0.16em]",
      chinese: "text-xl sm:text-[26px] leading-none",
      seal: "px-1 py-0.5 text-[10px] sm:px-1.5 sm:text-[11px]",
    },
    lg: {
      logo: "h-14 w-14 sm:h-16 sm:w-16",
      logoPx: 64,
      top: isZh ? "text-xs tracking-[0.26em]" : "text-sm tracking-[0.18em]",
      chinese: "text-3xl sm:text-4xl leading-none",
      seal: "px-1.5 py-1 text-xs",
    },
  }[size];

  return (
    <span className="inline-flex items-center gap-2 sm:gap-3">
      <span
        className={`relative shrink-0 overflow-hidden rounded-full bg-black shadow-xs ${sizeStyles.logo} ${
          isLight ? "ring-1 ring-accent-bright/45" : "ring-1 ring-ink/15"
        }`}
      >
        <Image
          src="/images/logo.svg"
          alt={`${store.nameEn} (${store.nameZh}) logo`}
          width={sizeStyles.logoPx}
          height={sizeStyles.logoPx}
          priority
          className="h-full w-full object-cover"
        />
      </span>
      <span className="flex flex-col">
        <span
          className={`font-display font-semibold ${
            locale === "en" ? "uppercase" : ""
          } ${sizeStyles.top} ${
            isLight ? "text-accent-bright" : "text-cinnabar"
          }`}
        >
          {pick("正宗果蔬煎饼", store.nameEn)}
        </span>
        <span
          className={`mt-0.5 font-calligraphy ${sizeStyles.chinese} ${
            isLight ? "text-parchment" : "text-ink"
          }`}
          lang={isTraditional ? "zh-Hant" : "zh-Hans"}
        >
          {zhText(store.nameZh)}
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
        {zhText(store.sealText)}
      </span>
    </span>
  );
}
