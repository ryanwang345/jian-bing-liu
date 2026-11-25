import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { DietaryTagKey } from "@/data/menu";
import { MenuPhotoError } from "@/lib/menu-photos";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import {
  deleteMenuItem,
  getAdminMenuSnapshot,
  patchMenuItemFlags,
  upsertMenuItem,
  type MenuItemUpsertInput,
} from "@/lib/menu-service";

async function requireAdmin() {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function revalidateMenuPages() {
  try {
    revalidatePath("/menu");
    revalidatePath("/");
  } catch {
    // Ignore revalidation errors in non-ISR contexts
  }
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const snapshot = await getAdminMenuSnapshot();
  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Partial<MenuItemUpsertInput>;
    if (!body.categoryId || !body.nameEn?.trim() || !body.nameZh?.trim()) {
      return NextResponse.json(
        { error: "分类、中文名和英文名为必填项 / Category, Chinese name, and English name are required." },
        { status: 400 }
      );
    }

    const dietary = Array.isArray(body.dietary)
      ? (body.dietary.filter((t) =>
          ["halal", "vegetarian", "vegan"].includes(String(t))
        ) as DietaryTagKey[])
      : [];

    const variants = Array.isArray(body.variants)
      ? body.variants.map((v) => ({
          id: typeof v.id === "string" ? v.id : undefined,
          sizeEn: String(v.sizeEn ?? "Regular"),
          sizeZh: String(v.sizeZh ?? "标准"),
          pricePence: Number(v.pricePence),
          isDefault: Boolean(v.isDefault),
        }))
      : [];

    const id = await upsertMenuItem({
      id: typeof body.id === "string" ? body.id : undefined,
      categoryId: String(body.categoryId),
      nameEn: String(body.nameEn),
      nameZh: String(body.nameZh),
      chineseName: typeof body.chineseName === "string" ? body.chineseName : undefined,
      descEn: String(body.descEn ?? ""),
      descZh: String(body.descZh ?? ""),
      uploadedPhotoUrls: Array.isArray(body.uploadedPhotoUrls)
        ? body.uploadedPhotoUrls.filter((url): url is string => typeof url === "string")
        : [],
      imageUrl: typeof body.imageUrl === "string" || body.imageUrl === null ? body.imageUrl : undefined,
      imageAltEn: typeof body.imageAltEn === "string" ? body.imageAltEn : null,
      imageAltZh: typeof body.imageAltZh === "string" ? body.imageAltZh : null,
      dietary,
      noteEn: typeof body.noteEn === "string" ? body.noteEn : null,
      noteZh: typeof body.noteZh === "string" ? body.noteZh : null,
      featured: Boolean(body.featured),
      isAvailable: body.isAvailable !== false,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
      variants,
    });

    revalidateMenuPages();
    const snapshot = await getAdminMenuSnapshot();
    return NextResponse.json({ ok: true, id, snapshot });
  } catch (error) {
    if (error instanceof MenuPhotoError) {
      return NextResponse.json({ error: error.userMessage }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Failed to save menu item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as {
      id?: string;
      isAvailable?: boolean;
      featured?: boolean;
    };
    if (!body.id) {
      return NextResponse.json({ error: "Missing dish id" }, { status: 400 });
    }

    await patchMenuItemFlags(body.id, {
      isAvailable: body.isAvailable,
      featured: body.featured,
    });
    revalidateMenuPages();
    const snapshot = await getAdminMenuSnapshot();
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update dish status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing dish id" }, { status: 400 });
  }

  try {
    await deleteMenuItem(id);
    revalidateMenuPages();
    const snapshot = await getAdminMenuSnapshot();
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    if (error instanceof MenuPhotoError) {
      return NextResponse.json({ error: error.userMessage }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Failed to delete dish";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
