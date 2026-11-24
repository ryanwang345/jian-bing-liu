import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getAdminMenuSnapshot, seedDefaultMenuToDb } from "@/lib/menu-service";

export async function POST() {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const counts = await seedDefaultMenuToDb();
    try {
      revalidatePath("/menu");
      revalidatePath("/");
    } catch {
      // Ignore revalidation errors outside ISR
    }
    const snapshot = await getAdminMenuSnapshot();
    return NextResponse.json({ ok: true, seeded: counts, snapshot });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to seed database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
