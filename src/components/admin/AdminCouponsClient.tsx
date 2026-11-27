"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import jsQR from "jsqr";
import {
  AlertTriangle,
  Ban,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ClipboardList,
  Download,
  Gift,
  Loader2,
  QrCode,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings2,
  Ticket,
  X,
  XCircle,
} from "lucide-react";
import type { SiteContentConfig, WelcomeCouponConfig } from "@/data/site-content";
import type {
  CouponActivityLogRecord,
  CouponEffectiveStatus,
  CouponStatsSummary,
  WelcomeCouponRecord,
} from "@/lib/coupon-service";

interface AdminCouponsClientProps {
  writable: boolean;
  initialCoupons: WelcomeCouponRecord[];
  initialStats: CouponStatsSummary;
  initialLogs: CouponActivityLogRecord[];
  initialLookup: WelcomeCouponRecord | null;
  initialQueryCode: string;
  initialSiteContent: SiteContentConfig;
}

type CounterListTab = "active" | "redeemed" | "expired" | "all" | "logs";

const STATUS_BADGE: Record<
  CouponEffectiveStatus,
  { label: string; className: string }
> = {
  active: {
    label: "🟢 未使用过",
    className: "bg-[#d1f7c4] text-[#135e18]",
  },
  redeemed: {
    label: "⚪ 已使用过",
    className: "bg-[#e5e7eb] text-[#374151]",
  },
  expired: {
    label: "🟠 已过期",
    className: "bg-[#ffebc4] text-[#8a5000]",
  },
  void: {
    label: "⛔ 已作废",
    className: "bg-[#fed3d1] text-[#8e1f0b]",
  },
};

const LOG_EVENT_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  redeemed: {
    label: "✅ 核销成功",
    className: "bg-[#d1f7c4] text-[#135e18]",
  },
  scanned_valid: {
    label: "🟢 扫码验真·可用",
    className: "bg-[#e3fcef] text-[#0f5132]",
  },
  scanned_used: {
    label: "🔴 拦截·已使用过",
    className: "bg-[#fee2e2] text-[#991b1b]",
  },
  scanned_expired: {
    label: "🟠 拦截·已过期",
    className: "bg-[#ffebc4] text-[#8a5000]",
  },
  scanned_void: {
    label: "⛔ 拦截·已作废",
    className: "bg-[#fee2e2] text-[#991b1b]",
  },
  scanned_invalid: {
    label: "⛔ 拦截·假码/错码",
    className: "bg-[#fee2e2] text-[#991b1b]",
  },
  issued: {
    label: "🎟️ 顾客领券",
    className: "bg-[#e0f2fe] text-[#075985]",
  },
  admin_issued: {
    label: "🎁 店长派券",
    className: "bg-[#f3e8ff] text-[#6b21a8]",
  },
  unredeemed: {
    label: "↩️ 撤销误核销",
    className: "bg-[#f3f4f6] text-[#374151]",
  },
  voided: {
    label: "🚫 手动作废",
    className: "bg-[#fed3d1] text-[#8e1f0b]",
  },
};

function extractCouponCodeFromScan(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const parsed = new URL(trimmed);
      const fromParam = parsed.searchParams.get("code")?.trim();
      if (fromParam) return fromParam.toUpperCase();
    }
  } catch {
    // Fall through to regex match
  }
  const match = trimmed.toUpperCase().match(/\bJBL-[A-Z0-9]{4,12}\b/);
  if (match) return match[0];
  if (/^[A-Z0-9]{4,12}$/i.test(trimmed)) {
    return `JBL-${trimmed.toUpperCase()}`;
  }
  return null;
}

function getRemainingDays(expiresAt: string): number {
  const iso = expiresAt.includes("T")
    ? expiresAt
    : `${expiresAt.replace(" ", "T")}Z`;
  const diff = Date.parse(iso) - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

function formatShortTime(raw: string | null | undefined): string {
  if (!raw) return "—";
  return raw.replace("T", " ").slice(0, 16);
}

export function AdminCouponsClient({
  writable,
  initialCoupons,
  initialStats,
  initialLogs,
  initialLookup,
  initialQueryCode,
  initialSiteContent,
}: AdminCouponsClientProps) {
  const [coupons, setCoupons] = useState<WelcomeCouponRecord[]>(initialCoupons);
  const [stats, setStats] = useState<CouponStatsSummary>(initialStats);
  const [logs, setLogs] = useState<CouponActivityLogRecord[]>(initialLogs);
  const [codeInput, setCodeInput] = useState(initialQueryCode);
  const [selectedCoupon, setSelectedCoupon] =
    useState<WelcomeCouponRecord | null>(initialLookup);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(
    initialQueryCode && !initialLookup ? initialQueryCode : null
  );
  const [justRedeemedCode, setJustRedeemedCode] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isRefreshingList, setIsRefreshingList] = useState(false);

  // Camera scanner state (works universally across iOS Safari, Android & Desktop via jsQR)
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const statusCardRef = useRef<HTMLDivElement | null>(null);

  // List & tabs state
  const [listTab, setListTab] = useState<CounterListTab>("active");
  const [searchFilter, setSearchFilter] = useState("");

  // Collapsible admin panels so Mom's daily counter view stays ultra-clean
  const [showIssuePanel, setShowIssuePanel] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Manual voucher issuance form state
  const [issueEmail, setIssueEmail] = useState("");
  const [issueName, setIssueName] = useState("");
  const [issueTitleZh, setIssueTitleZh] = useState("老客专属回馈立减券");
  const [issueTitleEn, setIssueTitleEn] = useState("VIP Loyalty Voucher");
  const [issueDiscountZh, setIssueDiscountZh] = useState("满 £10 减 £2");
  const [issueDiscountEn, setIssueDiscountEn] = useState("£2 OFF (£10+ order)");
  const [issueValidDays, setIssueValidDays] = useState(30);
  const [isIssuing, setIsIssuing] = useState(false);

  // Campaign config state
  const [siteContent, setSiteContent] = useState(initialSiteContent);
  const [couponConfig, setCouponConfig] = useState<WelcomeCouponConfig>(() =>
    structuredClone(initialSiteContent.welcomeCoupon)
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const refreshAll = async (focusCode?: string, showSpinner = false) => {
    if (showSpinner) setIsRefreshingList(true);
    try {
      const res = await fetch("/api/admin/coupons", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        coupons: WelcomeCouponRecord[];
        stats: CouponStatsSummary;
        logs?: CouponActivityLogRecord[];
      };
      setCoupons(data.coupons);
      setStats(data.stats);
      if (Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
      if (focusCode) {
        const updated = data.coupons.find((c) => c.couponCode === focusCode);
        if (updated) setSelectedCoupon(updated);
      }
    } finally {
      if (showSpinner) setIsRefreshingList(false);
    }
  };

  const handleLookup = async (
    event?: React.FormEvent,
    overrideCode?: string
  ) => {
    event?.preventDefault();
    const raw = (overrideCode ?? codeInput)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    if (!raw) return;
    const target = raw.startsWith("JBL-") ? raw : `JBL-${raw}`;
    setCodeInput(target);
    setIsLookingUp(true);
    setFeedback(null);
    setNotFoundCode(null);
    setJustRedeemedCode(null);

    try {
      const res = await fetch(
        `/api/admin/coupons?code=${encodeURIComponent(target)}&scan=1`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        coupon?: WelcomeCouponRecord | null;
      };
      if (!res.ok || !data.coupon) {
        setSelectedCoupon(null);
        setNotFoundCode(target);
      } else {
        setSelectedCoupon(data.coupon);
      }
      // Refresh logs immediately so the automatic scan record shows up right away
      await refreshAll();
      window.setTimeout(() => {
        statusCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 60);
    } catch {
      setFeedback({ type: "error", text: "网络查询失败，请重试。" });
    } finally {
      setIsLookingUp(false);
    }
  };

  // Universal in-page QR camera scanner (jsQR canvas decoder + BarcodeDetector fast path)
  useEffect(() => {
    if (!scannerOpen) return;
    let stream: MediaStream | null = null;
    let timerId = 0;
    let stopped = false;

    const startCamera = async () => {
      setScannerError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerError(
          "当前环境未开启摄像头权限——您也可以直接打开手机自带「相机 App」扫顾客二维码自动跳回本页核销！"
        );
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const BarcodeDetectorCtor = (
          window as unknown as {
            BarcodeDetector?: new (opts: { formats: string[] }) => {
              detect: (
                source: HTMLVideoElement
              ) => Promise<Array<{ rawValue?: string }>>;
            };
          }
        ).BarcodeDetector;
        const nativeDetector = BarcodeDetectorCtor
          ? new BarcodeDetectorCtor({ formats: ["qr_code"] })
          : null;

        const onDetected = (rawValue: string) => {
          const parsedCode = extractCouponCodeFromScan(rawValue);
          if (!parsedCode) return false;
          stopped = true;
          try {
            navigator.vibrate?.(80);
          } catch {
            // Ignore vibration unsupported
          }
          setScannerOpen(false);
          void handleLookup(undefined, parsedCode);
          return true;
        };

        const scanFrame = async () => {
          if (stopped) return;
          const video = videoRef.current;
          if (
            video &&
            video.readyState >= 2 &&
            video.videoWidth > 0 &&
            video.videoHeight > 0
          ) {
            // 1. Try hardware BarcodeDetector if supported
            if (nativeDetector) {
              try {
                const hits = await nativeDetector.detect(video);
                if (hits[0]?.rawValue && onDetected(hits[0].rawValue)) {
                  return;
                }
              } catch {
                // Fall through to jsQR
              }
            }

            // 2. Universal jsQR fallback (works on 100% of iPhones / Safari / WeChat / Android)
            if (ctx) {
              try {
                const scale = Math.min(1, 640 / video.videoWidth);
                canvas.width = Math.max(1, Math.floor(video.videoWidth * scale));
                canvas.height = Math.max(
                  1,
                  Math.floor(video.videoHeight * scale)
                );
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imgData = ctx.getImageData(
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );
                const qr = jsQR(imgData.data, imgData.width, imgData.height, {
                  inversionAttempts: "dontInvert",
                });
                if (qr?.data && onDetected(qr.data)) {
                  return;
                }
              } catch {
                // Ignore transient frame read error
              }
            }
          }

          if (!stopped) {
            timerId = window.setTimeout(() => void scanFrame(), 90);
          }
        };

        timerId = window.setTimeout(() => void scanFrame(), 120);
      } catch {
        setScannerError(
          "未允许访问摄像头。请在浏览器弹出框点「允许」，或直接用手机系统自带「相机 App」扫顾客二维码！"
        );
      }
    };

    void startCamera();

    return () => {
      stopped = true;
      if (timerId) window.clearTimeout(timerId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerOpen]);

  const handleAction = async (
    code: string,
    action: "redeem" | "unredeem" | "void"
  ) => {
    if (
      action === "void" &&
      !window.confirm(`确定要永久作废券码 ${code} 吗？作废后不可恢复。`)
    ) {
      return;
    }
    if (
      action === "unredeem" &&
      !window.confirm(
        `确定要撤销刚刚对 ${code} 的核销，将其恢复为「未使用过」状态吗？`
      )
    ) {
      return;
    }

    setIsRedeeming(true);
    setFeedback(null);
    setNotFoundCode(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, code }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        coupon?: WelcomeCouponRecord;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        if (data.coupon) setSelectedCoupon(data.coupon);
        setFeedback({
          type: "error",
          text: data.message || "操作失败，请检查优惠券状态。",
        });
        await refreshAll(code);
        return;
      }

      if (data.coupon) setSelectedCoupon(data.coupon);
      if (action === "redeem") {
        setJustRedeemedCode(code);
        try {
          navigator.vibrate?.([60, 40, 80]);
        } catch {
          // Ignore
        }
      } else {
        setJustRedeemedCode(null);
      }

      setFeedback({
        type: "success",
        text:
          action === "redeem"
            ? `✅ 核销成功！${code} 已自动记为「已使用过」并写入流水记录。`
            : data.message || `操作成功（${code}）。`,
      });
      await refreshAll(code);
    } catch {
      setFeedback({ type: "error", text: "网络错误，请重试。" });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleIssueVoucher = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsIssuing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue",
          email: issueEmail.trim(),
          customerName: issueName.trim(),
          campaignType: "vip",
          offerTitleZh: issueTitleZh.trim(),
          offerTitleEn: issueTitleEn.trim(),
          discountLabelZh: issueDiscountZh.trim(),
          discountLabelEn: issueDiscountEn.trim(),
          validDays: issueValidDays,
          maxUses: 1,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        coupon?: WelcomeCouponRecord;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setFeedback({
          type: "error",
          text: data.message || "派发失败，请检查邮箱格式。",
        });
        return;
      }
      setIssueEmail("");
      setIssueName("");
      setShowIssuePanel(false);
      setFeedback({
        type: "success",
        text:
          data.message ||
          `✅ 已派发优惠券 ${data.coupon?.couponCode ?? ""}！`,
      });
      await refreshAll();
    } catch {
      setFeedback({ type: "error", text: "网络错误，请重试。" });
    } finally {
      setIsIssuing(false);
    }
  };

  const handleExportOptInCsv = () => {
    const optedIn = coupons.filter((c) => c.marketingOptIn);
    const header =
      "email,customer_name,coupon_code,status,created_at,redeemed_at\n";
    const rows = optedIn
      .map((c) =>
        [
          c.email,
          c.customerName,
          c.couponCode,
          c.effectiveStatus,
          c.createdAt,
          c.redeemedAt ?? "",
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${header}${rows}`], {
      type: "text/csv;charset-utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jianbingliu-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveConfig = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingConfig(true);
    setFeedback(null);
    try {
      const nextContent: SiteContentConfig = {
        ...siteContent,
        welcomeCoupon: couponConfig,
      };
      const res = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: nextContent }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        content?: SiteContentConfig;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.content) {
        throw new Error(data.error || "保存失败");
      }
      setSiteContent(data.content);
      setCouponConfig(structuredClone(data.content.welcomeCoupon));
      setFeedback({
        type: "success",
        text: "✅ 新客领券活动规则已保存并实时生效。",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "保存失败，请重试。",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const tabFilteredCoupons = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    return coupons.filter((item) => {
      if (listTab === "active" && item.effectiveStatus !== "active") {
        return false;
      }
      if (listTab === "redeemed" && item.effectiveStatus !== "redeemed") {
        return false;
      }
      if (
        listTab === "expired" &&
        item.effectiveStatus !== "expired" &&
        item.effectiveStatus !== "void"
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.couponCode.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q)
      );
    });
  }, [coupons, listTab, searchFilter]);

  const optInCount = useMemo(
    () => coupons.filter((c) => c.marketingOptIn).length,
    [coupons]
  );

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#1a1a1a] sm:text-2xl">
            柜台优惠券极速核销台
          </h1>
          <p className="mt-1 text-xs text-[#616161] sm:text-sm">
            点下方大按钮直接扫码（苹果/安卓均支持），「未使用过 / 已使用过 / 已过期」结果秒出，每次扫码与核销自动记账。
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refreshAll(selectedCoupon?.couponCode, true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#d4d4d4] bg-white px-3.5 py-2 text-xs font-bold text-[#1a1a1a] shadow-2xs hover:bg-[#f5f5f5]"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshingList ? "animate-spin" : ""}`}
          />
          刷新最新数据
        </button>
      </div>

      {!writable && (
        <p
          role="status"
          className="rounded-xl border border-[#ffd6a4] bg-[#fff5ea] p-3.5 text-xs font-medium text-[#8a5000]"
        >
          当前未检测到 Cloudflare D1 数据库绑定，请先连接 D1 数据库后再使用核销功能。
        </p>
      )}

      {/* ── Primary 1-Tap Counter Scanner & Input Card ── */}
      <div className="rounded-2xl border-2 border-[#e3e3e3] bg-white p-4 shadow-xs sm:p-6">
        <button
          type="button"
          onClick={() => setScannerOpen((prev) => !prev)}
          className={`flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-xl px-5 py-4 text-base font-extrabold text-white shadow-md transition-all active:scale-[0.99] sm:text-lg ${
            scannerOpen
              ? "bg-[#374151] hover:bg-[#1f2937]"
              : "bg-[#b8251c] hover:bg-[#991b14]"
          }`}
        >
          {scannerOpen ? (
            <>
              <X className="h-6 w-6" />
              关闭摄像头
            </>
          ) : (
            <>
              <Camera className="h-6 w-6" />
              📷 点此打开相机扫顾客二维码
            </>
          )}
        </button>

        {scannerOpen && (
          <div className="mt-3 overflow-hidden rounded-xl border border-[#dcdcdc] bg-[#1a1a1a] p-3 text-white">
            {scannerError ? (
              <p className="p-3 text-sm font-medium leading-relaxed text-[#ffd6a4]">
                {scannerError}
              </p>
            ) : (
              <div className="space-y-2.5 text-center">
                <div className="relative mx-auto max-w-sm overflow-hidden rounded-lg border-2 border-[#f0c26e]/70 bg-black">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="max-h-72 w-full object-cover"
                  />
                </div>
                <p className="text-xs font-medium text-[#e5e5e5] sm:text-sm">
                  请将顾客手机上的优惠券二维码对准方框，识别后会自动弹出核销大屏！
                </p>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => void handleLookup(e)}
          className="mt-3.5 flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <QrCode
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#737373]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="或手动输 6 位券码（如 7K3M2A）"
              className="w-full rounded-xl border border-[#c9cccf] py-3 pr-3.5 pl-10 font-mono text-base font-bold uppercase text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
            />
          </div>
          <button
            type="submit"
            disabled={!writable || isLookingUp}
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-[#1a1a1a] px-6 py-3 text-sm font-extrabold text-white hover:bg-[#303030] disabled:opacity-50 sm:text-base"
          >
            {isLookingUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            立即查验状态
          </button>
        </form>
      </div>

      {/* ── Giant Unmistakable 4-State Traffic-Light Result Screen ── */}
      <div ref={statusCardRef}>
        {notFoundCode && (
          <div
            role="alert"
            className="rounded-2xl border-4 border-[#dc2626] bg-[#fef2f2] p-5 text-[#7f1d1d] shadow-lg sm:p-7"
          >
            <div className="flex items-start gap-3.5">
              <XCircle className="mt-0.5 h-10 w-10 shrink-0 text-[#dc2626]" />
              <div className="space-y-1.5">
                <span className="inline-block rounded-full bg-[#dc2626] px-3 py-1 text-xs font-extrabold text-white">
                  ⛔ 状态：无效券码（已自动记录拦截）
                </span>
                <p className="text-2xl font-black text-[#b91c1c] sm:text-3xl">
                  查无此码（{notFoundCode}）！切勿减免！
                </p>
                <p className="text-sm font-bold text-[#7f1d1d] sm:text-base">
                  数据库里根本没有这张优惠券，请核对是否输错字母，谨防假截图！
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedCoupon && (
          <div
            className={`rounded-2xl border-4 p-5 shadow-lg sm:p-7 ${
              selectedCoupon.effectiveStatus === "active"
                ? "border-[#15803d] bg-[#f0fdf4]"
                : justRedeemedCode === selectedCoupon.couponCode
                  ? "border-[#047857] bg-[#ecfdf5]"
                  : selectedCoupon.effectiveStatus === "expired"
                    ? "border-[#d97706] bg-[#fffbeb]"
                    : "border-[#dc2626] bg-[#fef2f2]"
            }`}
          >
            {selectedCoupon.effectiveStatus === "active" ? (
              /* STATE 1: UNUSED / ACTIVE (未使用过) */
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="mt-1 h-10 w-10 shrink-0 text-[#15803d]" />
                    <div>
                      <span className="inline-block rounded-full bg-[#15803d] px-3.5 py-1 text-xs font-extrabold text-white sm:text-sm">
                        🟢 状态：未使用过 · 现在可用！
                      </span>
                      <p className="mt-2 text-2xl font-black text-[#14532d] sm:text-3xl">
                        {selectedCoupon.discountLabelZh}
                      </p>
                      <p className="mt-1 font-mono text-lg font-extrabold tracking-wider text-[#1a1a1a]">
                        券码：{selectedCoupon.couponCode}
                        <span className="ml-2 rounded-md bg-white px-2 py-0.5 font-sans text-xs font-bold text-[#15803d]">
                          剩余 {getRemainingDays(selectedCoupon.expiresAt)} 天有效
                        </span>
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#374151] sm:text-sm">
                        顾客：{selectedCoupon.customerName || "未填称呼"}（
                        {selectedCoupon.email}） · 到期日：
                        {selectedCoupon.expiresAt.slice(0, 10)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[#f59e0b]/50 bg-[#fffbeb] px-4 py-3 text-xs font-bold text-[#92400e] sm:text-sm">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-[#d97706]" />
                  <span>
                    核销提醒：仅限柜台点餐且单笔满 £10 可用（外卖平台订单不可用）
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={!writable || isRedeeming}
                    onClick={() =>
                      void handleAction(selectedCoupon.couponCode, "redeem")
                    }
                    className="flex min-h-[64px] flex-1 items-center justify-center gap-2.5 rounded-2xl bg-[#15803d] px-6 py-4 text-lg font-black text-white shadow-md transition-all hover:bg-[#166534] active:scale-[0.99] disabled:opacity-50 sm:text-xl"
                  >
                    {isRedeeming ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6" />
                    )}
                    ✅ 确认核销（自动记为已使用过）
                  </button>

                  <button
                    type="button"
                    disabled={!writable || isRedeeming}
                    onClick={() =>
                      void handleAction(selectedCoupon.couponCode, "void")
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#d4d4d4] bg-white px-4 py-3 text-xs font-bold text-[#8e1f0b] hover:bg-[#fff2f0] disabled:opacity-45"
                  >
                    <Ban className="h-4 w-4" />
                    永久作废
                  </button>
                </div>
              </div>
            ) : justRedeemedCode === selectedCoupon.couponCode ? (
              /* JUST REDEEMED CELEBRATION */
              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="mt-1 h-10 w-10 shrink-0 text-[#047857]" />
                  <div>
                    <span className="inline-block rounded-full bg-[#047857] px-3.5 py-1 text-xs font-extrabold text-white sm:text-sm">
                      🎉 核销完成 · 已自动记入流水账
                    </span>
                    <p className="mt-2 text-2xl font-black text-[#064e3b] sm:text-3xl">
                      请给顾客减免：{selectedCoupon.discountLabelZh}
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#1f2937] sm:text-base">
                      券码{" "}
                      <span className="font-mono">
                        {selectedCoupon.couponCode}
                      </span>{" "}
                      已变更为「已使用过」，无法再二次使用，顾客手机页面也已同步更新！
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    disabled={!writable || isRedeeming}
                    onClick={() =>
                      void handleAction(selectedCoupon.couponCode, "unredeem")
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#9ca3af] bg-white px-4 py-2.5 text-xs font-bold text-[#374151] hover:bg-[#f3f4f6]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    手滑点错了？撤销刚刚这次核销（恢复为未使用过）
                  </button>
                </div>
              </div>
            ) : selectedCoupon.effectiveStatus === "redeemed" ? (
              /* STATE 2: ALREADY USED (已使用过) */
              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <XCircle className="mt-1 h-10 w-10 shrink-0 text-[#dc2626]" />
                  <div>
                    <span className="inline-block rounded-full bg-[#dc2626] px-3.5 py-1 text-xs font-extrabold text-white sm:text-sm">
                      🔴 状态：已使用过！（已自动记录拦截）
                    </span>
                    <p className="mt-2 text-2xl font-black text-[#b91c1c] sm:text-3xl">
                      这张券已经用过了！不可再减免！
                    </p>
                    <p className="mt-1.5 text-sm font-extrabold text-[#7f1d1d] sm:text-base">
                      券码：{selectedCoupon.couponCode} · 上次核销时间：
                      {formatShortTime(selectedCoupon.redeemedAt)}（已用{" "}
                      {selectedCoupon.usedCount}/{selectedCoupon.maxUses} 次）
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#7f1d1d]/85">
                      顾客邮箱：{selectedCoupon.email}
                      {selectedCoupon.redeemedBy
                        ? ` · 经手店员：${selectedCoupon.redeemedBy}`
                        : ""}
                    </p>
                  </div>
                </div>

                {selectedCoupon.status === "redeemed" && (
                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={!writable || isRedeeming}
                      onClick={() =>
                        void handleAction(selectedCoupon.couponCode, "unredeem")
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#fca5a5] bg-white px-3.5 py-2 text-xs font-bold text-[#7f1d1d] hover:bg-[#fef2f2]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      如果是店员刚刚误点核销，点此恢复为未使用过
                    </button>
                  </div>
                )}
              </div>
            ) : selectedCoupon.effectiveStatus === "expired" ? (
              /* STATE 3: EXPIRED (已过期) */
              <div className="space-y-3">
                <div className="flex items-start gap-3.5">
                  <Clock className="mt-1 h-10 w-10 shrink-0 text-[#d97706]" />
                  <div>
                    <span className="inline-block rounded-full bg-[#d97706] px-3.5 py-1 text-xs font-extrabold text-white sm:text-sm">
                      🟠 状态：已过期！（已自动记录拦截）
                    </span>
                    <p className="mt-2 text-2xl font-black text-[#92400e] sm:text-3xl">
                      这张优惠券已过期失效！不可使用！
                    </p>
                    <p className="mt-1.5 text-sm font-extrabold text-[#78350f] sm:text-base">
                      券码：{selectedCoupon.couponCode} · 已于{" "}
                      {selectedCoupon.expiresAt.slice(0, 10)} 到期作废
                    </p>
                    <p className="mt-1 text-xs text-[#78350f]/85">
                      顾客邮箱：{selectedCoupon.email}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* STATE 4: VOID (已作废) */
              <div className="space-y-3">
                <div className="flex items-start gap-3.5">
                  <Ban className="mt-1 h-10 w-10 shrink-0 text-[#dc2626]" />
                  <div>
                    <span className="inline-block rounded-full bg-[#dc2626] px-3.5 py-1 text-xs font-extrabold text-white sm:text-sm">
                      ⛔ 状态：已作废！（已自动记录拦截）
                    </span>
                    <p className="mt-2 text-2xl font-black text-[#b91c1c] sm:text-3xl">
                      这张优惠券已被作废！切勿减免！
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#7f1d1d]">
                      券码：{selectedCoupon.couponCode}（{selectedCoupon.email}）
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {feedback && !justRedeemedCode && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-xs font-bold sm:text-sm ${
            feedback.type === "success"
              ? "border-[#95d5b2] bg-[#edfbf1] text-[#135e18]"
              : "border-[#f3b6b0] bg-[#fff2f0] text-[#8e1f0b]"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* ── Clear 4-State Counter KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setListTab("active")}
          className={`rounded-xl border p-4 text-left transition-all ${
            listTab === "active"
              ? "border-[#15803d] bg-[#f0fdf4] ring-1 ring-[#15803d]"
              : "border-[#e3e3e3] bg-white hover:border-[#15803d]/50"
          }`}
        >
          <p className="text-xs font-bold text-[#15803d]">🟢 未使用过（有效）</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#14532d]">
            {stats.active}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setListTab("redeemed")}
          className={`rounded-xl border p-4 text-left transition-all ${
            listTab === "redeemed"
              ? "border-[#1a1a1a] bg-[#f9fafb] ring-1 ring-[#1a1a1a]"
              : "border-[#e3e3e3] bg-white hover:border-[#9ca3af]"
          }`}
        >
          <p className="text-xs font-bold text-[#4b5563]">⚪ 已使用过（已核销）</p>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-extrabold tabular-nums text-[#1a1a1a]">
              {stats.redeemed}
            </span>
            <span className="rounded-full bg-[#e5e7eb] px-2 py-0.5 text-[11px] font-bold text-[#374151]">
              今日 {stats.todayRedeemed ?? 0}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setListTab("expired")}
          className={`rounded-xl border p-4 text-left transition-all ${
            listTab === "expired"
              ? "border-[#d97706] bg-[#fffbeb] ring-1 ring-[#d97706]"
              : "border-[#e3e3e3] bg-white hover:border-[#d97706]/50"
          }`}
        >
          <p className="text-xs font-bold text-[#8a5000]">🟠 已过期 / 已作废</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#8a5000]">
            {stats.expired + stats.voided}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setListTab("logs")}
          className={`rounded-xl border p-4 text-left transition-all ${
            listTab === "logs"
              ? "border-[#b8251c] bg-[#fff5f5] ring-1 ring-[#b8251c]"
              : "border-[#e3e3e3] bg-white hover:border-[#b8251c]/50"
          }`}
        >
          <p className="text-xs font-bold text-[#b8251c]">📋 自动流水记录</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#1a1a1a]">
            {logs.length}
          </p>
        </button>
      </div>

      {/* ── Tabbed Coupons & Real-Time Automatic Audit Log Panel ── */}
      <div className="rounded-2xl border border-[#e3e3e3] bg-white p-4 shadow-2xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efefef] pb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "active", label: `🟢 未使用过 (${stats.active})` },
                { id: "redeemed", label: `⚪ 已使用过 (${stats.redeemed})` },
                {
                  id: "expired",
                  label: `🟠 已过期/作废 (${stats.expired + stats.voided})`,
                },
                { id: "all", label: `全部券 (${coupons.length})` },
                { id: "logs", label: `📋 自动扫码与核销流水 (${logs.length})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setListTab(t.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-colors ${
                  listTab === t.id
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {optInCount > 0 && (
              <button
                type="button"
                onClick={handleExportOptInCsv}
                className="inline-flex items-center gap-1 rounded-lg border border-[#c9cccf] bg-[#fafafa] px-2.5 py-1.5 text-[11px] font-semibold text-[#303030] hover:bg-[#efefef]"
              >
                <Download className="h-3 w-3" />
                导出订阅邮箱 ({optInCount})
              </button>
            )}
            {listTab !== "logs" && (
              <input
                type="search"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="搜券码 / 邮箱 / 称呼..."
                className="w-full max-w-[210px] rounded-lg border border-[#c9cccf] px-3 py-1.5 text-xs text-[#1a1a1a]"
              />
            )}
          </div>
        </div>

        {listTab === "logs" ? (
          /* Automatic Audit Log Table */
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2 text-xs text-[#616161]">
              <ClipboardList className="h-4 w-4 text-[#b8251c]" />
              <span>
                以下流水由系统全自动实时记录（包含顾客领券、店员每次扫码查验、核销成功、重复使用拦截等）：
              </span>
            </div>
            {logs.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#616161]">
                暂无自动流水记录。当有顾客领券或门店扫码时会自动生成。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e3e3e3] text-[#616161]">
                      <th className="py-2 pr-3 font-semibold">时间 (UTC)</th>
                      <th className="py-2 pr-3 font-semibold">事件类型</th>
                      <th className="py-2 pr-3 font-semibold">优惠券码</th>
                      <th className="py-2 pr-3 font-semibold">自动记录详情</th>
                      <th className="py-2 font-semibold">操作人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efefef]">
                    {logs.map((log) => {
                      const badge = LOG_EVENT_BADGE[log.eventType] ?? {
                        label: log.eventType,
                        className: "bg-[#f3f4f6] text-[#374151]",
                      };
                      return (
                        <tr key={log.id}>
                          <td className="py-2.5 pr-3 font-mono whitespace-nowrap text-[#616161]">
                            {formatShortTime(log.createdAt)}
                          </td>
                          <td className="py-2.5 pr-3 whitespace-nowrap">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 font-mono font-bold text-[#1a1a1a]">
                            <button
                              type="button"
                              onClick={() =>
                                void handleLookup(undefined, log.couponCode)
                              }
                              className="underline decoration-[#c9cccf] underline-offset-2 hover:text-[#b8251c]"
                            >
                              {log.couponCode}
                            </button>
                          </td>
                          <td className="py-2.5 pr-3 text-[#1a1a1a]">
                            <div>{log.detail}</div>
                            {log.customerEmail && (
                              <div className="text-[11px] text-[#616161]">
                                {log.customerEmail}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 whitespace-nowrap text-[#616161]">
                            {log.actor}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : tabFilteredCoupons.length === 0 ? (
          <p className="py-8 text-center text-xs text-[#616161]">
            当前分类下暂无优惠券记录。
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#e3e3e3] text-[#616161]">
                  <th className="py-2 pr-3 font-semibold">核销码</th>
                  <th className="py-2 pr-3 font-semibold">当前状态</th>
                  <th className="py-2 pr-3 font-semibold">优惠内容</th>
                  <th className="py-2 pr-3 font-semibold">顾客邮箱 / 称呼</th>
                  <th className="py-2 pr-3 font-semibold">有效期 / 核销时间</th>
                  <th className="py-2 text-right font-semibold">一键操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efefef]">
                {tabFilteredCoupons.map((item) => {
                  const badge = STATUS_BADGE[item.effectiveStatus];
                  return (
                    <tr key={item.id}>
                      <td className="py-3 pr-3 font-mono text-sm font-extrabold text-[#1a1a1a]">
                        <button
                          type="button"
                          onClick={() =>
                            void handleLookup(undefined, item.couponCode)
                          }
                          className="underline decoration-[#c9cccf] underline-offset-2 hover:text-[#b8251c]"
                        >
                          {item.couponCode}
                        </button>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 pr-3 font-semibold text-[#1a1a1a]">
                        <div>{item.discountLabelZh}</div>
                        <div className="text-[11px] font-normal text-[#616161]">
                          {item.source === "voucher" ? "🎁 专属派券" : "新客首单券"}
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-[#303030]">
                        <div className="font-medium">{item.email}</div>
                        {item.customerName && (
                          <div className="text-[11px] text-[#616161]">
                            {item.customerName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-3 tabular-nums text-[#616161]">
                        {item.effectiveStatus === "redeemed" ? (
                          <span className="font-semibold text-[#374151]">
                            用券于 {formatShortTime(item.redeemedAt)}
                          </span>
                        ) : (
                          <span>至 {item.expiresAt.slice(0, 10)}</span>
                        )}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        {item.effectiveStatus === "active" ? (
                          <button
                            type="button"
                            disabled={isRedeeming}
                            onClick={() =>
                              void handleAction(item.couponCode, "redeem")
                            }
                            className="rounded-lg bg-[#15803d] px-3.5 py-2 text-xs font-extrabold text-white shadow-2xs hover:bg-[#166534] disabled:opacity-50"
                          >
                            一键核销
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              void handleLookup(undefined, item.couponCode)
                            }
                            className="rounded-lg border border-[#d4d4d4] px-2.5 py-1 text-[11px] font-semibold text-[#616161] hover:bg-[#f5f5f5]"
                          >
                            查看详情
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Collapsible Tool 1: Manual VIP / Compensation Voucher Issuance ── */}
      <div className="rounded-2xl border border-[#e3e3e3] bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => setShowIssuePanel((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Gift className="h-4 w-4 text-[#b8251c]" />
            <div>
              <h2 className="text-sm font-bold text-[#1a1a1a]">
                手动给熟客 / 节日活动派发专属优惠券
              </h2>
              <p className="text-xs text-[#616161]">
                输入顾客邮箱即可直接发券到对方的「我的优惠券」卡包（支持同一顾客拥有多张券）
              </p>
            </div>
          </div>
          {showIssuePanel ? (
            <ChevronUp className="h-4 w-4 text-[#616161]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#616161]" />
          )}
        </button>

        {showIssuePanel && (
          <form
            onSubmit={(e) => void handleIssueVoucher(e)}
            className="space-y-3.5 border-t border-[#efefef] p-5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  顾客电子邮箱（必填）
                </label>
                <input
                  type="email"
                  required
                  value={issueEmail}
                  onChange={(e) => setIssueEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  顾客称呼（选填）
                </label>
                <input
                  type="text"
                  value={issueName}
                  onChange={(e) => setIssueName(e.target.value)}
                  placeholder="如：王先生 / Sarah"
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  立减金额标签（中文）
                </label>
                <input
                  type="text"
                  required
                  value={issueDiscountZh}
                  onChange={(e) => setIssueDiscountZh(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  Discount Badge (EN)
                </label>
                <input
                  type="text"
                  required
                  value={issueDiscountEn}
                  onChange={(e) => setIssueDiscountEn(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  券名称（中文）
                </label>
                <input
                  type="text"
                  required
                  value={issueTitleZh}
                  onChange={(e) => setIssueTitleZh(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  Voucher Title (EN)
                </label>
                <input
                  type="text"
                  required
                  value={issueTitleEn}
                  onChange={(e) => setIssueTitleEn(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  有效天数
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={issueValidDays}
                  onChange={(e) =>
                    setIssueValidDays(Number(e.target.value) || 30)
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!writable || isIssuing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#b8251c] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[#991b14] disabled:opacity-50"
            >
              {isIssuing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              立即派发到顾客卡包
            </button>
          </form>
        )}
      </div>

      {/* ── Collapsible Tool 2: Website Welcome Campaign Settings ── */}
      <div className="rounded-2xl border border-[#e3e3e3] bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => setShowConfigPanel((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Settings2 className="h-4 w-4 text-[#1a1a1a]" />
            <div>
              <h2 className="text-sm font-bold text-[#1a1a1a]">
                网站「新客首单领券」活动开关与规则设置
              </h2>
              <p className="text-xs text-[#616161]">
                当前状态：{couponConfig.enabled ? "🟢 开启中" : "⚪ 已暂停"} ·{" "}
                {couponConfig.discountLabel.zh}（有效期 {couponConfig.validDays}{" "}
                天）
              </p>
            </div>
          </div>
          {showConfigPanel ? (
            <ChevronUp className="h-4 w-4 text-[#616161]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#616161]" />
          )}
        </button>

        {showConfigPanel && (
          <form
            onSubmit={(e) => void handleSaveConfig(e)}
            className="space-y-4 border-t border-[#efefef] p-5"
          >
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-3.5">
              <div>
                <p className="text-xs font-bold text-[#1a1a1a] sm:text-sm">
                  开启全站「新客首单领券」活动与进站自动弹窗
                </p>
                <p className="mt-0.5 text-xs text-[#616161]">
                  关闭后前台将隐藏领券横幅与弹窗；已发出的未过期券仍可正常扫码核销。
                </p>
              </div>
              <input
                type="checkbox"
                checked={couponConfig.enabled}
                onChange={(e) =>
                  setCouponConfig({
                    ...couponConfig,
                    enabled: e.target.checked,
                  })
                }
                className="h-5 w-5 shrink-0 accent-[#1a1a1a]"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  活动标题（中文）
                </label>
                <input
                  type="text"
                  value={couponConfig.title.zh}
                  onChange={(e) =>
                    setCouponConfig({
                      ...couponConfig,
                      title: { ...couponConfig.title, zh: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  Campaign Title (EN)
                </label>
                <input
                  type="text"
                  value={couponConfig.title.en}
                  onChange={(e) =>
                    setCouponConfig({
                      ...couponConfig,
                      title: { ...couponConfig.title, en: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  优惠金额/福利标签（中文）
                </label>
                <input
                  type="text"
                  value={couponConfig.discountLabel.zh}
                  onChange={(e) =>
                    setCouponConfig({
                      ...couponConfig,
                      discountLabel: {
                        ...couponConfig.discountLabel,
                        zh: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  Discount Badge (EN)
                </label>
                <input
                  type="text"
                  value={couponConfig.discountLabel.en}
                  onChange={(e) =>
                    setCouponConfig({
                      ...couponConfig,
                      discountLabel: {
                        ...couponConfig.discountLabel,
                        en: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  说明文案（中文）
                </label>
                <input
                  type="text"
                  value={couponConfig.subtitle.zh}
                  onChange={(e) =>
                    setCouponConfig({
                      ...couponConfig,
                      subtitle: {
                        ...couponConfig.subtitle,
                        zh: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  Subtitle (EN)
                </label>
                <input
                  type="text"
                  value={couponConfig.subtitle.en}
                  onChange={(e) =>
                    setCouponConfig({
                      ...couponConfig,
                      subtitle: {
                        ...couponConfig.subtitle,
                        en: e.target.value,
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  领券有效天数（1 - 365 天）
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={couponConfig.validDays}
                  onChange={(e) =>
                    setCouponConfig({
                      ...couponConfig,
                      validDays: Number(e.target.value) || 14,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  每张券可用次数（建议保持 1 次防薅）
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={couponConfig.maxUses}
                  onChange={(e) =>
                    setCouponConfig({
                      ...couponConfig,
                      maxUses: Number(e.target.value) || 1,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!writable || isSavingConfig}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1a1a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#303030] disabled:opacity-50"
            >
              {isSavingConfig ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <Ticket className="h-3.5 w-3.5" />
              保存活动规则
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
