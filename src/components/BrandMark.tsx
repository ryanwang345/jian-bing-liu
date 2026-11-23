import { restaurant } from "@/data/restaurant";

interface BrandMarkProps {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export function BrandMark({ variant = "dark", size = "md" }: BrandMarkProps) {
  const isLight = variant === "light";

  const sizeStyles = {
    sm: {
      latin: "text-[11px] tracking-[0.14em]",
      chinese: "text-xl leading-none",
      seal: "px-1 py-0.5 text-[10px]",
    },
    md: {
      latin: "text-xs tracking-[0.16em]",
      chinese: "text-2xl sm:text-[26px] leading-none",
      seal: "px-1.5 py-0.5 text-[11px]",
    },
    lg: {
      latin: "text-sm tracking-[0.18em]",
      chinese: "text-3xl sm:text-4xl leading-none",
      seal: "px-1.5 py-1 text-xs",
    },
  }[size];

  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex flex-col">
        <span
          className={`font-display font-semibold uppercase ${sizeStyles.latin} ${
            isLight ? "text-[#F0C26E]" : "text-cinnabar"
          }`}
        >
          {restaurant.name}
        </span>
        <span
          className={`font-calligraphy ${sizeStyles.chinese} ${
            isLight ? "text-parchment" : "text-ink"
          }`}
          lang="zh-Hans"
        >
          {restaurant.chineseName}
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
        {restaurant.sealText}
      </span>
    </span>
  );
}
