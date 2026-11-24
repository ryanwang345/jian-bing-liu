"use client";

import { useLocale } from "@/lib/i18n";

export function SoldOutBadge() {
  const { pick } = useLocale();
  return (
    <span className="inline-block rounded-full bg-cinnabar px-2.5 py-1 text-xs font-semibold text-white">
      {pick("售罄", "Sold out")}
    </span>
  );
}
