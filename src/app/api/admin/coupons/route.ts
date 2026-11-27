import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import {
  listWelcomeCoupons,
  lookupCouponByCode,
  redeemCouponAtomic,
  unredeemCouponByCode,
  voidCouponByCode,
} from "@/lib/coupon-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim();

  if (code) {
    const coupon = await lookupCouponByCode(code);
    return NextResponse.json(
      { ok: Boolean(coupon), coupon },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const snapshot = await listWelcomeCoupons(200);
  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action?: unknown;
      code?: unknown;
    };

    const action = body.action;
    const code = typeof body.code === "string" ? body.code : "";
    const staff = session.identity || "admin";

    if (action === "redeem") {
      const result = await redeemCouponAtomic(code, staff);
      return NextResponse.json(result, {
        status: result.ok ? 200 : 409,
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (action === "unredeem") {
      const result = await unredeemCouponByCode(code, staff);
      return NextResponse.json(result, {
        status: result.ok ? 200 : 400,
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (action === "void") {
      const result = await voidCouponByCode(code, staff);
      return NextResponse.json(result, {
        status: result.ok ? 200 : 400,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.json(
      { ok: false, message: "无效的操作类型。" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "请求格式错误。" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}
