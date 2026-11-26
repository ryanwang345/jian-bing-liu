import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { defaultSiteContent } from "@/data/site-content";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getSiteContent, saveSiteContent } from "@/lib/site-content-service";

export async function GET() {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  return NextResponse.json(
    { content },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action?: "reset-all";
      content?: unknown;
    };

    const payload =
      body.action === "reset-all" ? defaultSiteContent : body.content;

    const saved = await saveSiteContent(payload);
    try {
      revalidatePath("/", "layout");
    } catch {
      // Ignore outside ISR
    }
    return NextResponse.json({ ok: true, content: saved });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save site content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
