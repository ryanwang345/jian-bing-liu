import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  claimWelcomeCoupon,
  DEVICE_COUPON_COOKIE_NAME,
} from "@/lib/coupon-service";
import {
  createCustomerWalletToken,
  CUSTOMER_WALLET_COOKIE_NAME,
  CUSTOMER_WALLET_MAX_AGE_SEC,
} from "@/lib/customer-wallet-auth";

export const dynamic = "force-dynamic";

const DEVICE_COOKIE_MAX_AGE_SEC = 90 * 24 * 60 * 60; // 90 days

export async function POST(request: Request) {
  try {
    const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);

    // Basic same-origin check when Origin header is present
    const origin = headerStore.get("origin");
    const host =
      headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      headerStore.get("host")?.trim();
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            {
              ok: false,
              reason: "forbidden_origin",
              messageZh: "非法请求来源。",
              messageEn: "Cross-origin requests are not permitted.",
            },
            { status: 403, headers: { "Cache-Control": "no-store" } }
          );
        }
      } catch {
        return NextResponse.json(
          {
            ok: false,
            reason: "forbidden_origin",
            messageZh: "非法请求来源。",
            messageEn: "Invalid origin header.",
          },
          { status: 403, headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    const clientIp =
      headerStore.get("cf-connecting-ip")?.trim() ||
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;
    const deviceCouponCode =
      cookieStore.get(DEVICE_COUPON_COOKIE_NAME)?.value?.trim() || null;

    const body = (await request.json()) as {
      email?: unknown;
      name?: unknown;
      pin?: unknown;
      marketingOptIn?: unknown;
      turnstileToken?: unknown;
      website?: unknown;
    };

    const email = typeof body.email === "string" ? body.email : "";
    const name = typeof body.name === "string" ? body.name : "";
    const pin = typeof body.pin === "string" ? body.pin : undefined;
    const marketingOptIn = Boolean(body.marketingOptIn);
    const turnstileToken =
      typeof body.turnstileToken === "string" ? body.turnstileToken : undefined;
    const honeypot =
      typeof body.website === "string" ? body.website : undefined;

    const result = await claimWelcomeCoupon({
      email,
      name,
      pin,
      marketingOptIn,
      turnstileToken,
      honeypot,
      clientIp,
      deviceCouponCode,
    });

    if (!result.ok) {
      const status =
        result.reason === "invalid_email" ||
        result.reason === "invalid_pin" ||
        result.reason === "turnstile_failed"
          ? 400
          : result.reason === "rate_limited"
            ? 429
            : result.reason === "already_claimed" ||
                result.reason === "device_limit"
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

    const walletToken = await createCustomerWalletToken({
      email: result.coupon.email,
      normalizedEmail: result.coupon.normalizedEmail,
    });

    const response = NextResponse.json(
      {
        ok: true,
        emailSent: result.emailSent,
        restoredExisting: Boolean(result.restoredExisting),
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
        status: result.restoredExisting ? 200 : 201,
        headers: { "Cache-Control": "no-store" },
      }
    );

    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set(DEVICE_COUPON_COOKIE_NAME, result.coupon.couponCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: DEVICE_COOKIE_MAX_AGE_SEC,
    });

    // Automatically log customer into `/my-coupons` on the claiming device
    response.cookies.set(CUSTOMER_WALLET_COOKIE_NAME, walletToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: CUSTOMER_WALLET_MAX_AGE_SEC,
    });

    return response;
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
