import { NextResponse } from "next/server";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import {
  issueCustomerVoucherByAdmin,
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
  const recordScan = searchParams.get("scan") !== "0";
  const staff = session.identity || "admin";

  if (code) {
    const coupon = await lookupCouponByCode(
      code,
      recordScan ? { recordScanByStaff: staff } : undefined
    );
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
      email?: unknown;
      customerName?: unknown;
      campaignType?: unknown;
      offerTitleZh?: unknown;
      offerTitleEn?: unknown;
      discountLabelZh?: unknown;
      discountLabelEn?: unknown;
      validDays?: unknown;
      maxUses?: unknown;
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

    if (action === "issue") {
      const result = await issueCustomerVoucherByAdmin({
        email: typeof body.email === "string" ? body.email : "",
        customerName:
          typeof body.customerName === "string" ? body.customerName : "",
        campaignType:
          typeof body.campaignType === "string" ? body.campaignType : "vip",
        offerTitleZh:
          typeof body.offerTitleZh === "string" ? body.offerTitleZh : "",
        offerTitleEn:
          typeof body.offerTitleEn === "string" ? body.offerTitleEn : "",
        discountLabelZh:
          typeof body.discountLabelZh === "string" ? body.discountLabelZh : "",
        discountLabelEn:
          typeof body.discountLabelEn === "string" ? body.discountLabelEn : "",
        validDays: Number(body.validDays) || 30,
        maxUses: Number(body.maxUses) || 1,
        staffIdentity: staff,
      });
      return NextResponse.json(result, {
        status: result.ok ? 201 : 400,
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
