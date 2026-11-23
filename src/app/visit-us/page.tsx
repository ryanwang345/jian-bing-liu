import { VisitView } from "@/components/views/VisitView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Visit Us",
  description:
    "Visit Jian Bing Liu at 124 Camden Rd, London NW1 9EE. Open daily 11:00 AM – 9:30 PM for takeaway and no-contact delivery (no dine-in). Call 07824 318124 or get directions.",
  path: "/visit-us",
  image: "/images/brand-kraft-sleeve.webp",
});

export default function VisitUsPage() {
  return <VisitView />;
}
