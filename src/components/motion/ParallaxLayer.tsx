"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  /** Maximum vertical travel in pixels across viewport traversal (positive = moves down slower, negative = floats up) */
  offset?: number;
}

/**
 * Lightweight 60fps scroll-scrubbed vertical depth parallax inspired by Apple product pages.
 * Runs exclusively via passive scroll + rAF + translate3d, with automatic reduced-motion opt-out.
 */
export function ParallaxLayer({
  children,
  className = "",
  offset = 24,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 767px)").matches
    ) {
      return;
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // Normalized progress from -1 (below viewport) to +1 (above viewport)
      const center = rect.top + rect.height / 2;
      const normalized = Math.max(-1, Math.min(1, (vh / 2 - center) / (vh / 2)));
      const y = normalized * offset;
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [offset]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
