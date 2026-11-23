"use client";

import { dietaryLabels, type DietaryTagKey } from "@/data/menu";
import { useLocale } from "@/lib/i18n";

interface DietaryBadgeProps {
  tag: DietaryTagKey;
}

const tagStyles: Record<DietaryTagKey, string> = {
  halal: "border-cinnabar/25 bg-cinnabar/10 text-cinnabar-dark",
  vegetarian: "border-jade/30 bg-jade/10 text-jade",
  vegan: "border-jade/40 bg-jade text-parchment",
};

export function DietaryBadge({ tag }: DietaryBadgeProps) {
  const { locale, t } = useLocale();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
        locale === "en" ? "uppercase" : ""
      } ${tagStyles[tag]}`}
    >
      {t(dietaryLabels[tag])}
    </span>
  );
}
