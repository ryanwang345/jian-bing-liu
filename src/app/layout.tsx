import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import { SocialLinksProvider } from "@/components/SocialLinksProvider";
import { getSocialProfiles } from "@/lib/social-profiles";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileActionBar } from "@/components/MobileActionBar";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { ScrollAmbientLights } from "@/components/motion/ScrollAmbientLights";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";
import { restaurant, SITE_URL } from "@/data/restaurant";
import { getCalligraphyStylesheetHref } from "@/lib/fonts";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf6ec",
};

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
    "煎餅劉",
    "爱民",
    "Jian Bing London",
    "Chinese street food Camden",
    "Chinese savoury crepe London",
    "Camden takeaway",
    "Halal Jian Bing London",
    "Halal Chinese food Camden",
    "Vegetarian Chinese street food London",
    "Roast duck Jian Bing London",
    "Crème brûlée crepe Camden",
    "Dragon fruit Jian Bing London",
    "伦敦煎饼果子",
    "伦敦煎饼刘",
    "小红书煎饼刘",
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
        url: "/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Freshly griddled Jian Bing savoury crepe at Jian Bing Liu in Camden, London",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${restaurant.name} (${restaurant.chineseName}) — Camden, London`,
    description: restaurant.description.en,
    images: ["/images/og-cover.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, { profiles }] = await Promise.all([cookies(), getSocialProfiles()]);
  const visibleLinks = profiles.filter((profile) => profile.visible);
  const jsonLd = buildRestaurantJsonLd(visibleLinks);
  const savedCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const hasSavedPreference = isValidLocale(savedCookie);

  const initialLocale: Locale = hasSavedPreference
    ? savedCookie
    : parseAcceptLanguage((await headers()).get("accept-language"));

  const calligraphyHref = getCalligraphyStylesheetHref(initialLocale);

  return (
    <html
      lang={localeToHtmlLang(initialLocale)}
      className={`${ibmPlexSans.variable} ${newsreader.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.instagram.com" />
        <link rel="dns-prefetch" href="https://www.tiktok.com" />
        <link rel="dns-prefetch" href="https://www.threads.com" />
        <link
          rel="preload"
          as="style"
          href={calligraphyHref}
        />
        <noscript>
          <link rel="stylesheet" href={calligraphyHref} />
        </noscript>
      </head>
      <body className="flex min-h-screen flex-col bg-parchment text-ink selection:bg-cinnabar/20 selection:text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />

        <LocaleProvider
          initialLocale={initialLocale}
          hasSavedPreference={hasSavedPreference}
        >
          <SocialLinksProvider links={visibleLinks}>
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

            <ScrollAmbientLights />
            <ScrollProgressBar />
            <Header />

            <main id="main-content" className="relative z-10 flex-1">
              <RouteTransition>{children}</RouteTransition>
            </main>

            <Footer />
            <MobileActionBar />
          </SocialLinksProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
