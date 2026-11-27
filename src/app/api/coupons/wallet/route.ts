import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  DEVICE_COUPON_COOKIE_NAME,
  getCustomerWalletSnapshot,
  isEmailOtpConfigured,
  resolveWalletFromDeviceCookie,
  updateCustomerWalletProfile,
} from "@/lib/coupon-service";
import {
  createCustomerWalletToken,
  CUSTOMER_WALLET_COOKIE_NAME,
  CUSTOMER_WALLET_MAX_AGE_SEC,
  getCustomerWalletSession,
} from "@/lib/customer-wallet-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const [session, cookieStore, emailOtpAvailable] = await Promise.all([
    getCustomerWalletSession(),
    cookies(),
    isEmailOtpConfigured(),
  ]);

  if (session) {
    const wallet = await getCustomerWalletSnapshot(session.normalizedEmail);
    if (wallet) {
      return NextResponse.json(
        { ok: true, authenticated: true, emailOtpAvailable, wallet },
        { headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  // Seamless auto-upgrade if this browser holds a valid `jbl_coupon_device` cookie
  const deviceCode = cookieStore.get(DEVICE_COUPON_COOKIE_NAME)?.value;
  if (deviceCode) {
    const fallbackWallet = await resolveWalletFromDeviceCookie(deviceCode);
    if (fallbackWallet) {
      const token = await createCustomerWalletToken({
        email: fallbackWallet.email,
        normalizedEmail: fallbackWallet.normalizedEmail,
      });
      const response = NextResponse.json(
        {
          ok: true,
          authenticated: true,
          emailOtpAvailable,
          wallet: fallbackWallet,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
      response.cookies.set(CUSTOMER_WALLET_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: CUSTOMER_WALLET_MAX_AGE_SEC,
      });
      return response;
    }
  }

  return NextResponse.json(
    { ok: true, authenticated: false, emailOtpAvailable, wallet: null },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(request: Request) {
  const [session, cookieStore] = await Promise.all([
    getCustomerWalletSession(),
    cookies(),
  ]);

  let targetNormalizedEmail = session?.normalizedEmail ?? null;
  if (!targetNormalizedEmail) {
    const deviceCode = cookieStore.get(DEVICE_COUPON_COOKIE_NAME)?.value;
    if (deviceCode) {
      const fallback = await resolveWalletFromDeviceCookie(deviceCode);
      targetNormalizedEmail = fallback?.normalizedEmail ?? null;
    }
  }

  if (!targetNormalizedEmail) {
    return NextResponse.json(
      {
        ok: false,
        messageZh: "登录状态已失效，请重新登录。",
        messageEn: "Session expired. Please sign in again.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const body = (await request.json()) as {
      customerName?: unknown;
      marketingOptIn?: unknown;
      newPin?: unknown;
    };

    const result = await updateCustomerWalletProfile(targetNormalizedEmail, {
      customerName:
        typeof body.customerName === "string" ? body.customerName : undefined,
      marketingOptIn:
        typeof body.marketingOptIn === "boolean"
          ? body.marketingOptIn
          : undefined,
      newPin: typeof body.newPin === "string" ? body.newPin : undefined,
    });

    if (!result.ok) {
      return NextResponse.json(result, {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.json(
      { ok: true, wallet: result.wallet },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        messageZh: "请求格式错误。",
        messageEn: "Invalid request payload.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}
