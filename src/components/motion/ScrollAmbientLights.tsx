"use client";

import { useEffect, useRef } from "react";

interface ScrollAmbientLightsProps {
  isFestive?: boolean;
}

/**
 * Clean, classic scroll-driven studio gradient lighting.
 * Smoothly glides wide, diffused warm brand gradient lights as the user scrolls,
 * intensifying into a richer multi-layered celebratory glow when a holiday theme is active.
 */
export function ScrollAmbientLights({
  isFestive = false,
}: ScrollAmbientLightsProps) {
  const primaryGlowRef = useRef<HTMLDivElement>(null);
  const secondaryGlowRef = useRef<HTMLDivElement>(null);
  const sideGlowRef = useRef<HTMLDivElement>(null);

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

      if (sideGlowRef.current) {
        const y = p * 26 - 10;
        const x = Math.sin(p * Math.PI) * 6;
        sideGlowRef.current.style.transform = `translate3d(${x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0)`;
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
      {/* Top-center studio gradient wash (vivid & luminous in holiday mode) */}
      <div
        ref={primaryGlowRef}
        className={`absolute left-1/2 -translate-x-1/2 rounded-full will-change-transform ${
          isFestive
            ? "-top-36 h-[620px] w-[min(130vw,1360px)]"
            : "-top-44 h-[540px] w-[min(120vw,1200px)]"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 68% 58% at 50% 45%, var(--theme-glow-a) 0%, var(--theme-glow-b) 52%, transparent 78%)",
          filter: isFestive ? "blur(42px)" : "blur(50px)",
        }}
      />

      {/* Extra festive mid-page colour pool for richer holiday depth */}
      {isFestive && (
        <div
          ref={sideGlowRef}
          className="absolute top-1/3 right-[-12%] h-[460px] w-[min(72vw,680px)] rounded-full will-change-transform"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, var(--theme-glow-b) 0%, var(--theme-glow-c) 46%, transparent 74%)",
            filter: "blur(48px)",
          }}
        />
      )}

      {/* Lower soft counterweight wash (adapts to active festival theme) */}
      <div
        ref={secondaryGlowRef}
        className={`absolute left-1/2 -translate-x-1/2 rounded-full will-change-transform ${
          isFestive
            ? "-bottom-40 h-[560px] w-[min(125vw,1280px)]"
            : "-bottom-48 h-[500px] w-[min(115vw,1120px)]"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 55%, var(--theme-glow-c) 0%, var(--theme-glow-d) 52%, transparent 78%)",
          filter: isFestive ? "blur(46px)" : "blur(54px)",
        }}
      />
    </div>
  );
}
