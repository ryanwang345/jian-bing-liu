export interface OpeningHoursEntry {
  days: string;
  hours: string;
  schemaDays: string[];
  opens: string;
  closes: string;
}

export interface SocialLink {
  label: string;
  href: string;
  platform: "instagram" | "tiktok" | "facebook" | "google-maps";
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://jianbingliucamden.co.uk";

export const restaurant = {
  name: "Jian Bing Liu",
  chineseName: "煎饼刘",
  sealText: "爱吃",
  subtitle: "Fruit & Vegetable Crepes · Chinese Street Food",
  chineseTagline: "正宗风味 · 果蔬煎饼",
  description:
    "Authentic Chinese street food takeaway in Camden, London — freshly griddled Jian Bing savoury crepes, delicate lace sweet crepes, handmade dumplings, braised mains, and traditional drinks.",
  shortIntro:
    "Tucked along Camden Road, Jian Bing Liu brings the warmth and crunch of traditional Chinese street food to North London — led by made-to-order savoury Jian Bing crepes, vibrant fruit-and-vegetable batters, crisp handmade dumplings, and delicate lace sweet crepes.",
  cuisine: "Chinese Street Food & Takeaway",
  priceRange: "£10–20",
  address: {
    street: "124 Camden Rd",
    locality: "Camden, London",
    postalCode: "NW1 9EE",
    country: "United Kingdom",
    countryCode: "GB",
    full: "124 Camden Rd, London NW1 9EE, United Kingdom",
  },
  phone: {
    display: "07824 318124",
    href: "tel:+447824318124",
    schema: "+447824318124",
  },
  // Placeholder for owner email — add a verified email address here when available.
  email: null as string | null,
  openingHoursSummary: "Monday – Sunday, 11:00 AM – 9:30 PM",
  openingHours: [
    {
      days: "Monday – Sunday",
      hours: "11:00 AM – 9:30 PM",
      schemaDays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "11:00",
      closes: "21:30",
    },
  ] as OpeningHoursEntry[],
  serviceOptions: {
    takeaway: true,
    noContactDelivery: true,
    dineIn: false,
  },
  links: {
    // Verified official online ordering portal (All Eat App) linked from jianbingliucamden.co.uk
    orderOnline:
      "https://jianbingliucamden.co.uk/menu-jian-bing-liu-chinese-takeaway-camden-town",
    orderOnlineProvider: "All Eat",
    googleMapsDirections:
      "https://www.google.com/maps/search/?api=1&query=Jian+Bing+Liu+124+Camden+Rd+London+NW1+9EE",
    googleMapsEmbedQuery: "124+Camden+Rd,+London+NW1+9EE,+UK",
  },
  // Verified external profiles only. Add official Instagram, TikTok, or Facebook URLs
  // here once confirmed by the restaurant so no unverified or third-party links appear.
  verifiedSocialLinks: [
    {
      label: "Find us on Google Maps",
      href: "https://www.google.com/maps/search/?api=1&query=Jian+Bing+Liu+124+Camden+Rd+London+NW1+9EE",
      platform: "google-maps",
    },
  ] as SocialLink[],
  // Clearly marked placeholders for optional content the owner may want to supply later
  placeholders: {
    emailLabel: "Email address (placeholder — add in src/data/restaurant.ts)",
    socialNotice:
      "Official Instagram & TikTok links can be added in src/data/restaurant.ts once confirmed.",
    founderStoryNote:
      "Owner bio placeholder: add founder year, hometown roots, and family recipe anecdotes in src/data/restaurant.ts.",
  },
  story: {
    headline: "Fresh off the cast-iron griddle in Camden",
    lead: "At Jian Bing Liu (煎饼刘), every crepe begins on a seasoned round griddle — thin, crisp batter swirled by hand, brushed with aromatic homemade sauce, layered with fresh herbs and crunch, and wrapped warm in our signature kraft sleeve.",
    paragraphs: [
      "Inspired by the lively street-food stalls of China, our kitchen focuses on the unmistakable contrast of textures that makes Jian Bing unforgettable: tender egg-kissed batter, crisp fried onions and savoury crunch, cool shredded vegetables, and bold house sauce folded together to order.",
      "Alongside our savoury Halal beef, Halal chicken, and veggie-lover crepes, we celebrate playful craft with our vibrant fruit-and-vegetable batters (果蔬煎饼) and intricate lace sweet crepes — plus comforting braised beef, Japanese-style curries, handmade dumplings, wonton soups, and hand-brewed drinks.",
      "Operating as a dedicated neighbourhood takeaway and delivery kitchen on Camden Road, we prepare every order fresh so you can enjoy warm, colourful Chinese street food on the go or at home across London.",
    ],
    pillars: [
      {
        title: "Made Fresh to Order",
        chinese: "现做现卖",
        description:
          "Every Jian Bing and lace crepe is poured, spread, and folded hot on the griddle when you order.",
      },
      {
        title: "Fruit & Vegetable Craft",
        chinese: "果蔬煎饼",
        description:
          "Naturally colourful batters, crisp lettuce, spring onions, spinach, and shredded vegetables in every fold.",
      },
      {
        title: "Halal, Veggie & Vegan Choices",
        chinese: "丰富口味",
        description:
          "Halal beef and chicken fillings sit alongside hearty vegetarian crepes, dumplings, and vegan Japanese curry.",
      },
    ],
  },
} as const;
