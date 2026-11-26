import { formatPricePence, type MenuCategory, type MenuItem } from "@/data/menu";
import { restaurant, SITE_URL } from "@/data/restaurant";
import type { SiteContentConfig } from "@/data/site-content";
import { getActiveFestivalThemeState } from "@/lib/festival-theme-service";
import { getPublicMenuCategories } from "@/lib/menu-service";
import { getSiteContent } from "@/lib/site-content-service";
import { getSocialProfiles } from "@/lib/social-profiles";

export type MachinePageSlug =
  | "home"
  | "menu"
  | "our-story"
  | "visit-us"
  | "gallery";

function formatItemPrice(item: MenuItem): string {
  if (item.variants && item.variants.length > 0) {
    return item.variants
      .map((v) => `${v.size.en} ${formatPricePence(v.pricePence)}`)
      .join(" / ");
  }
  return item.price ?? "See counter";
}

function formatMenuItemLine(item: MenuItem): string {
  const tags: string[] = [];
  if (item.isAvailable === false) tags.push("SOLD OUT");
  if (item.isNew) tags.push("NEW");
  if (item.featured) tags.push("Popular");
  if (item.dietary?.length) {
    tags.push(...item.dietary.map((d) => d.toUpperCase()));
  }
  if (item.note?.en) tags.push(item.note.en);

  const badgeStr = tags.length > 0 ? ` [${tags.join(" | ")}]` : "";
  const priceStr = formatItemPrice(item);
  const desc = item.description.en.trim();
  const zhPart = item.chineseName ? ` (${item.chineseName})` : "";

  return `- **${item.name.en}**${zhPart} — ${priceStr}${badgeStr}${
    desc ? `: ${desc}` : ""
  }`;
}

function renderStoreHeader(site: SiteContentConfig): string[] {
  const { store } = site;
  const lines = [
    `# ${store.nameEn} (${store.nameZh})`,
    "",
    `> ${restaurant.description.en}`,
    "",
    `- **Address**: ${store.street}, ${store.locality} ${store.postalCode}, United Kingdom (${store.addressZh})`,
    `- **Phone**: ${store.phoneDisplay}`,
    `- **Opening Hours**: ${store.hoursSummaryEn} (${store.hoursSummaryZh})`,
    `- **Service**: Takeaway & no-contact delivery only (no dine-in seating)`,
    `- **Price Range**: ${restaurant.priceRange}`,
  ];

  if (store.temporarilyClosed) {
    lines.push(
      `- **Status Notice**: TEMPORARILY CLOSED — ${store.closedNotice.en}`
    );
  } else if (
    store.customAnnouncementEnabled &&
    store.customAnnouncement.en.trim()
  ) {
    lines.push(`- **Announcement**: ${store.customAnnouncement.en.trim()}`);
  }

  if (store.orderOnlineUrl) {
    lines.push(
      `- **Order Online (${store.orderProviderEn})**: ${store.orderOnlineUrl}`
    );
  }
  lines.push(`- **Google Maps**: ${store.googleMapsUrl}`);
  lines.push(`- **Website**: ${SITE_URL}`);

  return lines;
}

function renderMenuCategories(categories: MenuCategory[]): string[] {
  const lines: string[] = [];
  for (const cat of categories) {
    lines.push(`### ${cat.title.en} (${cat.title.zh})`);
    if (cat.subtitle.en.trim()) {
      lines.push(cat.subtitle.en.trim());
    }
    lines.push("");
    for (const item of cat.items) {
      lines.push(formatMenuItemLine(item));
    }
    lines.push("");
  }
  return lines;
}

export async function buildLlmsTxt(): Promise<string> {
  const [site, categories, festivalState, { profiles }] = await Promise.all([
    getSiteContent(),
    getPublicMenuCategories(),
    getActiveFestivalThemeState().catch(() => null),
    getSocialProfiles().catch(() => ({ profiles: [] })),
  ]);

  const totalAvailable = categories
    .flatMap((c) => c.items)
    .filter((i) => i.isAvailable !== false).length;

  const visibleSocials = profiles.filter((p) => p.visible);

  const lines: string[] = [
    ...renderStoreHeader(site),
    "",
  ];

  if (festivalState?.activeFestival) {
    lines.push("## Current Seasonal Promotion");
    lines.push(
      `- **${festivalState.activeFestival.en}**: ${festivalState.activeFestival.bannerEn}`
    );
    lines.push("");
  }

  lines.push("## Machine-Readable Endpoints");
  lines.push(
    "All primary pages support HTTP content negotiation (`Accept: text/markdown`) in addition to these direct endpoints:"
  );
  lines.push("");
  lines.push(
    `- [Full Live Menu (Markdown)](${SITE_URL}/menu.md): Complete live menu (${totalAvailable} available items across ${categories.length} categories) with prices, variants, Halal/Vegetarian/Vegan tags, and sold-out flags.`
  );
  lines.push(
    `- [Home Summary](${SITE_URL}/): Send \`Accept: text/markdown\` for storefront overview, featured dishes, and meal deals.`
  );
  lines.push(
    `- [Live Menu Page](${SITE_URL}/menu): Send \`Accept: text/markdown\` for full live menu.`
  );
  lines.push(
    `- [Our Story](${SITE_URL}/our-story): Send \`Accept: text/markdown\` for Mrs Liu's story and natural fruit-and-veg batter craft.`
  );
  lines.push(
    `- [Visit Us](${SITE_URL}/visit-us): Send \`Accept: text/markdown\` for Camden Road directions, hours, phone, and ordering.`
  );
  lines.push(
    `- [JSON Menu API](${SITE_URL}/api/menu): Structured JSON feed of live menu categories and items.`
  );

  if (visibleSocials.length > 0) {
    lines.push("");
    lines.push("## Official Channels");
    for (const social of visibleSocials) {
      lines.push(`- [${social.label.en} (${social.handle})](${social.href})`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

export async function buildMachinePageMarkdown(
  slug: MachinePageSlug
): Promise<string> {
  const [site, categories, festivalState, { profiles }] = await Promise.all([
    getSiteContent(),
    getPublicMenuCategories(),
    getActiveFestivalThemeState().catch(() => null),
    getSocialProfiles().catch(() => ({ profiles: [] })),
  ]);

  const lines: string[] = [...renderStoreHeader(site), ""];

  if (festivalState?.activeFestival) {
    lines.push(
      `> **Seasonal Special**: ${festivalState.activeFestival.bannerEn}`
    );
    lines.push("");
  }

  if (slug === "menu") {
    lines.push("## Live Menu");
    lines.push("");
    lines.push(...renderMenuCategories(categories));
    lines.push("## Dietary & Allergen Information");
    lines.push(`- ${site.pages.menu.dietaryNote.en}`);
    lines.push(`- ${site.pages.menu.allergenNote.en}`);
    lines.push(`- ${site.pages.menu.pricingNote.en}`);
    lines.push("");
    return lines.join("\n");
  }

  if (slug === "our-story") {
    const story = site.pages.story;
    lines.push(`## ${story.headline.en}`);
    lines.push("");
    lines.push(story.lead.en);
    lines.push("");
    for (const p of story.paragraphs) {
      lines.push(p.en);
      lines.push("");
    }
    lines.push(`## ${story.stepsTitle.en}`);
    for (const step of story.steps) {
      lines.push(`- **${step.step.en} — ${step.title.en}**: ${step.description.en}`);
    }
    lines.push("");
    return lines.join("\n");
  }

  if (slug === "visit-us") {
    const { store } = site;
    lines.push("## Visit & Ordering Details");
    lines.push("");
    lines.push(
      `- **Monday – Wednesday**: ${store.monWedOpens} – ${store.monWedCloses}`
    );
    lines.push(
      `- **Thursday – Sunday**: ${store.thuSunOpens} – ${store.thuSunCloses}`
    );
    lines.push(`- **Hours Note**: ${site.pages.visit.hoursHint.en}`);
    lines.push(`- **Directions**: ${store.googleMapsUrl}`);
    if (store.orderOnlineUrl) {
      lines.push(
        `- **Online Ordering (${store.orderProviderEn})**: ${store.orderOnlineUrl}`
      );
    }
    const visibleSocials = profiles.filter((p) => p.visible);
    if (visibleSocials.length > 0) {
      lines.push("");
      lines.push("## Official Socials");
      for (const social of visibleSocials) {
        lines.push(`- ${social.label.en} (${social.handle}): ${social.href}`);
      }
    }
    lines.push("");
    return lines.join("\n");
  }

  if (slug === "gallery") {
    lines.push(`## ${site.pages.gallery.title.en}`);
    lines.push("");
    lines.push(site.pages.gallery.description.en);
    lines.push("");
    for (const item of site.pages.gallery.items) {
      const caption = item.caption.en;
      const alt = item.alt.en;
      lines.push(
        alt && alt !== caption
          ? `- **${caption}** (${item.category}): ${alt}`
          : `- **${caption}** (${item.category})`
      );
    }
    lines.push("");
    return lines.join("\n");
  }

  // Default: "home"
  const featured = categories
    .flatMap((c) => c.items)
    .filter((i) => i.featured && i.isAvailable !== false)
    .slice(0, 8);

  if (featured.length > 0) {
    lines.push("## Popular & Signature Dishes");
    lines.push("");
    for (const item of featured) {
      lines.push(formatMenuItemLine(item));
    }
    lines.push("");
  }

  if (site.home.combos.cards.length > 0) {
    lines.push("## Meal Deals & Combos");
    lines.push("");
    for (const combo of site.home.combos.cards) {
      lines.push(`- **${combo.title.en}** (${combo.price}): ${combo.desc.en}`);
    }
    lines.push("");
  }

  lines.push("## Full Menu & Links");
  lines.push(`- Full Live Menu (Markdown): ${SITE_URL}/menu.md`);
  lines.push(`- LLMs Directory: ${SITE_URL}/llms.txt`);
  lines.push(`- Structured JSON Menu API: ${SITE_URL}/api/menu`);
  lines.push("");

  return lines.join("\n");
}

async function computeWeakEtag(content: string): Promise<string> {
  const bytes = new TextEncoder().encode(content);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest).slice(0, 12))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `W/"${hex}"`;
}

export async function createMachineMarkdownResponse(
  request: Request,
  markdown: string,
  options?: { noindex?: boolean; headOnly?: boolean }
): Promise<Response> {
  const etag = await computeWeakEtag(markdown);
  const estimatedTokens = Math.max(1, Math.ceil(markdown.length / 4));

  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    Vary: "Accept",
    ETag: etag,
    "x-markdown-tokens": String(estimatedTokens),
    "Content-Signal": "search=yes, ai-input=yes, ai-train=no",
    "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    "X-Content-Type-Options": "nosniff",
  });

  if (options?.noindex) {
    headers.set("X-Robots-Tag", "noindex");
  }

  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch.split(",").map((s) => s.trim()).includes(etag)) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(options?.headOnly ? null : markdown, {
    status: 200,
    headers,
  });
}
