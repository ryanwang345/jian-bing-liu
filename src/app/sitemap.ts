import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/restaurant";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/menu", "/our-story", "/gallery", "/visit-us"];
  const now = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/menu" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
