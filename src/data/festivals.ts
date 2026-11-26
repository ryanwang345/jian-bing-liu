export type FestivalGroupKey = "chinese" | "uk" | "islamic";

export interface FestivalPreset {
  id: string;
  group: FestivalGroupKey;
  zh: string;
  en: string;
}

export const festivalGroupLabels: Record<
  FestivalGroupKey,
  { zh: string; en: string }
> = {
  chinese: { zh: "中国节假日", en: "Chinese Festivals & Holidays" },
  uk: { zh: "英国节假日", en: "UK & British Holidays" },
  islamic: { zh: "伊斯兰节日", en: "Islamic Holidays" },
};

export const festivalPresets: FestivalPreset[] = [
  // ── 中国传统与法定节假日 (Chinese Festivals & Holidays) ──
  {
    id: "lunar-new-year",
    group: "chinese",
    zh: "🧧 春节限定",
    en: "🧧 Lunar New Year Special",
  },
  {
    id: "lantern-festival",
    group: "chinese",
    zh: "🏮 元宵节限定",
    en: "🏮 Lantern Festival Special",
  },
  {
    id: "qingming",
    group: "chinese",
    zh: "🌿 清明节限定",
    en: "🌿 Qingming Festival Special",
  },
  {
    id: "dragon-boat",
    group: "chinese",
    zh: "🐉 端午节限定",
    en: "🐉 Dragon Boat Festival Special",
  },
  {
    id: "qixi",
    group: "chinese",
    zh: "💕 七夕节限定",
    en: "💕 Qixi Festival Special",
  },
  {
    id: "mid-autumn",
    group: "chinese",
    zh: "🥮 中秋节限定",
    en: "🥮 Mid-Autumn Festival Special",
  },
  {
    id: "double-ninth",
    group: "chinese",
    zh: "🌼 重阳节限定",
    en: "🌼 Double Ninth Festival Special",
  },
  {
    id: "national-day",
    group: "chinese",
    zh: "🎉 国庆节限定",
    en: "🎉 Golden Week Special",
  },
  {
    id: "winter-solstice",
    group: "chinese",
    zh: "🥟 冬至限定",
    en: "🥟 Winter Solstice Special",
  },
  {
    id: "laba",
    group: "chinese",
    zh: "🥣 腊八节限定",
    en: "🥣 Laba Festival Special",
  },

  // ── 英国与西方节假日 (UK & British Holidays) ──
  {
    id: "new-year",
    group: "uk",
    zh: "🎆 元旦新年限定",
    en: "🎆 New Year's Day Special",
  },
  {
    id: "valentines",
    group: "uk",
    zh: "💘 情人节限定",
    en: "💘 Valentine's Day Special",
  },
  {
    id: "pancake-day",
    group: "uk",
    zh: "🥞 英国煎饼节限定",
    en: "🥞 Pancake Day Special",
  },
  {
    id: "mothers-day-uk",
    group: "uk",
    zh: "💐 英国母亲节限定",
    en: "💐 Mother's Day Special",
  },
  {
    id: "easter",
    group: "uk",
    zh: "🐣 复活节限定",
    en: "🐣 Easter Special",
  },
  {
    id: "bank-holiday",
    group: "uk",
    zh: "👑 英国银行假日限定",
    en: "👑 UK Bank Holiday Special",
  },
  {
    id: "fathers-day",
    group: "uk",
    zh: "👔 父亲节限定",
    en: "👔 Father's Day Special",
  },
  {
    id: "halloween",
    group: "uk",
    zh: "🎃 万圣节限定",
    en: "🎃 Halloween Special",
  },
  {
    id: "bonfire-night",
    group: "uk",
    zh: "🎇 篝火之夜限定",
    en: "🎇 Bonfire Night Special",
  },
  {
    id: "christmas",
    group: "uk",
    zh: "🎄 圣诞节限定",
    en: "🎄 Christmas Special",
  },
  {
    id: "boxing-day",
    group: "uk",
    zh: "🎁 节礼日限定",
    en: "🎁 Boxing Day Special",
  },

  // ── 伊斯兰重要节日 (Islamic Holidays) ──
  {
    id: "ramadan",
    group: "islamic",
    zh: "🌙 斋月限定 / 开斋夜特供",
    en: "🌙 Ramadan & Iftar Special",
  },
  {
    id: "eid-al-fitr",
    group: "islamic",
    zh: "✨ 开斋节限定",
    en: "✨ Eid al-Fitr Special",
  },
  {
    id: "eid-al-adha",
    group: "islamic",
    zh: "🐑 宰牲节（古尔邦节）限定",
    en: "🐑 Eid al-Adha Special",
  },
  {
    id: "islamic-new-year",
    group: "islamic",
    zh: "🕌 伊斯兰新年限定",
    en: "🕌 Islamic New Year Special",
  },
  {
    id: "mawlid",
    group: "islamic",
    zh: "🌟 圣纪节限定",
    en: "🌟 Mawlid al-Nabi Special",
  },
];

export function matchFestivalPresetId(
  noteZh?: string | null,
  noteEn?: string | null
): string {
  const zh = (noteZh ?? "").trim();
  const en = (noteEn ?? "").trim();
  if (!zh && !en) return "";
  const hit = festivalPresets.find((p) => p.zh === zh || p.en === en);
  return hit ? hit.id : "custom";
}
