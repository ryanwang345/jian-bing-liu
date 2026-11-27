import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  authenticateCustomerWallet,
  isEmailOtpConfigured,
  requestCustomerWalletOtp,
} from "@/lib/coupon-service";
import {
  createCustomerWalletToken,
  CUSTOMER_WALLET_COOKIE_NAME,
  CUSTOMER_WALLET_MAX_AGE_SEC,
} from "@/lib/customer-wallet-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const headerStore = await headers();
    const clientIp =
      headerStore.get("cf-connecting-ip")?.trim() ||
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;

    const body = (await request.json()) as {
      action?: unknown;
      email?: unknown;
      credential?: unknown;
      otpCode?: unknown;
    };

    const action = typeof body.action === "string" ? body.action : "login";
    const email = typeof body.email === "string" ? body.email : "";

    if (action === "send-otp") {
      const otpRes = await requestCustomerWalletOtp({ email, clientIp });
      return NextResponse.json(otpRes, {
        status: otpRes.ok ? 200 : 400,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const credential =
      typeof body.credential === "string" ? body.credential : undefined;
    const otpCode = typeof body.otpCode === "string" ? body.otpCode : undefined;

    const authResult = await authenticateCustomerWallet({
      email,
      credential,
      otpCode,
      clientIp,
    });

    if (!authResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          messageZh: authResult.messageZh,
          messageEn: authResult.messageEn,
        },
        {
          status: authResult.status,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const token = await createCustomerWalletToken({
      email: authResult.wallet.email,
      normalizedEmail: authResult.wallet.normalizedEmail,
    });

    const emailOtpAvailable = await isEmailOtpConfigured();
    const response = NextResponse.json(
      {
        ok: true,
        authenticated: true,
        emailOtpAvailable,
        wallet: authResult.wallet,
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
  } catch {
    return NextResponse.json(
      {
        ok: false,
        messageZh: "请求格式错误，请重试。",
        messageEn: "Invalid request payload.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );
  response.cookies.set(CUSTOMER_WALLET_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
