import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import { DietaryBadge } from "@/components/DietaryBadge";
import { SectionHeading } from "@/components/SectionHeading";
import { featuredMenuItems } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: `${restaurant.name} (${restaurant.chineseName}) | Authentic Chinese Street Food in Camden`,
  description: restaurant.description,
  path: "/",
});

const craftGalleryStrip = [
  {
    src: "/images/veggie-crepe-griddle.jpg",
    alt: "Colourful fruit-and-vegetable batter crepe topped with herbs and shredded fillings on the hot griddle",
    label: "Fruit & Veg Batter",
  },
  {
    src: "/images/fancy-lace-dessert-cone.jpg",
    alt: "Hand-piped pink lace dessert crepe cone with whipped cream, fresh fruit, and biscuit sticks",
    label: "Fancy Lace Cones",
  },
  {
    src: "/images/veg-spring-rolls.jpg",
    alt: "Golden crispy vegetarian spring rolls served on a heart-shaped plate",
    label: "Crispy Street Snacks",
  },
  {
    src: "/images/spiced-tea-eggs.jpg",
    alt: "Spiced Chinese tea eggs steeping in dark soy and aromatic black tea marinade",
    label: "Traditional Tea Eggs",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="kraft-grain relative overflow-hidden border-b border-kraft-deep/80">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
          <div className="animate-fade-up lg:col-span-6">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cinnabar/25 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-cinnabar shadow-xs">
              <span
                lang="zh-Hans"
                className="font-calligraphy text-base font-normal text-ink"
              >
                {restaurant.chineseTagline}
              </span>
              <span aria-hidden="true" className="text-kraft-deep">
                |
              </span>
              <span className="tracking-wide uppercase">Camden, London</span>
            </div>

            <h1 className="mt-5 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Crisp, warm{" "}
              <span className="text-cinnabar">Jian Bing</span> folded fresh off
              the griddle.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              {restaurant.shortIntro}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3.5 text-sm font-semibold text-parchment shadow-md transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark hover:shadow-lg"
              >
                <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                View Menu
              </Link>

              <Link
                href="/visit-us"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-parchment px-6 py-3.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-parchment"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Visit Us
              </Link>

              {restaurant.links.orderOnline && (
                <a
                  href={restaurant.links.orderOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-cinnabar underline decoration-cinnabar/40 underline-offset-4 transition-colors hover:text-cinnabar-dark hover:decoration-cinnabar"
                >
                  Order Online
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* Verified quick-facts strip */}
            <dl className="mt-10 grid grid-cols-1 gap-4 border-t border-kraft-deep/90 pt-6 sm:grid-cols-3">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                  <MapPin className="h-3.5 w-3.5 text-cinnabar" aria-hidden="true" />
                  Location
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {restaurant.address.street}, {restaurant.address.postalCode}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                  <Clock className="h-3.5 w-3.5 text-cinnabar" aria-hidden="true" />
                  Open Daily
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  11:00 AM – 9:30 PM
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-ink-muted uppercase">
                  <Phone className="h-3.5 w-3.5 text-cinnabar" aria-hidden="true" />
                  Takeaway &amp; Delivery
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  <a
                    href={restaurant.phone.href}
                    className="hover:text-cinnabar"
                  >
                    {restaurant.phone.display}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Hero Photography Composition */}
          <div className="animate-fade-up-delay-1 relative lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border-2 border-kraft-deep bg-kraft shadow-xl">
              <Image
                src="/images/hero-jianbing-platter.jpg"
                alt="Freshly griddled herb-studded savoury Jian Bing crepe cut in half beside the Jian Bing Liu branded kraft sleeve"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Overlapping secondary food photo */}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-0 sm:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-lg sm:absolute sm:-bottom-6 sm:-left-6 sm:h-36 sm:w-48">
                <Image
                  src="/images/beef-crepe-sleeve.jpg"
                  alt="Warm black-sesame Jian Bing crepe wrapped in a signature kraft sleeve"
                  fill
                  sizes="(max-width: 640px) 50vw, 192px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-center rounded-2xl border border-kraft-deep bg-ink p-4 text-parchment shadow-lg sm:absolute sm:-right-3 sm:-bottom-6 sm:max-w-[230px]">
                <p
                  lang="zh-Hans"
                  className="font-calligraphy text-2xl text-[#F0C26E]"
                >
                  煎饼刘 · 现做现卖
                </p>
                <p className="mt-1 text-xs leading-relaxed text-parchment/80">
                  Halal beef &amp; chicken crepes, vibrant veggie batters, and
                  handmade dumplings made hot to order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Menu Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="From Our Menu"
            chineseAccent="招牌美味"
            title="Street-food favourites cooked hot to order"
            description="Explore our signature savoury Jian Bing crepes, slow-braised rice dishes, crispy dumplings, and sweet crepes — all with verified in-store pricing."
          />
          <Link
            href="/menu"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xs transition-all hover:border-cinnabar hover:text-cinnabar"
          >
            Explore Full Menu
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredMenuItems.slice(0, 6).map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {item.image && (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
                  <Image
                    src={item.image}
                    alt={item.imageAlt || item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.price && (
                    <span className="absolute right-3 bottom-3 rounded-full bg-ink/85 px-3 py-1 font-display text-sm font-bold text-[#F0C26E] backdrop-blur-xs">
                      {item.price}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl font-bold text-ink">
                      {item.name}
                    </h3>
                    {item.chineseName && (
                      <span
                        lang="zh-Hans"
                        className="text-xs font-medium text-ink-muted"
                      >
                        {item.chineseName}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                </div>

                {item.dietary && item.dietary.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.dietary.map((tag) => (
                      <DietaryBadge key={tag} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Our Story & Craft Editorial Band */}
      <section className="border-y border-kraft-deep/80 bg-kraft/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-22 lg:grid-cols-12 lg:px-8">
          <div className="grid grid-cols-12 gap-4 lg:col-span-6">
            <div className="relative col-span-7 aspect-[3/4] overflow-hidden rounded-3xl border-2 border-parchment bg-kraft shadow-lg">
              <Image
                src="/images/chef-lace-crepe.jpg"
                alt="Chef at Jian Bing Liu in Camden smiling while lifting a freshly made lace crepe in the kitchen"
                fill
                sizes="(max-width: 1024px) 60vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="col-span-5 flex flex-col gap-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-md">
                <Image
                  src="/images/brand-kraft-sleeve.jpg"
                  alt="Jian Bing Liu kraft crepe wrapper stamped with red script and Chinese calligraphy 煎饼刘"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover"
                />
              </div>
              <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-parchment bg-kraft shadow-md">
                <Image
                  src="/images/griddle-batter-egg.jpg"
                  alt="Swirling colourful vegetable batter and fresh egg on the round Jian Bing griddle"
                  fill
                  sizes="(max-width: 1024px) 40vw, 20vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="Our Story"
              chineseAccent="匠心手作"
              title={restaurant.story.headline}
              description={restaurant.story.lead}
            />

            <div className="mt-8 space-y-4">
              {restaurant.story.pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-kraft-deep/80 bg-parchment/90 p-4 shadow-2xs"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-ink">
                      {pillar.title}
                    </h3>
                    <span
                      lang="zh-Hans"
                      className="font-calligraphy text-lg text-cinnabar"
                    >
                      {pillar.chinese}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/our-story"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar"
              >
                Read Our Story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview Strip */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Kitchen Gallery"
            chineseAccent="色香俱全"
            title="Real food, vibrant colour, every single order"
            description="A peek behind the Camden counter — from savoury fruit-and-vegetable crepes to delicate hand-piped lace cones and street snacks."
          />
          <Link
            href="/gallery"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-kraft-deep bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-xs transition-all hover:border-cinnabar hover:text-cinnabar"
          >
            View Full Gallery
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {craftGalleryStrip.map((photo) => (
            <Link
              key={photo.src}
              href="/gallery"
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-kraft-deep bg-kraft shadow-xs"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent p-4 pt-12">
                <p className="font-display text-sm font-semibold text-parchment">
                  {photo.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Visit Us CTA Banner */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-12 text-parchment shadow-xl sm:px-12 sm:py-16">
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#F0C26E] uppercase">
                Camden Road · Takeaway &amp; Delivery
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">
                Stop by {restaurant.address.street} or order warm to your door.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-parchment/80 sm:text-base">
                Open daily from 11:00 AM to 9:30 PM for collection and
                no-contact delivery. Call ahead on{" "}
                <a
                  href={restaurant.phone.href}
                  className="font-semibold text-[#F0C26E] underline underline-offset-4 hover:text-white"
                >
                  {restaurant.phone.display}
                </a>{" "}
                or place your order online via{" "}
                {restaurant.links.orderOnlineProvider}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <a
                href={restaurant.links.googleMapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#F0C26E] px-6 py-3.5 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Get Directions
              </a>

              {restaurant.links.orderOnline && (
                <a
                  href={restaurant.links.orderOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-parchment/30 bg-cinnabar px-6 py-3.5 text-sm font-semibold text-parchment transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
                >
                  Order Online
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
