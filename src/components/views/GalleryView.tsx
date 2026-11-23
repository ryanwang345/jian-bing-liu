"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GalleryGrid } from "@/components/GalleryGrid";
import { galleryCategories, galleryItems } from "@/data/gallery";
import { restaurant } from "@/data/restaurant";
import { useLocale } from "@/lib/i18n";

export function GalleryView() {
  const { locale } = useLocale();
  const isZh = locale === "zh";

  return (
    <div className="pb-20">
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
                <span>{isZh ? "实拍图集" : "Photo Gallery"}</span>
                <span aria-hidden="true" className="text-kraft-deep">
                  ·
                </span>
                <span
                  lang="zh-Hans"
                  className="font-calligraphy text-lg font-normal tracking-normal text-ink"
                >
                  美食图集
                </span>
              </p>
              <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.025em] text-ink sm:text-5xl">
                {isZh
                  ? "来自卡姆登厨房的真实出餐"
                  : "Straight from our Camden kitchen"}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
                {isZh
                  ? "每一张照片均实拍自我们的铁板、档口与日常出品，点击任意图片可全屏放大浏览。"
                  : "All taken at our Camden Road griddle and counter. Click any photo for a closer look."}
              </p>
            </div>

            <Link
              href="/menu"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-sm font-semibold text-parchment shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
            >
              {isZh ? "查看菜单与价格" : "See Prices & Menu"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <GalleryGrid categories={galleryCategories} items={galleryItems} />

        <p className="mt-10 text-center text-xs text-ink-muted">
          {isZh
            ? `以上菜品均现点现做于${restaurant.chineseName}（${restaurant.address.street}, ${restaurant.address.postalCode}），时令点缀与配料可能随季节微调。`
            : `Everything shown here is cooked fresh at ${restaurant.name} (${restaurant.address.street}, ${restaurant.address.postalCode}). Seasonal toppings may vary.`}
        </p>
      </section>
    </div>
  );
}
