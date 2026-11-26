"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
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
  const [session, setSession] = useState<AdminSessionStatus>(initialSession);
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

  // Auth & Loading state
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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

  const refreshAll = async () => {
    const [menuRes, themeRes, contentRes] = await Promise.all([
      fetch("/api/admin/menu", { cache: "no-store" }),
      fetch("/api/admin/theme", { cache: "no-store" }),
      fetch("/api/admin/site-content", { cache: "no-store" }),
    ]);
    if (menuRes.ok) {
      setSnapshot((await menuRes.json()) as AdminMenuSnapshot);
    }
    if (themeRes.ok) {
      setFestivalTheme((await themeRes.json()) as ActiveFestivalThemeState);
    }
    if (contentRes.ok) {
      const data = (await contentRes.json()) as { content?: SiteContentConfig };
      if (data.content) {
        setSiteContent(data.content);
        setContentRevision((r) => r + 1);
      }
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

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setAuthError(data.error || "登录失败");
        return;
      }
      setSession((prev) => ({
        ...prev,
        authenticated: true,
        method: "session-cookie",
      }));
      setPassword("");
      await refreshAll();
    } catch {
      setAuthError("网络错误，请稍后重试");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setSession((prev) => ({ ...prev, authenticated: false, method: null }));
    setSnapshot(null);
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

  // ── Shopify-Style Clean Login Screen ──
  if (!session.authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f1f1f1] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#e3e3e3] bg-white p-7 shadow-lg sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1a1a] text-sm font-bold text-white">
              刘
            </span>
            <div>
              <h1 className="text-lg font-bold text-[#1a1a1a]">
                煎饼刘 · 门店管理系统
              </h1>
              <p className="text-xs text-[#616161]">
                Jian Bing Liu Store Admin · Camden NW1
              </p>
            </div>
          </div>

          {!session.configured && (
            <div className="mt-5 rounded-xl border border-[#fed3d1] bg-[#fff4f4] p-4 text-xs leading-relaxed text-[#8e1f0b]">
              尚未设置管理密码 <code>ADMIN_PASSWORD</code>：
              <span className="mt-2 block">线上环境请运行：</span>
              <code className="mt-1 block rounded-lg bg-[#1a1a1a] px-3 py-2 font-mono text-[11px] text-white">
                pnpm exec wrangler secret put ADMIN_PASSWORD
              </code>
              <span className="mt-2 block">
                本地预览请在根目录 <code>.dev.vars</code> 中写入{" "}
                <code>ADMIN_PASSWORD=你的密码</code> 后重启预览。
              </span>
            </div>
          )}

          {session.isLocalFallback && (
            <div className="mt-5 rounded-xl border border-[#ffd6a4] bg-[#fff5ea] p-3.5 text-xs leading-relaxed text-[#5e4200]">
              本地开发默认测试密码：{" "}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono font-bold text-[#1a1a1a]">
                jianbingliu-local
              </code>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#303030]"
              >
                <Lock className="h-3.5 w-3.5 text-[#616161]" />
                管理员密码 / Staff Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入店主管理密码"
                className="mt-1.5 w-full rounded-lg border border-[#c9cccf] bg-white px-3.5 py-2.5 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#005bd3]"
              />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-[#d82c0d]">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !session.configured}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#303030] disabled:opacity-50"
            >
              {isLoggingIn && <Loader2 className="h-4 w-4 animate-spin" />}
              进入管理后台
            </button>
          </form>

          <div className="mt-6 border-t border-[#ebebeb] pt-4 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-[#616161] hover:text-[#1a1a1a] hover:underline"
            >
              ← 返回网店前台首页
            </Link>
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
      canLogout={session.method !== "cloudflare-access"}
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
