"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FestivalAtmosphere } from "@/components/FestivalAtmosphere";
import { FestivalBanner } from "@/components/FestivalBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileActionBar } from "@/components/MobileActionBar";
import { NewArrivalBanner } from "@/components/NewArrivalBanner";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { ScrollAmbientLights } from "@/components/motion/ScrollAmbientLights";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";
import { useSiteContent } from "@/components/SiteContentProvider";
import {
  WelcomeCouponProvider,
  WelcomeCouponTopBar,
} from "@/components/WelcomeCouponSection";
import type { FestivalPreset } from "@/data/festivals";
import { useLocale } from "@/lib/i18n";
import type { NewArrivalSummary } from "@/lib/new-arrivals";

interface StorefrontChromeProps {
  children: ReactNode;
  activeFestival: FestivalPreset | null;
  hasFestiveDishes: boolean;
  newArrivals?: NewArrivalSummary[];
}

export function StorefrontChrome({
  children,
  activeFestival,
  hasFestiveDishes,
  newArrivals = [],
}: StorefrontChromeProps) {
  const pathname = usePathname();
  const { t } = useLocale();
  const { store } = useSiteContent();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <main id="main-content" className="min-h-screen bg-[#f1f1f1] text-[#303030]">
        {children}
      </main>
    );
  }

  const customBannerText = store.temporarilyClosed
    ? t(store.closedNotice)
    : store.customAnnouncementEnabled
      ? t(store.customAnnouncement)
      : "";

  return (
    <WelcomeCouponProvider>
      <ScrollAmbientLights isFestive={Boolean(activeFestival)} />
      <ScrollProgressBar />
      <WelcomeCouponTopBar />
      {customBannerText.trim() && (
        <div
          role="region"
          aria-label="Store announcement"
          className="relative z-40 border-b border-white/10 bg-cinnabar px-4 py-2 text-center text-xs font-semibold text-parchment"
        >
          {customBannerText}
        </div>
      )}
      {!store.temporarilyClosed && <NewArrivalBanner items={newArrivals} />}
      {activeFestival && (
        <FestivalBanner
          festival={activeFestival}
          hasFestiveDishes={hasFestiveDishes}
        />
      )}
      <Header />

      <main id="main-content" className="relative z-10 flex-1">
        {activeFestival && <FestivalAtmosphere festival={activeFestival} />}
        <RouteTransition>{children}</RouteTransition>
      </main>

      <Footer />
      <MobileActionBar />
    </WelcomeCouponProvider>
  );
}
