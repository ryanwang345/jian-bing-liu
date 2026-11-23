"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "scale" | "left" | "right";
}

/**
 * Apple-style viewport reveal using IntersectionObserver + GPU transform/opacity.
 * Triggers smoothly once on entry with Apple's signature deceleration curve.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    // Immediately reveal elements already within viewport on initial paint
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -48px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties | undefined =
    delay > 0
      ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties)
      : undefined;

  return (
    <div
      ref={ref}
      data-variant={variant}
      data-visible={visible ? "true" : "false"}
      style={style}
      className={`apple-reveal ${className}`}
    >
      {children}
    </div>
  );
}
