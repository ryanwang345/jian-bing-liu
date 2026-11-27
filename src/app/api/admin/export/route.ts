import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getMenuDb } from "@/lib/cf-bindings";
import { getActiveFestivalThemeState } from "@/lib/festival-theme-service";
import { getAdminMenuSnapshot } from "@/lib/menu-service";
import { getSiteContent } from "@/lib/site-content-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [menuSnapshot, siteContent, festivalTheme, db] = await Promise.all([
    getAdminMenuSnapshot(),
    getSiteContent(),
    getActiveFestivalThemeState(),
    getMenuDb(),
  ]);

  let socialProfiles: unknown[] = [];
  let showcasePosts: unknown[] = [];

  if (db) {
    try {
      const profilesRes = await db
        .prepare(
          "SELECT platform, handle, href, visible FROM social_profiles ORDER BY platform"
        )
        .all();
      socialProfiles = profilesRes.results ?? [];
    } catch {
      socialProfiles = [];
    }

    try {
      const postsRes = await db
        .prepare(
          "SELECT position, id, content, visible FROM showcase_posts ORDER BY position DESC"
        )
        .all();
      showcasePosts = (postsRes.results ?? []).map((row) => {
        const record = row as {
          position?: number;
          id?: string;
          content?: string;
          visible?: number;
        };
        let parsedContent: unknown = record.content ?? null;
        if (typeof record.content === "string") {
          try {
            parsedContent = JSON.parse(record.content);
          } catch {
            // Keep raw string if malformed
          }
        }
        return {
          position: record.position,
          id: record.id,
          visible: record.visible === 1,
          content: parsedContent,
        };
      });
    } catch {
      showcasePosts = [];
    }
  }

  const exportedAt = new Date().toISOString();
  const dateStamp = exportedAt.slice(0, 10);

  const backupPayload = {
    schemaVersion: 1,
    exportedAt,
    exportedBy: session.identity ?? "admin",
    source: menuSnapshot.source,
    menu: {
      categories: menuSnapshot.categories,
    },
    siteContent,
    festivalTheme: {
      setting: festivalTheme.setting,
      activeFestivalId: festivalTheme.activeFestival?.id ?? null,
      bannerOverrides: festivalTheme.bannerOverrides,
    },
    socialProfiles,
    showcasePosts,
  };

  return new NextResponse(JSON.stringify(backupPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="jian-bing-liu-backup-${dateStamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
