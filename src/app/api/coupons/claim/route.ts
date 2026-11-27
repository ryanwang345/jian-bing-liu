import { NextResponse } from "next/server";
import { claimWelcomeCoupon } from "@/lib/coupon-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      name?: unknown;
      marketingOptIn?: unknown;
      turnstileToken?: unknown;
    };

    const email = typeof body.email === "string" ? body.email : "";
    const name = typeof body.name === "string" ? body.name : "";
    const marketingOptIn = Boolean(body.marketingOptIn);
    const turnstileToken =
      typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;

    const result = await claimWelcomeCoupon({
      email,
      name,
      marketingOptIn,
      turnstileToken,
    });

    if (!result.ok) {
      const status =
        result.reason === "invalid_email" || result.reason === "turnstile_failed"
          ? 400
          : result.reason === "already_claimed"
            ? 409
            : result.reason === "disabled"
              ? 403
              : result.reason === "db_unavailable"
                ? 503
                : 500;

      return NextResponse.json(result, {
        status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        emailSent: result.emailSent,
        coupon: {
          couponCode: result.coupon.couponCode,
          customerName: result.coupon.customerName,
          offerTitleZh: result.coupon.offerTitleZh,
          offerTitleEn: result.coupon.offerTitleEn,
          discountLabelZh: result.coupon.discountLabelZh,
          discountLabelEn: result.coupon.discountLabelEn,
          maxUses: result.coupon.maxUses,
          usedCount: result.coupon.usedCount,
          remainingUses: result.coupon.remainingUses,
          expiresAt: result.coupon.expiresAt,
          effectiveStatus: result.coupon.effectiveStatus,
        },
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        reason: "invalid_request",
        messageZh: "请求格式错误，请重试。",
        messageEn: "Invalid request payload.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}
