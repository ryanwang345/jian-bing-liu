"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { restaurant, SITE_URL } from "@/data/restaurant";
import { useLocale } from "@/lib/i18n";

interface ShareSpotButtonProps {
  variant?: "light" | "dark";
}

export function ShareSpotButton({ variant = "light" }: ShareSpotButtonProps) {
  const { pick } = useLocale();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl =
      typeof window !== "undefined" ? window.location.origin : SITE_URL;
    const title = pick(
      "煎饼刘 Jian Bing Liu · 伦敦卡姆登 4.9★ 果蔬煎饼",
      "Jian Bing Liu (煎饼刘) — 4.9★ Natural Fruit & Veg Jian Bing in Camden"
    );
    const text = pick(
      "鲜切红心火龙果与甜菜根现榨果蔬皮（零色素），清真牛鸡与素食纯素都有，伦敦卡姆登路 124 号（Google 4.9★），约着一起去吃！",
      "Natural dragon fruit & beetroot Jian Bing with zero food dye on Camden Road (124 Camden Rd) — Halal beef & chicken, veggie & vegan options. Rated 4.9★ on Google."
    );

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled or share unsupported; fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(`${title} — ${shareUrl}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard unavailable
    }
  };

  const styles =
    variant === "dark"
      ? "border-parchment/25 bg-parchment/10 text-parchment hover:border-[#F0C26E] hover:text-[#F0C26E]"
      : "border-kraft-deep bg-white/90 text-ink hover:border-cinnabar hover:text-cinnabar";

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={pick(
        `分享${restaurant.chineseName}给朋友`,
        `Share ${restaurant.name} with friends`
      )}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${styles}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-jade" aria-hidden="true" />
          {pick("链接已复制，快发给朋友！", "Link copied — send to a friend!")}
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          {pick("约朋友一起吃 · 分享", "Share with a Friend")}
        </>
      )}
    </button>
  );
}
