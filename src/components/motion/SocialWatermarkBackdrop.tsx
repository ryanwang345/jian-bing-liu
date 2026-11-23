"use client";

import { useEffect, useRef } from "react";
import { SocialIcon } from "@/components/SocialIcon";
import type { SocialLink } from "@/data/restaurant";
import { useLocale } from "@/lib/i18n";

interface WatermarkItem {
  platform: Exclude<SocialLink["platform"], "google-maps">;
  label: string;
  positionClass: string;
  sizeClass: string;
  rotate: number;
  speed: number;
}

const embossedSeals: WatermarkItem[] = [
  {
    platform: "rednote",
    label: "小红书",
    positionClass: "top-6 -left-6 sm:left-4",
    sizeClass: "h-28 w-28 sm:h-36 sm:w-36",
    rotate: -12,
    speed: -22,
  },
  {
    platform: "instagram",
    label: "Instagram",
    positionClass: "top-10 right-4 sm:right-10",
    sizeClass: "h-24 w-24 sm:h-34 sm:w-34",
    rotate: 11,
    speed: 18,
  },
  {
    platform: "tiktok",
    label: "TikTok",
    positionClass: "top-[42%] -left-8 sm:left-6",
    sizeClass: "h-28 w-28 sm:h-40 sm:w-40",
    rotate: 8,
    speed: 26,
  },
  {
    platform: "threads",
    label: "Threads",
    positionClass: "top-[46%] -right-6 sm:right-8",
    sizeClass: "h-26 w-26 sm:h-36 sm:w-36",
    rotate: -10,
    speed: -24,
  },
  {
    platform: "reddit",
    label: "Reddit",
    positionClass: "bottom-8 left-8 sm:left-[18%]",
    sizeClass: "h-24 w-24 sm:h-32 sm:w-32",
    rotate: -7,
    speed: -16,
  },
  {
    platform: "fantuan",
    label: "Fantuan",
    positionClass: "bottom-6 right-6 sm:right-[16%]",
    sizeClass: "h-26 w-26 sm:h-34 sm:w-34",
    rotate: 9,
    speed: 20,
  },
];

const marqueePlatforms: Array<{
  platform: Exclude<SocialLink["platform"], "google-maps">;
  text: string;
}> = [
  { platform: "rednote", text: "小红书 RedNote" },
  { platform: "instagram", text: "Instagram" },
  { platform: "tiktok", text: "TikTok" },
  { platform: "threads", text: "Threads" },
  { platform: "reddit", text: "Reddit · r/LondonFood" },
  { platform: "fantuan", text: "饭团外卖 Fantuan" },
];

/**
 * Embossed / letterpress-style social platform watermark backdrop.
 * Combines subtle scroll-scrubbed parallax seals with softly drifting watermark ribbons
 * in warm kraft-paper debossed ink so foreground cards stay razor-clear and legible.
 */
export function SocialWatermarkBackdrop() {
  const { zhText } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const sealRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const center = rect.top + rect.height / 2;
      const normalized = Math.max(-1, Math.min(1, (vh / 2 - center) / (vh / 2)));

      embossedSeals.forEach((seal, idx) => {
        const el = sealRefs.current[idx];
        if (!el) return;
        const dy = normalized * seal.speed;
        el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0) rotate(${seal.rotate}deg)`;
      });
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Subtle warm radial paper vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,134,31,0.09),transparent_55%),radial-gradient(ellipse_at_50%_100%,rgba(184,37,28,0.07),transparent_55%)]" />

      {/* Top embossed drifting brand watermark ribbon */}
      <div className="watermark-mask absolute inset-x-0 top-4 overflow-hidden opacity-[0.07]">
        <div className="animate-watermark-left flex w-max items-center gap-10 whitespace-nowrap">
          {[...marqueePlatforms, ...marqueePlatforms, ...marqueePlatforms].map(
            (item, idx) => (
              <span
                key={`top-${item.platform}-${idx}`}
                className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-[0.14em] text-ink uppercase [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.8))]"
              >
                <SocialIcon platform={item.platform} className="h-4 w-4" />
                <span>{zhText(item.text)}</span>
                <span className="ml-6 text-ink/40">✦</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* Oversized scroll-parallax letterpress brand seals */}
      {embossedSeals.map((seal, idx) => (
        <div
          key={seal.platform}
          ref={(el) => {
            sealRefs.current[idx] = el;
          }}
          style={{ transform: `rotate(${seal.rotate}deg)` }}
          className={`absolute flex flex-col items-center justify-center rounded-full border border-ink/[0.06] bg-white/[0.16] text-ink/[0.065] will-change-transform [box-shadow:inset_0_1px_2px_rgba(26,22,20,0.06),0_1px_0_rgba(255,255,255,0.7)] ${seal.positionClass} ${seal.sizeClass}`}
        >
          <SocialIcon
            platform={seal.platform}
            className="h-[46%] w-[46%] [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.75))]"
          />
          <span className="mt-1 text-[10px] font-bold tracking-[0.2em] uppercase">
            {zhText(seal.label)}
          </span>
        </div>
      ))}

      {/* Bottom embossed reverse-drifting watermark ribbon */}
      <div className="watermark-mask absolute inset-x-0 bottom-3 overflow-hidden opacity-[0.065]">
        <div className="animate-watermark-right flex w-max items-center gap-10 whitespace-nowrap">
          {[...marqueePlatforms, ...marqueePlatforms, ...marqueePlatforms].map(
            (item, idx) => (
              <span
                key={`bot-${item.platform}-${idx}`}
                className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-[0.14em] text-ink uppercase [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.8))]"
              >
                <SocialIcon platform={item.platform} className="h-4 w-4" />
                <span>{zhText(item.text)}</span>
                <span className="ml-6 text-ink/40">✦</span>
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
