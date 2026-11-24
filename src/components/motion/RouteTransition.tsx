"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Smooth Apple-style route entrance animation when switching top navbar tabs.
 * Only animates opacity + 10px Y glide on the compositor thread.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-route-enter">
      {children}
    </div>
  );
}
