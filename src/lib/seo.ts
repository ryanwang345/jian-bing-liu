import type { Metadata } from "next";
import { restaurant, SITE_URL } from "@/data/restaurant";
import { googleRating } from "@/data/reviews";

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image = "/images/og-cover.jpg",
}: PageMetadataOptions): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_GB",
      url,
      siteName: `${restaurant.name} (${restaurant.chineseName})`,
      title,
      description,
      images: [
        {
          url: image,
          width: 1600,
          height: 1067,
          alt: `${restaurant.name} — authentic Chinese Jian Bing street food in Camden, London`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function buildRestaurantJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    alternateName: `${restaurant.chineseName} (${restaurant.sealText})`,
    description: restaurant.description.en,
    url: SITE_URL,
    image: [
      `${SITE_URL}/images/hero-jianbing-platter.webp`,
      `${SITE_URL}/images/beef-crepe-sleeve.webp`,
      `${SITE_URL}/images/chef-lace-crepe.webp`,
    ],
    telephone: restaurant.phone.schema,
    servesCuisine: ["Chinese", "Chinese Street Food", "Jian Bing"],
    priceRange: restaurant.priceRange,
    acceptsReservations: false,
    hasMenu: `${SITE_URL}/menu`,
    sameAs: restaurant.verifiedSocialLinks
      .filter(
        (s) =>
          s.platform === "instagram" ||
          s.platform === "threads" ||
          s.platform === "tiktok"
      )
      .map((s) => s.href),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: googleRating.score,
      reviewCount: String(googleRating.count),
      bestRating: "5",
      worstRating: "1",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address.street,
      addressLocality: restaurant.address.locality,
      addressRegion: "Greater London",
      postalCode: restaurant.address.postalCode,
      addressCountry: restaurant.address.countryCode,
    },
    openingHoursSpecification: restaurant.openingHours.map((entry) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: entry.schemaDays,
      opens: entry.opens,
      closes: entry.closes,
    })),
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: restaurant.links.orderOnline,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      deliveryMethod: [
        "http://purl.org/goodrelations/v1#DeliveryModePickUp",
        "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
      ],
    },
  };
}
