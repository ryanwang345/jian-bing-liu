"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Gift,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";
import { useLocale } from "@/lib/i18n";

export interface ClaimedCouponClient {
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
const POPUP_DISMISS_SESSION_KEY = "jbl_welcome_coupon_popup_dismissed_v1";
const TOPBAR_DISMISS_SESSION_KEY = "jbl_welcome_coupon_topbar_dismissed_v1";

interface WelcomeCouponContextValue {
  enabled: boolean;
  claimed: ClaimedCouponClient | null;
  openCouponModal: () => void;
}

const WelcomeCouponContext = createContext<WelcomeCouponContextValue>({
  enabled: false,
  claimed: null,
  openCouponModal: () => {},
});

export function useWelcomeCoupon() {
  return useContext(WelcomeCouponContext);
}

export function WelcomeCouponProvider({ children }: { children: ReactNode }) {
  const { isZh, t, pick } = useLocale();
  const { welcomeCoupon, store } = useSiteContent();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [restoredExisting, setRestoredExisting] = useState(false);
  const [claimed, setClaimed] = useState<ClaimedCouponClient | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [liveTimeStr, setLiveTimeStr] = useState<string>("");

  const openCouponModal = useCallback(() => {
    setErrorMsg(null);
    setModalOpen(true);
  }, []);

  const closeCouponModal = useCallback(() => {
    setModalOpen(false);
    try {
      window.sessionStorage.setItem(POPUP_DISMISS_SESSION_KEY, "1");
    } catch {
      // Ignore storage restrictions
    }
  }, []);

  // Load saved coupon AND auto-pop modal for first-time / unclaimed visitors on site entry
  useEffect(() => {
    let savedCoupon: ClaimedCouponClient | null = null;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ClaimedCouponClient;
        if (parsed?.couponCode) {
          savedCoupon = parsed;
          setClaimed(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }

    if (!welcomeCoupon.enabled || store.temporarilyClosed || savedCoupon) {
      return;
    }

    let dismissedThisSession = false;
    try {
      dismissedThisSession =
        window.sessionStorage.getItem(POPUP_DISMISS_SESSION_KEY) === "1";
    } catch {
      // Ignore storage errors
    }
    if (dismissedThisSession) return;

    const timer = window.setTimeout(() => {
      setModalOpen(true);
    }, 380);

    return () => window.clearTimeout(timer);
  }, [welcomeCoupon.enabled, store.temporarilyClosed]);

  // Close on Escape & lock background scroll while modal is open
  useEffect(() => {
    if (!modalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCouponModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen, closeCouponModal]);

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

  // Live ticking London timestamp inside open QR modal to deter static screenshot spoofing
  useEffect(() => {
    if (!modalOpen || !claimed) return;
    const updateClock = () => {
      try {
        setLiveTimeStr(
          new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(new Date())
        );
      } catch {
        setLiveTimeStr(new Date().toTimeString().slice(0, 8));
      }
    };
    updateClock();
    const id = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(id);
  }, [modalOpen, claimed]);

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
          website: honeypot,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        emailSent?: boolean;
        restoredExisting?: boolean;
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
      setRestoredExisting(Boolean(data.restoredExisting));
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.coupon));
        window.sessionStorage.setItem(POPUP_DISMISS_SESSION_KEY, "1");
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

  const handleDownloadVoucherImage = () => {
    if (!claimed || !qrDataUrl) return;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Warm parchment background
    ctx.fillStyle = "#fbf6ec";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top vermilion header band
    ctx.fillStyle = "#b8251c";
    ctx.fillRect(0, 0, canvas.width, 210);

    ctx.fillStyle = "#f0c26e";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("JIAN BING LIU 煎饼刘 · 124 CAMDEN RD", 360, 68);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText(
      `${claimed.discountLabelZh} / ${claimed.discountLabelEn}`,
      360,
      130
    );

    ctx.fillStyle = "#fde8c8";
    ctx.font = "22px sans-serif";
    ctx.fillText("Walk-in Counter Orders £10+ Only · 限到店柜台点餐满 £10 使用", 360, 176);

    // White QR card box
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
      ctx.fillText(claimed.couponCode, 360, 675);

      ctx.fillStyle = "#594f47";
      ctx.font = "22px sans-serif";
      ctx.fillText(
        `Valid until / 有效期至: ${claimed.expiresAt.slice(0, 10)} (1 use)`,
        360,
        732
      );

      ctx.fillStyle = "#8a1c14";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(
        "付款前出示由店员扫码核销 · 不与外卖平台同享",
        360,
        845
      );
      ctx.fillStyle = "#6e6258";
      ctx.font = "18px sans-serif";
      ctx.fillText("124 Camden Rd, London NW1 9EE · jianbingliu.uk", 360, 885);

      const link = document.createElement("a");
      link.download = `JianBingLiu-${claimed.couponCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    qrImg.src = qrDataUrl;
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

  const ctxValue = useMemo<WelcomeCouponContextValue>(
    () => ({
      enabled: welcomeCoupon.enabled,
      claimed,
      openCouponModal,
    }),
    [welcomeCoupon.enabled, claimed, openCouponModal]
  );

  return (
    <WelcomeCouponContext.Provider value={ctxValue}>
      {children}

      {welcomeCoupon.enabled && modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-coupon-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCouponModal();
          }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1a1614]/68 p-4 backdrop-blur-xs"
        >
          <div className="animate-fade-up relative w-full max-w-md overflow-hidden rounded-[30px] border border-[#e6d2ae] bg-parchment shadow-[0_28px_80px_rgba(26,22,20,0.45)]">
            {/* Festive Vermilion Ticket Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#8f1414] via-[#b8251c] to-[#991b14] px-6 pt-6 pb-5 text-parchment">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 -right-10 h-36 w-36 rounded-full bg-[#f0c26e]/20 blur-2xl"
              />
              <button
                type="button"
                onClick={closeCouponModal}
                aria-label={pick("关闭弹窗", "Close dialog")}
                className="absolute top-3.5 right-3.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-parchment/90 transition-colors hover:bg-black/35 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0c26e]/45 bg-black/20 px-3 py-1 text-xs font-bold tracking-wide text-[#f0c26e]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t(welcomeCoupon.badge)} · {t(welcomeCoupon.discountLabel)}
              </span>

              <h3
                id="welcome-coupon-modal-title"
                className="mt-2.5 pr-6 font-display text-2xl font-bold leading-snug text-white sm:text-[26px]"
              >
                {claimed
                  ? isZh
                    ? claimed.offerTitleZh
                    : claimed.offerTitleEn
                  : t(welcomeCoupon.title)}
              </h3>
              {!claimed && (
                <p className="mt-1.5 text-xs leading-relaxed text-parchment/90 sm:text-sm">
                  {t(welcomeCoupon.subtitle)}
                </p>
              )}
            </div>

            {/* Perforated ticket divider */}
            <div
              aria-hidden="true"
              className="relative flex items-center justify-between border-b border-dashed border-cinnabar/25 bg-parchment px-2"
            >
              <span className="-ml-4 h-5 w-5 rounded-full bg-[#1a1614]/68" />
              <span className="-mr-4 h-5 w-5 rounded-full bg-[#1a1614]/68" />
            </div>

            <div className="p-6 pt-5">
              {!claimed ? (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Invisible anti-bot honeypot field */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
                  >
                    <label htmlFor="coupon-website- trap">Website</label>
                    <input
                      id="coupon-website- trap"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
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
                      className="mt-1 w-full rounded-xl border border-kraft-deep bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-cinnabar"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="coupon-customer-email"
                      className="block text-xs font-semibold text-ink"
                    >
                      {pick(
                        "电子邮箱（必填，每人限领 1 次）",
                        "Email address (required, 1 per customer)"
                      )}
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
                        className="w-full rounded-xl border border-kraft-deep bg-white py-2.5 pr-3.5 pl-10 text-sm text-ink outline-none transition-colors focus:border-cinnabar"
                      />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-kraft-deep/70 bg-white/75 p-3 text-xs leading-relaxed text-ink-soft">
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
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-cinnabar px-5 py-3.5 text-sm font-bold text-parchment shadow-[0_8px_20px_-4px_rgba(184,37,28,0.45)] transition-all hover:-translate-y-0.5 hover:bg-cinnabar-dark disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Ticket className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>
                      {submitting
                        ? pick("正在生成核销码...", "Generating code...")
                        : t(welcomeCoupon.ctaLabel)}
                    </span>
                  </button>

                  <div className="flex items-center justify-between pt-0.5 text-[11px] text-ink-soft">
                    <span>
                      {pick(
                        `限到店柜台满 £10 使用 · ${welcomeCoupon.validDays} 天内有效（不与外卖平台同享）`,
                        `Counter orders £10+ only · Valid ${welcomeCoupon.validDays} days (excl. delivery apps)`
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={closeCouponModal}
                      className="shrink-0 pl-2 font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
                    >
                      {pick("稍后再领", "Maybe later")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3.5 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-jade/15 px-3 py-1 text-xs font-bold text-jade">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {restoredExisting
                        ? pick("已为你找回未使用的优惠券", "Active Voucher Restored")
                        : pick("新客优惠券已领取", "Welcome Coupon Ready")}
                    </span>

                    {liveTimeStr && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-ink">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-jade" />
                        {pick(`实时凭证 ${liveTimeStr}`, `LIVE ${liveTimeStr}`)}
                      </span>
                    )}
                  </div>

                  <div className="rounded-2xl border-2 border-dashed border-cinnabar/45 bg-white p-4 sm:p-5">
                    <p className="text-xs font-bold tracking-wider text-cinnabar uppercase">
                      {isZh ? claimed.discountLabelZh : claimed.discountLabelEn}
                    </p>

                    {qrDataUrl && (
                      <div className="mx-auto mt-2.5 w-fit rounded-xl border border-kraft-deep/60 bg-white p-2">
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

                    <div className="mt-2.5 flex items-center justify-center gap-2">
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

                    <p className="mt-2 text-xs font-medium text-ink-soft">
                      {pick(
                        `有效期至：${claimed.expiresAt.slice(0, 10)} · 限到店核销 ${claimed.maxUses} 次`,
                        `Valid until ${claimed.expiresAt.slice(0, 10)} · ${claimed.maxUses} in-store use`
                      )}
                    </p>
                  </div>

                  {qrDataUrl && (
                    <button
                      type="button"
                      onClick={handleDownloadVoucherImage}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cinnabar/35 bg-[#fff5e4] px-4 py-2.5 text-xs font-extrabold text-cinnabar-dark transition-colors hover:bg-cinnabar hover:text-parchment"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      {pick("保存优惠券图片到手机相册", "Save Voucher Card to Phone")}
                    </button>
                  )}

                  {emailSent && (
                    <p className="text-xs font-medium text-jade">
                      {pick(
                        "已同步发送至你的邮箱，方便随时翻查。",
                        "We've also emailed a copy to your inbox."
                      )}
                    </p>
                  )}

                  <p className="flex items-start justify-center gap-1.5 text-left text-[11px] leading-relaxed text-ink-soft">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cinnabar" aria-hidden="true" />
                    <span>
                      {pick(
                        "仅限到店柜台直接点餐单笔满 £10 使用（每单限 1 张，不与饭团等外卖平台同享）。付款前由店员实时扫码核销生效。",
                        "Walk-in counter orders £10+ only (limit 1 per order, not valid on delivery apps). Staff must scan live at counter."
                      )}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </WelcomeCouponContext.Provider>
  );
}

/**
 * Site-wide prominent top coupon announcement bar rendered above the sticky Header.
 */
export function WelcomeCouponTopBar() {
  const pathname = usePathname();
  const { t, pick } = useLocale();
  const { welcomeCoupon, store } = useSiteContent();
  const { enabled, claimed, openCouponModal } = useWelcomeCoupon();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(
        window.sessionStorage.getItem(TOPBAR_DISMISS_SESSION_KEY) === "1"
      );
    } catch {
      // Ignore storage restrictions
    }
  }, []);

  // On `/` the full-size ticket showcase card already sits right at the very top of the page
  if (!enabled || store.temporarilyClosed || dismissed || pathname === "/") {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(TOPBAR_DISMISS_SESSION_KEY, "1");
    } catch {
      // Ignore
    }
  };

  return (
    <div
      role="region"
      aria-label={pick("新客立减优惠券横幅", "Welcome discount coupon banner")}
      className="relative z-50 border-b border-[#f0c26e]/30 bg-gradient-to-r from-[#7d1111] via-cinnabar to-[#7d1111] px-3 py-2 text-parchment shadow-xs sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-2.5 gap-y-1 pr-7 text-xs sm:gap-x-3.5 sm:text-sm">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#f0c26e]/45 bg-[#1a1614]/35 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#f0c26e]">
          <Gift className="h-3 w-3" aria-hidden="true" />
          {t(welcomeCoupon.discountLabel)}
        </span>

        <button
          type="button"
          onClick={openCouponModal}
          className="min-w-0 truncate text-left font-semibold text-white underline-offset-4 hover:underline"
        >
          {claimed
            ? pick(
                `已领新客立减券（${claimed.couponCode}）· 到店出示核销`,
                `Coupon ready (${claimed.couponCode}) · Tap to show QR`
              )
            : t(welcomeCoupon.title)}
        </button>

        <button
          type="button"
          onClick={openCouponModal}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f0c26e] px-3 py-1 text-[11px] font-extrabold text-[#1a1614] shadow-xs transition-transform hover:scale-[1.03] hover:bg-white active:scale-95 sm:text-xs"
        >
          <Ticket className="h-3 w-3" aria-hidden="true" />
          <span>
            {claimed
              ? pick("出示券码", "View QR")
              : t(welcomeCoupon.ctaLabel)}
          </span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label={pick("收起顶部优惠横幅", "Dismiss coupon bar")}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-parchment/75 transition-colors hover:bg-black/20 hover:text-white"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * High-visibility perforated ticket section placed at the top of the homepage.
 */
export function WelcomeCouponSection() {
  const { t, pick } = useLocale();
  const { welcomeCoupon } = useSiteContent();
  const { enabled, claimed, openCouponModal } = useWelcomeCoupon();

  if (!enabled) {
    return null;
  }

  return (
    <section
      aria-label={pick("新客首单优惠券专区", "Welcome coupon offer")}
      className="relative z-20 border-b border-kraft-deep/80 bg-gradient-to-b from-[#f9eedb] to-parchment px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div
          onClick={openCouponModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openCouponModal();
            }
          }}
          className="group relative cursor-pointer overflow-hidden rounded-[26px] border-2 border-cinnabar/35 bg-gradient-to-r from-[#8f1414] via-[#b8251c] to-[#9b1c15] p-5 text-parchment shadow-[0_16px_40px_-12px_rgba(184,37,28,0.42)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-12px_rgba(184,37,28,0.52)] sm:p-6 lg:px-9 lg:py-6"
        >
          {/* Ambient golden shimmer */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/3 h-48 w-80 rounded-full bg-[#f0c26e]/20 blur-3xl"
          />

          {/* Ticket side cutouts */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 -left-3 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[#f9eedb] sm:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 -right-3 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[#f9eedb] sm:block"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              {/* Ticket Stub Value Stamp */}
              <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#f0c26e]/50 bg-black/25 px-4 py-2.5 backdrop-blur-xs sm:flex-col sm:gap-0.5 sm:border-r-2 sm:border-dashed sm:px-5 sm:py-3">
                <span className="text-[11px] font-bold tracking-widest text-[#f0c26e] uppercase">
                  {t(welcomeCoupon.badge)}
                </span>
                <span className="font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                  {t(welcomeCoupon.discountLabel)}
                </span>
              </div>

              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f0c26e]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#f0c26e]">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {pick("限时到店福利 · 秒出核销码", "Instant In-Store QR Voucher")}
                  </span>
                </div>
                <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-[28px]">
                  {claimed
                    ? pick(
                        `你的专属立减券已就绪：${claimed.couponCode}`,
                        `Your Welcome Voucher is Ready: ${claimed.couponCode}`
                      )
                    : t(welcomeCoupon.title)}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-parchment/90 sm:text-sm">
                  {t(welcomeCoupon.subtitle)}
                </p>
              </div>
            </div>

            <div className="flex w-full shrink-0 items-center md:w-auto">
              <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f0c26e] px-6 py-3.5 text-sm font-extrabold text-[#1a1614] shadow-lg transition-all group-hover:scale-[1.03] group-hover:bg-white sm:w-auto">
                <Ticket className="h-4 w-4" aria-hidden="true" />
                <span>
                  {claimed
                    ? pick("查看二维码核销", "Show QR Voucher")
                    : t(welcomeCoupon.ctaLabel)}
                </span>
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
