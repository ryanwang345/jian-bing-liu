import { galleryItems, type GalleryCategoryKey, type GalleryItem } from "@/data/gallery";
import { restaurant } from "@/data/restaurant";
import type { LocalizedText } from "@/lib/i18n";

export type HomeSectionId =
  | "hero"
  | "infoStrip"
  | "ticker"
  | "featuredMenu"
  | "combos"
  | "reviews"
  | "audience"
  | "craftShowcase"
  | "storyBand"
  | "galleryStrip"
  | "ctaBanner";

export interface HomeSectionLayoutItem {
  id: HomeSectionId;
  visible: boolean;
}

export interface EditableStoryHighlight {
  id: string;
  label: LocalizedText;
  tag: LocalizedText;
  headline: LocalizedText;
  caption: LocalizedText;
  hashtag: string;
  image: string;
  ctaLabel: LocalizedText;
  href: string;
  external?: boolean;
}

export interface EditableCraftSlide {
  id: string;
  number: string;
  tabLabel: LocalizedText;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  metricValue: LocalizedText;
  metricLabel: LocalizedText;
  image: string;
  href: string;
  cta: LocalizedText;
}

export interface EditableComboCard {
  id: string;
  tag: LocalizedText;
  title: LocalizedText;
  price: string;
  desc: LocalizedText;
  image: string;
  href: string;
  cta: LocalizedText;
}

export interface EditablePhotoCard {
  src: string;
  label: LocalizedText;
}

export interface NewArrivalsConfig {
  /** Master switch for the site-wide "new dishes" banner */
  bannerEnabled: boolean;
  /** Automatically drop the "new" flag N days after launch (0 = never expire) */
  autoExpireDays: number;
  title: LocalizedText;
  message: LocalizedText;
  ctaLabel: LocalizedText;
}

export interface SiteContentConfig {
  newArrivals: NewArrivalsConfig;
  store: {
    nameEn: string;
    nameZh: string;
    sealText: string;
    taglineZh: string;
    phoneDisplay: string;
    street: string;
    locality: string;
    postalCode: string;
    addressZh: string;
    orderOnlineUrl: string;
    orderProviderEn: string;
    orderProviderZh: string;
    googleMapsUrl: string;
    googleMapsEmbedQuery: string;
    monWedOpens: string;
    monWedCloses: string;
    thuSunOpens: string;
    thuSunCloses: string;
    hoursSummaryEn: string;
    hoursSummaryZh: string;
    temporarilyClosed: boolean;
    closedNotice: LocalizedText;
    customAnnouncementEnabled: boolean;
    customAnnouncement: LocalizedText;
    footerIntro: LocalizedText;
    footerNote: LocalizedText;
  };
  home: {
    sections: HomeSectionLayoutItem[];
    hero: {
      mobilePhotoFirst: boolean;
      desktopPhotoRight: boolean;
      headlineEnPrefix: string;
      headlineEnHighlight: string;
      headlineEnSuffix: string;
      headlineZhLine1: string;
      headlineZhLine2: string;
      headlineZhHighlight: string;
      description: LocalizedText;
      primaryCta: LocalizedText;
      orderCta: LocalizedText;
      directionsCta: LocalizedText;
      mainPhoto: string;
      mainPhotoCaption: LocalizedText;
      mainPhotoPrice: string;
      subPhotoLeft: string;
      subPhotoLeftTitle: LocalizedText;
      subPhotoLeftSub: LocalizedText;
      subPhotoRight: string;
      subPhotoRightTitle: LocalizedText;
      subPhotoRightSub: LocalizedText;
    };
    storyHighlights: EditableStoryHighlight[];
    tickerItems: LocalizedText[];
    featuredMenu: {
      columns: 2 | 3;
      eyebrow: LocalizedText;
      chineseAccent: string;
      title: LocalizedText;
      description: LocalizedText;
    };
    combos: {
      eyebrow: LocalizedText;
      chineseAccent: string;
      title: LocalizedText;
      description: LocalizedText;
      cards: EditableComboCard[];
    };
    audience: {
      cards: Array<{
        badge: LocalizedText;
        accentZh: string;
        title: LocalizedText;
        description: LocalizedText;
        cta: LocalizedText;
        href: string;
      }>;
    };
    craftShowcase: {
      heading: LocalizedText;
      slides: EditableCraftSlide[];
    };
    storyBand: {
      photoMain: string;
      photoTopRight: string;
      photoBottomRight: string;
      eyebrow: LocalizedText;
      chineseAccent: string;
      title: LocalizedText;
      lead: LocalizedText;
      pillars: Array<{
        title: LocalizedText;
        chinese: string;
        description: LocalizedText;
      }>;
    };
    galleryStrip: {
      eyebrow: LocalizedText;
      chineseAccent: string;
      title: LocalizedText;
      description: LocalizedText;
      photos: EditablePhotoCard[];
    };
    ctaBanner: {
      eyebrow: LocalizedText;
      title: LocalizedText;
      description: LocalizedText;
    };
  };
  pages: {
    menu: {
      eyebrow: LocalizedText;
      chineseAccent: string;
      title: LocalizedText;
      description: LocalizedText;
      allergenTitle: LocalizedText;
      dietaryNote: LocalizedText;
      allergenNote: LocalizedText;
      pricingNote: LocalizedText;
    };
    story: {
      eyebrow: LocalizedText;
      chineseAccent: string;
      headline: LocalizedText;
      lead: LocalizedText;
      paragraphs: LocalizedText[];
      heroPhoto: string;
      stepsTitle: LocalizedText;
      stepsDescription: LocalizedText;
      steps: Array<{
        step: LocalizedText;
        title: LocalizedText;
        chinese: string;
        description: LocalizedText;
        image: string;
      }>;
      detailsTitle: LocalizedText;
      detailsDescription: LocalizedText;
      detailCards: Array<{
        image: string;
        caption: LocalizedText;
      }>;
    };
    gallery: {
      eyebrow: LocalizedText;
      chineseAccent: string;
      title: LocalizedText;
      description: LocalizedText;
      items: GalleryItem[];
    };
    visit: {
      eyebrow: LocalizedText;
      chineseAccent: string;
      title: LocalizedText;
      description: LocalizedText;
      storefrontPhoto: string;
      storefrontCaption: LocalizedText;
      hoursHint: LocalizedText;
    };
  };
}

export const HOME_SECTION_LABELS: Record<
  HomeSectionId,
  { zh: string; en: string }
> = {
  hero: { zh: "首屏主视觉与三图拼图", en: "Hero Banner & Bento Photos" },
  infoStrip: { zh: "地址与营业时间信息栏", en: "Address & Hours Bar" },
  ticker: { zh: "滚动亮点跑马灯", en: "Scrolling Highlights Ticker" },
  featuredMenu: { zh: "招牌美味推荐区", en: "Featured Menu Highlights" },
  combos: { zh: "人气三套搭配指南", en: "First-Time Ordering Combos" },
  reviews: { zh: "Google 好评与社媒动态墙", en: "Google Reviews & Social Proof" },
  audience: { zh: "清真 · 家乡味 · 蔬食三栏卡片", en: "Halal, Authentic & Vegan Cards" },
  craftShowcase: { zh: "铁板匠心滚动幻灯片（4 幕）", en: "Interactive Craft Showcase" },
  storyBand: { zh: "品牌故事三图区", en: "Our Story Collage Band" },
  galleryStrip: { zh: "后厨实拍四图精选", en: "Kitchen Photo Strip" },
  ctaBanner: { zh: "底部到店与外卖邀请横幅", en: "Bottom Visit & Order Banner" },
};

export const defaultSiteContent: SiteContentConfig = {
  newArrivals: {
    bannerEnabled: true,
    autoExpireDays: 30,
    title: { zh: "新品上市", en: "New on the menu" },
    message: {
      zh: "刘阿姨新研发的味道已经上桌，快来尝鲜！",
      en: "Fresh from Mrs Liu's griddle — come and try them first!",
    },
    ctaLabel: { zh: "立即尝鲜", en: "Try it now" },
  },
  store: {
    nameEn: restaurant.name,
    nameZh: restaurant.chineseName,
    sealText: restaurant.sealText,
    taglineZh: restaurant.chineseTagline,
    phoneDisplay: restaurant.phone.display,
    street: restaurant.address.street,
    locality: restaurant.address.locality,
    postalCode: restaurant.address.postalCode,
    addressZh: restaurant.address.chineseLine,
    orderOnlineUrl: restaurant.links.orderOnline,
    orderProviderEn: restaurant.links.orderOnlineProvider,
    orderProviderZh: restaurant.links.orderOnlineProviderZh,
    googleMapsUrl: restaurant.links.googleMapsDirections,
    googleMapsEmbedQuery: restaurant.links.googleMapsEmbedQuery,
    monWedOpens: "11:00",
    monWedCloses: "21:00",
    thuSunOpens: "11:00",
    thuSunCloses: "21:30",
    hoursSummaryEn: "Mon–Wed 11:00–21:00 · Thu–Sun 11:00–21:30",
    hoursSummaryZh: "周一至三 11:00–21:00 · 周四至日 11:00–21:30",
    temporarilyClosed: false,
    closedNotice: {
      zh: "今日门店临时休息，明日照常营业，感谢街坊理解！",
      en: "We are temporarily closed today and will reopen as usual tomorrow!",
    },
    customAnnouncementEnabled: false,
    customAnnouncement: {
      zh: "",
      en: "",
    },
    footerIntro: {
      zh: "卡姆登路手工现摊中式果蔬煎饼——新鲜红心火龙果与甜菜根榨汁调糊，清真牛肉鸡肉，亦备有丰富素食与纯素美味。",
      en: "Handmade Northern Chinese Jian Bing on Camden Road — natural dragon fruit & beetroot batters, Halal beef & chicken, and veggie & vegan favourites.",
    },
    footerNote: {
      zh: "仅限外带与无接触配送（不提供堂食） · 菜品供应及价格以门店实际为准",
      en: "Takeaway & no-contact delivery only (no dine-in) · Prices & availability subject to in-store confirmation.",
    },
  },
  home: {
    sections: [
      { id: "hero", visible: true },
      { id: "infoStrip", visible: true },
      { id: "ticker", visible: true },
      { id: "featuredMenu", visible: true },
      { id: "combos", visible: true },
      { id: "reviews", visible: true },
      { id: "audience", visible: true },
      { id: "craftShowcase", visible: true },
      { id: "storyBand", visible: true },
      { id: "galleryStrip", visible: true },
      { id: "ctaBanner", visible: true },
    ],
    hero: {
      mobilePhotoFirst: true,
      desktopPhotoRight: true,
      headlineEnPrefix: "Hot, crisp",
      headlineEnHighlight: "Jian Bing",
      headlineEnSuffix: "spun fresh in Camden.",
      headlineZhLine1: "鲜榨果蔬皮，",
      headlineZhLine2: "铁板现摊的",
      headlineZhHighlight: "热乎煎饼",
      description: {
        zh: "新鲜红心火龙果、甜菜根和菠菜直接榨汁和面，出锅就是自然果蔬色。每一张都是现点现摊，磕鲜蛋、刷刘阿姨自家熬的酱、裹上金黄薄脆，捧在手里沉甸甸的，还是国内街口那股热乎香。",
        en: "Real dragon fruit, beetroot and spinach go straight into our batter for natural colour. Cooked to order with fresh egg, Mrs Liu's savoury house sauce and a crisp golden cracker folded right into the middle — hearty, comforting street food just like back home.",
      },
      primaryCta: { zh: "查看完整菜单", en: "View Menu" },
      orderCta: { zh: "饭团在线点餐", en: "Order on Fantuan" },
      directionsCta: { zh: "导航到店", en: "Directions" },
      mainPhoto: "/images/hero-jianbing-platter.webp",
      mainPhotoCaption: {
        zh: "现点现摊招牌咸味煎饼 · 零色素果蔬皮",
        en: "Signature Savoury Jian Bing · Zero Food Dye",
      },
      mainPhotoPrice: "£8 – £14",
      subPhotoLeft: "/images/roast-duck-jianbing.webp",
      subPhotoLeftTitle: { zh: "新品烤鸭煎饼", en: "Roast Duck Jian Bing" },
      subPhotoLeftSub: { zh: "满料现切烤鸭 · £12", en: "Crisp Roast Duck · £12" },
      subPhotoRight: "/images/creme-brulee-crepe.webp",
      subPhotoRightTitle: { zh: "焦糖布蕾可丽饼", en: "Crème Brûlée Crepe" },
      subPhotoRightSub: { zh: "甜口可丽饼 £5–£12", en: "Sweet Crepes £5–£12" },
    },
    storyHighlights: [
      {
        id: "dragonfruit",
        label: { en: "Fresh Batter", zh: "鲜榨果蔬皮" },
        tag: { en: "Never Food Dye", zh: "现切鲜榨 · 零色素" },
        headline: {
          en: "Real Red Dragon Fruit & Spinach Batters",
          zh: "红心火龙果与菠菜，每天现榨和面",
        },
        caption: {
          en: "Never artificial colouring — every morning Mrs Liu juices fresh red dragon fruit, beetroot and spinach straight into our batter for a naturally colourful, crisp-edged Jian Bing.",
          zh: "不用一滴食用色素。每天清晨刘阿姨在后厨现切红心火龙果、甜菜根和菠菜榨汁调糊，摊出来的煎饼皮带着自然清香，外圈微脆、里头软韧。",
        },
        hashtag: "124 Camden Rd · NW1",
        image: "/images/mrs-liu-rainbow-griddle.webp",
        ctaLabel: { en: "Explore Crepe Menu", zh: "查看果蔬煎饼菜单" },
        href: "/menu",
      },
      {
        id: "roast-duck",
        label: { en: "Roast Duck", zh: "招牌烤鸭" },
        tag: { en: "New · £12", zh: "新品热卖 · £12" },
        headline: {
          en: "Crisp Roast Duck & Halal Jian Bing",
          zh: "招牌脆皮烤鸭煎饼与清真牛鸡煎饼",
        },
        caption: {
          en: "Carved warm roast duck (£12), Halal Chicken (£8 Med / £11 Reg) and Halal Beef (£9 Med / £12 Reg) — or grab a Meal Deal with a drink from £12.",
          zh: "现切脆皮烤鸭煎饼 £12、清真鸡肉（中份 £8 / 标准 £11）、清真牛肉（中份 £9 / 标准 £12），搭配港式柠檬茶或豆浆套餐 £12 起。",
        },
        hashtag: "Medium from £8 · Meal Deals £12+",
        image: "/images/roast-duck-jianbing.webp",
        ctaLabel: { en: "See Savoury Jian Bing", zh: "看招牌咸味煎饼" },
        href: "/menu#savoury-crepes",
      },
      {
        id: "creme-brulee",
        label: { en: "Crème Brûlée", zh: "焦糖布蕾" },
        tag: { en: "Limited Edition · £11", zh: "人气限定 · £11" },
        headline: {
          en: "Torched Crème Brûlée & Mascarpone Crepe",
          zh: "现烤焦糖布蕾蛋糕可丽饼",
        },
        caption: {
          en: "Silky custard cream and mascarpone torched golden with fresh strawberries (£11), Cute Character Strawberry/Banana crepes (£10), or warm Chocolate Crepes (£5).",
          zh: "丝滑马斯卡彭奶油布蕾现烤焦糖脆壳配鲜草莓（£11），还有 £10 小动物鲜果可丽饼与 £5 热乎巧克力可丽饼。",
        },
        hashtag: "Sweet crepes from £5",
        image: "/images/creme-brulee-crepe.webp",
        ctaLabel: { en: "See Sweet Crepes", zh: "看花式可丽饼" },
        href: "/menu#sweet-crepes-and-desserts",
      },
      {
        id: "matcha-pistachio",
        label: { en: "Matcha", zh: "抹茶开心果" },
        tag: { en: "Matcha & Pistachio · £12", zh: "招牌甜口 · £12" },
        headline: {
          en: "Matcha & Pistachio Crème Brûlée Crepe",
          zh: "抹茶开心果布蕾蛋糕可丽饼",
        },
        caption: {
          en: "Fragrant green tea matcha crepe layered with creamy brûlée custard, nutty pistachio fluff and a generous dusting of matcha (£12).",
          zh: "茶香清苦回甘的抹茶饼皮，层层叠入绵密布蕾与香浓开心果奶油脆（£12），香醇不腻。",
        },
        hashtag: "Matcha · Pistachio · £12",
        image: "/images/matcha-pistachio-crepe.webp",
        ctaLabel: { en: "View Sweet Crepes", zh: "查看可丽饼菜单" },
        href: "/menu#sweet-crepes-and-desserts",
      },
      {
        id: "boba-drinks",
        label: { en: "HK Milk Tea", zh: "港式奶茶" },
        tag: { en: "Special Drinks · £6", zh: "特色手调饮品 · £6" },
        headline: {
          en: "Hong Kong Boba Milk Tea & Warm Soya Milk",
          zh: "港式奶茶撞珍珠（£6）与热豆奶 / 黑芝麻糊（£4）",
        },
        caption: {
          en: "Silky Hong Kong Boba Milk Tea (£6), Mango Pomelo Sago (£6), Pistachio Matcha Boba (£6), or cosy warm House Soya Milk & Toasted Black Sesame Paste (£4).",
          zh: "港式奶茶撞珍珠 £6、杨枝甘露 £6、开心抹茶珍珠奶茶 £6，还有暖手热豆奶与手磨黑芝麻糊 £4。",
        },
        hashtag: "Drinks from £2 · Specials £6",
        image: "/images/brulee-boba-milk-tea.webp",
        ctaLabel: { en: "Browse Drinks Menu", zh: "查看饮品菜单" },
        href: "/menu#drinks",
      },
      {
        id: "camden-shop",
        label: { en: "Our Shop", zh: "卡姆登门店" },
        tag: { en: "124 Camden Rd · NW1", zh: "认准红旗门面" },
        headline: {
          en: "Pop In to Take Away or Order on Fantuan",
          zh: "卡姆登路 124 号现做带走 · 饭团外卖直达",
        },
        caption: {
          en: "Takeaway and no-contact delivery only (no dine-in). Look for our hanging red Jian Bing banner at 124 Camden Rd NW1 9EE, or order warm on Fantuan.",
          zh: "仅限到店外带与无接触配送（不提供堂食）。认准卡姆登路 124 号门口红底果蔬煎饼旗帜，或上饭团外卖直接下单。",
        },
        hashtag: "Takeaway & Delivery",
        image: "/images/storefront-camden.webp",
        ctaLabel: { en: "Order on Fantuan", zh: "去饭团外卖下单" },
        href: restaurant.links.orderOnline,
        external: true,
      },
    ],
    tickerItems: [
      {
        en: "FRESH DRAGON FRUIT & BEETROOT BATTER · NEVER FOOD DYE",
        zh: "每天现切红心火龙果 · 甜菜根榨汁和面",
      },
      {
        en: "ROAST DUCK £12 · HALAL BEEF & CHICKEN FROM £8",
        zh: "新品烤鸭煎饼 £12 · 清真牛鸡煎饼 £8 起",
      },
      {
        en: "MEAL DEALS FROM £12 (JIAN BING + DRINK)",
        zh: "优惠套餐 £12 起（招牌煎饼 + 港式柠檬茶/豆浆）",
      },
      {
        en: "CRÈME BRÛLÉE £11 · MATCHA PISTACHIO CREPE £12",
        zh: "焦糖布蕾可丽饼 £11 · 抹茶开心果可丽饼 £12",
      },
      {
        en: "PAN-FRIED DUMPLINGS (6 PCS) FROM £5 · WARM SOYA MILK £4",
        zh: "现煎手工饺子 6 只 £5 起 · 热豆奶 / 黑芝麻糊 £4",
      },
      {
        en: "4.9★ ON GOOGLE (287+ REVIEWS) · 124 CAMDEN RD NW1",
        zh: "Google 4.9★ 街坊口碑 · 卡姆登路 124 号",
      },
    ],
    featuredMenu: {
      columns: 3,
      eyebrow: { zh: "家的味道 · 热乎现摊", en: "Fresh Off the Griddle" },
      chineseAccent: "招牌美味",
      title: {
        zh: "热乎出锅，像在家门口吃的一样踏实",
        en: "Cooked warm to order, just like back home",
      },
      description: {
        zh: "招牌烤鸭与清真牛鸡煎饼、焦糖布蕾与抹茶开心果可丽饼、萝卜炖牛肉饭与手工煎饺——全线明码实价，现点现做。",
        en: "From Roast Duck and Halal Beef Jian Bing to torched Crème Brûlée crepes, Matcha Pistachio crepes and slow-braised beef rice — simple, generous food cooked warm to order.",
      },
    },
    combos: {
      eyebrow: {
        zh: "第一次来不知道点啥？",
        en: "First Time at the Counter?",
      },
      chineseAccent: "人气搭配",
      title: {
        zh: "回头客常点的三套家常搭配",
        en: "Three orders Camden regulars come back for",
      },
      description: {
        zh: "第一次来不知道点什么？照着街坊和老客最常点的这三套搭配来一份，现做现拿，热乎又踏实。",
        en: "First time at the counter? Start with one of our regulars' favourites — cooked fresh in front of you and genuinely filling.",
      },
      cards: [
        {
          id: "combo-meal-deal",
          tag: { zh: "优惠套餐 · 清真可选", en: "Meal Deal · Halal" },
          title: {
            zh: "牛肉 / 鸡肉煎饼 + 港式柠檬茶或豆浆",
            en: "Beef or Chicken Jian Bing Meal Deal",
          },
          price: "£12 – £13",
          desc: {
            zh: "招牌清真鸡肉（£12）或牛肉煎饼（£13），直接配一杯冰爽港式冻柠茶或温润现磨豆浆，热乎顶饱又划算。",
            en: "Signature Halal Chicken (£12) or Beef (£13) Jian Bing paired with Hong Kong Iced Lemon Tea or freshly ground house soya milk.",
          },
          image: "/images/beef-jianbing-stack.webp",
          href: "/menu#meal-deals",
          cta: { zh: "查看优惠套餐", en: "See Meal Deals" },
        },
        {
          id: "combo-sweet",
          tag: { zh: "午后甜口", en: "Sweet Crepes" },
          title: {
            zh: "焦糖布蕾 / 抹茶开心果可丽饼",
            en: "Crème Brûlée or Matcha Pistachio Crepe",
          },
          price: "£11 – £12",
          desc: {
            zh: "现烤焦糖脆壳马斯卡彭布蕾配鲜草莓（£11），或茶香浓郁的抹茶开心果布蕾可丽饼（£12）；也有 £5 热乎巧克力可丽饼。",
            en: "Torched Crème Brûlée & Mascarpone with fresh strawberries (£11), or rich Matcha & Pistachio Fluff (£12) — plus warm Chocolate Crepes for £5.",
          },
          image: "/images/matcha-pistachio-crepe.webp",
          href: "/menu#sweet-crepes-and-desserts",
          cta: { zh: "看可丽饼菜单", en: "See Sweet Crepes" },
        },
        {
          id: "combo-rice",
          tag: { zh: "暖胃热饭 · 小吃", en: "Warm Rice & Dumplings" },
          title: {
            zh: "卤肉饭 / 萝卜炖牛肉饭 + 6 只煎饺",
            en: "Braised Pork or Beef Rice + 6 Dumplings",
          },
          price: "£10 – £17",
          desc: {
            zh: "油润入味的台湾卤肉饭（£10）或软烂炖牛肉饭（£15/£17），顺手加一份 6 只装脆底素饺（£5）或牛肉煎饺（£6），格外暖胃。",
            en: "Taiwanese Braised Pork Rice (£10) or Slow-Braised Beef Rice (£15/£17), paired with 6 golden pan-fried veggie (£5) or Halal beef dumplings (£6).",
          },
          image: "/images/braised-beef-rice.webp",
          href: "/menu#mains-and-rice",
          cta: { zh: "查看热菜与煎饺", en: "See Mains & Dumplings" },
        },
      ],
    },
    audience: {
      cards: [
        {
          badge: { zh: "清真之选", en: "Halal Options" },
          accentZh: "清真美味",
          title: {
            zh: "清真牛肉与鸡肉，中份 £8 起",
            en: "Halal beef & chicken, medium from £8",
          },
          description: {
            zh: "招牌清真鸡肉煎饼（£8/£11）、清真牛肉煎饼（£9/£12）、优惠套餐（£12 起）、清真牛肉大包（£3.50）与牛肉煎饺（6 个 £6）均选用清真肉类食材。",
            en: "Signature Halal Chicken (£8/£11) & Beef Jian Bing (£9/£12), Meal Deals from £12, Halal Beef Buns (£3.50) and 6-piece Beef Dumplings (£6). Filter all Halal dishes in one tap.",
          },
          cta: { zh: "一键查看清真菜单", en: "Browse Halal Menu" },
          href: "/menu?diet=halal",
        },
        {
          badge: { zh: "地道家乡味", en: "Authentic Street Food" },
          accentZh: "传统手艺",
          title: {
            zh: "火龙果现榨果蔬皮，留子中国胃认证",
            en: "Natural dragon fruit batter & real crunch",
          },
          description: {
            zh: "不是色素！后厨鲜切红心火龙果、甜菜根现打调糊，配现炸薄脆、自制辣椒油与热豆浆；就在 UCL/CSM 附近，支持饭团外卖（4.5 ★）。",
            en: "Zero food dye — fresh dragon fruit and beetroot blended straight into the batter, with crispy cracker, homemade chilli oil, soya milk, and Fantuan (4.5 ★).",
          },
          cta: { zh: "了解铁板手艺", en: "See Our Craft" },
          href: "/our-story",
        },
        {
          badge: { zh: "本地与蔬食友好", en: "Locals & Plant-Based" },
          accentZh: "蔬食友好",
          title: {
            zh: "现买现带超方便，素食与纯素同样丰富",
            en: "Quick takeaway for mixed groups & vegans",
          },
          description: {
            zh: "明码实价（小吃 £2.50 起），到店现摊外带或外卖直达；除咸甜煎饼外，还备有素菜煎饼（£9）、菠菜芝士煎饼（£10）、葱油饼（£2.50）与 6 只素煎饺（£5）。",
            en: "Clear in-store prices from £2.50 for quick takeaway and delivery, plus Veggie Lover (£9) & Spinach Cheese (£10) Jian Bing, Spring Onion Flatbread (£2.50) and 6-piece Veggie Dumplings (£5).",
          },
          cta: { zh: "浏览素食与纯素菜品", en: "Browse Veggie & Vegan" },
          href: "/menu?diet=vegetarian",
        },
      ],
    },
    craftShowcase: {
      heading: {
        zh: "一口铸铁圆锅，四件让人记住的事",
        en: "One cast-iron griddle. Four reasons people queue.",
      },
      slides: [
        {
          id: "natural-batter",
          number: "01",
          tabLabel: { en: "Natural Batters", zh: "鲜榨果蔬皮" },
          eyebrow: { en: "Zero Artificial Dye", zh: "鲜切现榨 · 零色素" },
          title: {
            en: "Real dragon fruit & beetroot, spun onto cast iron.",
            zh: "红心火龙果与甜菜根，现榨调色上铁板",
          },
          description: {
            en: "No bottled colouring. Every morning we blend fresh red dragon fruit, beetroot, and spinach straight into our batter for a delicate crisp edge and clean, natural aroma.",
            zh: "绝不用食用色素。后厨每天现切新鲜红心火龙果、甜菜根与菠菜榨汁和面，淋上滚烫圆铁板一转成圆，外圈焦脆、里头软韧。",
          },
          metricValue: { en: "0% Dye", zh: "0 食用色素" },
          metricLabel: {
            en: "Fresh fruit & veg blended daily",
            zh: "每日现切果蔬鲜榨调糊",
          },
          image: "/images/mrs-liu-rainbow-griddle.webp",
          href: "/menu",
          cta: { en: "Explore Savoury Crepes", zh: "查看招牌咸煎饼" },
        },
        {
          id: "the-crunch",
          number: "02",
          tabLabel: { en: "Halal & Roast Duck", zh: "清真与烤鸭" },
          eyebrow: {
            en: "Halal, Roast Duck & Veggie",
            zh: "清真牛鸡 · 烤鸭 · 素食",
          },
          title: {
            en: "Cracked egg, house chilli oil, and proper crunch.",
            zh: "热锅磕蛋刷秘制酱，一口咬出薄脆咔嚓声",
          },
          description: {
            en: "Homemade savoury sauce, crispy fried shallots, fresh greens, and your choice of Roast Duck, Halal beef or chicken, Char Siu, Pork Hock, or Veggie Lover.",
            zh: "自家慢熬咸香酱与秘制辣椒油，铺满酥脆薄脆与鲜绿时蔬，招牌烤鸭、清真牛鸡、叉烧、猪酱肘子与素菜任选。",
          },
          metricValue: { en: "From £8", zh: "£8 起" },
          metricLabel: {
            en: "Medium £8–£9 · Regular £11–£12 · Meal Deals £12+",
            zh: "中份 £8–£9 · 标准份 £11–£12 · 优惠套餐 £12 起",
          },
          image: "/images/dragonfruit-pink-jianbing.webp",
          href: "/menu?diet=halal",
          cta: { en: "Browse Halal Menu", zh: "一键看清真菜单" },
        },
        {
          id: "hand-piped-lace",
          number: "03",
          tabLabel: { en: "Crème Brûlée Crepes", zh: "布蕾可丽饼" },
          eyebrow: {
            en: "Sweet Crepes & Matcha",
            zh: "现烤布蕾 · 抹茶开心果",
          },
          title: {
            en: "Torched Crème Brûlée & Matcha Pistachio crepes.",
            zh: "现烤焦糖布蕾与抹茶开心果可丽饼",
          },
          description: {
            en: "Crackly caramelised mascarpone custard with fresh strawberries (£11), Matcha & Pistachio Fluff (£12), Cute Character cones (£10), or warm Chocolate Crepes (£5).",
            zh: "丝滑马斯卡彭焦糖布蕾配鲜草莓（£11）、抹茶开心果布蕾（£12）、小动物鲜果可丽饼（£10）及热乎巧克力可丽饼（£5）。",
          },
          metricValue: { en: "From £5", zh: "£5 起" },
          metricLabel: {
            en: "Chocolate £5 · Crème Brûlée £11 · Matcha £12",
            zh: "巧克力 £5 · 焦糖布蕾 £11 · 抹茶开心果 £12",
          },
          image: "/images/creme-brulee-crepe.webp",
          href: "/menu#sweet-crepes-and-desserts",
          cta: { en: "See Sweet Crepes", zh: "看花式可丽饼" },
        },
        {
          id: "camden-craft",
          number: "04",
          tabLabel: { en: "4.9★ Camden", zh: "4.9★ 好评口碑" },
          eyebrow: { en: "124 Camden Rd · NW1", zh: "伦敦卡姆登 · 现做外带" },
          title: {
            en: "Folded hot into our 爱民 sleeve, ready to go.",
            zh: "趁热装入「爱民」牛皮纸袋，一口暖到心",
          },
          description: {
            en: "Retired in China, started from zero in London — third time lucky. Loved by Camden locals, UCL & CSM students, and London foodies for takeaway and Fantuan delivery.",
            zh: "国内退休后赴英第三次归零创业，扎根卡姆登路收获众多回头客。现点现摊外带或饭团外卖直达，每一口都热乎实在。",
          },
          metricValue: { en: "4.9 ★", zh: "4.9 ★" },
          metricLabel: {
            en: "287 verified Google reviews",
            zh: "Google 287 条真实好评",
          },
          image: "/images/beef-jianbing-stack.webp",
          href: "/our-story",
          cta: { en: "Read Our Story", zh: "了解创业故事" },
        },
      ],
    },
    storyBand: {
      photoMain: "/images/mrs-liu-sweet-cones.webp",
      photoTopRight: "/images/mrs-liu-rainbow-griddle.webp",
      photoBottomRight: "/images/dragonfruit-blender-prep.webp",
      eyebrow: { zh: "创业故事", en: "Our Story" },
      chineseAccent: "归零创业",
      title: restaurant.story.headline,
      lead: restaurant.story.lead,
      pillars: restaurant.story.pillars.map((p) => ({
        title: { ...p.title },
        chinese: p.chinese,
        description: { ...p.description },
      })),
    },
    galleryStrip: {
      eyebrow: { zh: "后厨实拍", en: "From Our Kitchen" },
      chineseAccent: "色香俱全",
      title: {
        zh: "真实出餐，每一份都热气腾腾",
        en: "Real food, straight off the griddle",
      },
      description: {
        zh: "镜头直击伦敦卡姆登厨房——从天然果蔬咸味煎饼到现烤焦糖布蕾、抹茶开心果可丽饼与港式珍珠奶茶。",
        en: "Straight from our Camden kitchen: natural fruit-and-veg crepes, torched Crème Brûlée cones, Matcha Pistachio crepes, and Hong Kong boba tea.",
      },
      photos: [
        {
          src: "/images/roast-duck-jianbing.webp",
          label: { en: "Roast Duck Jian Bing · £12", zh: "新品烤鸭煎饼 · £12" },
        },
        {
          src: "/images/creme-brulee-crepe.webp",
          label: { en: "Crème Brûlée Crepe · £11", zh: "焦糖布蕾可丽饼 · £11" },
        },
        {
          src: "/images/matcha-pistachio-crepe.webp",
          label: { en: "Matcha & Pistachio · £12", zh: "抹茶开心果可丽饼 · £12" },
        },
        {
          src: "/images/brulee-boba-milk-tea.webp",
          label: { en: "HK Boba Milk Tea · £6", zh: "港式奶茶撞珍珠 · £6" },
        },
      ],
    },
    ctaBanner: {
      eyebrow: {
        zh: "伦敦卡姆登路 · 现摊外带与无接触配送",
        en: "Camden Road · Warm Takeaway & Delivery",
      },
      title: {
        zh: "顺路来卡姆登路 124 号带一份，或饭团外卖热乎送到家。",
        en: "Swing by 124 Camden Rd, or get it delivered hot on Fantuan.",
      },
      description: {
        zh: "支持到店自取外带与无接触配送（不提供堂食），欢迎提前致电或直接通过线上平台点单。",
        en: "Open daily for takeaway and no-contact delivery (no dine-in). Give us a quick ring or order online for delivery.",
      },
    },
  },
  pages: {
    menu: {
      eyebrow: { zh: "全部菜品", en: "Our Menu" },
      chineseAccent: "精选菜单",
      title: {
        zh: "现点现做，热乎踏实的家常街头味",
        en: "Warm street food, cooked fresh to order",
      },
      description: {
        zh: "招牌烤鸭、清真牛鸡与素菜果蔬煎饼（中份 £8 起）、优惠套餐（£12 起）、焦糖布蕾与抹茶开心果可丽饼、卤肉/炖牛肉盖饭、手工煎饺馄饨与港式特色饮品——价格以门店最新菜单为准。",
        en: "Roast Duck, Halal beef & chicken and veggie Jian Bing (medium from £8), £12+ Meal Deals, Crème Brûlée & Matcha Pistachio crepes, braised beef & pork rice bowls, pan-fried dumplings and Hong Kong milk teas.",
      },
      allergenTitle: {
        zh: "过敏原提示与价格说明",
        en: "Allergens, dietary details & pricing notes",
      },
      dietaryNote: {
        zh: "清真牛肉煎饼、清真鸡肉煎饼、清真牛肉肉夹馍、清真牛肉包子、牛肉煎饺及牛肉馄饨均选用清真肉类食材，并同时供应蛋奶素果蔬煎饼、菠菜芝士煎饼、素煎饺及纯素春卷与多款饮品，点单时可通过顶部「饮食筛选」一键查看。",
        en: "Our Beef & Chicken Jian Bing crepes, Halal Beef Roujiamo, Beef Stuffed Bun, pan-fried beef dumplings, and beef wontons are made with Halal meat, alongside vegetarian crepes, veggie dumplings, and vegan spring rolls & drinks.",
      },
      allergenNote: {
        zh: "本店厨房日常使用小麦/麸质、鸡蛋、芝麻、大豆、乳制品、甲壳类（鲜虾馄饨、芝麻虾多士）及坚果（榛子巧克力酱、开心果）。如您对任何食材过敏，请在下单前致电或在点单时告知店员。",
        en: "Our kitchen handles wheat/gluten, eggs, sesame, soy, dairy, crustaceans (prawn wontons & prawn toast), and nuts (Nutella & pistachio). Please call or speak with our team before ordering if you have any food allergy.",
      },
      pricingNote: {
        zh: "本页所有菜品与售价均与后台数据库实时同步，支持线上外卖下单或到店自取。",
        en: "All dishes and prices are synced live from our Camden Road counter menu. Available for takeaway collection and online delivery.",
      },
    },
    story: {
      eyebrow: { zh: "创业故事", en: "Our Story" },
      chineseAccent: "归零创业",
      headline: { ...restaurant.story.headline },
      lead: { ...restaurant.story.lead },
      paragraphs: restaurant.story.paragraphs.map((p) => ({ ...p })),
      heroPhoto: "/images/chef-lace-crepe.webp",
      stepsTitle: {
        zh: "三步出锅，从滚烫面糊到酥香纸袋",
        en: "Three steps from hot batter to brown paper sleeve",
      },
      stepsDescription: {
        zh: "正宗中式煎饼讲究火候、手速与配料层次，热腾腾现摊现叠，趁热咬下去最香。",
        en: "Proper Jian Bing comes down to heat, speed, and crunch. Cooked right in front of you and best eaten hot.",
      },
      steps: [
        {
          step: { en: "Step 01", zh: "第一步" },
          title: { en: "Natural Batter on Cast Iron", zh: "鲜榨果蔬糊热铁板现摊" },
          chinese: "摊面糊",
          description: {
            en: "Fresh red dragon fruit, beetroot, and spinach batters (zero food dye) are poured onto sizzling cast iron and spread paper-thin with cracked egg.",
            zh: "零色素！新鲜红心火龙果、甜菜根与菠菜现榨调成的果蔬面糊淋上热铁板，迅速摊圆磕入鲜蛋，激出麦香与蛋香。",
          },
          image: "/images/mrs-liu-rainbow-griddle.webp",
        },
        {
          step: { en: "Step 02", zh: "第二步" },
          title: { en: "Brushed & Layered", zh: "刷秘制酱铺满料" },
          chinese: "刷酱加料",
          description: {
            en: "We brush on our savoury homemade sauce and pile on crisp lettuce, spring onions, crispy fried onions, and your choice of Roast Duck, Halal beef, chicken, char siu, or veggies.",
            zh: "刷上自家调制的咸香酱汁，铺满脆生菜、香葱、酥脆炸洋葱，再按口味加入烤鸭、清真牛肉、鸡肉、叉烧或爽脆时蔬。",
          },
          image: "/images/mrs-liu-adding-filling.webp",
        },
        {
          step: { en: "Step 03", zh: "第三步" },
          title: { en: "Folded Warm to Go", zh: "趁热装袋酥脆入口" },
          chinese: "趁热享用",
          description: {
            en: "Folded straight into our 煎饼刘 (爱民) brown paper sleeve while the eggy crepe is still soft and the centre is piping hot and crisp.",
            zh: "迅速折好装入印有「煎饼刘 · 爱民」印章的暖黄牛皮纸袋，每一口都是外柔内脆的热乎满足。",
          },
          image: "/images/dragonfruit-pink-jianbing.webp",
        },
      ],
      detailsTitle: {
        zh: "手写书法、爱民朱印与多彩果蔬煎饼",
        en: "Brush calligraphy, our 爱民 seal & colourful crepes",
      },
      detailsDescription: {
        zh: "从印着毛笔字「煎饼刘」与「爱民」朱印的牛皮纸袋，到门口红底流苏的果蔬煎饼旗帜，每一处细节都延续着地道亲切的中国市井温度。",
        en: "From the brush-lettered 煎饼刘 paper sleeves and red 爱民 stamp to the fringed banner out front and hand-piped lace crepes, we keep the feel of a traditional Chinese street stall.",
      },
      detailCards: [
        {
          image: "/images/brand-kraft-sleeve.webp",
          caption: {
            zh: "招牌牛皮纸袋，印有手写书法「煎饼刘」与「爱民」朱红印章。",
            en: "Our brown paper sleeve stamped with 煎饼刘 calligraphy and the red 爱民 seal.",
          },
        },
        {
          image: "/images/banner-fruit-veg-crepe.webp",
          caption: {
            zh: "门店悬挂的传统红金流苏旗帜——「正宗风味 · 果蔬煎饼」。",
            en: "Our traditional red banner for fruit-and-vegetable crepes (果蔬煎饼).",
          },
        },
        {
          image: "/images/lace-crepe-sheet.webp",
          caption: {
            zh: "手工挤制的花式蕾丝脆边，卷成高颜值的甜筒煎饼。",
            en: "Hand-piped lace edges made on the griddle for our sweet crepe cones.",
          },
        },
      ],
    },
    gallery: {
      eyebrow: { zh: "实拍图集", en: "Photo Gallery" },
      chineseAccent: "美食图集",
      title: {
        zh: "来自卡姆登厨房的真实出餐",
        en: "Straight from our Camden kitchen",
      },
      description: {
        zh: "每一张照片均实拍自我们的铁板、档口与日常出品，点击任意图片可全屏放大浏览。",
        en: "All taken at our Camden Road griddle and counter. Click any photo for a closer look.",
      },
      items: galleryItems.map((item) => ({
        ...item,
        alt: { ...item.alt },
        caption: { ...item.caption },
      })),
    },
    visit: {
      eyebrow: { zh: "位置与联系", en: "Visit & Contact" },
      chineseAccent: "来店指南",
      title: {
        zh: "在伦敦卡姆登路找到我们",
        en: "Find us on Camden Road",
      },
      description: {
        zh: "支持到店自取外带热乎现摊煎饼，以及卡姆登及周边伦敦区域无接触配送（不提供堂食）。",
        en: "Pick up a hot takeaway on Camden Road, or order no-contact delivery across Camden and nearby North London (takeaway & delivery only — no dine-in).",
      },
      storefrontPhoto: "/images/storefront-camden.webp",
      storefrontCaption: {
        zh: "认准 124 Camden Rd 门头与红底「果蔬煎饼」旗帜（位于 Caribbean Delight 内）",
        en: "Look for our hanging 果蔬煎饼 banner at 124 Camden Rd (inside Caribbean Delight)",
      },
      hoursHint: {
        zh: "节假日营业时间可能略有调整，如临近打烊前来店，建议提前致电确认。",
        en: "Bank holiday hours can vary, so give us a quick ring if you're heading over late.",
      },
    },
  },
};

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Boolean(val) && typeof val === "object" && !Array.isArray(val);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) {
      if (key in override) {
        out[key] = deepMerge(
          (base as Record<string, unknown>)[key],
          override[key]
        );
      }
    }
    return out as T;
  }
  return (typeof override === typeof base ? override : base) as T;
}

export function mergeSiteContent(raw: unknown): SiteContentConfig {
  const merged = deepMerge(defaultSiteContent, raw);

  // Guarantee all 11 home section IDs exist even if saved sections came from an older schema
  const validIds = new Set<HomeSectionId>(
    defaultSiteContent.home.sections.map((s) => s.id)
  );
  const seen = new Set<HomeSectionId>();
  const normalizedSections: HomeSectionLayoutItem[] = [];

  for (const s of merged.home.sections) {
    if (s && validIds.has(s.id) && !seen.has(s.id)) {
      seen.add(s.id);
      normalizedSections.push({ id: s.id, visible: Boolean(s.visible) });
    }
  }
  for (const def of defaultSiteContent.home.sections) {
    if (!seen.has(def.id)) {
      normalizedSections.push({ ...def });
    }
  }
  merged.home.sections = normalizedSections;

  const days = Number(merged.newArrivals.autoExpireDays);
  merged.newArrivals.autoExpireDays =
    Number.isFinite(days) && days > 0 ? Math.min(Math.round(days), 365) : 0;

  // Validate gallery categories defensively
  const validGalleryCats = new Set<GalleryCategoryKey>([
    "savoury",
    "sweet",
    "craft",
    "mains",
  ]);
  merged.pages.gallery.items = merged.pages.gallery.items.filter(
    (item) =>
      item &&
      typeof item.src === "string" &&
      item.src.trim().length > 0 &&
      validGalleryCats.has(item.category)
  );

  return merged;
}
