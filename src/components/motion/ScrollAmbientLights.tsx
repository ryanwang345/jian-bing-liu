"use client";

import { useEffect, useRef } from "react";

/**
 * Clean, classic scroll-driven studio gradient lighting.
 * Smoothly glides two wide, softly diffused warm brand gradient lights as the user scrolls,
 * keeping the layout refined, balanced, and easy to read.
 */
export function ScrollAmbientLights() {
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

      // Gentle, steady studio light glide (clean linear vertical sweep + subtle horizontal drift)
      if (primaryGlowRef.current) {
        const y = p * 22; // 0vh -> 22vh
        const x = p * 8 - 4; // -4vw -> +4vw
        primaryGlowRef.current.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0)`;
      }

      if (secondaryGlowRef.current) {
        const y = -p * 18; // 0vh -> -18vh
        const x = -p * 6 + 3; // +3vw -> -3vw
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
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Top-center warm kitchen-lantern studio gradient wash */}
      <div
        ref={primaryGlowRef}
        className="absolute -top-44 left-1/2 h-[540px] w-[min(120vw,1200px)] -translate-x-1/2 rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse 68% 58% at 50% 45%, rgba(235,176,78,0.2) 0%, rgba(201,112,48,0.09) 48%, transparent 76%)",
          filter: "blur(50px)",
        }}
      />

      {/* Lower soft toasted-amber & subtle vermilion counterweight wash */}
      <div
        ref={secondaryGlowRef}
        className="absolute -bottom-48 left-1/2 h-[500px] w-[min(115vw,1120px)] -translate-x-1/2 rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 55%, rgba(184,58,34,0.08) 0%, rgba(235,176,78,0.14) 48%, transparent 76%)",
          filter: "blur(54px)",
        }}
      />
    </div>
  );
}
