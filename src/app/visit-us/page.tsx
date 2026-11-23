import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Visit Us",
  description:
    "Visit Jian Bing Liu at 124 Camden Rd, London NW1 9EE. Open daily 11:00 AM – 9:30 PM for takeaway and no-contact delivery. Call 07824 318124 or get directions.",
  path: "/visit-us",
  image: "/images/brand-kraft-sleeve.jpg",
});

export default function VisitUsPage() {
  const mapEmbedUrl = `https://maps.google.com/maps?q=${restaurant.links.googleMapsEmbedQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="pb-20">
      {/* Header */}
      <section className="kraft-grain border-b border-kraft-deep/80">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinnabar uppercase">
              <span>Visit &amp; Contact</span>
              <span aria-hidden="true" className="text-kraft-deep">
                ·
              </span>
              <span
                lang="zh-Hans"
                className="font-calligraphy text-lg font-normal tracking-normal text-ink"
              >
                来店指南
              </span>
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Find us on Camden Road
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted sm:text-lg">
              Drop by for freshly griddled takeaway or order no-contact delivery
              across Camden and surrounding North London neighbourhoods.
            </p>
          </div>
        </div>
      </section>

      {/* Main Details + Map */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Contact & Hours Cards */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-kraft-deep bg-white p-6 shadow-xs sm:p-7">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    Address
                  </h2>
                  <address className="mt-1.5 not-italic text-sm leading-relaxed text-ink-muted">
                    {restaurant.name} (<span lang="zh-Hans">{restaurant.chineseName}</span>)
                    <br />
                    {restaurant.address.street}
                    <br />
                    {restaurant.address.locality} {restaurant.address.postalCode}
                    <br />
                    {restaurant.address.country}
                  </address>

                  <a
                    href={restaurant.links.googleMapsDirections}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-cinnabar px-5 py-2.5 text-sm font-semibold text-parchment shadow-xs transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    Get Directions
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-kraft-deep bg-white p-6 shadow-xs sm:p-7">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="w-full">
                  <h2 className="font-display text-lg font-bold text-ink">
                    Opening Hours
                  </h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    {restaurant.openingHours.map((row) => (
                      <div
                        key={row.days}
                        className="flex items-center justify-between gap-4 border-b border-kraft-deep/60 pb-2 last:border-0 last:pb-0"
                      >
                        <dt className="font-medium text-ink-soft">{row.days}</dt>
                        <dd className="font-semibold text-ink">{row.hours}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-ink-muted">
                    Hours may occasionally vary on public holidays — call ahead
                    if visiting close to closing time.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-kraft-deep bg-white p-6 shadow-xs sm:p-7">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="w-full">
                  <h2 className="font-display text-lg font-bold text-ink">
                    Phone &amp; Ordering
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    Call the kitchen directly for enquiries or pickup orders:
                  </p>
                  <a
                    href={restaurant.phone.href}
                    className="mt-2 inline-block font-display text-xl font-bold text-cinnabar hover:text-cinnabar-dark"
                  >
                    {restaurant.phone.display}
                  </a>

                  {restaurant.links.orderOnline && (
                    <div className="mt-4 border-t border-kraft-deep/60 pt-4">
                      <a
                        href={restaurant.links.orderOnline}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-parchment transition-colors hover:bg-cinnabar"
                      >
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                        Order Online via {restaurant.links.orderOnlineProvider}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  )}

                  {/* Clearly marked placeholder for optional email */}
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-kraft-deep bg-parchment p-3 text-xs text-ink-muted">
                    <Mail
                      className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted"
                      aria-hidden="true"
                    />
                    <span>
                      {restaurant.email ? (
                        <a
                          href={`mailto:${restaurant.email}`}
                          className="font-semibold text-ink hover:text-cinnabar"
                        >
                          {restaurant.email}
                        </a>
                      ) : (
                        <>
                          <strong className="font-semibold text-ink">
                            Email placeholder:
                          </strong>{" "}
                          {restaurant.placeholders.emailLabel}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map + Service Options */}
          <div className="space-y-6 lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-kraft-deep bg-kraft shadow-sm">
              <iframe
                title="Map showing Jian Bing Liu at 124 Camden Rd, London NW1 9EE"
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[380px] w-full border-0 sm:h-[440px]"
              />
            </div>

            <div className="rounded-3xl border border-kraft-deep bg-kraft/50 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">
                Service Information
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                Jian Bing Liu operates as a dedicated Chinese street-food
                takeaway and delivery counter.
              </p>

              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                <li className="flex items-center gap-2.5 rounded-2xl border border-jade/25 bg-white px-4 py-3 text-sm font-semibold text-ink">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-jade"
                    aria-hidden="true"
                  />
                  Takeaway
                </li>
                <li className="flex items-center gap-2.5 rounded-2xl border border-jade/25 bg-white px-4 py-3 text-sm font-semibold text-ink">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-jade"
                    aria-hidden="true"
                  />
                  No-contact delivery
                </li>
                <li className="flex items-center gap-2.5 rounded-2xl border border-kraft-deep bg-white/70 px-4 py-3 text-sm font-medium text-ink-muted">
                  <XCircle
                    className="h-5 w-5 shrink-0 text-cinnabar/70"
                    aria-hidden="true"
                  />
                  No dine-in seating
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-kraft-deep/80 pt-5 text-sm">
                <span className="text-ink-muted">
                  Typical spend:{" "}
                  <strong className="font-semibold text-ink">
                    {restaurant.priceRange} per person
                  </strong>
                </span>
                <Link
                  href="/menu"
                  className="font-semibold text-cinnabar underline underline-offset-4 hover:text-cinnabar-dark"
                >
                  Browse verified menu &amp; prices →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
