import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import {
  deleteMenuCategory,
  getAdminMenuSnapshot,
  reorderMenuCategories,
  upsertMenuCategory,
} from "@/lib/menu-service";

async function requireAdmin() {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function revalidateMenu() {
  try {
    revalidatePath("/menu");
    revalidatePath("/");
  } catch {
    // Ignore outside ISR
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as {
      action?: "upsert" | "reorder";
      id?: string;
      titleZh?: string;
      titleEn?: string;
      chineseTitle?: string;
      subtitleZh?: string;
      subtitleEn?: string;
      orderedIds?: string[];
    };

    if (body.action === "reorder") {
      if (!Array.isArray(body.orderedIds)) {
        return NextResponse.json(
          { error: "Missing orderedIds" },
          { status: 400 }
        );
      }
      await reorderMenuCategories(body.orderedIds.map(String));
      revalidateMenu();
      const snapshot = await getAdminMenuSnapshot();
      return NextResponse.json({ ok: true, snapshot });
    }

    if (!body.titleZh?.trim() || !body.titleEn?.trim()) {
      return NextResponse.json(
        { error: "分类中文名称与英文名称为必填项" },
        { status: 400 }
      );
    }

    const id = await upsertMenuCategory({
      id: typeof body.id === "string" ? body.id : undefined,
      titleZh: body.titleZh,
      titleEn: body.titleEn,
      chineseTitle: body.chineseTitle,
      subtitleZh: body.subtitleZh,
      subtitleEn: body.subtitleEn,
    });

    revalidateMenu();
    const snapshot = await getAdminMenuSnapshot();
    return NextResponse.json({ ok: true, id, snapshot });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save category";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing category id" }, { status: 400 });
  }

  try {
    await deleteMenuCategory(id);
    revalidateMenu();
    const snapshot = await getAdminMenuSnapshot();
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
