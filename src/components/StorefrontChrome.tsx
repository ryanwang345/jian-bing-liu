"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FestivalBanner } from "@/components/FestivalBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileActionBar } from "@/components/MobileActionBar";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { ScrollAmbientLights } from "@/components/motion/ScrollAmbientLights";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";
import type { FestivalPreset } from "@/data/festivals";

interface StorefrontChromeProps {
  children: ReactNode;
  activeFestival: FestivalPreset | null;
  hasFestiveDishes: boolean;
}

export function StorefrontChrome({
  children,
  activeFestival,
  hasFestiveDishes,
}: StorefrontChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <main id="main-content" className="min-h-screen bg-[#f1f1f1] text-[#303030]">
        {children}
      </main>
    );
  }

  return (
    <>
      <ScrollAmbientLights />
      <ScrollProgressBar />
      {activeFestival && (
        <FestivalBanner
          festival={activeFestival}
          hasFestiveDishes={hasFestiveDishes}
        />
      )}
      <Header />

      <main id="main-content" className="relative z-10 flex-1">
        <RouteTransition>{children}</RouteTransition>
      </main>

      <Footer />
      <MobileActionBar />
    </>
  );
}
