export type Locale = "en" | "zh" | "zh-Hant";

export const LOCALE_COOKIE_NAME = "jianbingliu_locale";
export const LOCALE_STORAGE_KEY = "jianbingliu.locale";

export function isValidLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "zh" || value === "zh-Hant";
}

export function localeToHtmlLang(locale: Locale): string {
  if (locale === "zh") return "zh-Hans";
  if (locale === "zh-Hant") return "zh-Hant";
  return "en-GB";
}

/**
 * Parse an HTTP `Accept-Language` header (RFC 9110) and pick the highest-priority
 * supported locale ("zh-Hant", "zh", or "en"), defaulting to "en" if none match.
 */
export function parseAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return "en";

  const entries = header
    .split(",")
    .map((part, index) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = rawTag?.trim().toLowerCase() ?? "";
      let q = 1;
      for (const param of params) {
        const [k, v] = param.trim().split("=");
        if (k?.trim().toLowerCase() === "q" && v !== undefined) {
          const parsed = Number.parseFloat(v.trim());
          if (!Number.isNaN(parsed)) {
            q = parsed;
          }
        }
      }
      return { tag, q, index };
    })
    .filter((entry) => entry.tag.length > 0 && entry.q > 0)
    .sort((a, b) => (b.q !== a.q ? b.q - a.q : a.index - b.index));

  for (const { tag } of entries) {
    if (
      tag === "zh-hant" ||
      tag.startsWith("zh-hant-") ||
      tag === "zh-tw" ||
      tag.startsWith("zh-tw-") ||
      tag === "zh-hk" ||
      tag.startsWith("zh-hk-") ||
      tag === "zh-mo" ||
      tag.startsWith("zh-mo-")
    ) {
      return "zh-Hant";
    }
    if (tag === "zh" || tag.startsWith("zh-")) return "zh";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }

  return "en";
}
