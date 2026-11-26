"use client";

import { useEffect, useRef } from "react";

interface ScrollAmbientLightsProps {
  isFestive?: boolean;
}

/**
 * Clean, classic scroll-driven studio gradient lighting.
 * Smoothly glides wide, softly diffused brand gradient lights along the top/bottom page edges
 * without washing over food photography or description text.
 */
export function ScrollAmbientLights({
  isFestive = false,
}: ScrollAmbientLightsProps) {
  const primaryGlowRef = useRef<HTMLDivElement>(null);
  const secondaryGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const docHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const p = Math.min(1, Math.max(0, window.scrollY / docHeight));

      if (primaryGlowRef.current) {
        const y = p * 14;
        const x = p * 6 - 3;
        primaryGlowRef.current.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0)`;
      }

      if (secondaryGlowRef.current) {
        const y = -p * 14;
        const x = -p * 6 + 3;
        secondaryGlowRef.current.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0)`;
      }
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
  }, []);

  return (
    <div
      aria-hidden="true"
      data-festival-decorative="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Top-edge ambient colour halo */}
      <div
        ref={primaryGlowRef}
        className={`absolute left-1/2 -translate-x-1/2 rounded-full will-change-transform ${
          isFestive
            ? "-top-56 h-[440px] w-[min(124vw,1300px)]"
            : "-top-44 h-[540px] w-[min(120vw,1200px)]"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 68% 58% at 50% 40%, var(--theme-glow-a) 0%, var(--theme-glow-b) 48%, transparent 76%)",
          filter: "blur(52px)",
        }}
      />

      {/* Bottom-edge soft counterweight wash */}
      <div
        ref={secondaryGlowRef}
        className={`absolute left-1/2 -translate-x-1/2 rounded-full will-change-transform ${
          isFestive
            ? "-bottom-52 h-[420px] w-[min(120vw,1240px)]"
            : "-bottom-48 h-[500px] w-[min(115vw,1120px)]"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 60%, var(--theme-glow-c) 0%, var(--theme-glow-d) 48%, transparent 76%)",
          filter: "blur(54px)",
        }}
      />
    </div>
  );
}
