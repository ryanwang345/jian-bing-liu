"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";
import { useLocale } from "@/lib/i18n";
import type { NewArrivalSummary } from "@/lib/new-arrivals";

const DISMISS_KEY = "jbl:new-arrivals-dismissed";

interface NewArrivalBannerProps {
  items: NewArrivalSummary[];
}

export function NewArrivalBanner({ items }: NewArrivalBannerProps) {
  const pathname = usePathname();
  const { t, pick } = useLocale();
  const { newArrivals } = useSiteContent();
  const [dismissed, setDismissed] = useState(false);

  // Fingerprint of the current launch line-up: a brand-new dish re-shows the banner
  const signature = items.map((i) => i.id).sort().join("|");

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === signature);
    } catch {
      // Storage may be unavailable (private mode)
    }
  }, [signature]);

  if (!newArrivals.bannerEnabled || items.length === 0 || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, signature);
    } catch {
      // Ignore
    }
  };

  const shown = items.slice(0, 3);
  const extraCount = items.length - shown.length;
  const names = shown.map((i) => t(i.name)).join(pick("、", ", "));
  const onMenuPage = pathname?.startsWith("/menu");
  const href = onMenuPage ? "#new-arrivals" : "/menu#new-arrivals";

  return (
    <div
      role="region"
      aria-label={pick("新品上市公告", "New dishes announcement")}
      className="relative z-40 overflow-hidden border-b border-ink/10 bg-gradient-to-r from-turmeric via-[#f6d58a] to-turmeric px-4 py-2 text-ink sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-x-3 gap-y-1.5 pr-7 text-xs sm:text-sm">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-turmeric uppercase">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {t(newArrivals.title)}
        </span>

        <div className="hidden shrink-0 -space-x-2 sm:flex" aria-hidden="true">
          {shown
            .filter((i) => i.image)
            .map((i) => (
              <span
                key={i.id}
                className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-white bg-kraft shadow-xs"
              >
                <Image
                  src={i.image as string}
                  alt=""
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </span>
            ))}
        </div>

        <p className="min-w-0 truncate font-semibold leading-snug">
          <span>{names}</span>
          {extraCount > 0 && (
            <span className="text-ink/70">
              {pick(` 等 ${items.length} 款`, ` +${extraCount} more`)}
            </span>
          )}
          {t(newArrivals.message).trim() && (
            <span className="hidden font-normal text-ink/75 md:inline">
              {" "}
              · {t(newArrivals.message)}
            </span>
          )}
        </p>

        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cinnabar px-3 py-1 text-[11px] font-bold text-parchment shadow-xs transition-colors hover:bg-cinnabar-dark sm:text-xs"
        >
          {t(newArrivals.ctaLabel)}
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label={pick("关闭新品横幅", "Dismiss new dishes banner")}
        className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-ink/60 transition-colors hover:bg-ink/10 hover:text-ink"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
