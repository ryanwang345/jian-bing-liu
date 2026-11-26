"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
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

  // ── Zero-Trust SSO Gate (100% Cloud-Native Cloudflare Access) ──
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
                Cloudflare Zero Trust · 云原生单点登录
              </p>
            </div>
          </div>

          {!session.configured ? (
            <div className="mt-5 space-y-2.5 rounded-xl border border-[#ffd6a4] bg-[#fff5ea] p-4 text-xs leading-relaxed text-[#5e4200]">
              <p className="flex items-center gap-1.5 font-bold text-[#1a1a1a]">
                <ShieldAlert className="h-4 w-4 shrink-0 text-[#b98900]" />
                尚未配置 Cloudflare Access 云原生验签参数
              </p>
              <p>
                旧密码登录已停用。请按{" "}
                <code>deploy/cloudflare-access/README.md</code>{" "}
                在云端完成配置后填入以下变量：
              </p>
              <code className="block rounded-lg bg-[#1a1a1a] px-3 py-2 font-mono text-[11px] leading-5 text-white">
                CF_ACCESS_TEAM_DOMAIN=https://&lt;team&gt;.cloudflareaccess.com
                <br />
                CF_ACCESS_AUD=&lt;Application-AUD-Tag&gt;
              </code>
              {process.env.NODE_ENV === "development" && (
                <p className="pt-1 text-[#8a5000]">
                  本地开发调试可在 <code>.env.local</code> 或{" "}
                  <code>.dev.vars</code> 中写入{" "}
                  <code>ADMIN_DEV_BYPASS=true</code> 后刷新页面。
                </p>
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-3 rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-4 text-xs leading-relaxed text-[#4a4a4a]">
              <p className="flex items-center gap-1.5 font-bold text-[#1a1a1a]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#047b5d]" />
                需通过 Cloudflare Zero Trust 身份验证
              </p>
              <p>
                当前请求未携带有效的{" "}
                <code>Cf-Access-Jwt-Assertion</code> 签名凭证。请通过受{" "}
                <strong>Cloudflare Access</strong> 保护的正式域名访问{" "}
                <code>/admin</code>。
              </p>
              <a
                href="/admin"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#303030]"
              >
                <RefreshCw className="h-4 w-4" />
                进入单点登录验证
              </a>
            </div>
          )}

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
