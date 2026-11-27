"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  CheckCircle2,
  Copy,
  Gift,
  Loader2,
  Mail,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";
import { useLocale } from "@/lib/i18n";

interface ClaimedCouponClient {
  couponCode: string;
  customerName: string;
  offerTitleZh: string;
  offerTitleEn: string;
  discountLabelZh: string;
  discountLabelEn: string;
  maxUses: number;
  usedCount: number;
  remainingUses: number;
  expiresAt: string;
  effectiveStatus: string;
}

const STORAGE_KEY = "jbl_welcome_coupon_v1";

export function WelcomeCouponSection() {
  const { isZh, t, pick } = useLocale();
  const { welcomeCoupon } = useSiteContent();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [claimed, setClaimed] = useState<ClaimedCouponClient | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ClaimedCouponClient;
        if (parsed?.couponCode) {
          setClaimed(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (!claimed?.couponCode) {
      setQrDataUrl(null);
      return;
    }

    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://jianbingliu.uk";
    const redeemUrl = `${origin}/admin/coupons?code=${encodeURIComponent(claimed.couponCode)}`;

    let cancelled = false;
    void QRCode.toDataURL(redeemUrl, {
      width: 240,
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
  }, [claimed?.couponCode]);

  if (!welcomeCoupon.enabled) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/coupons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          marketingOptIn,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        emailSent?: boolean;
        coupon?: ClaimedCouponClient;
        messageZh?: string;
        messageEn?: string;
      };

      if (!res.ok || !data.ok || !data.coupon) {
        setErrorMsg(
          isZh
            ? data.messageZh || "领取失败，请检查邮箱后重试。"
            : data.messageEn || "Unable to claim coupon. Please check your email."
        );
        return;
      }

      setClaimed(data.coupon);
      setEmailSent(Boolean(data.emailSent));
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.coupon));
      } catch {
        // Ignore storage errors
      }
    } catch {
      setErrorMsg(
        pick(
          "网络异常，请稍后重试。",
          "Network error. Please try again in a moment."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    if (!claimed?.couponCode) return;
    try {
      await navigator.clipboard.writeText(claimed.couponCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-cinnabar/25 bg-gradient-to-br from-[#fff9f2] via-parchment to-[#fceee3] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cinnabar/30 bg-cinnabar/10 px-3 py-1 text-xs font-bold tracking-wide text-cinnabar-dark">
                <Gift className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t(welcomeCoupon.badge)}</span>
                <span aria-hidden="true">·</span>
                <span>{t(welcomeCoupon.discountLabel)}</span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {t(welcomeCoupon.title)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
                {t(welcomeCoupon.subtitle)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3.5 text-sm font-bold text-parchment shadow-md transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark"
              >
                <Ticket className="h-4 w-4" aria-hidden="true" />
                <span>
                  {claimed
                    ? pick("查看我的优惠券", "View My Coupon")
                    : t(welcomeCoupon.ctaLabel)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-coupon-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-kraft-deep bg-parchment p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label={pick("关闭弹窗", "Close dialog")}
              className="absolute top-4 right-4 rounded-full p-2 text-ink-soft hover:bg-kraft-deep/40 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>

            {!claimed ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cinnabar/10 px-3 py-1 text-xs font-bold text-cinnabar-dark">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {t(welcomeCoupon.badge)} · {t(welcomeCoupon.discountLabel)}
                  </span>
                  <h3
                    id="welcome-coupon-modal-title"
                    className="mt-3 font-display text-2xl font-bold text-ink"
                  >
                    {t(welcomeCoupon.title)}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                    {t(welcomeCoupon.subtitle)}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="coupon-customer-name"
                    className="block text-xs font-semibold text-ink"
                  >
                    {pick("怎么称呼你（选填）", "Your name (optional)")}
                  </label>
                  <input
                    id="coupon-customer-name"
                    type="text"
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={pick("例如：Alex / 小陈", "e.g. Alex")}
                    className="mt-1 w-full rounded-xl border border-kraft-deep bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-cinnabar"
                  />
                </div>

                <div>
                  <label
                    htmlFor="coupon-customer-email"
                    className="block text-xs font-semibold text-ink"
                  >
                    {pick("电子邮箱（必填，每人限领 1 次）", "Email address (required, 1 per customer)")}
                  </label>
                  <div className="relative mt-1">
                    <Mail
                      className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-soft"
                      aria-hidden="true"
                    />
                    <input
                      id="coupon-customer-email"
                      type="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-kraft-deep bg-white py-2.5 pr-3.5 pl-10 text-sm text-ink outline-none focus:border-cinnabar"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-kraft-deep/70 bg-white/70 p-3 text-xs leading-relaxed text-ink-soft">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-cinnabar"
                  />
                  <span>
                    {pick(
                      "我愿意接收煎饼刘的新品上新及节日限定通知（可随时取消，不勾选也可照常领券）。",
                      "Send me occasional updates on seasonal flavours and Camden specials (optional — you can still claim without ticking)."
                    )}
                  </span>
                </label>

                {errorMsg && (
                  <p
                    role="alert"
                    className="rounded-xl border border-cinnabar/30 bg-cinnabar/10 px-3 py-2 text-xs font-medium text-cinnabar-dark"
                  >
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-cinnabar px-5 py-3 text-sm font-bold text-parchment shadow-sm hover:bg-cinnabar-dark disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  <span>
                    {submitting
                      ? pick("正在生成核销码...", "Generating code...")
                      : t(welcomeCoupon.ctaLabel)}
                  </span>
                </button>

                <p className="text-center text-[11px] text-ink-soft">
                  {pick(
                    `领取后 ${welcomeCoupon.validDays} 天内有效 · 限到店核销 ${welcomeCoupon.maxUses} 次`,
                    `Valid for ${welcomeCoupon.validDays} days · In-store redemption (${welcomeCoupon.maxUses} use)`
                  )}
                </p>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-jade/15 px-3 py-1 text-xs font-bold text-jade">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {pick("新客优惠券已领取", "Welcome Coupon Ready")}
                </div>

                <h3
                  id="welcome-coupon-modal-title"
                  className="font-display text-xl font-bold text-ink"
                >
                  {isZh ? claimed.offerTitleZh : claimed.offerTitleEn}
                </h3>

                <div className="rounded-2xl border-2 border-dashed border-cinnabar/45 bg-white p-5">
                  <p className="text-xs font-bold tracking-wider text-cinnabar uppercase">
                    {isZh ? claimed.discountLabelZh : claimed.discountLabelEn}
                  </p>

                  {qrDataUrl && (
                    <div className="mx-auto mt-3 w-fit rounded-xl border border-kraft-deep/60 bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrDataUrl}
                        alt={`QR code for ${claimed.couponCode}`}
                        width={160}
                        height={160}
                        className="h-40 w-40"
                      />
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="font-mono text-2xl font-extrabold tracking-[0.14em] text-ink">
                      {claimed.couponCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopyCode()}
                      aria-label={pick("复制核销码", "Copy code")}
                      className="rounded-lg border border-kraft-deep px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-kraft"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-jade" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2.5 text-xs text-ink-soft">
                    {pick(
                      `有效期至：${claimed.expiresAt.slice(0, 10)} · 可使用 ${claimed.maxUses} 次`,
                      `Valid until ${claimed.expiresAt.slice(0, 10)} · ${claimed.maxUses} use allowed`
                    )}
                  </p>
                </div>

                {emailSent && (
                  <p className="text-xs font-medium text-jade">
                    {pick(
                      "已同步发送至你的邮箱，方便随时翻查。",
                      "We've also emailed a copy to your inbox."
                    )}
                  </p>
                )}

                <p className="text-xs leading-relaxed text-ink-soft">
                  {pick(
                    "到店点餐付款前，请向店员出示此二维码或券码，店员扫码核销后立减生效（以门店实时系统核销状态为准）。",
                    "Show this QR code at our Camden counter before paying. Staff will scan and redeem it once in-store."
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
