import type { Locale } from "@/lib/locale-detect";

/**
 * Exact set of Chinese characters displayed as calligraphy accents when browsing
 * in English mode (BrandMark, SectionHeadings, Menu categories, Story pillars).
 * Requesting a subsetted Google Font via `&text=` delivers a single ~12 KB woff2
 * instead of 578 KB of render-blocking CJK font CSS.
 */
const EN_CALLIGRAPHY_SUBSET = Array.from(
  new Set(
    [
      " · ",
      "煎饼刘爱民",
      "正宗风味果蔬煎饼",
      "现做现卖",
      "招牌美味",
      "匠心手作",
      "色香俱全",
      "食客好评",
      "精选菜单",
      "关于煎饼刘",
      "美食图集",
      "来店指南",
      "招牌果蔬煎饼",
      "午市精选",
      "热菜盖饭",
      "鲜汤馄饨",
      "街头小吃",
      "甜煎饼与甜品",
      "手调饮品",
      "丰富口味",
      "清真美味",
      "传统手艺",
      "蔬食友好",
      "匠心工艺",
      "摊面糊刷酱加料趁热享用",
    ].join("")
  )
).join("");

export function getCalligraphyStylesheetHref(locale: Locale): string {
  if (locale === "zh") {
    return "https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap";
  }
  if (locale === "zh-Hant") {
    return "https://fonts.googleapis.com/css2?family=Yuji+Boku&display=swap";
  }
  return `https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&text=${encodeURIComponent(
    EN_CALLIGRAPHY_SUBSET
  )}&display=swap`;
}
