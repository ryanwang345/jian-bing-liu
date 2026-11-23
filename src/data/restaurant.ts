import type { LocalizedText } from "@/lib/i18n";

export interface OpeningHoursEntry {
  days: LocalizedText;
  hours: LocalizedText;
  schemaDays: string[];
  opens: string;
  closes: string;
}

export interface SocialLink {
  label: LocalizedText;
  handle: string;
  href: string;
  platform: "instagram" | "threads" | "tiktok" | "google-maps";
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://jianbingliu.uk";

export const restaurant = {
  name: "Jian Bing Liu",
  chineseName: "煎饼刘",
  sealText: "爱民",
  chineseTagline: "正宗风味 · 果蔬煎饼",
  description: {
    en: "Authentic Chinese street food takeaway in Camden, London — freshly griddled Jian Bing savoury crepes, delicate lace sweet crepes, handmade dumplings, braised mains, and traditional drinks.",
    zh: "位于伦敦卡姆登的正宗中式街头小吃外卖店——现摊果蔬咸味煎饼、手工花式蕾丝甜煎饼、酥脆煎饺、慢炖热菜及现磨饮品。",
  },
  shortIntro: {
    en: "Tucked along Camden Road, Jian Bing Liu brings the warmth and crunch of traditional Chinese street food to North London — led by made-to-order savoury Jian Bing crepes, vibrant fruit-and-vegetable batters, crisp handmade dumplings, and delicate lace sweet crepes.",
    zh: "藏在伦敦卡姆登路上的暖心烟火气，煎饼刘坚持手工现摊每一张果蔬煎饼——薄脆带焦香的饼皮、秘制咸香酱料、清脆时蔬与酥脆薄脆层层叠起，还有花式蕾丝甜筒、热腾腾的炖菜与手工煎饺，把熟悉的中国街头好味道带到北伦敦。",
  },
  priceRange: "£10–20",
  address: {
    street: "124 Camden Rd",
    locality: "London",
    postalCode: "NW1 9EE",
    country: "United Kingdom",
    countryCode: "GB",
    chineseLine: "英国伦敦卡姆登路 124 号",
  },
  phone: {
    display: "07824 318124",
    href: "tel:+447824318124",
    schema: "+447824318124",
  },
  // Placeholder for owner email — add a verified email address here when available.
  email: null as string | null,
  openingHoursSummary: {
    en: "Monday – Sunday, 11:00 AM – 9:30 PM",
    zh: "周一至周日 11:00 – 21:30",
  },
  openingHours: [
    {
      days: { en: "Monday – Sunday", zh: "周一至周日" },
      hours: { en: "11:00 AM – 9:30 PM", zh: "11:00 – 21:30" },
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
    orderOnline:
      "https://jianbingliucamden.co.uk/menu-jian-bing-liu-chinese-takeaway-camden-town",
    orderOnlineProvider: "All Eat",
    googleMapsDirections:
      "https://www.google.com/maps/search/?api=1&query=Jian+Bing+Liu+124+Camden+Rd+London+NW1+9EE",
    googleMapsEmbedQuery: "124+Camden+Rd,+London+NW1+9EE,+UK",
  },
  verifiedSocialLinks: [
    {
      label: { en: "Instagram", zh: "Instagram" },
      handle: "@jian_bing_liu",
      href: "https://www.instagram.com/jian_bing_liu/",
      platform: "instagram",
    },
    {
      label: { en: "Threads", zh: "Threads" },
      handle: "@jian_bing_liu",
      href: "https://www.threads.com/@jian_bing_liu",
      platform: "threads",
    },
    {
      label: { en: "TikTok", zh: "TikTok" },
      handle: "@jianbingliu.uk",
      href: "https://www.tiktok.com/@jianbingliu.uk",
      platform: "tiktok",
    },
    {
      label: { en: "Google Maps", zh: "谷歌地图" },
      handle: "124 Camden Rd",
      href: "https://www.google.com/maps/search/?api=1&query=Jian+Bing+Liu+124+Camden+Rd+London+NW1+9EE",
      platform: "google-maps",
    },
  ] as SocialLink[],
  story: {
    headline: {
      en: "Fresh off the cast-iron griddle in Camden",
      zh: "伦敦卡姆登，铁板现摊的热乎烟火气",
    },
    lead: {
      en: "At Jian Bing Liu (煎饼刘), every crepe begins on a seasoned round griddle — thin, crisp batter swirled by hand, brushed with aromatic homemade sauce, layered with fresh herbs and crunch, and wrapped warm in our signature kraft sleeve stamped with our 爱民 seal.",
      zh: "在煎饼刘，每一张煎饼都从一口烧得恰到好处的圆铁板开始——手工摊开细腻面糊、磕入鲜蛋、刷上秘制酱料、铺满鲜脆配菜与金黄酥脆，最后趁热装进印有「煎饼刘 · 爱民」印章的牛皮纸袋里。",
    },
    paragraphs: [
      {
        en: "Inspired by the lively street-food stalls of China, our kitchen focuses on the unmistakable contrast of textures that makes Jian Bing unforgettable: tender egg-kissed batter, crisp fried onions and savoury crunch, cool shredded vegetables, and bold house sauce folded together to order.",
        zh: "延续中国街头早餐摊最迷人的层次感，我们讲究刚出锅那一瞬间的口感反差：柔韧带蛋香的饼皮、咔滋作响的酥脆洋葱与脆片、清爽解腻的生菜与蔬菜丝，再由自家调制的秘制酱汁裹在一起，每一口都热乎满足。",
      },
      {
        en: "Alongside our savoury Halal beef, Halal chicken, and veggie-lover crepes, we celebrate playful craft with our vibrant fruit-and-vegetable batters (果蔬煎饼) and intricate lace sweet crepes — plus comforting braised beef, Japanese-style curries, handmade dumplings, wonton soups, and hand-brewed drinks.",
        zh: "除了经典的清真牛肉、清真鸡肉和素食果蔬煎饼，我们还用天然果蔬调出色彩鲜亮的饼皮，并手工挤出精致的花式蕾丝甜煎饼；店内同时供应慢炖牛肉饭、日式咖喱、手工煎饺、鲜汤馄饨和现磨豆浆、黑芝麻糊等熟悉的家常味道。",
      },
      {
        en: "Operating as a dedicated neighbourhood takeaway and delivery kitchen on Camden Road, we prepare every order fresh so you can enjoy warm, colourful Chinese street food on the go or at home across London.",
        zh: "我们扎根伦敦卡姆登路，专注外带与无接触配送，坚持每一单现点现做，无论匆忙路过还是宅家解馋，都能吃到这一口热气腾腾的中国味。",
      },
    ],
    pillars: [
      {
        title: { en: "Made Fresh to Order", zh: "铁板现点现摊" },
        chinese: "现做现卖",
        description: {
          en: "Every Jian Bing and lace crepe is poured, spread, and folded hot on the griddle when you order.",
          zh: "每一张咸味煎饼与花式蕾丝甜煎饼都在下单后现摊现叠，保证拿到手时依然酥脆滚烫。",
        },
      },
      {
        title: { en: "Fruit & Vegetable Craft", zh: "天然果蔬饼皮" },
        chinese: "果蔬煎饼",
        description: {
          en: "Naturally colourful batters, crisp lettuce, spring onions, spinach, and shredded vegetables in every fold.",
          zh: "精选新鲜菠菜、生菜、葱花与爽脆时蔬，色彩自然明亮，清爽不油腻。",
        },
      },
      {
        title: { en: "Halal, Veggie & Vegan Choices", zh: "清真与素食兼顾" },
        chinese: "丰富口味",
        description: {
          en: "Halal beef and chicken fillings sit alongside hearty vegetarian crepes, dumplings, and vegan Japanese curry.",
          zh: "既有清真牛肉、清真鸡肉招牌口味，也贴心准备了素食煎饼、素煎饺与纯素日式咖喱。",
        },
      },
    ],
  },
} as const;
