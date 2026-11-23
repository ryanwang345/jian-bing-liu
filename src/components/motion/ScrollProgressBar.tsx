"use client";

import { useEffect, useRef } from "react";

/**
 * Apple-style ultra-thin scroll progress hairline fixed along the very top edge.
 * Updates purely on the GPU compositor thread via transform: scaleX(...) with rAF.
 */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) {
      bar.style.display = "none";
      return;
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      bar.style.transform = `scaleX(${progress})`;
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
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2.5px] bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-cinnabar via-turmeric to-[#F0C26E]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
