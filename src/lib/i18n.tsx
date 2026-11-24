"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCalligraphyStylesheetHref } from "@/lib/fonts";
import {
  isValidLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  localeToHtmlLang,
  type Locale,
} from "@/lib/locale-detect";
import { toTraditionalChinese } from "@/lib/zh-traditional";

export type { Locale };

export interface LocalizedText {
  en: string;
  zh: string;
  zhHant?: string;
}

interface LocaleContextValue {
  locale: Locale;
  isZh: boolean;
  isTraditional: boolean;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  t: (text: LocalizedText) => string;
  /** Render a Simplified Chinese string, converting to Traditional when locale === "zh-Hant". */
  zhText: (simplified: string, traditional?: string) => string;
  /** Pick between Chinese (auto-converted to Traditional in zh-Hant) and English. */
  pick: (zhSimplified: string, en: string, zhTraditional?: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function ensureCalligraphyFont(next: Locale) {
  if (typeof document === "undefined") return;
  if (
    document.head.querySelector(
      `link[data-calligraphy-locale="${next}"]`
    )
  ) {
    return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = getCalligraphyStylesheetHref(next);
  link.setAttribute("data-calligraphy-locale", next);
  document.head.appendChild(link);
}

function writeLocaleCookie(next: Locale) {
  try {
    const secure =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "; Secure"
        : "";
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  } catch {
    // Ignore cookie access restrictions
  }
}

export function LocaleProvider({
  initialLocale = "en",
  hasSavedPreference = false,
  children,
}: {
  initialLocale?: Locale;
  hasSavedPreference?: boolean;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // One-time migration for returning visitors who had saved localStorage before cookies existed.
  useEffect(() => {
    if (hasSavedPreference) return;
    try {
      const legacySaved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isValidLocale(legacySaved)) {
        writeLocaleCookie(legacySaved);
        if (legacySaved !== initialLocale) {
          ensureCalligraphyFont(legacySaved);
          setLocaleState(legacySaved);
          document.documentElement.lang = localeToHtmlLang(legacySaved);
        }
      }
    } catch {
      // Ignore storage access restrictions
    }
  }, [hasSavedPreference, initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    ensureCalligraphyFont(next);
    setLocaleState((prev) => {
      if (prev !== next && typeof document !== "undefined") {
        const root = document.documentElement;
        root.removeAttribute("data-locale-switching");
        // Force reflow so rapid switches replay the settle animation cleanly
        void root.offsetWidth;
        root.setAttribute("data-locale-switching", "true");
        window.setTimeout(() => {
          root.removeAttribute("data-locale-switching");
        }, 380);
      }
      return next;
    });
    document.documentElement.lang = localeToHtmlLang(next);
    writeLocaleCookie(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Ignore storage access restrictions
    }
  }, []);

  const toggleLocale = useCallback(() => {
    const next: Locale =
      locale === "en" ? "zh" : locale === "zh" ? "zh-Hant" : "en";
    setLocale(next);
  }, [locale, setLocale]);

  const isZh = locale === "zh" || locale === "zh-Hant";
  const isTraditional = locale === "zh-Hant";

  const zhText = useCallback(
    (simplified: string, traditional?: string) => {
      if (locale === "zh-Hant") {
        return traditional ?? toTraditionalChinese(simplified);
      }
      return simplified;
    },
    [locale]
  );

  const t = useCallback(
    (text: LocalizedText) => {
      if (locale === "zh-Hant") {
        return text.zhHant ?? toTraditionalChinese(text.zh);
      }
      if (locale === "zh") return text.zh;
      return text.en;
    },
    [locale]
  );

  const pick = useCallback(
    (zhSimplified: string, en: string, zhTraditional?: string) => {
      if (locale === "zh-Hant") {
        return zhTraditional ?? toTraditionalChinese(zhSimplified);
      }
      if (locale === "zh") return zhSimplified;
      return en;
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      isZh,
      isTraditional,
      setLocale,
      toggleLocale,
      t,
      zhText,
      pick,
    }),
    [locale, isZh, isTraditional, setLocale, toggleLocale, t, zhText, pick]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return ctx;
}
