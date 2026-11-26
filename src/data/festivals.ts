export type FestivalGroupKey = "chinese" | "uk" | "islamic";

export type FestivalMotif =
  | "lanterns"
  | "bamboo"
  | "moon"
  | "petals"
  | "fireworks"
  | "griddle"
  | "spring"
  | "heritage"
  | "spooky"
  | "winter"
  | "crescent";

export interface FestivalThemeTokens {
  parchment: string;
  kraft: string;
  kraftDeep: string;
  cinnabar: string;
  cinnabarDark: string;
  turmeric: string;
  jade: string;
  surfaceDark: string;
  accentBright: string;
  glowA: string;
  glowB: string;
  glowC: string;
  glowD: string;
  bannerBg: string;
  bannerBgEnd: string;
  bannerText: string;
  bannerAccent: string;
  motif: FestivalMotif;
}

export const FESTIVAL_THEME_CSS_PROPS = [
  "--theme-parchment",
  "--theme-kraft",
  "--theme-kraft-deep",
  "--theme-cinnabar",
  "--theme-cinnabar-dark",
  "--theme-turmeric",
  "--theme-jade",
  "--theme-surface-dark",
  "--theme-accent-bright",
  "--theme-banner-bg",
  "--theme-banner-end",
  "--theme-banner-accent",
  "--theme-glow-a",
  "--theme-glow-b",
  "--theme-glow-c",
  "--theme-glow-d",
] as const;

export function getFestivalThemeCssVars(
  theme: FestivalThemeTokens
): Record<(typeof FESTIVAL_THEME_CSS_PROPS)[number], string> {
  return {
    "--theme-parchment": theme.parchment,
    "--theme-kraft": theme.kraft,
    "--theme-kraft-deep": theme.kraftDeep,
    "--theme-cinnabar": theme.cinnabar,
    "--theme-cinnabar-dark": theme.cinnabarDark,
    "--theme-turmeric": theme.turmeric,
    "--theme-jade": theme.jade,
    "--theme-surface-dark": theme.surfaceDark,
    "--theme-accent-bright": theme.accentBright,
    "--theme-banner-bg": theme.bannerBg,
    "--theme-banner-end": theme.bannerBgEnd,
    "--theme-banner-accent": theme.bannerAccent,
    "--theme-glow-a": theme.glowA,
    "--theme-glow-b": theme.glowB,
    "--theme-glow-c": theme.glowC,
    "--theme-glow-d": theme.glowD,
  };
}

export interface FestivalPreset {
  id: string;
  group: FestivalGroupKey;
  zh: string;
  en: string;
  bannerZh: string;
  bannerEn: string;
  paletteName: { zh: string; en: string };
  theme: FestivalThemeTokens;
}

export const festivalGroupLabels: Record<
  FestivalGroupKey,
  { zh: string; en: string }
> = {
  chinese: { zh: "中国节假日", en: "Chinese Festivals & Holidays" },
  uk: { zh: "英国节假日", en: "UK & British Holidays" },
  islamic: { zh: "伊斯兰节日", en: "Islamic Holidays" },
};

// Vivid, jewel-toned, WCAG AA/AAA-verified festive palettes crafted to keep food photography & description text pure and readable
const PALETTES = {
  // 1. 中国红金 (春节 / 元宵 / 国庆 / 腊八)
  crimsonGold: {
    parchment: "#FFF4E8",
    kraft: "#FDE7CF",
    kraftDeep: "#EEAD72",
    cinnabar: "#C41812",
    cinnabarDark: "#96100C",
    turmeric: "#E59A00",
    jade: "#156B41",
    surfaceDark: "#320A0D",
    accentBright: "#FFD65C",
    glowA: "rgba(235, 42, 34, 0.24)",
    glowB: "rgba(255, 184, 28, 0.22)",
    glowC: "rgba(217, 30, 24, 0.18)",
    glowD: "rgba(255, 198, 64, 0.24)",
    bannerBg: "#BA1313",
    bannerBgEnd: "#7A0A14",
    bannerText: "#FFF8EC",
    bannerAccent: "#FFD966",
    motif: "lanterns",
  },
  // 2. 竹青翠玉 (清明 / 端午)
  bambooJade: {
    parchment: "#EEF9F1",
    kraft: "#DCF4E2",
    kraftDeep: "#8AD1A2",
    cinnabar: "#0A704B",
    cinnabarDark: "#065437",
    turmeric: "#D99200",
    jade: "#0A6A47",
    surfaceDark: "#0C2C20",
    accentBright: "#F7D665",
    glowA: "rgba(20, 184, 118, 0.24)",
    glowB: "rgba(245, 194, 52, 0.18)",
    glowC: "rgba(12, 122, 82, 0.18)",
    glowD: "rgba(116, 224, 152, 0.22)",
    bannerBg: "#0D6E4B",
    bannerBgEnd: "#093E33",
    bannerText: "#F2FFF6",
    bannerAccent: "#FFE074",
    motif: "bamboo",
  },
  // 3. 桂花明月 (中秋 / 重阳 / 冬至)
  moonlitAmber: {
    parchment: "#FFF5E2",
    kraft: "#FDEAC4",
    kraftDeep: "#E7B454",
    cinnabar: "#B33B04",
    cinnabarDark: "#8A2B02",
    turmeric: "#E89B0C",
    jade: "#26497A",
    surfaceDark: "#191B3A",
    accentBright: "#FFD76B",
    glowA: "rgba(255, 190, 48, 0.30)",
    glowB: "rgba(224, 98, 24, 0.18)",
    glowC: "rgba(54, 62, 148, 0.18)",
    glowD: "rgba(255, 206, 84, 0.24)",
    bannerBg: "#1D1F4B",
    bannerBgEnd: "#4A2148",
    bannerText: "#FFF7E6",
    bannerAccent: "#FFDA68",
    motif: "moon",
  },
  // 4. 浪漫花韵 (七夕 / 情人节 / 英国母亲节)
  roseBlossom: {
    parchment: "#FFF1F6",
    kraft: "#FDE2EC",
    kraftDeep: "#F09BB8",
    cinnabar: "#BE145A",
    cinnabarDark: "#940C44",
    turmeric: "#E57A35",
    jade: "#156B4D",
    surfaceDark: "#360C21",
    accentBright: "#FFB4D3",
    glowA: "rgba(244, 63, 128, 0.24)",
    glowB: "rgba(255, 152, 188, 0.22)",
    glowC: "rgba(214, 31, 105, 0.18)",
    glowD: "rgba(255, 188, 128, 0.20)",
    bannerBg: "#B81456",
    bannerBgEnd: "#6B0D3B",
    bannerText: "#FFF3F8",
    bannerAccent: "#FFD4E5",
    motif: "petals",
  },
  // 5. 庆典烟火 (元旦 / 英国银行假日 / 篝火之夜)
  royalCelebration: {
    parchment: "#F5F2FF",
    kraft: "#EAE4FC",
    kraftDeep: "#B4A2EA",
    cinnabar: "#B81746",
    cinnabarDark: "#8C0E33",
    turmeric: "#E69B0C",
    jade: "#36319E",
    surfaceDark: "#15153B",
    accentBright: "#FFD659",
    glowA: "rgba(116, 78, 245, 0.22)",
    glowB: "rgba(255, 184, 36, 0.22)",
    glowC: "rgba(216, 36, 94, 0.18)",
    glowD: "rgba(148, 114, 255, 0.20)",
    bannerBg: "#1D1A57",
    bannerBgEnd: "#721444",
    bannerText: "#F8F6FF",
    bannerAccent: "#FFDA63",
    motif: "fireworks",
  },
  // 6. 枫糖铁板金 (英国煎饼节 Pancake Day)
  goldenGriddle: {
    parchment: "#FFF8E0",
    kraft: "#FDECBD",
    kraftDeep: "#ECB544",
    cinnabar: "#B43C03",
    cinnabarDark: "#8A2B01",
    turmeric: "#EA9900",
    jade: "#176B3C",
    surfaceDark: "#2E1506",
    accentBright: "#FFD859",
    glowA: "rgba(255, 188, 24, 0.30)",
    glowB: "rgba(238, 108, 22, 0.20)",
    glowC: "rgba(212, 78, 8, 0.16)",
    glowD: "rgba(255, 212, 78, 0.26)",
    bannerBg: "#963204",
    bannerBgEnd: "#B85106",
    bannerText: "#FFF9E8",
    bannerAccent: "#FFE57A",
    motif: "griddle",
  },
  // 7. 春日复苏 (复活节 Easter)
  springPastel: {
    parchment: "#F1FCEE",
    kraft: "#E0F7D8",
    kraftDeep: "#99D888",
    cinnabar: "#147244",
    cinnabarDark: "#0C5733",
    turmeric: "#E59A08",
    jade: "#A82F70",
    surfaceDark: "#143323",
    accentBright: "#FFE269",
    glowA: "rgba(88, 208, 118, 0.24)",
    glowB: "rgba(255, 206, 56, 0.24)",
    glowC: "rgba(242, 116, 168, 0.18)",
    glowD: "rgba(140, 226, 146, 0.22)",
    bannerBg: "#14663E",
    bannerBgEnd: "#1E7558",
    bannerText: "#F5FFF2",
    bannerAccent: "#FFE673",
    motif: "spring",
  },
  // 8. 复古英伦暖褐 (父亲节)
  heritageTweed: {
    parchment: "#FAF2E6",
    kraft: "#F1E3CC",
    kraftDeep: "#CCA472",
    cinnabar: "#9E212B",
    cinnabarDark: "#75141C",
    turmeric: "#C98916",
    jade: "#1A5C48",
    surfaceDark: "#1E1B24",
    accentBright: "#F5C76B",
    glowA: "rgba(212, 148, 36, 0.22)",
    glowB: "rgba(158, 33, 43, 0.16)",
    glowC: "rgba(26, 92, 72, 0.16)",
    glowD: "rgba(224, 172, 82, 0.20)",
    bannerBg: "#241C24",
    bannerBgEnd: "#5E1922",
    bannerText: "#FFF7EC",
    bannerAccent: "#F7CA6A",
    motif: "heritage",
  },
  // 9. 南瓜暮色 (万圣节 Halloween)
  pumpkinEmber: {
    parchment: "#FFF3E6",
    kraft: "#FDE2CC",
    kraftDeep: "#EC9858",
    cinnabar: "#B43602",
    cinnabarDark: "#8A2701",
    turmeric: "#F08A0C",
    jade: "#622894",
    surfaceDark: "#1E0F2E",
    accentBright: "#FFA638",
    glowA: "rgba(255, 108, 18, 0.26)",
    glowB: "rgba(136, 56, 212, 0.20)",
    glowC: "rgba(232, 82, 12, 0.18)",
    glowD: "rgba(168, 78, 240, 0.20)",
    bannerBg: "#2B1142",
    bannerBgEnd: "#7E2708",
    bannerText: "#FFF5EA",
    bannerAccent: "#FFAA3B",
    motif: "spooky",
  },
  // 10. 冬青松绿圣诞 (圣诞节 / 节礼日)
  christmasHolly: {
    parchment: "#F1FAF3",
    kraft: "#DFF2E5",
    kraftDeep: "#92C8A5",
    cinnabar: "#C41421",
    cinnabarDark: "#940B15",
    turmeric: "#DF9A10",
    jade: "#0E6B42",
    surfaceDark: "#0B2E1E",
    accentBright: "#FFD766",
    glowA: "rgba(20, 148, 86, 0.22)",
    glowB: "rgba(220, 32, 46, 0.18)",
    glowC: "rgba(245, 188, 42, 0.20)",
    glowD: "rgba(26, 152, 92, 0.20)",
    bannerBg: "#0D5A36",
    bannerBgEnd: "#911320",
    bannerText: "#F7FFF9",
    bannerAccent: "#FFDC73",
    motif: "winter",
  },
  // 11. 翡翠星月金 (斋月 / 开斋节 / 宰牲节 / 伊斯兰新年 / 圣纪节)
  crescentEmerald: {
    parchment: "#EFFAF5",
    kraft: "#DAF4E7",
    kraftDeep: "#84CBA7",
    cinnabar: "#09704F",
    cinnabarDark: "#05543B",
    turmeric: "#DDA012",
    jade: "#096865",
    surfaceDark: "#082B21",
    accentBright: "#FFD86B",
    glowA: "rgba(14, 166, 118, 0.24)",
    glowB: "rgba(242, 188, 48, 0.24)",
    glowC: "rgba(12, 140, 128, 0.18)",
    glowD: "rgba(255, 206, 72, 0.22)",
    bannerBg: "#075740",
    bannerBgEnd: "#0E384A",
    bannerText: "#F2FFF9",
    bannerAccent: "#FFDE73",
    motif: "crescent",
  },
} satisfies Record<string, FestivalThemeTokens>;

export const festivalPresets: FestivalPreset[] = [
  // ── 中国传统与法定节假日 (Chinese Festivals & Holidays) ──
  {
    id: "lunar-new-year",
    group: "chinese",
    zh: "🧧 春节限定",
    en: "🧧 Lunar New Year Special",
    bannerZh: "🧧 新春大吉 · 现摊热乎煎饼与春节限定美味陪你过好年",
    bannerEn: "🧧 Happy Lunar New Year — Hot Jian Bing & Festive Specials in Camden",
    paletteName: { zh: "中国红金", en: "Crimson & Gold" },
    theme: PALETTES.crimsonGold,
  },
  {
    id: "lantern-festival",
    group: "chinese",
    zh: "🏮 元宵节限定",
    en: "🏮 Lantern Festival Special",
    bannerZh: "🏮 元宵喜乐 · 团圆夜来一份热乎现摊煎饼与节日特调",
    bannerEn: "🏮 Happy Lantern Festival — Celebrate with Hot Jian Bing & Festive Treats",
    paletteName: { zh: "花灯红金", en: "Lantern Red & Gold" },
    theme: PALETTES.crimsonGold,
  },
  {
    id: "qingming",
    group: "chinese",
    zh: "🌿 清明节限定",
    en: "🌿 Qingming Festival Special",
    bannerZh: "🌿 春意正浓 · 鲜榨菠菜果蔬煎饼与清明春日限定上新",
    bannerEn: "🌿 Spring Fresh in Camden — Natural Green-Batter Crepes & Seasonal Specials",
    paletteName: { zh: "青团竹绿", en: "Spring Bamboo" },
    theme: PALETTES.bambooJade,
  },
  {
    id: "dragon-boat",
    group: "chinese",
    zh: "🐉 端午节限定",
    en: "🐉 Dragon Boat Festival Special",
    bannerZh: "🐉 端午安康 · 尝鲜端午限定美味与热乎果蔬煎饼",
    bannerEn: "🐉 Happy Dragon Boat Festival — Limited Seasonal Specials Made Fresh",
    paletteName: { zh: "粽叶青玉", en: "Bamboo Jade" },
    theme: PALETTES.bambooJade,
  },
  {
    id: "qixi",
    group: "chinese",
    zh: "💕 七夕节限定",
    en: "💕 Qixi Festival Special",
    bannerZh: "💕 七夕甜蜜限定 · 焦糖布蕾与抹茶花式可丽饼双人分享更香",
    bannerEn: "💕 Happy Qixi Festival — Sweet Crème Brûlée & Matcha Crepes for Two",
    paletteName: { zh: "玫瑰花韵", en: "Rose Blossom" },
    theme: PALETTES.roseBlossom,
  },
  {
    id: "mid-autumn",
    group: "chinese",
    zh: "🥮 中秋节限定",
    en: "🥮 Mid-Autumn Festival Special",
    bannerZh: "🥮 中秋团圆 · 在伦敦也能吃上热乎家乡味与中秋限定美味",
    bannerEn: "🥮 Happy Mid-Autumn Festival — Homestyle Chinese Street Food & Festive Specials",
    paletteName: { zh: "明月桂金", en: "Moonlit Amber" },
    theme: PALETTES.moonlitAmber,
  },
  {
    id: "double-ninth",
    group: "chinese",
    zh: "🌼 重阳节限定",
    en: "🌼 Double Ninth Festival Special",
    bannerZh: "🌼 重阳暖秋 · 现熬养生鸡汤与热乎煎饼暖胃又舒心",
    bannerEn: "🌼 Autumn Warmth — Slow-Simmered Chicken Soup & Hot Griddled Jian Bing",
    paletteName: { zh: "金秋暖琥珀", en: "Autumn Amber" },
    theme: PALETTES.moonlitAmber,
  },
  {
    id: "national-day",
    group: "chinese",
    zh: "🎉 国庆节限定",
    en: "🎉 Golden Week Special",
    bannerZh: "🎉 欢度国庆 · 招牌烤鸭煎饼与节日限定热乎出锅",
    bannerEn: "🎉 Golden Week Specials — Hot Savoury Jian Bing & Limited Treats",
    paletteName: { zh: "喜庆红金", en: "Festive Crimson" },
    theme: PALETTES.crimsonGold,
  },
  {
    id: "winter-solstice",
    group: "chinese",
    zh: "🥟 冬至限定",
    en: "🥟 Winter Solstice Special",
    bannerZh: "🥟 冬至大如年 · 现煎手工饺子、鲜汤馄饨与热乎煎饼管饱暖身",
    bannerEn: "🥟 Winter Solstice Warmers — Pan-Fried Dumplings, Wonton Soup & Hot Crepes",
    paletteName: { zh: "暖冬灯火", en: "Warm Solstice" },
    theme: PALETTES.moonlitAmber,
  },
  {
    id: "laba",
    group: "chinese",
    zh: "🥣 腊八节限定",
    en: "🥣 Laba Festival Special",
    bannerZh: "🥣 过了腊八就是年 · 现磨热豆奶、黑芝麻糊配热乎煎饼最暖胃",
    bannerEn: "🥣 Laba Festival — Cosy Hot Soya Milk, Black Sesame & Fresh Jian Bing",
    paletteName: { zh: "岁末红金", en: "Winter Crimson" },
    theme: PALETTES.crimsonGold,
  },

  // ── 英国与西方节假日 (UK & British Holidays) ──
  {
    id: "new-year",
    group: "uk",
    zh: "🎆 元旦新年限定",
    en: "🎆 New Year's Day Special",
    bannerZh: "🎆 新年快乐 · 新的一年从一张热乎现摊果蔬煎饼开始",
    bannerEn: "🎆 Happy New Year — Start the Year Warm with Fresh Jian Bing in Camden",
    paletteName: { zh: "烟火星金", en: "Midnight & Gold" },
    theme: PALETTES.royalCelebration,
  },
  {
    id: "valentines",
    group: "uk",
    zh: "💘 情人节限定",
    en: "💘 Valentine's Day Special",
    bannerZh: "💘 情人节限定 · 鲜草莓焦糖布蕾可丽饼与热乎煎饼甜蜜上线",
    bannerEn: "💘 Happy Valentine's Day — Torched Crème Brûlée & Strawberry Crepes Made Fresh",
    paletteName: { zh: "莓果粉红", en: "Berry Rose" },
    theme: PALETTES.roseBlossom,
  },
  {
    id: "pancake-day",
    group: "uk",
    zh: "🥞 英国煎饼节限定",
    en: "🥞 Pancake Day Special",
    bannerZh: "🥞 英国煎饼节（Pancake Day）快乐 · 咸甜果蔬煎饼全天现摊",
    bannerEn: "🥞 Happy Pancake Day — Celebrate with Authentic Savoury Jian Bing & Sweet Crepes",
    paletteName: { zh: "铁板金黄", en: "Golden Griddle" },
    theme: PALETTES.goldenGriddle,
  },
  {
    id: "mothers-day-uk",
    group: "uk",
    zh: "💐 英国母亲节限定",
    en: "💐 Mother's Day Special",
    bannerZh: "💐 母亲节快乐 · 带妈妈来尝刘阿姨亲手现摊的暖心家常味",
    bannerEn: "💐 Happy Mother's Day — Homestyle Crepes & Sweet Treats Made with Care",
    paletteName: { zh: "康乃馨粉", en: "Blossom Rose" },
    theme: PALETTES.roseBlossom,
  },
  {
    id: "easter",
    group: "uk",
    zh: "🐣 复活节限定",
    en: "🐣 Easter Special",
    bannerZh: "🐣 复活节快乐 · 春日限定甜煎饼与鲜榨果蔬煎饼现点现做",
    bannerEn: "🐣 Happy Easter — Spring Sweet Crepes & Fresh Fruit-and-Veg Jian Bing",
    paletteName: { zh: "春日草绿", en: "Spring Meadow" },
    theme: PALETTES.springPastel,
  },
  {
    id: "bank-holiday",
    group: "uk",
    zh: "👑 英国银行假日限定",
    en: "👑 UK Bank Holiday Special",
    bannerZh: "👑 银行假日照常营业 · 逛 Camden 顺路来份热乎煎饼与套餐",
    bannerEn: "👑 Open This Bank Holiday — Pop Into Camden Road for Hot Jian Bing & Meal Deals",
    paletteName: { zh: "皇家庆典", en: "Royal Celebration" },
    theme: PALETTES.royalCelebration,
  },
  {
    id: "fathers-day",
    group: "uk",
    zh: "👔 父亲节限定",
    en: "👔 Father's Day Special",
    bannerZh: "👔 父亲节快乐 · 满料烤鸭煎饼、清真牛肉煎饼与慢炖牛肉饭管饱过瘾",
    bannerEn: "👔 Happy Father's Day — Loaded Roast Duck & Halal Beef Jian Bing Made to Order",
    paletteName: { zh: "英伦暖褐", en: "Heritage Tweed" },
    theme: PALETTES.heritageTweed,
  },
  {
    id: "halloween",
    group: "uk",
    zh: "🎃 万圣节限定",
    en: "🎃 Halloween Special",
    bannerZh: "🎃 万圣节限定上线 · 逛卡姆登夜游先来一份热腾腾煎饼暖手",
    bannerEn: "🎃 Happy Halloween — Spooky Season Specials & Piping-Hot Jian Bing in Camden",
    paletteName: { zh: "南瓜暮橙", en: "Pumpkin Ember" },
    theme: PALETTES.pumpkinEmber,
  },
  {
    id: "bonfire-night",
    group: "uk",
    zh: "🎇 篝火之夜限定",
    en: "🎇 Bonfire Night Special",
    bannerZh: "🎇 篝火之夜暖手必吃 · 刚出锅的酥脆煎饼配热豆奶最过瘾",
    bannerEn: "🎇 Bonfire Night Warmers — Hot Griddled Jian Bing & Warm Soya Milk to Go",
    paletteName: { zh: "夜空焰火", en: "Sparkler Night" },
    theme: PALETTES.royalCelebration,
  },
  {
    id: "christmas",
    group: "uk",
    zh: "🎄 圣诞节限定",
    en: "🎄 Christmas Special",
    bannerZh: "🎄 圣诞快乐 · 卡姆登街头热乎现摊煎饼与圣诞限定甜品暖胃过冬",
    bannerEn: "🎄 Merry Christmas — Warm Jian Bing & Festive Sweet Crepes in Camden",
    paletteName: { zh: "松绿冬青红", en: "Christmas Holly" },
    theme: PALETTES.christmasHolly,
  },
  {
    id: "boxing-day",
    group: "uk",
    zh: "🎁 节礼日限定",
    en: "🎁 Boxing Day Special",
    bannerZh: "🎁 节礼日快乐 · 逛街扫货累了来一份热乎煎饼与港式奶茶回血",
    bannerEn: "🎁 Happy Boxing Day — Refuel with Hot Jian Bing & Hong Kong Milk Tea",
    paletteName: { zh: "冬日松绿", en: "Winter Pine" },
    theme: PALETTES.christmasHolly,
  },

  // ── 伊斯兰重要节日 (Islamic Holidays) ──
  {
    id: "ramadan",
    group: "islamic",
    zh: "🌙 斋月限定 / 开斋夜特供",
    en: "🌙 Ramadan & Iftar Special",
    bannerZh: "🌙 斋月吉庆（Ramadan Mubarak）· 清真牛肉/鸡肉煎饼与开斋限定热乎供应",
    bannerEn: "🌙 Ramadan Mubarak — Fresh Halal Beef & Chicken Jian Bing & Iftar Specials",
    paletteName: { zh: "翡翠星月金", en: "Crescent Emerald" },
    theme: PALETTES.crescentEmerald,
  },
  {
    id: "eid-al-fitr",
    group: "islamic",
    zh: "✨ 开斋节限定",
    en: "✨ Eid al-Fitr Special",
    bannerZh: "✨ 开斋节快乐（Eid Mubarak）· 清真招牌煎饼、牛肉夹馍与节日限定欢庆上新",
    bannerEn: "✨ Eid Mubarak — Celebrate Eid al-Fitr with Halal Jian Bing & Festive Specials",
    paletteName: { zh: "翡翠星月金", en: "Crescent Emerald" },
    theme: PALETTES.crescentEmerald,
  },
  {
    id: "eid-al-adha",
    group: "islamic",
    zh: "🐑 宰牲节（古尔邦节）限定",
    en: "🐑 Eid al-Adha Special",
    bannerZh: "🐑 宰牲节吉庆（Eid Mubarak）· 精选清真牛肉煎饼、炖牛肉饭与节日特供",
    bannerEn: "🐑 Eid al-Adha Mubarak — Halal Beef Jian Bing, Braised Beef Rice & Festive Specials",
    paletteName: { zh: "翡翠星月金", en: "Crescent Emerald" },
    theme: PALETTES.crescentEmerald,
  },
  {
    id: "islamic-new-year",
    group: "islamic",
    zh: "🕌 伊斯兰新年限定",
    en: "🕌 Islamic New Year Special",
    bannerZh: "🕌 伊斯兰新年吉庆 · 现点现做清真煎饼与手工牛肉煎饺欢迎品尝",
    bannerEn: "🕌 Happy Islamic New Year — Fresh Halal Jian Bing & Pan-Fried Beef Dumplings",
    paletteName: { zh: "翡翠星月金", en: "Crescent Emerald" },
    theme: PALETTES.crescentEmerald,
  },
  {
    id: "mawlid",
    group: "islamic",
    zh: "🌟 圣纪节限定",
    en: "🌟 Mawlid al-Nabi Special",
    bannerZh: "🌟 圣纪节平安喜乐 · 清真美味煎饼与现调甜品饮品热乎奉上",
    bannerEn: "🌟 Mawlid Mubarak — Fresh Halal Street Food & Sweet Crepes Made to Order",
    paletteName: { zh: "翡翠星月金", en: "Crescent Emerald" },
    theme: PALETTES.crescentEmerald,
  },
];

export function getFestivalPresetById(
  id: string | null | undefined
): FestivalPreset | null {
  if (!id) return null;
  return festivalPresets.find((p) => p.id === id) ?? null;
}

const CALLIGRAPHY_BY_ID: Record<string, string> = {
  "lunar-new-year": "新春限定",
  "lantern-festival": "元宵限定",
  qingming: "清明限定",
  "dragon-boat": "端午限定",
  qixi: "七夕限定",
  "mid-autumn": "中秋限定",
  "double-ninth": "重阳限定",
  "national-day": "国庆限定",
  "winter-solstice": "冬至限定",
  laba: "腊八限定",
  "new-year": "新年限定",
  valentines: "情人限定",
  "pancake-day": "煎饼节",
  "mothers-day-uk": "母亲节",
  easter: "复活限定",
  "bank-holiday": "假日限定",
  "fathers-day": "父亲节",
  halloween: "万圣限定",
  "bonfire-night": "篝火限定",
  christmas: "圣诞限定",
  "boxing-day": "节礼限定",
  ramadan: "斋月特供",
  "eid-al-fitr": "开斋限定",
  "eid-al-adha": "古尔邦节",
  "islamic-new-year": "回历新年",
  mawlid: "圣纪限定",
};

/** Short button label for Mom (e.g. "🧧 春节" instead of "🧧 春节限定 / 开斋夜特供") */
export function getFestivalShortNameZh(preset: FestivalPreset): string {
  return preset.zh
    .replace(/\s*\/\s*开斋夜特供/, "")
    .replace(/限定$/, "")
    .trim();
}

export function getFestivalShortNameEn(preset: FestivalPreset): string {
  return preset.en
    .replace(/^[^\w]+/, "")
    .replace(/\s+Special$/i, "")
    .trim();
}

export function matchFestivalPresetIds(
  textZh?: string | null,
  textEn?: string | null
): string[] {
  const zh = (textZh ?? "").trim();
  const en = (textEn ?? "").trim();
  if (!zh && !en) return [];

  return festivalPresets
    .filter((p) => {
      const shortZh = getFestivalShortNameZh(p).replace(/^[^\u4e00-\u9fff]+/, "").trim();
      const shortEn = getFestivalShortNameEn(p);
      return (
        (zh && (zh.includes(p.zh) || (shortZh && zh.includes(shortZh)))) ||
        (en && (en.includes(p.en) || (shortEn && en.toLowerCase().includes(shortEn.toLowerCase()))))
      );
    })
    .map((p) => p.id);
}

export function matchFestivalPresetId(
  noteZh?: string | null,
  noteEn?: string | null
): string {
  const zh = (noteZh ?? "").trim();
  const en = (noteEn ?? "").trim();
  if (!zh && !en) return "";
  const exact = festivalPresets.find((p) => p.zh === zh || p.en === en);
  if (exact) return exact.id;
  const multi = matchFestivalPresetIds(zh, en);
  return multi.length > 0 ? multi[0] : "custom";
}

export function composeDishNoteFromFestivals(ids: string[]): {
  noteZh: string;
  noteEn: string;
} {
  const selected = ids
    .map((id) => getFestivalPresetById(id))
    .filter((p): p is FestivalPreset => Boolean(p));

  if (selected.length === 0) {
    return { noteZh: "", noteEn: "" };
  }
  if (selected.length === 1) {
    return { noteZh: selected[0].zh, noteEn: selected[0].en };
  }
  return {
    noteZh: `${selected.map((p) => getFestivalShortNameZh(p)).join(" · ")}限定`,
    noteEn: `${selected.map((p) => getFestivalShortNameEn(p)).join(" · ")} Specials`,
  };
}

export function composeCategoryFromFestivals(ids: string[]): {
  titleZh: string;
  titleEn: string;
  chineseTitle: string;
  subtitleZh: string;
  subtitleEn: string;
} {
  const selected = ids
    .map((id) => getFestivalPresetById(id))
    .filter((p): p is FestivalPreset => Boolean(p));

  if (selected.length === 0) {
    return {
      titleZh: "节日限定菜单",
      titleEn: "Festive Specials",
      chineseTitle: "节日限定",
      subtitleZh: "逢年过节特别推出的限定风味煎饼、点心与特调，限时供应、售完即止。",
      subtitleEn:
        "Limited-time seasonal crepes, snacks and drinks crafted for holidays and celebrations — available while ingredients last.",
    };
  }

  if (selected.length === 1) {
    const p = selected[0];
    const shortZh = getFestivalShortNameZh(p);
    const shortEn = getFestivalShortNameEn(p);
    return {
      titleZh: `${shortZh}限定菜单`,
      titleEn: `${shortEn} Specials`,
      chineseTitle: CALLIGRAPHY_BY_ID[p.id] || "节日限定",
      subtitleZh: `${p.bannerZh}，限时供应、售完即止。`,
      subtitleEn: `${p.bannerEn} — freshly made to order while ingredients last.`,
    };
  }

  const zhNames = selected.map((p) => getFestivalShortNameZh(p));
  const enNames = selected.map((p) => getFestivalShortNameEn(p));
  const titleZh =
    zhNames.length <= 3
      ? `${zhNames.join(" · ")}限定菜单`
      : `${zhNames.slice(0, 3).join(" · ")}等 ${zhNames.length} 大节日限定`;
  const titleEn =
    enNames.length <= 3
      ? `${enNames.join(" & ")} Specials`
      : `Festive Specials (${enNames.slice(0, 2).join(", ")} & More)`;

  return {
    titleZh,
    titleEn,
    chineseTitle: "节日限定",
    subtitleZh: `精选 ${zhNames.join("、")} 特别推出的限定风味煎饼、点心与特调，现点现做、售完即止。`,
    subtitleEn: `Special limited-time crepes, snacks and drinks celebrating ${enNames.join(", ")} — freshly made to order.`,
  };
}
