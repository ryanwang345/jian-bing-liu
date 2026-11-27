"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  History,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";
import {
  COUPON_LOCAL_STORAGE_KEY,
  useWelcomeCoupon,
} from "@/components/WelcomeCouponSection";
import type {
  CouponActivityLogRecord,
  CustomerWalletSnapshot,
  WelcomeCouponRecord,
} from "@/lib/coupon-service";
import { useLocale } from "@/lib/i18n";

interface CustomerWalletClientProps {
  initialWallet: CustomerWalletSnapshot | null;
  initialEmailOtpAvailable: boolean;
}

type WalletTab = "active" | "redeemed" | "expired" | "history" | "settings";

function getDaysRemaining(expiresAt: string): number {
  const iso = expiresAt.includes("T")
    ? expiresAt
    : `${expiresAt.replace(" ", "T")}Z`;
  const ms = Date.parse(iso) - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function formatDateTimeShort(raw: string | null | undefined): string {
  if (!raw) return "—";
  return raw.replace("T", " ").slice(0, 16);
}

export function CustomerWalletClient({
  initialWallet,
  initialEmailOtpAvailable,
}: CustomerWalletClientProps) {
  const { isZh, pick } = useLocale();
  const { store, welcomeCoupon } = useSiteContent();
  const { claimed: modalClaimedCoupon, openCouponModal } = useWelcomeCoupon();

  const [wallet, setWallet] = useState<CustomerWalletSnapshot | null>(
    initialWallet
  );
  const [emailOtpAvailable, setEmailOtpAvailable] = useState(
    initialEmailOtpAvailable
  );
  const [activeTab, setActiveTab] = useState<WalletTab>("active");
  const [selectedCode, setSelectedCode] = useState<string | null>(
    initialWallet?.coupons.find((c) => c.effectiveStatus === "active")
      ?.couponCode ??
      initialWallet?.coupons[0]?.couponCode ??
      null
  );

  // Login form states
  const [loginMode, setLoginMode] = useState<"credential" | "otp">(
    "credential"
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCredential, setLoginCredential] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Live QR & clock states
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [liveClock, setLiveClock] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liveRedeemedBanner, setLiveRedeemedBanner] =
    useState<WelcomeCouponRecord | null>(null);

  // Quick PIN & profile settings states
  const [quickPin, setQuickPin] = useState("");
  const [savingQuickPin, setSavingQuickPin] = useState(false);
  const [profileName, setProfileName] = useState(
    initialWallet?.customerName ?? ""
  );
  const [profileOptIn, setProfileOptIn] = useState(
    initialWallet?.marketingOptIn ?? false
  );
  const [profileNewPin, setProfileNewPin] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const prevActiveCodesRef = useRef<Set<string>>(
    new Set(
      (initialWallet?.coupons ?? [])
        .filter((c) => c.effectiveStatus === "active")
        .map((c) => c.couponCode)
    )
  );

  const applyWalletUpdate = useCallback((next: CustomerWalletSnapshot) => {
    // Detect real-time counter redemption so customer's screen celebrates immediately!
    const newlyRedeemed = next.coupons.find(
      (c) =>
        c.effectiveStatus === "redeemed" &&
        prevActiveCodesRef.current.has(c.couponCode)
    );
    if (newlyRedeemed) {
      setLiveRedeemedBanner(newlyRedeemed);
    }

    prevActiveCodesRef.current = new Set(
      next.coupons
        .filter((c) => c.effectiveStatus === "active")
        .map((c) => c.couponCode)
    );

    setWallet(next);
    setProfileName(next.customerName);
    setProfileOptIn(next.marketingOptIn);

    setSelectedCode((prev) => {
      if (prev && next.coupons.some((c) => c.couponCode === prev)) {
        return prev;
      }
      return (
        next.coupons.find((c) => c.effectiveStatus === "active")?.couponCode ??
        next.coupons[0]?.couponCode ??
        null
      );
    });

    // Keep browser localStorage coupon badge in sync
    try {
      const primary =
        next.coupons.find((c) => c.effectiveStatus === "active") ??
        next.coupons[0];
      if (primary) {
        window.localStorage.setItem(
          COUPON_LOCAL_STORAGE_KEY,
          JSON.stringify({
            couponCode: primary.couponCode,
            customerName: primary.customerName,
            offerTitleZh: primary.offerTitleZh,
            offerTitleEn: primary.offerTitleEn,
            discountLabelZh: primary.discountLabelZh,
            discountLabelEn: primary.discountLabelEn,
            maxUses: primary.maxUses,
            usedCount: primary.usedCount,
            remainingUses: primary.remainingUses,
            expiresAt: primary.expiresAt,
            effectiveStatus: primary.effectiveStatus,
          })
        );
      }
    } catch {
      // Ignore storage restrictions
    }
  }, []);

  const refreshWallet = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setRefreshing(true);
      try {
        const res = await fetch("/api/coupons/wallet", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          authenticated?: boolean;
          emailOtpAvailable?: boolean;
          wallet?: CustomerWalletSnapshot | null;
        };
        if (typeof data.emailOtpAvailable === "boolean") {
          setEmailOtpAvailable(data.emailOtpAvailable);
        }
        if (data.authenticated && data.wallet) {
          applyWalletUpdate(data.wallet);
        }
      } catch {
        // Ignore background network hiccups
      } finally {
        if (showSpinner) setRefreshing(false);
      }
    },
    [applyWalletUpdate]
  );

  // If visitor claims a welcome coupon via the modal while on `/my-coupons`, auto-load wallet!
  useEffect(() => {
    if (!wallet && modalClaimedCoupon?.couponCode) {
      void refreshWallet(true);
    }
  }, [wallet, modalClaimedCoupon?.couponCode, refreshWallet]);

  // Pre-fill login credential from localStorage if available on same browser
  useEffect(() => {
    if (wallet) return;
    try {
      const saved = window.localStorage.getItem(COUPON_LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { couponCode?: string };
        if (parsed?.couponCode && !loginCredential) {
          setLoginCredential(parsed.couponCode);
        }
      }
    } catch {
      // Ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  // Automatic 8-second live status polling while logged in so counter scans reflect live!
  useEffect(() => {
    if (!wallet) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshWallet(false);
      }
    }, 8000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshWallet(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [wallet, refreshWallet]);

  const activeCoupons = useMemo(
    () =>
      (wallet?.coupons ?? []).filter((c) => c.effectiveStatus === "active"),
    [wallet?.coupons]
  );
  const redeemedCoupons = useMemo(
    () =>
      (wallet?.coupons ?? []).filter((c) => c.effectiveStatus === "redeemed"),
    [wallet?.coupons]
  );
  const expiredCoupons = useMemo(
    () =>
      (wallet?.coupons ?? []).filter(
        (c) => c.effectiveStatus === "expired" || c.effectiveStatus === "void"
      ),
    [wallet?.coupons]
  );

  const focusedActiveCoupon = useMemo(() => {
    if (!activeCoupons.length) return null;
    return (
      activeCoupons.find((c) => c.couponCode === selectedCode) ??
      activeCoupons[0]
    );
  }, [activeCoupons, selectedCode]);

  // Generate QR code for currently focused active voucher
  useEffect(() => {
    if (!focusedActiveCoupon?.couponCode) {
      setQrDataUrl(null);
      return;
    }
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://jianbingliu.uk";
    const redeemUrl = `${origin}/admin/coupons?code=${encodeURIComponent(focusedActiveCoupon.couponCode)}`;

    let cancelled = false;
    void QRCode.toDataURL(redeemUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#1c1816", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [focusedActiveCoupon?.couponCode]);

  // Live London clock for active counter voucher
  useEffect(() => {
    if (!focusedActiveCoupon) return;
    const tick = () => {
      try {
        setLiveClock(
          new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(new Date())
        );
      } catch {
        setLiveClock(new Date().toTimeString().slice(0, 8));
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [focusedActiveCoupon]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setOtpSentNotice(null);

    try {
      const res = await fetch("/api/coupons/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: loginEmail.trim(),
          credential:
            loginMode === "credential" ? loginCredential.trim() : undefined,
          otpCode: loginMode === "otp" ? loginOtp.trim() : undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        wallet?: CustomerWalletSnapshot;
        messageZh?: string;
        messageEn?: string;
      };

      if (!res.ok || !data.ok || !data.wallet) {
        setAuthError(
          isZh
            ? data.messageZh || "登录失败，请检查邮箱与密码/券码。"
            : data.messageEn || "Sign-in failed. Please check your details."
        );
        return;
      }

      applyWalletUpdate(data.wallet);
      setActiveTab(
        data.wallet.coupons.some((c) => c.effectiveStatus === "active")
          ? "active"
          : "redeemed"
      );
    } catch {
      setAuthError(
        pick("网络异常，请稍后重试。", "Network error. Please try again.")
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!loginEmail.trim()) {
      setAuthError(
        pick("请先输入你的领券电子邮箱。", "Please enter your email first.")
      );
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setOtpSentNotice(null);
    try {
      const res = await fetch("/api/coupons/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-otp",
          email: loginEmail.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        messageZh?: string;
        messageEn?: string;
      };
      if (!res.ok || !data.ok) {
        setAuthError(
          isZh
            ? data.messageZh || "发送失败，请改用密码或券码登录。"
            : data.messageEn || "Unable to send code."
        );
        return;
      }
      setOtpSentNotice(
        isZh
          ? data.messageZh || "验证码已发送！"
          : data.messageEn || "Verification code sent!"
      );
    } catch {
      setAuthError(
        pick("发送失败，请稍后重试。", "Failed to send verification code.")
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/coupons/auth", { method: "DELETE" });
    } catch {
      // Ignore
    }
    setWallet(null);
    setLiveRedeemedBanner(null);
  };

  const handleSaveQuickPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(quickPin.trim())) {
      setSettingsMsg({
        type: "error",
        text: pick(
          "请输入 4 至 8 位纯数字作为取券密码（如手机尾号后 4 位）。",
          "Please enter 4–8 digits for your PIN."
        ),
      });
      return;
    }
    setSavingQuickPin(true);
    setSettingsMsg(null);
    try {
      const res = await fetch("/api/coupons/wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPin: quickPin.trim() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        wallet?: CustomerWalletSnapshot;
        messageZh?: string;
        messageEn?: string;
      };
      if (!res.ok || !data.ok || !data.wallet) {
        setSettingsMsg({
          type: "error",
          text: isZh
            ? data.messageZh || "保存失败"
            : data.messageEn || "Could not save PIN",
        });
        return;
      }
      applyWalletUpdate(data.wallet);
      setQuickPin("");
      setSettingsMsg({
        type: "success",
        text: pick(
          "✅ 数字取券密码已保存！以后在任何手机输入邮箱 + 此密码即可登录找回全部优惠券。",
          "✅ PIN saved! You can now sign in from any phone using your email + PIN."
        ),
      });
    } catch {
      setSettingsMsg({
        type: "error",
        text: pick("网络错误，请稍后重试。", "Network error."),
      });
    } finally {
      setSavingQuickPin(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSettingsMsg(null);
    try {
      const res = await fetch("/api/coupons/wallet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: profileName.trim(),
          marketingOptIn: profileOptIn,
          newPin: profileNewPin.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        wallet?: CustomerWalletSnapshot;
        messageZh?: string;
        messageEn?: string;
      };
      if (!res.ok || !data.ok || !data.wallet) {
        setSettingsMsg({
          type: "error",
          text: isZh
            ? data.messageZh || "保存失败"
            : data.messageEn || "Could not save settings",
        });
        return;
      }
      applyWalletUpdate(data.wallet);
      setProfileNewPin("");
      setSettingsMsg({
        type: "success",
        text: pick(
          "✅ 个人账户与密码设置已更新！",
          "✅ Your wallet settings have been updated!"
        ),
      });
    } catch {
      setSettingsMsg({
        type: "error",
        text: pick("保存失败，请重试。", "Failed to save settings."),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Ignore
    }
  };

  const handleDownloadVoucherPng = (coupon: WelcomeCouponRecord) => {
    if (!qrDataUrl) return;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#fbf6ec";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#b8251c";
    ctx.fillRect(0, 0, canvas.width, 210);

    ctx.fillStyle = "#f0c26e";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("JIAN BING LIU 煎饼刘 · 124 CAMDEN RD", 360, 68);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText(
      `${coupon.discountLabelZh} / ${coupon.discountLabelEn}`,
      360,
      130
    );

    ctx.fillStyle = "#fde8c8";
    ctx.font = "22px sans-serif";
    ctx.fillText(
      "Walk-in Counter Orders £10+ Only · 限到店柜台点餐满 £10 使用",
      360,
      176
    );

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#d9c39e";
    ctx.lineWidth = 3;
    ctx.fillRect(110, 260, 500, 520);
    ctx.strokeRect(110, 260, 500, 520);

    const qrImg = new window.Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 200, 295, 320, 320);

      ctx.fillStyle = "#1a1614";
      ctx.font = "bold 46px monospace";
      ctx.fillText(coupon.couponCode, 360, 675);

      ctx.fillStyle = "#594f47";
      ctx.font = "22px sans-serif";
      ctx.fillText(
        `Valid until / 有效期至: ${coupon.expiresAt.slice(0, 10)}`,
        360,
        732
      );

      ctx.fillStyle = "#8a1c14";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("付款前出示由店员扫码核销 · jianbingliu.uk/my-coupons", 360, 845);
      ctx.fillStyle = "#6e6258";
      ctx.font = "18px sans-serif";
      ctx.fillText("124 Camden Rd, London NW1 9EE", 360, 885);

      const link = document.createElement("a");
      link.download = `JianBingLiu-${coupon.couponCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  /* ─────────────────────────── Logged-Out View ─────────────────────────── */
  if (!wallet) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="overflow-hidden rounded-[28px] border border-[#e6d2ae] bg-white shadow-[0_20px_60px_-15px_rgba(26,22,20,0.14)]">
          <div className="bg-gradient-to-br from-[#8f1414] via-[#b8251c] to-[#991b14] px-6 py-7 text-parchment sm:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0c26e]/45 bg-black/20 px-3 py-1 text-xs font-bold text-[#f0c26e]">
              <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
              {pick("煎饼刘 · 顾客专属卡包", "Jian Bing Liu · Coupon Wallet")}
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
              {pick("登录管理我的优惠券", "Sign In to My Coupons")}
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-parchment/90 sm:text-sm">
              {pick(
                "随时查看你的优惠券「未使用 / 已使用过 / 已过期」实时状态，到店出示动态二维码秒速核销。",
                "Check live status (Unused, Used, or Expired) across all your vouchers and show your live QR code at the counter."
              )}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {emailOtpAvailable && (
              <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-kraft/70 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("credential");
                    setAuthError(null);
                  }}
                  className={`rounded-xl py-2.5 transition-colors ${
                    loginMode === "credential"
                      ? "bg-white text-cinnabar shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {pick("密码 / 券码登录", "PIN or Voucher Code")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("otp");
                    setAuthError(null);
                  }}
                  className={`rounded-xl py-2.5 transition-colors ${
                    loginMode === "otp"
                      ? "bg-white text-cinnabar shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {pick("邮箱验证码登录", "Email One-Time Code")}
                </button>
              </div>
            )}

            <form onSubmit={(e) => void handleLoginSubmit(e)} className="space-y-4">
              <div>
                <label
                  htmlFor="wallet-login-email"
                  className="block text-xs font-bold text-ink"
                >
                  {pick("领券时登记的电子邮箱", "Your registered email")}
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-soft"
                    aria-hidden="true"
                  />
                  <input
                    id="wallet-login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-kraft-deep bg-parchment/45 py-3 pr-3.5 pl-10 text-sm text-ink outline-none transition-colors focus:border-cinnabar focus:bg-white"
                  />
                </div>
              </div>

              {loginMode === "credential" ? (
                <div>
                  <label
                    htmlFor="wallet-login-cred"
                    className="block text-xs font-bold text-ink"
                  >
                    {pick(
                      "数字取券密码（4-8位）或 任意一张优惠券码",
                      "4–8 Digit PIN or Any Voucher Code"
                    )}
                  </label>
                  <div className="relative mt-1.5">
                    <KeyRound
                      className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-soft"
                      aria-hidden="true"
                    />
                    <input
                      id="wallet-login-cred"
                      type="text"
                      required
                      value={loginCredential}
                      onChange={(e) => setLoginCredential(e.target.value)}
                      placeholder={pick(
                        "例如：8866 或 7K3M2A / JBL-7K3M2A",
                        "e.g. 8866 or JBL-7K3M2A"
                      )}
                      className="w-full rounded-xl border border-kraft-deep bg-parchment/45 py-3 pr-3.5 pl-10 font-mono text-sm text-ink outline-none transition-colors focus:border-cinnabar focus:bg-white"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
                    {pick(
                      "💡 小贴士：如果你之前没设过数字密码，直接输入相册截图或邮件里的 6 位优惠券码（如 7K3M2A）即可登录！",
                      "Tip: If you haven't set a numeric PIN yet, enter your 6-character voucher code (e.g. 7K3M2A) from your saved screenshot."
                    )}
                  </p>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="wallet-login-otp"
                    className="block text-xs font-bold text-ink"
                  >
                    {pick("6 位邮箱验证码", "6-Digit Email Code")}
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      id="wallet-login-otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="123456"
                      className="flex-1 rounded-xl border border-kraft-deep bg-parchment/45 px-3.5 py-3 font-mono text-sm tracking-widest text-ink outline-none focus:border-cinnabar focus:bg-white"
                    />
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => void handleSendOtp()}
                      className="shrink-0 rounded-xl border border-cinnabar/40 bg-[#fff5e4] px-4 py-3 text-xs font-extrabold text-cinnabar-dark hover:bg-cinnabar hover:text-white disabled:opacity-50"
                    >
                      {pick("获取验证码", "Send Code")}
                    </button>
                  </div>
                  {otpSentNotice && (
                    <p className="mt-1.5 text-xs font-semibold text-jade">
                      {otpSentNotice}
                    </p>
                  )}
                </div>
              )}

              {authError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-cinnabar/30 bg-cinnabar/10 p-3 text-xs font-medium text-cinnabar-dark"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-cinnabar px-6 py-3.5 text-sm font-bold text-parchment shadow-[0_10px_24px_-6px_rgba(184,37,28,0.45)] transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark disabled:opacity-55"
              >
                {authLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                <span>
                  {pick("立即登录我的优惠券卡包", "Sign In to Coupon Wallet")}
                </span>
              </button>
            </form>

            {welcomeCoupon.enabled && (
              <div className="mt-6 rounded-2xl border border-dashed border-cinnabar/35 bg-[#fbf6ec] p-4 text-center">
                <p className="text-xs font-bold text-ink">
                  {pick(
                    "首次光临煎饼刘？还没领过新客立减券？",
                    "First time visiting Jian Bing Liu?"
                  )}
                </p>
                <button
                  type="button"
                  onClick={openCouponModal}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#f0c26e] px-5 py-2.5 text-xs font-extrabold text-[#1a1614] shadow-xs transition-transform hover:scale-[1.02]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {pick(
                    "免费领取新客满 £10 减 £2 优惠券",
                    "Claim £2 Welcome Voucher Free"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────── Logged-In Wallet View ─────────────────────────── */
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Real-time Counter Redemption Celebration Alert */}
      {liveRedeemedBanner && (
        <div
          role="status"
          className="mb-6 rounded-2xl border-2 border-jade bg-[#ecfdf3] p-5 text-[#0f5132] shadow-md"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-jade" />
            <div>
              <p className="text-lg font-extrabold">
                {pick(
                  `🎉 门店核销成功！已为你立减（${liveRedeemedBanner.discountLabelZh}）`,
                  `🎉 Redeemed In-Store! (${liveRedeemedBanner.discountLabelEn})`
                )}
              </p>
              <p className="mt-1 text-xs font-medium sm:text-sm">
                {pick(
                  `券码 ${liveRedeemedBanner.couponCode} 已自动登记为「已使用过」，感谢光临伦敦卡姆登煎饼刘，祝用餐愉快！`,
                  `Voucher ${liveRedeemedBanner.couponCode} has been marked as Used. Enjoy your meal at Jian Bing Liu!`
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Account Summary Card */}
      <div className="overflow-hidden rounded-[26px] border border-kraft-deep bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 bg-gradient-to-r from-[#8f1414] via-[#b8251c] to-[#991b14] p-5 text-parchment sm:flex-row sm:items-center sm:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-bold text-[#f0c26e]">
                <Ticket className="h-3 w-3" />
                {pick("我的优惠券卡包", "My Coupon Wallet")}
              </span>
              <span className="text-xs text-parchment/85">{wallet.email}</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {wallet.customerName
                ? pick(
                    `你好，${wallet.customerName}！`,
                    `Welcome back, ${wallet.customerName}!`
                  )
                : pick("我的专属优惠福利", "Your Vouchers & Rewards")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshWallet(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-black/35"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              {pick("同步最新状态", "Refresh")}
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-parchment/90 transition-colors hover:bg-black/30 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              {pick("退出", "Sign Out")}
            </button>
          </div>
        </div>

        {/* 3 Clear Status Counters */}
        <div className="grid grid-cols-3 divide-x divide-kraft-deep/70 border-b border-kraft-deep/70 bg-parchment/45 text-center">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`py-3.5 transition-colors hover:bg-kraft/40 ${
              activeTab === "active" ? "bg-white font-bold" : ""
            }`}
          >
            <p className="text-[11px] font-semibold text-ink-soft sm:text-xs">
              {pick("🟢 未使用过", "🟢 Unused")}
            </p>
            <p className="mt-0.5 text-xl font-extrabold tabular-nums text-jade sm:text-2xl">
              {activeCoupons.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("redeemed")}
            className={`py-3.5 transition-colors hover:bg-kraft/40 ${
              activeTab === "redeemed" ? "bg-white font-bold" : ""
            }`}
          >
            <p className="text-[11px] font-semibold text-ink-soft sm:text-xs">
              {pick("⚪ 已使用过", "⚪ Used")}
            </p>
            <p className="mt-0.5 text-xl font-extrabold tabular-nums text-ink sm:text-2xl">
              {redeemedCoupons.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expired")}
            className={`py-3.5 transition-colors hover:bg-kraft/40 ${
              activeTab === "expired" ? "bg-white font-bold" : ""
            }`}
          >
            <p className="text-[11px] font-semibold text-ink-soft sm:text-xs">
              {pick("🟠 已过期/失效", "🟠 Expired")}
            </p>
            <p className="mt-0.5 text-xl font-extrabold tabular-nums text-[#8a5000] sm:text-2xl">
              {expiredCoupons.length}
            </p>
          </button>
        </div>

        {/* Gentle 1-Step PIN Setup Banner if customer hasn't set a PIN yet */}
        {!wallet.hasPin && (
          <form
            onSubmit={(e) => void handleSaveQuickPin(e)}
            className="flex flex-col gap-3 border-b border-kraft-deep/70 bg-[#fff9eb] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2 text-xs text-[#78350f]">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#d97706]" />
              <span>
                {pick(
                  "设置一个 4 位数字取券密码（如手机尾号后 4 位），以后换手机也能随时登录管理：",
                  "Set a 4-digit PIN (e.g. last 4 digits of phone) so you can sign in easily on any device:"
                )}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={quickPin}
                onChange={(e) =>
                  setQuickPin(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder={pick("4-8位数字", "4–8 digits")}
                className="w-28 rounded-lg border border-[#fcd34d] bg-white px-3 py-1.5 font-mono text-xs font-bold text-ink outline-none focus:border-cinnabar"
              />
              <button
                type="submit"
                disabled={savingQuickPin}
                className="rounded-lg bg-ink px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cinnabar disabled:opacity-50"
              >
                {savingQuickPin
                  ? pick("保存中...", "Saving...")
                  : pick("保存密码", "Save PIN")}
              </button>
            </div>
          </form>
        )}

        {/* Navigation Sub-tabs */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-3 sm:px-6">
          {(
            [
              {
                id: "active",
                label: pick(
                  `未使用 (${activeCoupons.length})`,
                  `Unused (${activeCoupons.length})`
                ),
                icon: Ticket,
              },
              {
                id: "redeemed",
                label: pick(
                  `已使用过 (${redeemedCoupons.length})`,
                  `Used (${redeemedCoupons.length})`
                ),
                icon: CheckCircle2,
              },
              {
                id: "expired",
                label: pick(
                  `已过期 (${expiredCoupons.length})`,
                  `Expired (${expiredCoupons.length})`
                ),
                icon: Clock,
              },
              {
                id: "history",
                label: pick("核销记录", "Activity Log"),
                icon: History,
              },
              {
                id: "settings",
                label: pick("账户与密码", "Settings & PIN"),
                icon: Settings,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSettingsMsg(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  selected
                    ? "bg-cinnabar text-parchment shadow-2xs"
                    : "bg-kraft/60 text-ink-soft hover:bg-kraft hover:text-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {settingsMsg && (
        <div
          role="status"
          className={`mt-4 rounded-xl border px-4 py-3 text-xs font-semibold sm:text-sm ${
            settingsMsg.type === "success"
              ? "border-jade/40 bg-[#ecfdf3] text-[#135e18]"
              : "border-cinnabar/35 bg-cinnabar/10 text-cinnabar-dark"
          }`}
        >
          {settingsMsg.text}
        </div>
      )}

      {/* ── Tab 1: Active / Unused Vouchers ── */}
      {activeTab === "active" && (
        <div className="mt-6 space-y-5">
          {activeCoupons.length === 0 ? (
            <div className="rounded-2xl border border-kraft-deep bg-white p-8 text-center">
              <p className="text-base font-bold text-ink">
                {pick(
                  "当前没有「未使用」的优惠券",
                  "You have no unused coupons right now"
                )}
              </p>
              <p className="mt-1 text-xs text-ink-soft sm:text-sm">
                {redeemedCoupons.length > 0
                  ? pick(
                      "你之前的优惠券已到店核销使用，可在「已使用过」标签查看详情。我们会在节日上新时向老客派发专属福利券！",
                      "Your previous voucher has been used in-store. Check the Used tab for details!"
                    )
                  : pick(
                      "留意门店节日活动，我们将不定期为你派发专属优惠券。",
                      "Stay tuned for seasonal Camden specials and reward vouchers!"
                    )}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 rounded-full bg-cinnabar px-5 py-2.5 text-xs font-bold text-parchment hover:bg-cinnabar-dark"
                >
                  {pick("浏览招牌菜单", "Browse Menu")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left: Voucher selector list (when customer holds 1 or more active vouchers) */}
              <div className="space-y-3 lg:col-span-5">
                <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">
                  {pick(
                    `可用优惠券列表（共 ${activeCoupons.length} 张）`,
                    `Available Vouchers (${activeCoupons.length})`
                  )}
                </p>
                {activeCoupons.map((coupon) => {
                  const isFocused =
                    focusedActiveCoupon?.couponCode === coupon.couponCode;
                  const daysLeft = getDaysRemaining(coupon.expiresAt);
                  return (
                    <button
                      key={coupon.id}
                      type="button"
                      onClick={() => setSelectedCode(coupon.couponCode)}
                      className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                        isFocused
                          ? "border-cinnabar bg-[#fff8ed] shadow-sm"
                          : "border-kraft-deep bg-white hover:border-cinnabar/45"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#d1f7c4] px-2.5 py-0.5 text-[11px] font-extrabold text-[#135e18]">
                          <CheckCircle2 className="h-3 w-3" />
                          {pick("未使用过 · 可用", "UNUSED · READY")}
                        </span>
                        <span className="rounded-full bg-cinnabar/10 px-2.5 py-0.5 text-[11px] font-bold text-cinnabar-dark">
                          {daysLeft <= 1
                            ? pick("即将到期", "Expires soon")
                            : pick(`剩 ${daysLeft} 天`, `${daysLeft}d left`)}
                        </span>
                      </div>
                      <p className="mt-2 font-display text-lg font-extrabold text-cinnabar">
                        {isZh ? coupon.discountLabelZh : coupon.discountLabelEn}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-ink">
                        {isZh ? coupon.offerTitleZh : coupon.offerTitleEn}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-kraft-deep pt-2 text-[11px] text-ink-soft">
                        <span className="font-mono font-bold text-ink">
                          {coupon.couponCode}
                        </span>
                        <span>
                          {pick(
                            `有效期至 ${coupon.expiresAt.slice(0, 10)}`,
                            `Until ${coupon.expiresAt.slice(0, 10)}`
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right: Live Counter QR Pass */}
              {focusedActiveCoupon && (
                <div className="lg:col-span-7">
                  <div className="overflow-hidden rounded-[26px] border-2 border-cinnabar/40 bg-white p-5 text-center shadow-md sm:p-7">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d1f7c4] px-3 py-1 text-xs font-extrabold text-[#135e18]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {pick("未使用过 · 到店出示核销", "UNUSED · SHOW AT COUNTER")}
                      </span>
                      {liveClock && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/35 bg-parchment px-3 py-1 font-mono text-xs font-bold tabular-nums text-ink">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-jade" />
                          {pick(`实时凭证 ${liveClock}`, `LIVE ${liveClock}`)}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 font-display text-2xl font-extrabold text-cinnabar sm:text-3xl">
                      {isZh
                        ? focusedActiveCoupon.discountLabelZh
                        : focusedActiveCoupon.discountLabelEn}
                    </h2>
                    <p className="mt-1 text-xs font-medium text-ink-soft sm:text-sm">
                      {isZh
                        ? focusedActiveCoupon.offerTitleZh
                        : focusedActiveCoupon.offerTitleEn}
                    </p>

                    {qrDataUrl && (
                      <div className="mx-auto mt-4 w-fit rounded-2xl border-2 border-dashed border-cinnabar/35 bg-white p-3 shadow-2xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrDataUrl}
                          alt={`QR code for ${focusedActiveCoupon.couponCode}`}
                          width={210}
                          height={210}
                          className="h-48 w-48 sm:h-52 sm:w-52"
                        />
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span className="font-mono text-2xl font-extrabold tracking-[0.14em] text-ink sm:text-3xl">
                        {focusedActiveCoupon.couponCode}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopyCode(focusedActiveCoupon.couponCode)
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-kraft-deep px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-kraft"
                      >
                        {copiedCode === focusedActiveCoupon.couponCode ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-jade" />
                            {pick("已复制", "Copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            {pick("复制", "Copy")}
                          </>
                        )}
                      </button>
                    </div>

                    <p className="mt-2 text-xs font-medium text-ink-soft">
                      {pick(
                        `有效期至 ${focusedActiveCoupon.expiresAt.slice(0, 10)} · 剩余可用 ${focusedActiveCoupon.remainingUses}/${focusedActiveCoupon.maxUses} 次`,
                        `Valid until ${focusedActiveCoupon.expiresAt.slice(0, 10)} · ${focusedActiveCoupon.remainingUses}/${focusedActiveCoupon.maxUses} uses left`
                      )}
                    </p>

                    <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadVoucherPng(focusedActiveCoupon)
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-cinnabar/35 bg-[#fff5e4] px-4 py-2.5 text-xs font-extrabold text-cinnabar-dark transition-colors hover:bg-cinnabar hover:text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {pick("保存卡片到手机相册", "Save Image to Photos")}
                      </button>

                      <a
                        href={store.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-parchment transition-colors hover:bg-cinnabar"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {pick("到店导航 (124 Camden Rd)", "Directions to Store")}
                      </a>
                    </div>

                    <p className="mt-4 flex items-start justify-center gap-1.5 text-left text-[11px] leading-relaxed text-ink-soft">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cinnabar" />
                      <span>
                        {pick(
                          "到店柜台点餐付款前出示此二维码，店员扫码后本页将实时自动变更为「已使用过」（限柜台单笔满 £10 使用，不与外卖平台同享）。",
                          "Show this QR code before paying at our Camden Road counter. Status updates automatically once scanned (walk-in £10+ orders only)."
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Redeemed / Used Vouchers ── */}
      {activeTab === "redeemed" && (
        <div className="mt-6 space-y-3">
          {redeemedCoupons.length === 0 ? (
            <div className="rounded-2xl border border-kraft-deep bg-white p-8 text-center text-sm text-ink-soft">
              {pick("暂无已使用过的优惠券记录。", "No used vouchers yet.")}
            </div>
          ) : (
            redeemedCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-kraft-deep bg-white/85 p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e5e7eb] px-2.5 py-0.5 text-xs font-extrabold text-[#374151]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {pick("已使用过", "USED")}
                    </span>
                    <span className="font-mono text-sm font-bold text-ink-soft line-through">
                      {coupon.couponCode}
                    </span>
                  </div>
                  <p className="mt-1.5 text-base font-bold text-ink">
                    {isZh ? coupon.discountLabelZh : coupon.discountLabelEn} ·{" "}
                    {isZh ? coupon.offerTitleZh : coupon.offerTitleEn}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {pick(
                      `到店核销时间：${formatDateTimeShort(coupon.redeemedAt)}（已使用 ${coupon.usedCount}/${coupon.maxUses} 次）`,
                      `Redeemed at: ${formatDateTimeShort(coupon.redeemedAt)} (${coupon.usedCount}/${coupon.maxUses} used)`
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab 3: Expired / Void Vouchers ── */}
      {activeTab === "expired" && (
        <div className="mt-6 space-y-3">
          {expiredCoupons.length === 0 ? (
            <div className="rounded-2xl border border-kraft-deep bg-white p-8 text-center text-sm text-ink-soft">
              {pick("没有已过期或失效的优惠券。", "No expired vouchers.")}
            </div>
          ) : (
            expiredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-kraft-deep bg-white/75 p-5 opacity-85 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ffebc4] px-2.5 py-0.5 text-xs font-extrabold text-[#8a5000]">
                      <XCircle className="h-3.5 w-3.5" />
                      {coupon.effectiveStatus === "expired"
                        ? pick("已过期", "EXPIRED")
                        : pick("已作废", "VOID")}
                    </span>
                    <span className="font-mono text-sm font-bold text-ink-soft line-through">
                      {coupon.couponCode}
                    </span>
                  </div>
                  <p className="mt-1.5 text-base font-bold text-ink">
                    {isZh ? coupon.discountLabelZh : coupon.discountLabelEn} ·{" "}
                    {isZh ? coupon.offerTitleZh : coupon.offerTitleEn}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {pick(
                      `到期日：${coupon.expiresAt.slice(0, 10)}`,
                      `Expired on: ${coupon.expiresAt.slice(0, 10)}`
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab 4: Automatic Activity Timeline ── */}
      {activeTab === "history" && (
        <div className="mt-6 rounded-2xl border border-kraft-deep bg-white p-5 sm:p-6">
          <h2 className="text-sm font-bold text-ink sm:text-base">
            {pick("优惠券自动流转记录", "Automatic Voucher Activity History")}
          </h2>
          {wallet.activities.length === 0 ? (
            <p className="mt-3 text-xs text-ink-soft">
              {pick("暂无流水记录。", "No activity recorded yet.")}
            </p>
          ) : (
            <div className="mt-4 divide-y divide-kraft-deep/60">
              {wallet.activities.map((act: CouponActivityLogRecord) => (
                <div
                  key={act.id}
                  className="flex flex-col justify-between gap-1 py-3 text-xs sm:flex-row sm:items-center"
                >
                  <div>
                    <span className="mr-2 font-mono font-bold text-cinnabar">
                      {act.couponCode}
                    </span>
                    <span className="font-medium text-ink">{act.detail}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-ink-soft">
                    {formatDateTimeShort(act.createdAt)} UTC
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 5: Account & PIN Settings ── */}
      {activeTab === "settings" && (
        <form
          onSubmit={(e) => void handleSaveProfile(e)}
          className="mt-6 space-y-4 rounded-2xl border border-kraft-deep bg-white p-5 sm:p-7"
        >
          <h2 className="text-base font-bold text-ink">
            {pick("个人卡包与登录密码设置", "Wallet Profile & PIN Settings")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-ink">
                {pick("绑定邮箱（不可修改）", "Bound Email")}
              </label>
              <input
                type="text"
                disabled
                value={wallet.email}
                className="mt-1 w-full rounded-xl border border-kraft-deep bg-kraft/40 px-3.5 py-2.5 text-sm text-ink-soft"
              />
            </div>

            <div>
              <label
                htmlFor="wallet-profile-name"
                className="block text-xs font-bold text-ink"
              >
                {pick("你的称呼", "Your Name")}
              </label>
              <input
                id="wallet-profile-name"
                type="text"
                maxLength={80}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder={pick("例如：Alex / 小陈", "e.g. Alex")}
                className="mt-1 w-full rounded-xl border border-kraft-deep bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-cinnabar"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="wallet-profile-pin"
              className="block text-xs font-bold text-ink"
            >
              {wallet.hasPin
                ? pick(
                    "修改数字取券密码（留空则保持原密码不变）",
                    "Change Numeric PIN (leave blank to keep current PIN)"
                  )
                : pick(
                    "设置 4–8 位数字取券密码（方便在其他设备登录）",
                    "Set 4–8 Digit Numeric PIN"
                  )}
            </label>
            <input
              id="wallet-profile-pin"
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={profileNewPin}
              onChange={(e) =>
                setProfileNewPin(e.target.value.replace(/[^\d]/g, ""))
              }
              placeholder={pick(
                "输入 4 至 8 位纯数字（如 8866）",
                "4 to 8 digits (e.g. 8866)"
              )}
              className="mt-1 w-full max-w-xs rounded-xl border border-kraft-deep bg-white px-3.5 py-2.5 font-mono text-sm text-ink outline-none focus:border-cinnabar"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-kraft-deep/80 bg-parchment/50 p-3.5 text-xs leading-relaxed text-ink">
            <input
              type="checkbox"
              checked={profileOptIn}
              onChange={(e) => setProfileOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-cinnabar"
            />
            <span>
              {pick(
                "接收煎饼刘的节日限定口味上新与老客专属福利券通知（可随时取消）。",
                "Receive seasonal Camden specials and exclusive loyalty voucher drops."
              )}
            </span>
          </label>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-xs font-extrabold text-parchment shadow-sm hover:bg-cinnabar-dark disabled:opacity-55 sm:text-sm"
          >
            {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
            {pick("保存设置", "Save Settings")}
          </button>
        </form>
      )}
    </div>
  );
}
