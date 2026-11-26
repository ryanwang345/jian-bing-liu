"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Navigation,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import { phoneToTelHref, useSiteContent } from "@/components/SiteContentProvider";
import { useLocale } from "@/lib/i18n";

export function MobileActionBar() {
  const pathname = usePathname();
  const { pick } = useLocale();
  const { store } = useSiteContent();
  const isMenuPage = pathname.startsWith("/menu");

  return (
    <div
      role="region"
      aria-label={pick("快捷操作栏", "Quick actions")}
      className="fixed inset-x-3 bottom-3 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-3 items-center gap-1.5 rounded-full border border-parchment/15 bg-surface-dark/95 p-1.5 text-xs font-semibold text-parchment shadow-2xl backdrop-blur-md">
        <a
          href={store.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-parchment/90 transition-colors hover:bg-white/10"
        >
          <Navigation className="h-3.5 w-3.5 text-accent-bright" aria-hidden="true" />
          {pick("导航", "Directions")}
        </a>

        {isMenuPage ? (
          <a
            href={phoneToTelHref(store.phoneDisplay)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-parchment/90 transition-colors hover:bg-white/10"
          >
            <Phone className="h-3.5 w-3.5 text-accent-bright" aria-hidden="true" />
            {pick("致电", "Call")}
          </a>
        ) : (
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 text-parchment/90 transition-colors hover:bg-white/10"
          >
            <UtensilsCrossed
              className="h-3.5 w-3.5 text-accent-bright"
              aria-hidden="true"
            />
            {pick("菜单", "Menu")}
          </Link>
        )}

        {store.orderOnlineUrl ? (
          <a
            href={store.orderOnlineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-cinnabar px-3 py-2.5 font-bold text-parchment shadow-sm transition-colors hover:bg-cinnabar-dark active:scale-95"
          >
            {pick("在线点餐", "Order")}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        ) : (
          <Link
            href="/visit-us"
            className="inline-flex items-center justify-center gap-1 rounded-full bg-cinnabar px-3 py-2.5 text-parchment shadow-sm transition-colors hover:bg-cinnabar-dark"
          >
            {pick("来店", "Visit")}
          </Link>
        )}
      </div>
    </div>
  );
}
