import Link from "next/link";
import { Clock, ExternalLink, MapPin, Phone, ShoppingBag } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { restaurant } from "@/data/restaurant";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/our-story", label: "Our Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/visit-us", label: "Visit Us" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-soft bg-ink text-parchment/90">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <Link
              href="/"
              className="inline-block rounded-lg"
              aria-label={`${restaurant.name} — Home`}
            >
              <BrandMark variant="light" size="md" />
            </Link>
            <p className="text-sm leading-relaxed text-parchment/75">
              Authentic Chinese savoury Jian Bing crepes, fruit-and-vegetable
              batters, handmade dumplings, and delicate lace sweet crepes in
              Camden, London.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium">
              <span className="rounded-full border border-parchment/20 bg-parchment/10 px-3 py-1 text-parchment/90">
                Takeaway
              </span>
              <span className="rounded-full border border-parchment/20 bg-parchment/10 px-3 py-1 text-parchment/90">
                No-contact delivery
              </span>
            </div>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-[#F0C26E]">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-parchment/80 transition-colors hover:text-[#F0C26E]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {restaurant.links.orderOnline && (
                <li>
                  <a
                    href={restaurant.links.orderOnline}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[#F0C26E] transition-colors hover:text-white"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                    Order Online ({restaurant.links.orderOnlineProvider})
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-[#F0C26E]">
              Visit &amp; Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-parchment/80">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#F0C26E]"
                  aria-hidden="true"
                />
                <span>
                  {restaurant.address.street}
                  <br />
                  {restaurant.address.locality} {restaurant.address.postalCode}
                  <br />
                  {restaurant.address.country}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  className="h-4 w-4 shrink-0 text-[#F0C26E]"
                  aria-hidden="true"
                />
                <a
                  href={restaurant.phone.href}
                  className="transition-colors hover:text-[#F0C26E]"
                >
                  {restaurant.phone.display}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#F0C26E]"
                  aria-hidden="true"
                />
                <span>{restaurant.openingHoursSummary}</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-[#F0C26E]">
              Verified Links
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {restaurant.verifiedSocialLinks.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-parchment/85 transition-colors hover:text-[#F0C26E]"
                  >
                    {social.label}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
              {restaurant.links.orderOnline && (
                <li>
                  <a
                    href={restaurant.links.orderOnline}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-parchment/85 transition-colors hover:text-[#F0C26E]"
                  >
                    Official Ordering Menu ({restaurant.links.orderOnlineProvider})
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              )}
            </ul>
            <p className="mt-4 rounded-xl border border-parchment/15 bg-parchment/5 p-3 text-xs leading-relaxed text-parchment/65">
              <strong className="font-semibold text-parchment/85">
                Social accounts:
              </strong>{" "}
              No official Instagram or TikTok handle was supplied yet. Add
              verified links in <code className="text-[#F0C26E]">src/data/restaurant.ts</code>.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-parchment/15 pt-6 text-xs text-parchment/60 sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {restaurant.name} (
            <span lang="zh-Hans">{restaurant.chineseName}</span>).{" "}
            {restaurant.address.street}, {restaurant.address.postalCode}.
          </p>
          <p>Takeaway &amp; delivery kitchen · Prices &amp; availability subject to in-store confirmation.</p>
        </div>
      </div>
    </footer>
  );
}
