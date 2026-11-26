import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getFestivalPresetById } from "@/data/festivals";
import { isValidFestivalBannerText, FESTIVAL_BANNER_MAX_LENGTH } from "@/data/festival-banners";
import {
  getActiveFestivalThemeState,
  isValidFestivalThemeSetting,
  setActiveFestivalThemeSetting,
  setFestivalBannerText,
} from "@/lib/festival-theme-service";

export async function GET() {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getActiveFestivalThemeState();
  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request: Request) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const festivalId = body && typeof body === "object" && "festivalId" in body
    ? body.festivalId : null;
  if (typeof festivalId !== "string" || !getFestivalPresetById(festivalId) || !isValidFestivalBannerText(body)) {
    return NextResponse.json(
      { error: `请选择有效节日，中英文标题各不超过 ${FESTIVAL_BANNER_MAX_LENGTH} 个字符` },
      { status: 400 }
    );
  }

  try {
    const state = await setFestivalBannerText(festivalId, body);
    try {
      revalidatePath("/", "layout");
    } catch {
      // Ignore revalidation errors outside ISR.
    }
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存节日标题失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { theme?: unknown };
    const theme = typeof body.theme === "string" ? body.theme.trim() : "";
    if (!isValidFestivalThemeSetting(theme)) {
      return NextResponse.json(
        { error: "无效的节日主题选项 / Invalid festival theme" },
        { status: 400 }
      );
    }

    const state = await setActiveFestivalThemeSetting(theme);
    try {
      revalidatePath("/", "layout");
    } catch {
      // Ignore revalidation errors outside ISR
    }
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update festival theme";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
