import { redirect } from "next/navigation";
import { AdminCouponsClient } from "@/components/admin/AdminCouponsClient";
import { ShopifyAdminShell } from "@/components/admin/ShopifyAdminShell";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { listWelcomeCoupons, lookupCouponByCode } from "@/lib/coupon-service";
import { getSiteContent } from "@/lib/site-content-service";

export const metadata = {
  title: "优惠券极速核销与流水 · 管理中心",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) redirect("/admin");

  const params = await searchParams;
  const queryCode = params.code?.trim().toUpperCase() || "";
  const staff = session.identity || "admin";

  // Run lookup first if arrived via QR scan so the freshly recorded scan event appears in `snapshot.logs`
  const initialLookup = queryCode
    ? await lookupCouponByCode(queryCode, { recordScanByStaff: staff })
    : null;

  const [snapshot, siteContent] = await Promise.all([
    listWelcomeCoupons(200),
    getSiteContent(),
  ]);

  return (
    <ShopifyAdminShell
      activeNav="coupons"
      hasDb={snapshot.writable}
      identity={session.identity}
      logoutHref={session.logoutUrl}
    >
      <AdminCouponsClient
        writable={snapshot.writable}
        initialCoupons={snapshot.coupons}
        initialStats={snapshot.stats}
        initialLogs={snapshot.logs}
        initialLookup={initialLookup}
        initialQueryCode={queryCode}
        initialSiteContent={siteContent}
      />
    </ShopifyAdminShell>
  );
}
