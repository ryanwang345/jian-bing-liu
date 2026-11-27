"use client";

import { useState } from "react";
import {
  Ban,
  CheckCircle2,
  Loader2,
  QrCode,
  Save,
  Search,
  Ticket,
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
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

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

  const handleLookup = async (event?: React.FormEvent, overrideCode?: string) => {
    event?.preventDefault();
    const target = (overrideCode ?? codeInput).trim().toUpperCase();
    if (!target) return;
    setCodeInput(target);
    setIsLookingUp(true);
    setFeedback(null);

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
        setFeedback({
          type: "error",
          text: `未找到核销码 ${target}，请确认是否输入正确。`,
        });
        return;
      }
      setSelectedCoupon(data.coupon);
    } catch {
      setFeedback({ type: "error", text: "查询失败，请重试。" });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAction = async (code: string, action: "redeem" | "void") => {
    setIsRedeeming(true);
    setFeedback(null);
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
      setFeedback({
        type: "success",
        text:
          action === "redeem"
            ? `核销成功！${code} 已记录使用（${data.coupon?.usedCount ?? 1}/${data.coupon?.maxUses ?? 1} 次）。`
            : data.message || `已作废 ${code}。`,
      });
      await refreshAll(code);
    } catch {
      setFeedback({ type: "error", text: "网络错误，请重试。" });
    } finally {
      setIsRedeeming(false);
    }
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

  return (
    <div className="space-y-5 pb-16">
      <div>
        <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">
          新客优惠券与到店核销
        </h1>
        <p className="mt-1 text-xs text-[#616161] sm:text-sm">
          扫描顾客出示的二维码或输入券码即可实时验真与核销，所有使用次数与有效期均由 D1 数据库原子锁死。
        </p>
      </div>

      {!writable && (
        <p
          role="status"
          className="rounded-xl border border-[#ffd6a4] bg-[#fff5ea] p-3.5 text-xs font-medium text-[#8a5000]"
        >
          当前未检测到 Cloudflare D1 数据库绑定，请先应用数据库迁移后再使用核销功能。
        </p>
      )}

      {feedback && (
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

      {/* Quick lookup & redeem */}
      <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-[#1a1a1a]" aria-hidden="true" />
          <h2 className="text-sm font-bold text-[#1a1a1a]">
            扫码 / 输码核销验证
          </h2>
        </div>

        <form onSubmit={(e) => void handleLookup(e)} className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="输入核销码，例如 JBL-7K3M2A"
            className="min-w-[220px] flex-1 rounded-lg border border-[#c9cccf] px-3 py-2 font-mono text-sm font-semibold uppercase text-[#1a1a1a]"
          />
          <button
            type="submit"
            disabled={!writable || isLookingUp}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#303030] disabled:opacity-50"
          >
            {isLookingUp ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            查询券码
          </button>
        </form>

        {selectedCoupon && (
          <div className="mt-4 rounded-xl border border-[#dcdcdc] bg-[#fafafa] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-extrabold tracking-wider text-[#1a1a1a]">
                    {selectedCoupon.couponCode}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_BADGE[selectedCoupon.effectiveStatus].className}`}
                  >
                    {STATUS_BADGE[selectedCoupon.effectiveStatus].label}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#303030]">
                  {selectedCoupon.discountLabelZh} · {selectedCoupon.offerTitleZh}
                </p>
                <p className="mt-1 text-xs text-[#616161]">
                  顾客：{selectedCoupon.customerName || "未填称呼"}（{selectedCoupon.email}）
                </p>
                <p className="mt-0.5 text-xs text-[#616161]">
                  已用次数：{selectedCoupon.usedCount} / {selectedCoupon.maxUses} 次 · 有效期至：{selectedCoupon.expiresAt.slice(0, 10)} UTC
                </p>
                {selectedCoupon.redeemedAt && (
                  <p className="mt-0.5 text-xs text-[#616161]">
                    最近核销：{selectedCoupon.redeemedAt}（操作人：{selectedCoupon.redeemedBy || "admin"}）
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={
                    !writable ||
                    isRedeeming ||
                    selectedCoupon.effectiveStatus !== "active"
                  }
                  onClick={() => void handleAction(selectedCoupon.couponCode, "redeem")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#135e18] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0f4a12] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isRedeeming ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  确认核销使用
                </button>

                {selectedCoupon.status !== "void" && (
                  <button
                    type="button"
                    disabled={!writable || isRedeeming}
                    onClick={() => void handleAction(selectedCoupon.couponCode, "void")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-3 py-2 text-xs font-semibold text-[#8e1f0b] hover:bg-[#fff2f0] disabled:opacity-45"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    作废此券
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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
              在网站首页展示「新客首单领券」活动
            </p>
            <p className="mt-0.5 text-xs text-[#616161]">
              关闭后首页会隐藏领券卡片并暂停发放新券；已发放但未过期的券仍可在后台正常核销。
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
              每张券可用次数（1 - 10 次）
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
          <h2 className="text-sm font-bold text-[#1a1a1a]">
            领券记录 ({filteredCoupons.length})
          </h2>
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
                  <th className="py-2 pr-3 font-semibold">有效期至 (UTC)</th>
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
                            className="rounded-md bg-[#135e18] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#0f4a12] disabled:opacity-50"
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
