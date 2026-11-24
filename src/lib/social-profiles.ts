import { cache } from "react";
import { restaurant, type SocialLink } from "@/data/restaurant";
import { getMenuDb } from "@/lib/cf-bindings";

export function isSocialAccount(link: SocialLink) {
  return link.platform !== "fantuan" && link.platform !== "google-maps";
}

export type SocialProfile = SocialLink & { visible: boolean };

export const getSocialProfiles = cache(async () => {
  const defaults = restaurant.verifiedSocialLinks.map((link) => ({ ...link, visible: true }));
  const db = await getMenuDb();
  if (!db) return { profiles: defaults, writable: false };

  try {
    const { results } = await db.prepare("SELECT platform, handle, href, visible FROM social_profiles")
      .all<{ platform: string; handle: string; href: string; visible: number }>();
    const profiles = defaults.map((link) => {
      const row = results.find((entry) => entry.platform === link.platform);
      return row ? { ...link, handle: row.handle, href: row.href, visible: row.visible === 1 } : link;
    });
    return { profiles, writable: true };
  } catch {
    // Keep existing links available while the D1 migration is pending.
    return { profiles: defaults, writable: false };
  }
});
