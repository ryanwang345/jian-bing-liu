import type { Metadata } from "next";
import { Fraunces, Ma_Shan_Zheng, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { restaurant, SITE_URL } from "@/data/restaurant";
import { buildRestaurantJsonLd } from "@/lib/seo";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-fraunces",
  display: "swap",
});

const maShanZheng = Ma_Shan_Zheng({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ma-shan-zheng",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${restaurant.name} (${restaurant.chineseName}) | Authentic Chinese Street Food in Camden`,
    template: `%s | ${restaurant.name} (${restaurant.chineseName})`,
  },
  description: restaurant.description,
  keywords: [
    "Jian Bing Liu",
    "煎饼刘",
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
    description: restaurant.description,
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
    description: restaurant.description,
    images: ["/images/hero-jianbing-platter.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildRestaurantJsonLd();

  return (
    <html
      lang="en-GB"
      className={`${plusJakarta.variable} ${fraunces.variable} ${maShanZheng.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-parchment text-ink selection:bg-cinnabar/20 selection:text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-cinnabar focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Header />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
