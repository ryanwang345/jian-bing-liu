import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import {
  IBM_Plex_Sans,
  LXGW_WenKai_TC,
  Ma_Shan_Zheng,
  Newsreader,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Yuji_Boku,
} from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { restaurant, SITE_URL } from "@/data/restaurant";
import { LocaleProvider } from "@/lib/i18n";
import {
  isValidLocale,
  LOCALE_COOKIE_NAME,
  localeToHtmlLang,
  parseAcceptLanguage,
  type Locale,
} from "@/lib/locale-detect";
import { buildRestaurantJsonLd } from "@/lib/seo";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const maShanZheng = Ma_Shan_Zheng({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ma-shan-zheng",
  display: "swap",
});

const lxgwWenKaiTC = LXGW_WenKai_TC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lxgw-wenkai-tc",
  display: "swap",
});

const yujiBoku = Yuji_Boku({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-yuji-boku",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${restaurant.name} (${restaurant.chineseName}) | Authentic Chinese Street Food in Camden`,
    template: `%s | ${restaurant.name} (${restaurant.chineseName})`,
  },
  description: restaurant.description.en,
  keywords: [
    "Jian Bing Liu",
    "煎饼刘",
    "爱民",
    "Jian Bing London",
    "Chinese street food Camden",
    "Chinese savoury crepe London",
    "Camden takeaway",
    "Halal Jian Bing London",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: `${restaurant.name} (${restaurant.chineseName})`,
    title: `${restaurant.name} (${restaurant.chineseName}) — Chinese Street Food in Camden`,
    description: restaurant.description.en,
    images: [
      {
        url: "/images/hero-jianbing-platter.jpg",
        width: 1600,
        height: 1067,
        alt: "Freshly griddled Jian Bing savoury crepe at Jian Bing Liu in Camden, London",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${restaurant.name} (${restaurant.chineseName}) — Camden, London`,
    description: restaurant.description.en,
    images: ["/images/hero-jianbing-platter.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildRestaurantJsonLd();
  const cookieStore = await cookies();
  const savedCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const hasSavedPreference = isValidLocale(savedCookie);

  const initialLocale: Locale = hasSavedPreference
    ? savedCookie
    : parseAcceptLanguage((await headers()).get("accept-language"));

  return (
    <html
      lang={localeToHtmlLang(initialLocale)}
      className={`${ibmPlexSans.variable} ${newsreader.variable} ${notoSansSC.variable} ${notoSansTC.variable} ${maShanZheng.variable} ${lxgwWenKaiTC.variable} ${yujiBoku.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-parchment text-ink selection:bg-cinnabar/20 selection:text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <LocaleProvider
          initialLocale={initialLocale}
          hasSavedPreference={hasSavedPreference}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-cinnabar focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
          >
            {initialLocale === "zh"
              ? "跳到正文"
              : initialLocale === "zh-Hant"
                ? "跳至正文"
                : "Skip to main content"}
          </a>

          <Header />

          <main id="main-content" className="flex-1">
            {children}
          </main>

          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
