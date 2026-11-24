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
    en: "Warm, freshly griddled Northern Chinese Jian Bing tucked away on Camden Road. Natural dragon fruit, beetroot and spinach batters — never food dye — with Roast Duck, Halal beef & chicken, veggie choices, Crème Brûlée & Matcha crepes and Hong Kong milk teas. Takeaway & delivery. 4.9★ on Google.",
    zh: "藏在伦敦卡姆登路上的家常煎饼小店。刘阿姨国内退休后赴英三次从零开始，每天现切红心火龙果、甜菜根与菠菜榨汁和面（零色素），现摊招牌烤鸭、清真牛鸡与素菜煎饼、焦糖布蕾与抹茶开心果可丽饼、手工煎饺与港式饮品。仅限外带与配送，Google 4.9★ 好评。",
  },
  shortIntro: {
    en: "After retiring in China, Mrs Liu started over in London — third time lucky. One cast-iron griddle on Camden Road, fresh dragon fruit & beetroot squeezed every morning, and crisp Jian Bing folded hot to order.",
    zh: "国内退休后来伦敦，刘阿姨第三次从零起步——在卡姆登路守着一块热铁板，每天清晨鲜切火龙果与甜菜根榨汁和面，把热腾腾、外柔内脆的家乡煎饼亲手递到每位食客手里。",
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
      en: "Done properly on Camden Road: real fruit and veg juiced straight into the batter, cracked egg on hot cast iron, a proper wonton crunch, and folded warm into our brown paper sleeve stamped with our 爱民 seal.",
      zh: "在卡姆登路守着一口热铁板，实实在在做好每一张饼：新鲜红心火龙果、甜菜根与菠菜现榨和面，磕蛋刷自家酱、夹上酥脆薄脆，趁热装进印着「煎饼刘 · 爱民」朱印的牛皮纸袋。",
    },
    paragraphs: [
      {
        en: "After retiring in China and settling in the UK, Mrs Liu decided to start from scratch for the third time in her life — bringing proper Northern Chinese street food to London. What began with one round cast-iron griddle has quietly grown into a much-loved Camden neighbourhood spot with over 280 five-star reviews on Google.",
        zh: "国内退休定居英国后，刘阿姨决定人生第三次从零开始，把熟悉的家乡果蔬煎饼带到伦敦。从一口圆铁板起步，不紧不慢，靠街坊和回头客口口相传，在 Google 收获了 280 多条五星好评。",
      },
      {
        en: "No artificial colouring, ever. Our pink and green batters get their colour straight from fresh red dragon fruit, beetroot and spinach — then meet crisp fried shallots, Mrs Liu's savoury house sauce, homemade chilli oil and warm sweet crepes cooked right in front of you.",
        zh: "绝不用一滴食用色素。粉色和翠绿的饼皮，来自后厨每天现切鲜榨的红心火龙果、甜菜根和菠菜。再刷上刘阿姨自己熬的咸香酱、辣椒油，旁边还有慢炖土豆牛肉、纯素咖喱、脆底煎饺与现磨热豆浆。",
      },
      {
        en: "Whether you're a UCL or CSM student missing the taste of home, a Camden local grabbing an £8 medium Jian Bing or £12 Meal Deal, or a group mixing Halal beef, Roast Duck and veggie orders, pop in for something hot to go or order delivery straight to your door.",
        zh: "不管是想念老家味道的留学生、路过顺手买份 £8 中份煎饼或 £12 优惠套餐的卡姆登街坊，还是清真牛鸡、烤鸭与素食朋友一起拼单，只要铁板还热着，我们就在卡姆登路 124 号现点现做，等你趁热带走。",
      },
    ],
    pillars: [
      {
        title: { en: "Fresh Fruit & Veg Batters", zh: "鲜榨果蔬和面 · 零色素" },
        chinese: "果蔬现榨",
        description: {
          en: "Real red dragon fruit, beetroot and spinach juiced straight into the batter — natural colour, gentle crisp edge, never food dye.",
          zh: "每天现切红心火龙果、甜菜根与菠菜榨汁调糊，颜色自然清爽，摊出来外圈微脆、里头软韧。",
        },
      },
      {
        title: { en: "Loved by Camden Locals (4.9★)", zh: "街坊口口相传 · 4.9★" },
        chinese: "匠心手作",
        description: {
          en: "Built from scratch after retirement and now backed by 280+ five-star Google reviews from regulars, students and North London locals.",
          zh: "退休后在伦敦从零做起，靠实在分量和亲切人情味，攒下 280 多条真实五星好评。",
        },
      },
      {
        title: { en: "Halal, Veggie & Vegan Friendly", zh: "清真、素食与纯素皆全" },
        chinese: "丰俭由人",
        description: {
          en: "Halal beef & chicken Jian Bing, Halal Beef Buns and 6-piece Beef Dumplings sit alongside veggie crepes, spring onion flatbread, veggie dumplings and refreshing vegan teas.",
          zh: "清真牛鸡煎饼、清真牛肉大包与 6 只牛肉煎饺之外，同样备齐素菜煎饼、葱油饼、素煎饺与多款纯素鲜果茶饮，拼单特别方便。",
        },
      },
    ],
  },
} as const;
