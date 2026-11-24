"use client";

import { useEffect, useState } from "react";
import { Bookmark, Heart } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const LIKED_KEY = "jbl-liked-dishes";
const SAVED_KEY = "jbl-saved-dishes";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === "string")
        : []
    );
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // Ignore private-mode storage errors
  }
}

export function DishSocialActions({
  dishId,
  hashtag,
}: {
  dishId: string;
  hashtag: string;
}) {
  const { pick } = useLocale();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [justLiked, setJustLiked] = useState(false);

  useEffect(() => {
    setLiked(readSet(LIKED_KEY).has(dishId));
    setSaved(readSet(SAVED_KEY).has(dishId));
  }, [dishId]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    if (next) {
      setJustLiked(true);
      window.setTimeout(() => setJustLiked(false), 450);
    }
    const set = readSet(LIKED_KEY);
    if (next) set.add(dishId);
    else set.delete(dishId);
    writeSet(LIKED_KEY, set);
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    const set = readSet(SAVED_KEY);
    if (next) set.add(dishId);
    else set.delete(dishId);
    writeSet(SAVED_KEY, set);
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-2 border-t border-kraft-deep/55 pt-3">
      <span className="truncate text-[11px] font-medium text-ink-muted">
        {hashtag}
      </span>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={pick("点个想吃", "Mark dish as craving")}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${
            liked
              ? "border-cinnabar/35 bg-cinnabar/10 text-cinnabar"
              : "border-kraft-deep/80 bg-parchment/70 text-ink-muted hover:border-cinnabar/40 hover:text-cinnabar"
          }`}
        >
          <Heart
            className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""} ${
              justLiked ? "animate-heart-pop" : ""
            }`}
            aria-hidden="true"
          />
          <span>{liked ? pick("想吃!", "Craving!") : pick("想吃", "Save")}</span>
        </button>

        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          aria-label={pick("收藏菜品", "Bookmark dish")}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition-all active:scale-95 ${
            saved
              ? "border-ink bg-ink text-yolk"
              : "border-kraft-deep/80 bg-parchment/70 text-ink-muted hover:border-ink hover:text-ink"
          }`}
        >
          <Bookmark
            className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
