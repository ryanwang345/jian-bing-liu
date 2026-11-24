"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  galleryCategoryLabels,
  type GalleryCategoryKey,
  type GalleryItem,
} from "@/data/gallery";
import { useLocale } from "@/lib/i18n";

interface GalleryGridProps {
  categories: GalleryCategoryKey[];
  items: GalleryItem[];
}

export function GalleryGrid({ categories, items }: GalleryGridProps) {
  const { t, pick } = useLocale();
  const [selectedCategory, setSelectedCategory] =
    useState<GalleryCategoryKey>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visibleItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      } else if (event.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % visibleItems.length
        );
      } else if (event.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + visibleItems.length) % visibleItems.length
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, visibleItems.length]);

  const activePhoto =
    lightboxIndex !== null ? visibleItems[lightboxIndex] : null;

  return (
    <div>
      <div
        role="tablist"
        aria-label={pick("按分类筛选美食照片", "Filter gallery photos by category")}
        className="flex flex-wrap gap-2"
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                setSelectedCategory(category);
                setLightboxIndex(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                isSelected
                  ? "bg-cinnabar text-parchment shadow-sm"
                  : "border border-kraft-deep bg-white/75 text-ink-soft hover:bg-kraft hover:text-ink"
              }`}
            >
              {t(galleryCategoryLabels[category])}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            aria-label={pick(
              `放大查看照片：${item.caption.zh}`,
              `View larger photo: ${item.caption.en}`
            )}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
              <Image
                src={item.src}
                alt={t(item.alt)}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 rounded-full bg-ink/75 px-3 py-1 text-[11px] font-semibold text-parchment backdrop-blur-xs">
                {t(galleryCategoryLabels[item.category])}
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-ink group-hover:text-cinnabar">
                {t(item.caption)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t(activePhoto.caption)}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-parchment/15 bg-ink shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-parchment/15 px-5 py-3.5 text-parchment">
              <div className="text-xs font-semibold tracking-wider text-[#F0C26E]">
                {t(galleryCategoryLabels[activePhoto.category])} ·{" "}
                {pick(
                  `第 ${lightboxIndex + 1} / ${visibleItems.length} 张`,
                  `${lightboxIndex + 1} / ${visibleItems.length}`
                )}
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label={pick("关闭大图预览", "Close photo viewer")}
                className="rounded-full bg-parchment/10 p-2 text-parchment transition-colors hover:bg-parchment/20"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative flex-1 bg-black/50">
              <div className="relative mx-auto h-[62vh] w-full">
                <Image
                  src={activePhoto.src}
                  alt={t(activePhoto.alt)}
                  fill
                  sizes="90vw"
                  className="object-contain p-3"
                  priority
                />
              </div>

              {visibleItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + visibleItems.length) %
                          visibleItems.length
                      )
                    }
                    aria-label={pick("上一张照片", "Previous photo")}
                    className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-ink/80 p-2.5 text-parchment shadow-md transition-colors hover:bg-cinnabar"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex + 1) % visibleItems.length
                      )
                    }
                    aria-label={pick("下一张照片", "Next photo")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-ink/80 p-2.5 text-parchment shadow-md transition-colors hover:bg-cinnabar"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            <div className="border-t border-parchment/15 px-6 py-4 text-parchment">
              <p className="font-display text-base font-semibold">
                {t(activePhoto.caption)}
              </p>
              <p className="mt-1 text-xs text-parchment/70">
                {t(activePhoto.alt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
