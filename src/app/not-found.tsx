import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <p
        lang="zh-Hans"
        className="font-calligraphy text-4xl text-cinnabar"
        aria-hidden="true"
      >
        煎饼刘
      </p>
      <h1 className="mt-4 font-display text-4xl font-extrabold text-ink sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-3 text-base text-ink-muted">
        Sorry, we couldn&apos;t find the page you were looking for. Head back to
        our homepage or explore our freshly cooked menu.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-cinnabar"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 rounded-full border border-kraft-deep bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-cinnabar hover:text-cinnabar"
        >
          <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          View Menu
        </Link>
      </div>
    </section>
  );
}
