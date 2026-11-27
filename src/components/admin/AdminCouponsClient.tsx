"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Camera,
  CheckCircle2,
  Download,
  Loader2,
  QrCode,
  RotateCcw,
  Save,
  Search,
  Ticket,
  X,
  XCircle,
} from "lucide-react";
import type { SiteContentConfig, WelcomeCouponConfig } from "@/data/site-content";
import type {
  CouponEffectiveStatus,
  CouponStatsSummary,
  WelcomeCouponRecord,
} from "@/lib/coupon-service";

interface AdminCouponsClientProps {
  writable: boolean;
  initialCoupons: WelcomeCouponRecord[];
  initialStats: CouponStatsSummary;
  initialLookup: WelcomeCouponRecord | null;
  initialQueryCode: string;
  initialSiteContent: SiteContentConfig;
}

const STATUS_BADGE: Record<
  CouponEffectiveStatus,
  { label: string; className: string }
> = {
  active: {
    label: "可使用",
    className: "bg-[#d1f7c4] text-[#135e18]",
  },
  redeemed: {
    label: "已核销",
    className: "bg-[#e3e3e3] text-[#4a4a4a]",
  },
  expired: {
    label: "已过期",
    className: "bg-[#ffebc4] text-[#8a5000]",
  },
  void: {
    label: "已作废",
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

export function AdminCouponsClient({
  writable,
  initialCoupons,
  initialStats,
  initialLookup,
  initialQueryCode,
  initialSiteContent,
}: AdminCouponsClientProps) {
  const [coupons, setCoupons] = useState<WelcomeCouponRecord[]>(initialCoupons);
  const [stats, setStats] = useState<CouponStatsSummary>(initialStats);
  const [codeInput, setCodeInput] = useState(initialQueryCode);
  const [selectedCoupon, setSelectedCoupon] =
    useState<WelcomeCouponRecord | null>(initialLookup);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(
    initialQueryCode && !initialLookup ? initialQueryCode : null
  );
  const [justRedeemedCode, setJustRedeemedCode] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Camera scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [siteContent, setSiteContent] = useState(initialSiteContent);
  const [couponConfig, setCouponConfig] = useState<WelcomeCouponConfig>(() =>
    structuredClone(initialSiteContent.welcomeCoupon)
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const refreshAll = async (focusCode?: string) => {
    const res = await fetch("/api/admin/coupons", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      coupons: WelcomeCouponRecord[];
      stats: CouponStatsSummary;
    };
    setCoupons(data.coupons);
    setStats(data.stats);
    if (focusCode) {
      const updated = data.coupons.find((c) => c.couponCode === focusCode);
      if (updated) setSelectedCoupon(updated);
    }
  };

  const handleLookup = async (
    event?: React.FormEvent,
    overrideCode?: string
  ) => {
    event?.preventDefault();
    const raw = (overrideCode ?? codeInput).trim().toUpperCase().replace(/\s+/g, "");
    if (!raw) return;
    const target = raw.startsWith("JBL-") ? raw : `JBL-${raw}`;
    setCodeInput(target);
    setIsLookingUp(true);
    setFeedback(null);
    setNotFoundCode(null);
    setJustRedeemedCode(null);

    try {
      const res = await fetch(
        `/api/admin/coupons?code=${encodeURIComponent(target)}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        coupon?: WelcomeCouponRecord | null;
      };
      if (!res.ok || !data.coupon) {
        setSelectedCoupon(null);
        setNotFoundCode(target);
        return;
      }
      setSelectedCoupon(data.coupon);
    } catch {
      setFeedback({ type: "error", text: "网络查询失败，请重试。" });
    } finally {
      setIsLookingUp(false);
    }
  };

  // In-browser camera QR scanner via native BarcodeDetector (supported on Chrome/Android & modern Safari)
  useEffect(() => {
    if (!scannerOpen) return;
    let stream: MediaStream | null = null;
    let rafId = 0;
    let stopped = false;

    const startCamera = async () => {
      setScannerError(null);
      const BarcodeDetectorCtor = (
        window as unknown as {
          BarcodeDetector?: new (opts: { formats: string[] }) => {
            detect: (
              source: HTMLVideoElement
            ) => Promise<Array<{ rawValue?: string }>>;
          };
        }
      ).BarcodeDetector;

      if (!BarcodeDetectorCtor) {
        setScannerError(
          "当前浏览器不支持页内扫码——请直接打开苹果手机自带「相机 App」对准顾客二维码，点击顶部弹出的黄色链接即可秒进核销！"
        );
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerError("无法调用摄像头权限，请直接使用手机系统「相机 App」扫码。");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
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

        const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
        const tick = async () => {
          if (stopped) return;
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const results = await detector.detect(videoRef.current);
              const firstVal = results[0]?.rawValue;
              if (firstVal) {
                const parsedCode = extractCouponCodeFromScan(firstVal);
                if (parsedCode) {
                  stopped = true;
                  setScannerOpen(false);
                  void handleLookup(undefined, parsedCode);
                  return;
                }
              }
            } catch {
              // Ignore transient frame errors
            }
          }
          rafId = window.requestAnimationFrame(() => void tick());
        };
        rafId = window.requestAnimationFrame(() => void tick());
      } catch {
        setScannerError(
          "摄像头未授权。您也可以直接用手机系统「相机 App」扫顾客二维码自动跳回本页核销！"
        );
      }
    };

    void startCamera();

    return () => {
      stopped = true;
      if (rafId) window.cancelAnimationFrame(rafId);
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
      !window.confirm(`确定要撤销刚刚对 ${code} 的核销，将其恢复为「可使用」状态吗？`)
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
          text: data.message || "操作失败，请检查券状态。",
        });
        await refreshAll(code);
        return;
      }

      if (data.coupon) setSelectedCoupon(data.coupon);
      if (action === "redeem") {
        setJustRedeemedCode(code);
      } else {
        setJustRedeemedCode(null);
      }

      setFeedback({
        type: "success",
        text:
          action === "redeem"
            ? `✅ 核销成功！${code} 已完成核销，本单可为顾客立减（已记录使用 ${data.coupon?.usedCount ?? 1}/${data.coupon?.maxUses ?? 1} 次）。`
            : data.message || `操作成功（${code}）。`,
      });
      await refreshAll(code);
    } catch {
      setFeedback({ type: "error", text: "网络错误，请重试。" });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleExportOptInCsv = () => {
    const optedIn = coupons.filter((c) => c.marketingOptIn);
    const header = "email,customer_name,coupon_code,status,created_at,redeemed_at\n";
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
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jianbingliu-marketing-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
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
        text: "新客领券活动设置已保存并实时生效。",
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

  const filteredCoupons = coupons.filter((item) => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      item.couponCode.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q)
    );
  });

  const optInCount = coupons.filter((c) => c.marketingOptIn).length;

  return (
    <div className="space-y-5 pb-16">
      <div>
        <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">
          柜台优惠券极速核销
        </h1>
        <p className="mt-1 text-xs text-[#616161] sm:text-sm">
          最省心用法：直接打开手机自带「相机」对准顾客二维码，点弹出的链接即可自动验真；也可在下方点「打开相机扫码」或只输后 6 位券码。
        </p>
      </div>

      {!writable && (
        <p
          role="status"
          className="rounded-xl border border-[#ffd6a4] bg-[#fff5ea] p-3.5 text-xs font-medium text-[#8a5000]"
        >
          当前未检测到 Cloudflare D1 数据库绑定，请先连接 D1 数据库后再使用核销功能。
        </p>
      )}

      {/* ── Giant Counter Traffic-Light Verification Result ── */}
      {notFoundCode && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-[#d82c0d] bg-[#fff0ef] p-5 text-[#8e1f0b] shadow-md sm:p-6"
        >
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-8 w-8 shrink-0 text-[#d82c0d]" />
            <div>
              <p className="text-lg font-extrabold text-[#b91c1c] sm:text-xl">
                ❌ 查无此券码（{notFoundCode}）！切勿减免！
              </p>
              <p className="mt-1 text-sm font-medium">
                系统里不存在这个号码，请核对是否输错字母，并谨防顾客使用假截图。
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedCoupon && (
        <div
          className={`rounded-2xl border-2 p-5 shadow-md sm:p-6 ${
            selectedCoupon.effectiveStatus === "active"
              ? "border-[#135e18] bg-[#ecfdf3]"
              : justRedeemedCode === selectedCoupon.couponCode
                ? "border-[#047b5d] bg-[#e6f7f2]"
                : "border-[#d82c0d] bg-[#fff0ef]"
          }`}
        >
          {selectedCoupon.effectiveStatus === "active" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-[#135e18]" />
                  <div>
                    <p className="text-xl font-extrabold text-[#135e18] sm:text-2xl">
                      ✅ 有效可用 · {selectedCoupon.discountLabelZh}
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold tracking-wider text-[#1a1a1a]">
                      券码：{selectedCoupon.couponCode}
                    </p>
                    <p className="mt-1 text-xs text-[#374151] sm:text-sm">
                      顾客：{selectedCoupon.customerName || "未填称呼"}（{selectedCoupon.email}） · 有效期至 {selectedCoupon.expiresAt.slice(0, 10)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#f59e0b]/45 bg-[#fffbeb] px-3.5 py-2.5 text-xs font-bold text-[#92400e] sm:text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#d97706]" />
                <span>
                  核销前请确认：顾客是在柜台直接点餐、且本单金额已满 £10（饭团等外卖平台订单不可使用）
                </span>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  disabled={!writable || isRedeeming}
                  onClick={() =>
                    void handleAction(selectedCoupon.couponCode, "redeem")
                  }
                  className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#135e18] px-6 py-3.5 text-base font-extrabold text-white shadow-md transition-colors hover:bg-[#0f4a12] active:scale-[0.99] disabled:opacity-50 sm:text-lg"
                >
                  {isRedeeming ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  点此一键确认核销（{selectedCoupon.discountLabelZh}）
                </button>

                <button
                  type="button"
                  disabled={!writable || isRedeeming}
                  onClick={() =>
                    void handleAction(selectedCoupon.couponCode, "void")
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d4d4d4] bg-white px-4 py-3 text-xs font-semibold text-[#8e1f0b] hover:bg-[#fff2f0] disabled:opacity-45"
                >
                  <Ban className="h-4 w-4" />
                  作废此券
                </button>
              </div>
            </div>
          ) : justRedeemedCode === selectedCoupon.couponCode ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-[#047b5d]" />
                <div>
                  <p className="text-xl font-extrabold text-[#065f46] sm:text-2xl">
                    🎉 刚刚核销成功！请为顾客立减（{selectedCoupon.discountLabelZh}）
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#1f2937]">
                    券码 <span className="font-mono font-bold">{selectedCoupon.couponCode}</span> 已锁死失效，无法再被二次使用。
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#9ca3af] bg-white px-3.5 py-2 text-xs font-semibold text-[#374151] hover:bg-[#f3f4f6]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  点错了？撤销刚刚这次核销
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-8 w-8 shrink-0 text-[#d82c0d]" />
                <div>
                  <p className="text-xl font-extrabold text-[#b91c1c] sm:text-2xl">
                    ❌ 不可使用！切勿给顾客减免！
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#7f1d1d] sm:text-base">
                    {selectedCoupon.effectiveStatus === "redeemed"
                      ? `原因：这张券（${selectedCoupon.couponCode}）已经在 ${selectedCoupon.redeemedAt ?? "之前"} 用过了（${selectedCoupon.usedCount}/${selectedCoupon.maxUses} 次）！`
                      : selectedCoupon.effectiveStatus === "expired"
                        ? `原因：这张券（${selectedCoupon.couponCode}）已于 ${selectedCoupon.expiresAt.slice(0, 10)} 过期！`
                        : `原因：这张券（${selectedCoupon.couponCode}）已被作废！`}
                  </p>
                  <p className="mt-1 text-xs text-[#7f1d1d]/85">
                    登记邮箱：{selectedCoupon.email}
                    {selectedCoupon.redeemedBy
                      ? ` · 上次核销人：${selectedCoupon.redeemedBy}`
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#fca5a5] bg-white px-3 py-1.5 text-xs font-semibold text-[#7f1d1d] hover:bg-[#fef2f2]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    如果是店员刚刚误点核销，点此恢复可用
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {feedback && !justRedeemedCode && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-xs font-semibold sm:text-sm ${
            feedback.type === "success"
              ? "border-[#95d5b2] bg-[#edfbf1] text-[#135e18]"
              : "border-[#f3b6b0] bg-[#fff2f0] text-[#8e1f0b]"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* ── Quick Scan & Shorthand Lookup Box ── */}
      <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-[#1a1a1a]" aria-hidden="true" />
            <h2 className="text-sm font-bold text-[#1a1a1a]">
              扫码或输入后 6 位券码查询
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setScannerOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#b8251c] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#921b14]"
          >
            {scannerOpen ? (
              <>
                <X className="h-3.5 w-3.5" />
                关闭摄像头
              </>
            ) : (
              <>
                <Camera className="h-3.5 w-3.5" />
                打开相机扫二维码
              </>
            )}
          </button>
        </div>

        {scannerOpen && (
          <div className="mt-3 overflow-hidden rounded-xl border border-[#dcdcdc] bg-[#1a1a1a] p-3 text-white">
            {scannerError ? (
              <p className="p-2 text-xs leading-relaxed text-[#ffd6a4]">
                {scannerError}
              </p>
            ) : (
              <div className="space-y-2 text-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="mx-auto max-h-64 w-full max-w-sm rounded-lg bg-black object-cover"
                />
                <p className="text-xs text-[#d4d4d4]">
                  请将顾客手机上的优惠券二维码对准画面中央，识别后会自动跳出结果
                </p>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => void handleLookup(e)}
          className="mt-3 flex flex-wrap gap-2"
        >
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="只需输后 6 位（如 7K3M2A）或 JBL-7K3M2A"
            className="min-w-[210px] flex-1 rounded-lg border border-[#c9cccf] px-3.5 py-2.5 font-mono text-sm font-bold uppercase text-[#1a1a1a]"
          />
          <button
            type="submit"
            disabled={!writable || isLookingUp}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#303030] disabled:opacity-50"
          >
            {isLookingUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            查询验真
          </button>
        </form>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#e3e3e3] bg-white p-4">
          <p className="text-xs text-[#616161]">累计发券</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#1a1a1a]">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-[#e3e3e3] bg-white p-4">
          <p className="text-xs text-[#616161]">待使用（有效中）</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#135e18]">
            {stats.active}
          </p>
        </div>
        <div className="rounded-xl border border-[#e3e3e3] bg-white p-4">
          <p className="text-xs text-[#616161]">已到店核销</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#1a1a1a]">
            {stats.redeemed}
          </p>
        </div>
        <div className="rounded-xl border border-[#e3e3e3] bg-white p-4">
          <p className="text-xs text-[#616161]">已过期 / 作废</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#8a5000]">
            {stats.expired + stats.voided}
          </p>
        </div>
      </div>

      {/* Campaign rules editor */}
      <form
        onSubmit={(e) => void handleSaveConfig(e)}
        className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-[#1a1a1a]" aria-hidden="true" />
            <h2 className="text-sm font-bold text-[#1a1a1a]">
              活动开关与领券规则设置
            </h2>
          </div>

          <button
            type="submit"
            disabled={!writable || isSavingConfig}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#303030] disabled:opacity-50"
          >
            {isSavingConfig ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            保存活动规则
          </button>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-3.5">
          <div>
            <p className="text-xs font-bold text-[#1a1a1a] sm:text-sm">
              开启全站「新客首单领券」活动与进站弹窗
            </p>
            <p className="mt-0.5 text-xs text-[#616161]">
              关闭后前台将隐藏领券横幅与自动弹窗并暂停发新券；已发放未过期的券仍可正常扫码核销。
            </p>
          </div>
          <input
            type="checkbox"
            checked={couponConfig.enabled}
            onChange={(e) =>
              setCouponConfig({ ...couponConfig, enabled: e.target.checked })
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
                  subtitle: { ...couponConfig.subtitle, zh: e.target.value },
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
                  subtitle: { ...couponConfig.subtitle, en: e.target.value },
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
      </form>

      {/* Issued coupons table */}
      <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-sm font-bold text-[#1a1a1a]">
              领券记录 ({filteredCoupons.length})
            </h2>
            {optInCount > 0 && (
              <button
                type="button"
                onClick={handleExportOptInCsv}
                className="inline-flex items-center gap-1 rounded-lg border border-[#c9cccf] bg-[#fafafa] px-2.5 py-1 text-[11px] font-semibold text-[#303030] hover:bg-[#efefef]"
              >
                <Download className="h-3 w-3" />
                导出订阅顾客邮箱 CSV ({optInCount})
              </button>
            )}
          </div>
          <input
            type="search"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="按券码 / 邮箱 / 称呼筛选..."
            className="w-full max-w-xs rounded-lg border border-[#c9cccf] px-3 py-1.5 text-xs text-[#1a1a1a]"
          />
        </div>

        {filteredCoupons.length === 0 ? (
          <p className="mt-4 text-xs text-[#616161]">暂无领券记录。</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#e3e3e3] text-[#616161]">
                  <th className="py-2 pr-3 font-semibold">核销码</th>
                  <th className="py-2 pr-3 font-semibold">状态</th>
                  <th className="py-2 pr-3 font-semibold">顾客邮箱 / 称呼</th>
                  <th className="py-2 pr-3 font-semibold">次数</th>
                  <th className="py-2 pr-3 font-semibold">有效期至</th>
                  <th className="py-2 text-right font-semibold">快捷操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efefef]">
                {filteredCoupons.map((item) => {
                  const badge = STATUS_BADGE[item.effectiveStatus];
                  return (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-3 font-mono font-bold text-[#1a1a1a]">
                        <button
                          type="button"
                          onClick={() => void handleLookup(undefined, item.couponCode)}
                          className="underline decoration-[#c9cccf] underline-offset-2 hover:text-[#9c2d1d]"
                        >
                          {item.couponCode}
                        </button>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-[#303030]">
                        <div>{item.email}</div>
                        {item.customerName && (
                          <div className="text-[11px] text-[#616161]">
                            {item.customerName}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-[#303030]">
                        {item.usedCount} / {item.maxUses}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-[#616161]">
                        {item.expiresAt.slice(0, 10)}
                      </td>
                      <td className="py-2.5 text-right">
                        {item.effectiveStatus === "active" ? (
                          <button
                            type="button"
                            disabled={isRedeeming}
                            onClick={() =>
                              void handleAction(item.couponCode, "redeem")
                            }
                            className="rounded-md bg-[#135e18] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0f4a12] disabled:opacity-50"
                          >
                            核销
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#8c8c8c]">—</span>
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
    </div>
  );
}
