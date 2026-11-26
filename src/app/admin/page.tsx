import type { Metadata } from "next";
import { MenuAdminClient } from "@/components/admin/MenuAdminClient";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getActiveFestivalThemeState } from "@/lib/festival-theme-service";
import { getAdminMenuSnapshot } from "@/lib/menu-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "菜单管理后台 | Menu Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getAdminSessionStatus();
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
    />
  );
}
