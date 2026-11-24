"use client";

import { useLocale } from "@/lib/i18n";

interface SectionHeadingProps {
  eyebrow: string;
  chineseAccent?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  chineseAccent,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const { isTraditional, zhText } = useLocale();
  const isCenter = align === "center";

  return (
    <div className={isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-dragonfruit/20 bg-white/90 px-3.5 py-1 text-xs font-bold tracking-[0.06em] text-cinnabar shadow-2xs ${
          isCenter ? "justify-center" : ""
        }`}
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-gradient-to-tr from-dragonfruit via-cinnabar to-yolk"
        />
        <span>{eyebrow}</span>
        {chineseAccent && (
          <>
            <span aria-hidden="true" className="text-kraft-deep">
              ·
            </span>
            <span
              lang={isTraditional ? "zh-Hant" : "zh-Hans"}
              className="font-calligraphy text-base font-normal tracking-normal text-ink"
            >
              {zhText(chineseAccent)}
            </span>
          </>
        )}
      </div>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-[17px]">
          {description}
        </p>
      )}
    </div>
  );
}
