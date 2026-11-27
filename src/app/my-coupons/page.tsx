import { cookies } from "next/headers";
import type { Metadata } from "next";
import { CustomerWalletClient } from "@/components/CustomerWalletClient";
import {
  DEVICE_COUPON_COOKIE_NAME,
  getCustomerWalletSnapshot,
  isEmailOtpConfigured,
  resolveWalletFromDeviceCookie,
} from "@/lib/coupon-service";
import { getCustomerWalletSession } from "@/lib/customer-wallet-auth";

export const metadata: Metadata = {
  title: "我的优惠券 · My Coupons",
  description:
    "登录查看并管理你在煎饼刘（Jian Bing Liu）领取的全部优惠券、实时核销状态与专属福利。",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MyCouponsPage() {
  const [session, cookieStore, emailOtpAvailable] = await Promise.all([
    getCustomerWalletSession(),
    cookies(),
    isEmailOtpConfigured(),
  ]);

  let initialWallet = session
    ? await getCustomerWalletSnapshot(session.normalizedEmail)
    : null;

  if (!initialWallet) {
    const deviceCode = cookieStore.get(DEVICE_COUPON_COOKIE_NAME)?.value;
    if (deviceCode) {
      initialWallet = await resolveWalletFromDeviceCookie(deviceCode);
    }
  }

  return (
    <CustomerWalletClient
      initialWallet={initialWallet}
      initialEmailOtpAvailable={emailOtpAvailable}
    />
  );
}
