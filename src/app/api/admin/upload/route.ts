import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { MenuPhotoError, storeMenuPhoto } from "@/lib/menu-photos";

export async function POST(request: Request) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择菜品照片。" }, { status: 400 });
    }
    const photo = await storeMenuPhoto(file);
    return NextResponse.json({ ok: true, ...photo });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof MenuPhotoError ? error.userMessage : "照片上传失败，请重试。" },
      { status: error instanceof MenuPhotoError ? error.status : 500 }
    );
  }
}
