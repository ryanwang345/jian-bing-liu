import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { restaurant } from "@/data/restaurant";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Our Story",
  description:
    "Meet Jian Bing Liu (煎饼刘) in Camden, London — celebrating traditional Chinese savoury Jian Bing, vibrant fruit-and-vegetable batters, and handcrafted lace sweet crepes.",
  path: "/our-story",
  image: "/images/chef-lace-crepe.jpg",
});

const griddleSteps = [
  {
    step: "01",
    title: "Swirled on Cast Iron",
    chinese: "摊面糊",
    description:
      "Fresh savoury or naturally tinted fruit-and-vegetable batter is poured onto a hot round griddle and swept paper-thin with cracked egg.",
    image: "/images/griddle-batter-egg.jpg",
    alt: "Fresh vegetable batter and cracked egg cooking evenly across a seasoned cast-iron Jian Bing griddle",
  },
  {
    step: "02",
    title: "Brushed & Layered",
    chinese: "刷酱加料",
    description:
      "We brush on our savoury homemade sauce and pile on crisp lettuce, spring onions, crispy fried onions, and your choice of Halal beef, chicken, or veggies.",
    image: "/images/folded-rainbow-crepe.jpg",
    alt: "Colourful savoury Jian Bing crepe layered with fresh greens and folded warm on the griddle",
  },
  {
    step: "03",
    title: "Folded Warm to Go",
    chinese: "趁热享用",
    description:
      "Tucked straight into our signature 煎饼刘 kraft sleeve so every bite balances tender egg-kissed batter with golden street-food crunch.",
    image: "/images/jianbing-apron-hero.jpg",
    alt: "Generously filled Jian Bing wrapped in a kraft sleeve held in front of the embroidered Jian Bing Liu apron",
  },
];

export default function OurStoryPage() {
  return (
    <div className="pb-20">
      {/* Intro Hero */}
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
              <span>Our Story</span>
              <span aria-hidden="true" className="text-kraft-deep">
                ·
              </span>
              <span
                lang="zh-Hans"
                className="font-calligraphy text-lg font-normal tracking-normal text-ink"
              >
                关于煎饼刘
              </span>
            </p>
            <h1 className="mt-2 font-display text-4xl leading-[1.1] font-extrabold tracking-tight text-ink sm:text-5xl">
              {restaurant.story.headline}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
              {restaurant.story.lead}
            </p>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-muted sm:text-base">
              {restaurant.story.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Transparent placeholder for additional owner-supplied history */}
            <div className="mt-6 rounded-2xl border border-dashed border-cinnabar/40 bg-white/75 p-4 text-xs leading-relaxed text-ink-muted">
              <strong className="font-semibold text-cinnabar-dark">
                Placeholder — Founder Notes:
              </strong>{" "}
              {restaurant.placeholders.founderStoryNote}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border-2 border-kraft-deep bg-kraft shadow-xl">
              <Image
                src="/images/chef-lace-crepe.jpg"
                alt="Jian Bing Liu chef smiling in branded black apron and red sleeve while holding a freshly griddled pink lace crepe"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Craft Process */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22 lg:px-8">
        <SectionHeading
          eyebrow="The Griddle Craft"
          chineseAccent="匠心工艺"
          title="Three steps from sizzling batter to warm kraft sleeve"
          description="Traditional Chinese Jian Bing is all about timing, heat, and texture — cooked right in front of you and best eaten piping hot."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {griddleSteps.map((item) => (
            <article
              key={item.step}
              className="flex flex-col overflow-hidden rounded-2xl border border-kraft-deep/80 bg-white shadow-xs"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-kraft">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 rounded-full bg-ink/85 px-3 py-1 font-display text-xs font-bold text-[#F0C26E]">
                  Step {item.step}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl font-bold text-ink">
                    {item.title}
                  </h3>
                  <span
                    lang="zh-Hans"
                    className="font-calligraphy text-xl text-cinnabar"
                  >
                    {item.chinese}
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Brand Heritage & Signatures */}
      <section className="border-y border-kraft-deep/80 bg-kraft/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Identity"
            chineseAccent="正宗风味"
            title="Calligraphy, vermilion seals & colourful crepes"
            description="Every detail of Jian Bing Liu takes inspiration from classic Chinese street-stall warmth — from our brush-lettered 煎饼刘 kraft sleeves and red fringed banners to our hand-piped lace crepes."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <figure className="overflow-hidden rounded-2xl border border-kraft-deep bg-white shadow-xs">
              <div className="relative aspect-square w-full bg-kraft">
                <Image
                  src="/images/brand-kraft-sleeve.jpg"
                  alt="Jian Bing Liu kraft crepe wrapper stamped with red script, black brush calligraphy 煎饼刘, and vermilion seal"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-4 text-sm font-medium text-ink-muted">
                Signature kraft sleeve stamped with{" "}
                <span lang="zh-Hans" className="font-semibold text-ink">
                  煎饼刘
                </span>{" "}
                and our vermilion seal.
              </figcaption>
            </figure>

            <figure className="overflow-hidden rounded-2xl border border-kraft-deep bg-white shadow-xs">
              <div className="relative aspect-square w-full bg-kraft">
                <Image
                  src="/images/banner-fruit-veg-crepe.jpg"
                  alt="Freshly folded savoury Jian Bing held in front of the traditional red and gold 果蔬煎饼 banner"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-4 text-sm font-medium text-ink-muted">
                Traditional red banner celebrating authentic fruit-and-vegetable
                crepes (<span lang="zh-Hans">果蔬煎饼</span>).
              </figcaption>
            </figure>

            <figure className="overflow-hidden rounded-2xl border border-kraft-deep bg-white shadow-xs">
              <div className="relative aspect-square w-full bg-kraft">
                <Image
                  src="/images/lace-crepe-sheet.jpg"
                  alt="Freshly griddled golden crepe trimmed with delicate hand-piped pink lattice lace"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-4 text-sm font-medium text-ink-muted">
                Playful hand-piped fancy lace edges crafted for our sweet crepe
                cones.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-kraft-deep bg-white p-8 shadow-sm md:flex-row md:items-center sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Ready to try a warm Jian Bing in Camden?
            </h2>
            <p className="mt-2 text-sm text-ink-muted sm:text-base">
              Browse the full menu or drop by {restaurant.address.street} any
              day between 11:00 AM and 9:30 PM.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-cinnabar-dark"
            >
              View Menu
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/visit-us"
              className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-parchment"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Visit Us
            </Link>
            {restaurant.links.orderOnline && (
              <a
                href={restaurant.links.orderOnline}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-kraft/60 px-5 py-3 text-sm font-semibold text-ink hover:border-cinnabar hover:text-cinnabar"
              >
                Order Online
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
