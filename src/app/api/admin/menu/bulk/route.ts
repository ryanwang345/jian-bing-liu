import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import {
  bulkMenuItemsAction,
  getAdminMenuSnapshot,
  type BulkMenuAction,
} from "@/lib/menu-service";

export async function POST(request: Request) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as BulkMenuAction;
    if (!body || typeof body.type !== "string") {
      return NextResponse.json(
        { error: "Invalid bulk action payload" },
        { status: 400 }
      );
    }

    await bulkMenuItemsAction(body);
    try {
      revalidatePath("/menu");
      revalidatePath("/");
    } catch {
      // Ignore revalidation errors outside ISR
    }
    const snapshot = await getAdminMenuSnapshot();
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run bulk action";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
