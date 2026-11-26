import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import {
  getActiveFestivalThemeState,
  isValidFestivalThemeSetting,
  setActiveFestivalThemeSetting,
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
