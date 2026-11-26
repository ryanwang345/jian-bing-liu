import type { Metadata } from "next";
import { MenuAdminClient } from "@/components/admin/MenuAdminClient";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getActiveFestivalThemeState } from "@/lib/festival-theme-service";
import { getAdminMenuSnapshot } from "@/lib/menu-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "煎饼刘 · 管理中心 | Shopify-Style Admin",
  robots: {
    index: false,
    follow: false,
  },
};

type MainAdminTab = "overview" | "products" | "categories" | "themes";

function parseInitialTab(raw?: string | string[]): MainAdminTab {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (
    val === "overview" ||
    val === "products" ||
    val === "categories" ||
    val === "themes"
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
  const [initialSnapshot, initialFestivalTheme] = session.authenticated
    ? await Promise.all([
        getAdminMenuSnapshot(),
        getActiveFestivalThemeState(),
      ])
    : [null, null];

  return (
    <MenuAdminClient
      initialSession={session}
      initialSnapshot={initialSnapshot}
      initialFestivalTheme={initialFestivalTheme}
      initialTab={parseInitialTab(params.tab)}
    />
  );
}
