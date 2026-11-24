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
  platform:
    | "instagram"
    | "threads"
    | "tiktok"
    | "rednote"
    | "reddit"
    | "fantuan"
    | "google-maps";
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
    en: "Handmade Northern Chinese Jian Bing on Camden Road, London. Natural dragon fruit & beetroot batters with zero food dye, Halal beef & chicken, veggie & vegan choices, dumplings, and lace sweet crepes. Takeaway & delivery. Rated 4.9★ on Google.",
    zh: "国内退休后来伦敦三次归零创业，扎根卡姆登路的暖心煎饼小店！鲜切红心火龙果与甜菜根现榨天然果蔬饼皮，清真牛鸡与素食纯素皆全，Google 4.9★ 好评，支持到店自取外带与无接触配送。",
  },
  shortIntro: {
    en: "Mrs Liu retired in China, moved to London, and started over for the third time — spinning crisp Northern Chinese Jian Bing on Camden Road with fresh dragon fruit & beetroot batters, crispy wonton cracker, Halal beef or chicken, and house chilli oil.",
    zh: "国内退休后搬来伦敦，刘阿姨第三次把自己归零重来——在卡姆登路守着一块热铁板，鲜切红心火龙果与甜菜根现榨和面，磕双蛋、夹薄脆、配清真牛鸡与素食，把热气腾腾的中国街头味带到北伦敦。",
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
    en: "Mon–Wed 11:00 AM – 9:00 PM · Thu–Sun 11:00 AM – 9:30 PM",
    zh: "周一至周三 11:00 – 21:00 · 周四至周日 11:00 – 21:30",
  },
  openingHours: [
    {
      days: { en: "Monday – Wednesday", zh: "周一至周三" },
      hours: { en: "11:00 AM – 9:00 PM", zh: "11:00 – 21:00" },
      schemaDays: ["Monday", "Tuesday", "Wednesday"],
      opens: "11:00",
      closes: "21:00",
    },
    {
      days: { en: "Thursday – Sunday", zh: "周四至周日" },
      hours: { en: "11:00 AM – 9:30 PM", zh: "11:00 – 21:30" },
      schemaDays: ["Thursday", "Friday", "Saturday", "Sunday"],
      opens: "11:00",
      closes: "21:30",
    },
  ] as OpeningHoursEntry[],
  serviceOptions: {
    dineIn: false,
    takeaway: true,
    noContactDelivery: true,
  },
  links: {
    orderOnline: "https://www.fantuanorder.com/store/jian-bing-liu/gb-4753211",
    orderOnlineProvider: "Fantuan",
    orderOnlineProviderZh: "饭团外卖",
    fantuanOrder: "https://www.fantuanorder.com/store/jian-bing-liu/gb-4753211",
    googleMapsDirections:
      "https://www.google.com/maps/place/Jian+Bing+Liu/@51.5422785,-0.1377214,17z/data=!3m1!4b1!4m6!3m5!1s0x48761b0053d36dcf:0x6c48602980f0cb9e!8m2!3d51.5422785!4d-0.1377214!16s%2Fg%2F11y90b95h1",
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
      label: { en: "RedNote", zh: "小红书" },
      handle: "ID: 1162231947",
      href: "https://xhslink.cn/m/24xL12L1i1R",
      platform: "rednote",
    },
    {
      label: { en: "Reddit", zh: "Reddit 社区" },
      handle: "r/LondonFood",
      href: "https://www.reddit.com/r/LondonFood/comments/1qmx85b/highly_recommend_jian_bing_liu_in_camden/",
      platform: "reddit",
    },
    {
      label: { en: "Fantuan Delivery", zh: "饭团外卖" },
      handle: "4.5 ★ Camden",
      href: "https://www.fantuanorder.com/store/jian-bing-liu/gb-4753211",
      platform: "fantuan",
    },
    {
      label: { en: "Google Maps", zh: "谷歌地图" },
      handle: "124 Camden Rd",
      href: "https://www.google.com/maps/place/Jian+Bing+Liu/@51.5422785,-0.1377214,17z/data=!3m1!4b1!4m6!3m5!1s0x48761b0053d36dcf:0x6c48602980f0cb9e!8m2!3d51.5422785!4d-0.1377214!16s%2Fg%2F11y90b95h1",
      platform: "google-maps",
    },
  ] as SocialLink[],
  story: {
    headline: {
      en: "Retired in China. Starting over in London — third time lucky.",
      zh: "国内退休，来伦敦第三次从零开始",
    },
    lead: {
      en: "No shortcuts on Camden Road: real fruit and veg blended straight into the batter, cracked egg on sizzling cast iron, crisp wonton cracker, and folded piping hot into our brown paper sleeve stamped with our 爱民 seal.",
      zh: "在卡姆登路守着这块热铁板，不走捷径、不加色素：新鲜红心火龙果与甜菜根现切现榨和面，热锅磕蛋、刷秘制酱、铺满现炸薄脆与鲜菜，趁热装进盖着「煎饼刘 · 爱民」朱印的牛皮纸袋。",
    },
    paragraphs: [
      {
        en: "After retiring in China and settling in the UK, Mrs Liu decided to start from scratch for the third time in her life — bringing real Northern Chinese street food to London. What began with one round cast-iron griddle has grown into a beloved Camden neighbourhood spot with over 280 five-star reviews on Google.",
        zh: "在国内退休定居英国后，刘阿姨决定人生第三次把自己归零，把最地道的中国果蔬煎饼与街头小吃带到伦敦。从一口圆铁板起步，慢慢做成卡姆登街坊与伦敦食客口口相传的小店，在 Google 收获了 280 多条五星好评。",
      },
      {
        en: "No artificial colouring, ever. Our pink and green batters get their colour straight from fresh red dragon fruit, beetroot, and spinach — then meet crisp fried onions, savoury house sauce, homemade chilli oil, and hand-piped lace sweet crepes cooked right in front of you.",
        zh: "绝不靠食用色素讨巧：粉色与翠绿的饼皮，来自后厨每天现切鲜榨的红心火龙果、甜菜根与新鲜菠菜。配上自家熬制咸香酱、秘制辣椒油和现炸薄脆，旁边还有手工挤制的花式蕾丝甜筒、慢炖牛肉饭、纯素咖喱与现磨豆浆。",
      },
      {
        en: "Whether you are a UCL or CSM student missing home, a Camden local grabbing a £6.50 lunch crepe, or a group mixing Halal beef, veggie, and vegan orders, pick one up hot for the walk or order delivery straight to your door.",
        zh: "不管是想念家乡味的留子、下班顺路买份 £6.5 午市煎饼的伦敦本地客，还是清真搭子与素食朋友一起拼单外带，只要铁板还热着，我们就在卡姆登路 124 号现点现摊，等你趁热带走。",
      },
    ],
    pillars: [
      {
        title: { en: "Real Dragon Fruit & Beetroot Batters", zh: "鲜切果蔬现榨 · 零色素" },
        chinese: "果蔬现榨",
        description: {
          en: "Fresh red dragon fruit, beetroot, and spinach blended straight into the batter — natural colour, light crisp edge, zero food dye.",
          zh: "新鲜红心火龙果、甜菜根与菠菜现切榨汁和面，色泽自然清香，外圈微脆、里头软韧。",
        },
      },
      {
        title: { en: "4.9★ Camden Favourite", zh: "伦敦卡姆登 4.9★ 口碑" },
        chinese: "匠心手作",
        description: {
          en: "Started from scratch after retirement and now backed by 280+ five-star Google reviews across RedNote, TikTok, Instagram, and r/LondonFood.",
          zh: "退休赴英归零创业一路走来，收获 Google 280+ 五星好评与小红书、TikTok、Instagram 食客口口相传。",
        },
      },
      {
        title: { en: "Halal, Veggie & Vegan Choices", zh: "清真、素食与纯素皆全" },
        chinese: "丰俭由人",
        description: {
          en: "Halal beef and chicken Jian Bing and beef dumplings sit alongside veggie crepes, veg dumplings, and vegan Japanese curry.",
          zh: "清真牛肉/鸡肉煎饼与牛肉煎饺之外，同时备齐蛋奶素煎饼、素煎饺与纯素日式咖喱，拼单不踩雷。",
        },
      },
    ],
  },
} as const;
