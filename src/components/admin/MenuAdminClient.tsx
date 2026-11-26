"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  MailCheck,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { AdminCategoriesView } from "@/components/admin/AdminCategoriesView";
import { AdminCustomizerView } from "@/components/admin/AdminCustomizerView";
import { AdminGalleryView } from "@/components/admin/AdminGalleryView";
import { AdminOverviewView } from "@/components/admin/AdminOverviewView";
import {
  AdminProductEditor,
  itemToFormState,
  type DishFormState,
} from "@/components/admin/AdminProductEditor";
import { AdminProductsView } from "@/components/admin/AdminProductsView";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";
import { AdminThemesView } from "@/components/admin/AdminThemesView";
import {
  ShopifyAdminShell,
  type MainAdminTab,
} from "@/components/admin/ShopifyAdminShell";
import type { MenuCategory, MenuItem } from "@/data/menu";
import { defaultSiteContent, type SiteContentConfig } from "@/data/site-content";
import type { AdminSessionStatus } from "@/lib/admin-auth";
import {
  FESTIVAL_THEME_CSS_PROPS,
  getFestivalThemeCssVars,
} from "@/data/festivals";
import type { ActiveFestivalThemeState } from "@/lib/festival-theme-service";
import type { FestivalBannerText } from "@/data/festival-banners";
import type { AdminMenuSnapshot, BulkMenuAction } from "@/lib/menu-service";

interface MenuAdminClientProps {
  initialSession: AdminSessionStatus;
  initialSnapshot: AdminMenuSnapshot | null;
  initialFestivalTheme?: ActiveFestivalThemeState | null;
  initialSiteContent?: SiteContentConfig | null;
  initialTab?: MainAdminTab;
}

export function MenuAdminClient({
  initialSession,
  initialSnapshot,
  initialFestivalTheme = null,
  initialSiteContent = null,
  initialTab = "products",
}: MenuAdminClientProps) {
  const [session] = useState<AdminSessionStatus>(initialSession);
  const [snapshot, setSnapshot] = useState<AdminMenuSnapshot | null>(
    initialSnapshot
  );
  const [festivalTheme, setFestivalTheme] =
    useState<ActiveFestivalThemeState | null>(initialFestivalTheme);
  const [siteContent, setSiteContent] = useState<SiteContentConfig>(
    initialSiteContent ?? defaultSiteContent
  );
  const [contentRevision, setContentRevision] = useState(0);

  // Navigation & Editor state
  const [activeTab, setActiveTab] = useState<MainAdminTab>(initialTab);
  const [productsCategoryJump, setProductsCategoryJump] =
    useState<string>("all");
  const [editorForm, setEditorForm] = useState<DishFormState | null>(null);

  // Loading state
  const [isBusy, setIsBusy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    window.setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const selectTab = (tab: MainAdminTab) => {
    setEditorForm(null);
    setActiveTab(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === "products") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.replaceState({}, "", url.pathname + url.search);
    } catch {
      // Ignore history restrictions
    }
  };

  const applyThemeToDocument = (state: ActiveFestivalThemeState) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const active = state.activeFestival;
    if (!active) {
      root.dataset.festivalTheme = "default";
      FESTIVAL_THEME_CSS_PROPS.forEach((p) => root.style.removeProperty(p));
      return;
    }

    root.dataset.festivalTheme = active.id;
    const vars = getFestivalThemeCssVars(active.theme);
    for (const [prop, val] of Object.entries(vars)) {
      root.style.setProperty(prop, val);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => null);
    window.location.assign(session.logoutUrl || "/cdn-cgi/access/logout");
  };

  const handleSeedDatabase = async () => {
    setIsBusy(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        seeded?: { categories: number; items: number; variants: number };
        snapshot?: AdminMenuSnapshot;
      };
      if (!res.ok) {
        showToast("error", data.error || "导入失败");
        return;
      }
      if (data.snapshot) setSnapshot(data.snapshot);
      showToast(
        "success",
        `已同步 ${data.seeded?.items ?? 0} 道菜品、${data.seeded?.variants ?? 0} 个规格到 Cloudflare D1`
      );
    } catch {
      showToast("error", "请求失败，请检查网络连接");
    } finally {
      setIsBusy(false);
    }
  };

  const handleQuickToggle = async (
    item: MenuItem,
    patch: { isAvailable?: boolean; featured?: boolean }
  ) => {
    setIsBusy(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, ...patch }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        snapshot?: AdminMenuSnapshot;
      };
      if (!res.ok) {
        showToast("error", data.error || "更新失败");
        return;
      }
      if (data.snapshot) setSnapshot(data.snapshot);
      showToast(
        "success",
        patch.isAvailable === false
          ? `「${item.name.zh}」已标记售罄`
          : patch.isAvailable === true
            ? `「${item.name.zh}」已恢复供应`
            : `已更新「${item.name.zh}」`
      );
    } catch {
      showToast("error", "更新失败");
    } finally {
      setIsBusy(false);
    }
  };

  const handleRunBulkAction = async (
    action: BulkMenuAction,
    successText: string
  ) => {
    setIsBusy(true);
    try {
      const res = await fetch("/api/admin/menu/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        snapshot?: AdminMenuSnapshot;
      };
      if (!res.ok || !data.snapshot) {
        showToast("error", data.error || "操作失败");
        return;
      }
      setSnapshot(data.snapshot);
      showToast("success", successText);
    } catch {
      showToast("error", "网络错误，操作未成功");
    } finally {
      setIsBusy(false);
    }
  };

  const handleSaveEditor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editorForm) return;

    const parsedVariants = editorForm.variants
      .filter((v) => v.pricePounds.trim() !== "")
      .map((v) => ({
        id: v.id,
        sizeEn: v.sizeEn.trim() || "Regular",
        sizeZh: v.sizeZh.trim() || "标准",
        pricePence: Math.round(Number.parseFloat(v.pricePounds) * 100),
        isDefault: v.isDefault,
      }))
      .filter((v) => Number.isFinite(v.pricePence) && v.pricePence >= 0);

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editorForm.id ?? editorForm.draftId,
          uploadedPhotoUrls: editorForm.uploadedPhotoUrls,
          categoryId: editorForm.categoryId,
          nameZh: editorForm.nameZh,
          nameEn: editorForm.nameEn,
          chineseName: editorForm.nameZh,
          descZh: editorForm.descZh,
          descEn: editorForm.descEn,
          noteZh: editorForm.noteZh.trim() || null,
          noteEn: editorForm.noteEn.trim() || null,
          imageUrl: editorForm.imageUrl || null,
          dietary: editorForm.dietary,
          featured: editorForm.featured,
          isAvailable: editorForm.isAvailable,
          isNew: editorForm.isNew,
          variants: parsedVariants,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        snapshot?: AdminMenuSnapshot;
      };
      if (!res.ok) {
        showToast("error", data.error || "保存失败");
        return;
      }

      if (data.snapshot) setSnapshot(data.snapshot);
      setEditorForm(null);
      showToast("success", `已保存「${editorForm.nameZh}」，前台菜单已即时同步`);

      if (festivalTheme?.setting === "auto") {
        const themeRes = await fetch("/api/admin/theme", { cache: "no-store" });
        if (themeRes.ok) {
          const nextTheme = (await themeRes.json()) as ActiveFestivalThemeState;
          setFestivalTheme(nextTheme);
          applyThemeToDocument(nextTheme);
        }
      }
    } catch {
      showToast("error", "保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCurrentEditorItem = async () => {
    if (!editorForm?.id) return;
    if (
      !window.confirm(
        `确定要永久删除「${editorForm.nameZh}」吗？如果只是今天卖完了，建议将销售状态改为「已售罄」。`
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/admin/menu?id=${encodeURIComponent(editorForm.id)}`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        snapshot?: AdminMenuSnapshot;
      };
      if (!res.ok) {
        showToast("error", data.error || "删除失败");
        return;
      }
      if (data.snapshot) setSnapshot(data.snapshot);
      const deletedName = editorForm.nameZh;
      setEditorForm(null);
      showToast("success", `已删除「${deletedName}」`);
    } catch {
      showToast("error", "删除失败");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeFestivalTheme = async (nextValue: string) => {
    setIsUpdatingTheme(true);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: nextValue }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        state?: ActiveFestivalThemeState;
      };
      if (!res.ok || !data.state) {
        showToast("error", data.error || "切换主题失败");
        return;
      }
      setFestivalTheme(data.state);
      applyThemeToDocument(data.state);
      const label = data.state.activeFestival
        ? `${data.state.activeFestival.zh}（${data.state.activeFestival.paletteName.zh}）`
        : "经典原版暖色主题";
      showToast("success", `全站已切换为：${label}`);
    } catch {
      showToast("error", "网络错误，请稍后重试");
    } finally {
      setIsUpdatingTheme(false);
    }
  };

  const handleSaveFestivalBanner = async (festivalId: string, text: FestivalBannerText): Promise<boolean> => {
    setIsUpdatingTheme(true);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festivalId, ...text }),
      });
      const data = (await res.json()) as { error?: string; state?: ActiveFestivalThemeState };
      if (!res.ok || !data.state) {
        showToast("error", data.error || "保存节日标题失败");
        return false;
      }
      setFestivalTheme(data.state);
      showToast("success", "节日标题已保存，启用该节日主题时会显示新文案");
      return true;
    } catch {
      showToast("error", "网络错误，请稍后重试");
      return false;
    } finally {
      setIsUpdatingTheme(false);
    }
  };

  const handleSaveSiteContent = async (
    nextContent: SiteContentConfig,
    successMsg = "全站内容与排版已保存生效"
  ) => {
    setIsSavingContent(true);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: nextContent }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        content?: SiteContentConfig;
      };
      if (!res.ok || !data.content) {
        showToast("error", data.error || "保存失败");
        return;
      }
      setSiteContent(data.content);
      setContentRevision((r) => r + 1);
      showToast("success", successMsg);
    } catch {
      showToast("error", "网络错误，请稍后重试");
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleResetSiteContent = async () => {
    setIsSavingContent(true);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-all" }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        content?: SiteContentConfig;
      };
      if (!res.ok || !data.content) {
        showToast("error", data.error || "恢复默认失败");
        return;
      }
      setSiteContent(data.content);
      setContentRevision((r) => r + 1);
      showToast("success", "已恢复全站默认文案、照片与板块顺序");
    } catch {
      showToast("error", "网络错误，请稍后重试");
    } finally {
      setIsSavingContent(false);
    }
  };

  const categories: MenuCategory[] = useMemo(
    () => snapshot?.categories ?? [],
    [snapshot]
  );

  const { totalProducts, soldOutProducts } = useMemo(() => {
    let total = 0;
    let soldOut = 0;
    for (const c of categories) {
      total += c.items.length;
      for (const item of c.items) {
        if (item.isAvailable === false) soldOut++;
      }
    }
    return { totalProducts: total, soldOutProducts: soldOut };
  }, [categories]);

  // ── Handcrafted Brand-Aligned Zero-Trust Staff Portal ──
  if (!session.authenticated) {
    const isAlternateHost =
      Boolean(session.requestHost) && session.requestHost !== "jianbingliu.uk";

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fbf6ec] px-4 py-12 text-[#1a1614]">
        {/* Top vermilion accent hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8f1414] via-[#b8251c] to-[#c9861f]"
        />

        {/* Warm ambient radial glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(235,176,78,0.22)_0%,rgba(184,37,28,0.06)_48%,transparent_72%)] blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 right-1/4 h-[300px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(201,134,31,0.14)_0%,transparent_70%)] blur-2xl"
        />

        <div className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-3xl border border-[#e6d7bd] bg-white/95 shadow-[0_24px_60px_-15px_rgba(26,22,20,0.12),0_2px_8px_rgba(26,22,20,0.04)] backdrop-blur-md">
          {/* Brand Header Band */}
          <div className="border-b border-[#efe4d0] bg-gradient-to-b from-[#faf2e1] via-[#fdf9f0] to-white px-7 pt-8 pb-6 text-center sm:px-8">
            <div className="mx-auto flex items-center justify-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-[#1a1614] shadow-md ring-2 ring-[#e6d7bd]">
                <Image
                  src="/images/logo.svg"
                  alt="煎饼刘 Jian Bing Liu"
                  width={56}
                  height={56}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
              <span
                aria-hidden="true"
                className="inline-flex flex-col items-center justify-center rounded-md border border-[#921b14] bg-[#b8251c] px-1.5 py-1 font-calligraphy text-xs leading-tight text-[#fbf6ec] shadow-xs"
                style={{ writingMode: "vertical-rl" }}
              >
                爱民
              </span>
            </div>

            <p className="mt-4 text-[11px] font-semibold tracking-[0.2em] text-[#b8251c] uppercase">
              Camden NW1 · Staff Portal
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#1a1614] sm:text-[26px]">
              煎饼刘 · 门店管理中心
            </h1>
            <p className="mt-1.5 text-xs text-[#6e6258]">
              管理每日菜品售罄状态、新品横幅、营业时间与店铺公告
            </p>
          </div>

          {/* Body */}
          <div className="space-y-5 px-7 py-6 sm:px-8 sm:py-7">
            {!session.configured ? (
              <div className="space-y-2.5 rounded-2xl border border-[#f3d19c] bg-[#fff8eb] p-4 text-xs leading-relaxed text-[#5e4200]">
                <p className="flex items-center gap-1.5 font-bold text-[#1a1614]">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-[#c9861f]" />
                  尚未完成云端安全网关初始化
                </p>
                <p>
                  请在部署配置中填入 <code>CF_ACCESS_TEAM_DOMAIN</code> 与{" "}
                  <code>CF_ACCESS_AUD</code> 后重新发布。
                </p>
              </div>
            ) : (
              <>
                {/* Login methods reassurance */}
                <div className="space-y-2.5 rounded-2xl border border-[#efe4d0] bg-[#fcf9f3] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#2b593c]">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#2b593c]" />
                    <span>云端零信任安全保护已开启（免记密码）</span>
                  </div>

                  <div className="grid gap-2 pt-1 text-xs text-[#594f47]">
                    <div className="flex items-start gap-2.5 rounded-xl bg-white/90 px-3 py-2 ring-1 ring-[#ede2ce]">
                      <MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b8251c]" />
                      <div>
                        <span className="font-semibold text-[#1a1614]">
                          邮箱验证码登录：
                        </span>
                        输入授权邮箱，填入收到的 6 位数字即可进入（30 天内免重复验证）
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 rounded-xl bg-white/90 px-3 py-2 ring-1 ring-[#ede2ce]">
                      <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c9861f]" />
                      <div>
                        <span className="font-semibold text-[#1a1614]">
                          Google 账号快捷登录：
                        </span>
                        支持已授权的店主 Google 账号一键验证
                      </div>
                    </div>
                  </div>
                </div>

                {session.diagnostic === "email-not-allowed" ? (
                  <div className="space-y-3 rounded-2xl border border-[#f5c2c0] bg-[#fff5f5] p-4 text-center text-xs leading-relaxed text-[#8e1f0b]">
                    <p className="font-semibold">
                      当前登录的邮箱不在门店管理员白名单中
                    </p>
                    <a
                      href="/cdn-cgi/access/logout"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8251c] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#921b14]"
                    >
                      退出并切换授权邮箱重新登录
                    </a>
                  </div>
                ) : (
                  <a
                    href="https://jianbingliu.uk/admin"
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b8251c] px-5 py-3.5 text-sm font-semibold text-[#fbf6ec] shadow-[0_8px_20px_-6px_rgba(184,37,28,0.45)] transition-all hover:-translate-y-0.5 hover:bg-[#921b14] hover:shadow-[0_12px_24px_-6px_rgba(184,37,28,0.55)] active:translate-y-0"
                  >
                    <span>前往安全登录进入后台</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                )}

                {isAlternateHost && (
                  <p className="text-center text-[11px] leading-relaxed text-[#7a6d61]">
                    当前网址为{" "}
                    <span className="font-medium text-[#312a26]">
                      {session.requestHost}
                    </span>
                    ，点击上方按钮将自动切换至主域名完成验证
                  </p>
                )}

                {!isAlternateHost &&
                  session.diagnostic &&
                  session.diagnostic !== "missing-token" &&
                  session.diagnostic !== "email-not-allowed" && (
                    <p className="text-center text-[11px] text-[#8a5000]">
                      登录凭证已过期或需刷新（{session.diagnostic}），请点击上方按钮重新验证
                    </p>
                  )}
              </>
            )}

            {process.env.NODE_ENV === "development" && (
              <p className="rounded-xl border border-dashed border-[#dcc9a6] bg-[#faf4e8] px-3 py-2 text-center text-[11px] text-[#6e5225]">
                本地开发提示：在 <code>.env.local</code> 中设置{" "}
                <code>ADMIN_DEV_BYPASS=true</code> 可免网关直接预览后台
              </p>
            )}

            <div className="border-t border-[#efe4d0] pt-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#6e6258] transition-colors hover:text-[#b8251c]"
              >
                ← 返回煎饼刘网店首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ShopifyAdminShell
      activeNav={editorForm ? "products" : activeTab}
      onSelectMainTab={selectTab}
      totalProducts={totalProducts}
      soldOutProducts={soldOutProducts}
      totalCategories={categories.length}
      hasDb={snapshot?.hasDb ?? false}
      hasR2={snapshot?.hasR2 ?? false}
      identity={session.identity}
      canLogout={Boolean(session.logoutUrl)}
      onLogout={handleLogout}
    >
      {/* Polaris Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed right-4 bottom-5 z-50 flex max-w-sm items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold text-white shadow-2xl ${
            toast.type === "success" ? "bg-[#1a1a1a]" : "bg-[#d82c0d]"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#36fba1]" />
          <span>{toast.text}</span>
        </div>
      )}

      {editorForm ? (
        <AdminProductEditor
          form={editorForm}
          categories={categories}
          hasR2={snapshot?.hasR2 ?? false}
          isSaving={isSaving}
          onChange={setEditorForm}
          onSave={handleSaveEditor}
          onCancel={() => setEditorForm(null)}
          onDelete={editorForm.id ? handleDeleteCurrentEditorItem : undefined}
          showToast={showToast}
        />
      ) : activeTab === "overview" ? (
        <AdminOverviewView
          categories={categories}
          festivalTheme={festivalTheme}
          hasDb={snapshot?.hasDb ?? false}
          isBusy={isBusy}
          onAddProduct={() =>
            setEditorForm(
              itemToFormState(
                categories.find((c) => c.id !== "festive-specials")?.id ||
                  categories[0]?.id ||
                  "savoury-crepes"
              )
            )
          }
          onEditProduct={(catId, item) =>
            setEditorForm(itemToFormState(catId, item))
          }
          onQuickToggleAvailable={(item, isAvailable) =>
            void handleQuickToggle(item, { isAvailable })
          }
          onNavigateTab={selectTab}
        />
      ) : activeTab === "categories" ? (
        <AdminCategoriesView
          categories={categories}
          hasDb={snapshot?.hasDb ?? false}
          onSnapshotChange={setSnapshot}
          onJumpToCategoryProducts={(catId) => {
            setProductsCategoryJump(catId);
            selectTab("products");
          }}
          onSyncTheme={handleChangeFestivalTheme}
          showToast={showToast}
        />
      ) : activeTab === "themes" ? (
        <AdminThemesView
          festivalTheme={festivalTheme}
          hasDb={snapshot?.hasDb ?? false}
          isUpdating={isUpdatingTheme}
          onSelectTheme={(val) => void handleChangeFestivalTheme(val)}
          onSaveBanner={handleSaveFestivalBanner}
        />
      ) : activeTab === "customizer" ? (
        <AdminCustomizerView
          key={`customizer-${contentRevision}`}
          content={siteContent}
          hasDb={snapshot?.hasDb ?? false}
          hasR2={snapshot?.hasR2 ?? false}
          isSaving={isSavingContent}
          onSaveContent={handleSaveSiteContent}
          onResetAllContent={handleResetSiteContent}
          onNavigateMainTab={selectTab}
          showToast={showToast}
        />
      ) : activeTab === "gallery" ? (
        <AdminGalleryView
          key={`gallery-${contentRevision}`}
          content={siteContent}
          hasDb={snapshot?.hasDb ?? false}
          hasR2={snapshot?.hasR2 ?? false}
          isSaving={isSavingContent}
          onSaveContent={handleSaveSiteContent}
          showToast={showToast}
        />
      ) : activeTab === "settings" ? (
        <AdminSettingsView
          key={`settings-${contentRevision}`}
          content={siteContent}
          hasDb={snapshot?.hasDb ?? false}
          isSaving={isSavingContent}
          onSaveContent={handleSaveSiteContent}
        />
      ) : (
        <AdminProductsView
          categories={categories}
          hasDb={snapshot?.hasDb ?? false}
          source={snapshot?.source ?? "fallback"}
          isBusy={isBusy}
          initialCategoryFilter={productsCategoryJump}
          onCreateProduct={(catId) => setEditorForm(itemToFormState(catId))}
          onEditProduct={(catId, item) =>
            setEditorForm(itemToFormState(catId, item))
          }
          onQuickToggle={(item, patch) => void handleQuickToggle(item, patch)}
          onRunBulkAction={handleRunBulkAction}
          onSeedDatabase={() => void handleSeedDatabase()}
        />
      )}
    </ShopifyAdminShell>
  );
}
