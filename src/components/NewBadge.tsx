"use client";

import { Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export function NewBadge({ className = "" }: { className?: string }) {
  const { pick } = useLocale();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-turmeric px-2.5 py-1 text-xs font-bold text-ink shadow-xs ring-1 ring-ink/10 ${className}`}
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      {pick("新品", "New")}
    </span>
  );
}
