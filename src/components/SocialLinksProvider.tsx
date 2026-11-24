"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SocialLink } from "@/data/restaurant";

const SocialLinksContext = createContext<SocialLink[]>([]);

export function SocialLinksProvider({ links, children }: { links: SocialLink[]; children: ReactNode }) {
  return <SocialLinksContext.Provider value={links}>{children}</SocialLinksContext.Provider>;
}

export function useSocialLinks() {
  return useContext(SocialLinksContext);
}
