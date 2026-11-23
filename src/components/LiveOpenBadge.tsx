"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n";

interface LondonOpenStatus {
  isOpen: boolean;
  closesZh: string;
  closesEn: string;
}

function getLondonOpenStatus(): LondonOpenStatus | null {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? NaN);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? NaN);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

    const isEarlyClose =
      weekday === "Mon" || weekday === "Tue" || weekday === "Wed";
    const closeMinutes = isEarlyClose ? 21 * 60 : 21 * 60 + 30;
    const totalMinutes = hour * 60 + minute;

    return {
      isOpen: totalMinutes >= 11 * 60 && totalMinutes < closeMinutes,
      closesZh: isEarlyClose ? "21:00" : "21:30",
      closesEn: isEarlyClose ? "9:00 PM" : "9:30 PM",
    };
  } catch {
    return null;
  }
}

export function LiveOpenBadge() {
  const { pick } = useLocale();
  const [status, setStatus] = useState<LondonOpenStatus | null>(null);

  useEffect(() => {
    setStatus(getLondonOpenStatus());
    const timer = window.setInterval(() => {
      setStatus(getLondonOpenStatus());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (status === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/25 bg-jade/[0.08] px-3 py-1 text-xs font-semibold text-jade">
        <span className="h-2 w-2 rounded-full bg-jade" aria-hidden="true" />
        {pick("每日 11:00 开门营业", "Opens Daily at 11:00 AM")}
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
      {pick("每日 11:00 开门营业", "Opens Daily at 11:00 AM")}
    </span>
  );
}
