"use client";

import { useEffect, useState } from "react";
import { useSiteContent } from "@/components/SiteContentProvider";
import { useLocale } from "@/lib/i18n";

interface LondonOpenStatus {
  isOpen: boolean;
  closesZh: string;
  closesEn: string;
}

function parseHhMm(str: string, fallbackMinutes: number): number {
  const m = str.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return fallbackMinutes;
  return Number(m[1]) * 60 + Number(m[2]);
}

function format12h(str: string): string {
  const m = str.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return str;
  const h = Number(m[1]);
  const min = m[2];
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${min} ${suffix}`;
}

export function LiveOpenBadge() {
  const { pick } = useLocale();
  const { store } = useSiteContent();
  const [status, setStatus] = useState<LondonOpenStatus | null>(null);

  useEffect(() => {
    const compute = (): LondonOpenStatus | null => {
      try {
        const parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/London",
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).formatToParts(new Date());

        const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
        const hour = Number(
          parts.find((p) => p.type === "hour")?.value ?? NaN
        );
        const minute = Number(
          parts.find((p) => p.type === "minute")?.value ?? NaN
        );
        if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

        const isMonWed =
          weekday === "Mon" || weekday === "Tue" || weekday === "Wed";
        const openStr = isMonWed ? store.monWedOpens : store.thuSunOpens;
        const closeStr = isMonWed ? store.monWedCloses : store.thuSunCloses;
        const openMinutes = parseHhMm(openStr, 11 * 60);
        const closeMinutes = parseHhMm(
          closeStr,
          isMonWed ? 21 * 60 : 21 * 60 + 30
        );
        const totalMinutes = hour * 60 + minute;

        return {
          isOpen: totalMinutes >= openMinutes && totalMinutes < closeMinutes,
          closesZh: closeStr,
          closesEn: format12h(closeStr),
        };
      } catch {
        return null;
      }
    };

    setStatus(compute());
    const timer = window.setInterval(() => setStatus(compute()), 60_000);
    return () => window.clearInterval(timer);
  }, [
    store.monWedOpens,
    store.monWedCloses,
    store.thuSunOpens,
    store.thuSunCloses,
  ]);

  if (store.temporarilyClosed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cinnabar/30 bg-cinnabar/10 px-3 py-1 text-xs font-semibold text-cinnabar-dark">
        <span className="h-2 w-2 rounded-full bg-cinnabar" aria-hidden="true" />
        {pick("今日临时休息", "Temporarily Closed Today")}
      </span>
    );
  }

  if (status === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/25 bg-jade/[0.08] px-3 py-1 text-xs font-semibold text-jade">
        <span className="h-2 w-2 rounded-full bg-jade" aria-hidden="true" />
        {pick(
          `每日 ${store.monWedOpens} 开门营业`,
          `Opens Daily at ${format12h(store.monWedOpens)}`
        )}
      </span>
    );
  }

  return status.isOpen ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade/10 px-3 py-1 text-xs font-semibold text-jade">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-jade" />
      </span>
      {pick(
        `营业中 · 今日至 ${status.closesZh}`,
        `Open Now in Camden · Until ${status.closesEn}`
      )}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-white/85 px-3 py-1 text-xs font-semibold text-ink-muted">
      <span className="h-2 w-2 rounded-full bg-turmeric" aria-hidden="true" />
      {pick(
        `每日 ${store.monWedOpens} 开门营业`,
        `Opens Daily at ${format12h(store.monWedOpens)}`
      )}
    </span>
  );
}
