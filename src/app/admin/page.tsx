import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MenuAdminClient } from "@/components/admin/MenuAdminClient";
import type { MainAdminTab } from "@/components/admin/ShopifyAdminShell";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getActiveFestivalThemeState } from "@/lib/festival-theme-service";
import { getAdminMenuSnapshot } from "@/lib/menu-service";
import { getSiteContent } from "@/lib/site-content-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "煎饼刘 · 管理中心 | Shopify-Style Admin",
  robots: {
    index: false,
    follow: false,
  },
};

function parseInitialTab(raw?: string | string[]): MainAdminTab {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (
    val === "overview" ||
    val === "products" ||
    val === "categories" ||
    val === "themes" ||
    val === "customizer" ||
    val === "gallery" ||
    val === "settings"
  ) {
    return val;
  }
  return "products";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const [params, session] = await Promise.all([
    searchParams,
    getAdminSessionStatus(),
  ]);

  // Automatically forward `www.jianbingliu.uk/admin` to the Access-protected apex domain
  if (
    !session.authenticated &&
    session.configured &&
    session.requestHost === "www.jianbingliu.uk"
  ) {
    const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
    const target = tabParam
      ? `https://jianbingliu.uk/admin?tab=${encodeURIComponent(tabParam)}`
      : "https://jianbingliu.uk/admin";
    redirect(target);
  }
  const [initialSnapshot, initialFestivalTheme, initialSiteContent] =
    session.authenticated
      ? await Promise.all([
          getAdminMenuSnapshot(),
          getActiveFestivalThemeState(),
          getSiteContent(),
        ])
      : [null, null, null];

  return (
    <MenuAdminClient
      initialSession={session}
      initialSnapshot={initialSnapshot}
      initialFestivalTheme={initialFestivalTheme}
      initialSiteContent={initialSiteContent}
      initialTab={parseInitialTab(params.tab)}
    />
  );
}
