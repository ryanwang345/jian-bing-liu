"use client";

import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export function NotFoundView() {
  const { isTraditional, zhText, pick } = useLocale();

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <p
        lang={isTraditional ? "zh-Hant" : "zh-Hans"}
        className="font-calligraphy text-4xl text-cinnabar"
        aria-hidden="true"
      >
        {zhText("煎饼刘")}
      </p>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.02em] text-ink sm:text-5xl">
        {pick("页面未找到", "Page not found")}
      </h1>
      <p className="mt-3 text-base text-ink-muted">
        {pick(
          "抱歉，您访问的页面不存在。可以返回首页或直接浏览我们的精选菜单。",
          "We couldn't find that page. Head back home or take a look at the menu."
        )}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-cinnabar"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {pick("返回首页", "Back to Home")}
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 rounded-full border border-kraft-deep bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
        >
          <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          {pick("查看菜单", "View Menu")}
        </Link>
      </div>
    </section>
  );
}
