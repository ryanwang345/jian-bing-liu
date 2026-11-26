"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  defaultSiteContent,
  type SiteContentConfig,
} from "@/data/site-content";

const SiteContentContext = createContext<SiteContentConfig>(defaultSiteContent);

export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContentConfig;
  children: ReactNode;
}) {
  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): SiteContentConfig {
  return useContext(SiteContentContext);
}

export function phoneToTelHref(display: string): string {
  const digits = display.replace(/[^0-9+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("0")) return `tel:+44${digits.slice(1)}`;
  return `tel:${digits}`;
}
