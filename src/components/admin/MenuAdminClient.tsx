"use client";

import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  HardDrive,
  ImagePlus,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  dietaryLabels,
  formatPricePence,
  type DietaryTagKey,
  type MenuCategory,
  type MenuItem,
} from "@/data/menu";
import type { AdminSessionStatus } from "@/lib/admin-auth";
import type { AdminMenuSnapshot } from "@/lib/menu-service";

interface MenuAdminClientProps {
  initialSession: AdminSessionStatus;
  initialSnapshot: AdminMenuSnapshot | null;
}

interface EditableVariant {
  id?: string;
  sizeZh: string;
  sizeEn: string;
  pricePounds: string;
  isDefault: boolean;
}

interface DishFormState {
  id?: string;
  categoryId: string;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  imageUrl: string;
  dietary: DietaryTagKey[];
  featured: boolean;
  isAvailable: boolean;
  variants: EditableVariant[];
}

const ALL_DIETARY: DietaryTagKey[] = ["halal", "vegetarian", "vegan"];

/**
 * Downscales large phone photos in the browser to <=1280px WebP before upload
 * so R2 storage stays lean and storefront loading remains instant.
 */
async function downsizeLargeUpload(file: File): Promise<File> {
  const isPhoto = file.type.startsWith("image/") || /\.hei[cf]$/i.test(file.name);
  if (file.size <= 8 * 1024 * 1024 || !isPhoto) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1280;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.84)
    );
    if (!blob || blob.type !== "image/webp") return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "dish";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

function itemToFormState(categoryId: string, item?: MenuItem): DishFormState {
  if (!item) {
    return {
      categoryId,
      nameZh: "",
      nameEn: "",
      descZh: "",
      descEn: "",
      imageUrl: "",
      dietary: [],
      featured: false,
      isAvailable: true,
      variants: [
        {
          sizeZh: "标准",
          sizeEn: "Regular",
          pricePounds: "10.00",
          isDefault: true,
        },
      ],
    };
  }

  const variants: EditableVariant[] =
    item.variants && item.variants.length > 0
      ? item.variants.map((v, idx) => ({
          id: v.id,
          sizeZh: v.size.zh,
          sizeEn: v.size.en,
          pricePounds: (v.pricePence / 100).toFixed(2),
          isDefault: v.isDefault ?? idx === 0,
        }))
      : [
          {
            sizeZh: "标准",
            sizeEn: "Regular",
            pricePounds: item.price
              ? item.price.replace(/[^0-9.]/g, "")
              : "",
            isDefault: true,
          },
        ];

  return {
    id: item.id,
    categoryId,
    nameZh: item.name.zh,
    nameEn: item.name.en,
    descZh: item.description.zh,
    descEn: item.description.en,
    imageUrl: item.image ?? "",
    dietary: item.dietary ? [...item.dietary] : [],
    featured: Boolean(item.featured),
    isAvailable: item.isAvailable !== false,
    variants,
  };
}

export function MenuAdminClient({
  initialSession,
  initialSnapshot,
}: MenuAdminClientProps) {
  const [session, setSession] = useState<AdminSessionStatus>(initialSession);
  const [snapshot, setSnapshot] = useState<AdminMenuSnapshot | null>(
    initialSnapshot
  );

  // Login state
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Filter / feedback state
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Editor modal state
  const [editorForm, setEditorForm] = useState<DishFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    window.setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const refreshMenu = async () => {
    const res = await fetch("/api/admin/menu", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as AdminMenuSnapshot;
      setSnapshot(data);
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
      await refreshMenu();
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
      showToast("success", `已更新「${item.name.zh}」`);
    } catch {
      showToast("error", "更新失败");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    const confirmed = window.confirm(
      `确定要删除「${item.name.zh} (${item.name.en})」吗？此操作无法撤销。`
    );
    if (!confirmed) return;

    setIsBusy(true);
    try {
      const res = await fetch(
        `/api/admin/menu?id=${encodeURIComponent(item.id)}`,
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
      showToast("success", `已删除「${item.name.zh}」`);
    } catch {
      showToast("error", "删除失败");
    } finally {
      setIsBusy(false);
    }
  };

  const handleUploadPhoto = async (file: File) => {
    if (!editorForm) return;
    const uploadInput = fileInputRef.current;
    setIsUploading(true);
    try {
      const optimized = await downsizeLargeUpload(file);
      const formData = new FormData();
      formData.append("file", optimized);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (fileInputRef.current !== uploadInput) return;
      if (!res.ok || !data.url) {
        showToast("error", data.error || "图片上传失败");
        return;
      }

      setEditorForm((prev) => (prev ? { ...prev, imageUrl: data.url! } : prev));
      showToast("success", "照片已上传至 Cloudflare R2");
    } catch {
      showToast("error", "图片上传出错");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editorForm || isUploading) return;

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
          id: editorForm.id,
          categoryId: editorForm.categoryId,
          nameZh: editorForm.nameZh,
          nameEn: editorForm.nameEn,
          chineseName: editorForm.nameZh,
          descZh: editorForm.descZh,
          descEn: editorForm.descEn,
          imageUrl: editorForm.imageUrl || null,
          dietary: editorForm.dietary,
          featured: editorForm.featured,
          isAvailable: editorForm.isAvailable,
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
    } catch {
      showToast("error", "保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  const categories: MenuCategory[] = useMemo(
    () => snapshot?.categories ?? [],
    [snapshot]
  );

  const visibleEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list: Array<{ category: MenuCategory; item: MenuItem }> = [];
    for (const cat of categories) {
      if (activeCategoryId !== "all" && cat.id !== activeCategoryId) continue;
      for (const item of cat.items) {
        if (q) {
          const hay = `${item.name.zh} ${item.name.en} ${item.description.zh} ${item.description.en}`.toLowerCase();
          if (!hay.includes(q)) continue;
        }
        list.push({ category: cat, item });
      }
    }
    return list;
  }, [categories, activeCategoryId, searchQuery]);

  // ── Login Gate ──
  if (!session.authenticated) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-3xl border border-kraft-deep bg-white p-7 shadow-lg sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cinnabar/10 text-cinnabar">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-center font-display text-2xl font-bold text-ink">
            煎饼刘 · 店铺管理后台
          </h1>
          <p className="mt-1.5 text-center text-sm text-ink-muted">
            Menu &amp; Social Media Manager (Cloudflare D1 + R2)
          </p>

          {!session.configured && (
            <div className="mt-5 rounded-2xl border border-cinnabar/30 bg-cinnabar/5 p-4 text-xs leading-relaxed text-cinnabar-dark">
              尚未设置管理密码 <code>ADMIN_PASSWORD</code>：
              <span className="mt-2 block">
                线上环境请运行：
              </span>
              <code className="mt-1 block rounded-lg bg-ink px-3 py-2 font-mono text-[11px] text-parchment">
                pnpm exec wrangler secret put ADMIN_PASSWORD
              </code>
              <span className="mt-2 block">
                本地预览（localhost:8787）请在项目根目录的 <code>.dev.vars</code> 中写入{" "}
                <code>ADMIN_PASSWORD=你的密码</code>，然后重启 <code>pnpm cf:preview</code>。
              </span>
            </div>
          )}

          {session.isLocalFallback && (
            <div className="mt-5 rounded-2xl border border-turmeric/40 bg-turmeric/10 p-3.5 text-xs leading-relaxed text-ink-soft">
              本地开发模式：默认测试密码为{" "}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono font-bold text-ink">
                jianbingliu-local
              </code>
              （可在 <code>.env.local</code> 中设置 <code>ADMIN_PASSWORD</code> 覆盖）。
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-ink-soft"
              >
                管理员密码 / Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入管理密码"
                className="mt-1.5 w-full rounded-xl border border-kraft-deep bg-parchment/60 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cinnabar focus:bg-white"
              />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-cinnabar">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !session.configured}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-sm font-bold text-parchment shadow-sm transition-all hover:bg-cinnabar-dark disabled:opacity-50"
            >
              {isLoggingIn && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              登录后台 / Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/menu"
              className="text-xs font-semibold text-ink-muted underline underline-offset-4 hover:text-cinnabar"
            >
              返回前台菜单 / Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed top-20 right-4 z-[110] flex max-w-sm items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${
            toast.type === "success"
              ? "bg-jade text-parchment"
              : "bg-cinnabar text-parchment"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-kraft-deep pb-6">
        <div>
          <p className="text-xs font-semibold tracking-wider text-cinnabar uppercase">
            Jian Bing Liu · Admin Console
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
            菜单与社交媒体管理
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
                snapshot?.hasDb
                  ? "bg-jade/12 text-jade"
                  : "bg-turmeric/20 text-ink-soft"
              }`}
            >
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              {snapshot?.hasDb
                ? snapshot.source === "d1"
                  ? "Cloudflare D1 实时模式"
                  : "D1 已连接（尚未初始化数据）"
                : "预览回退模式（运行 cf:preview 或部署后写入 D1）"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
                snapshot?.hasR2
                  ? "bg-jade/12 text-jade"
                  : "bg-kraft text-ink-muted"
              }`}
            >
              <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
              {snapshot?.hasR2 ? "R2 图库就绪" : "R2 未绑定"}
            </span>
            <span className="rounded-full bg-kraft px-3 py-1 font-semibold text-ink-soft">
              共 {totalItems} 道菜品
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={!snapshot?.hasDb}
            onClick={() =>
              setEditorForm(
                itemToFormState(
                  activeCategoryId !== "all"
                    ? activeCategoryId
                    : categories[0]?.id || "savoury-crepes"
                )
              )
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-cinnabar px-5 py-2.5 text-sm font-bold text-parchment shadow-xs transition-all hover:bg-cinnabar-dark disabled:opacity-45"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            新增菜品
          </button>

          {snapshot?.hasDb && snapshot.source === "fallback" && (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleSeedDatabase}
              className="inline-flex items-center gap-1.5 rounded-full border border-cinnabar bg-white px-4 py-2.5 text-xs font-bold text-cinnabar hover:bg-cinnabar hover:text-parchment disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isBusy ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              一键导入默认菜单到 D1
            </button>
          )}

          <Link
            href="/admin/posts"
            className="rounded-full border border-kraft-deep bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-cinnabar hover:text-cinnabar"
          >
            展示帖子
          </Link>

          <Link
            href="/admin/social"
            className="rounded-full border border-kraft-deep bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-cinnabar hover:text-cinnabar"
          >
            社交媒体账号
          </Link>

          <Link
            href="/menu"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:border-cinnabar hover:text-cinnabar"
          >
            查看前台菜单
          </Link>

          {session.method !== "cloudflare-access" && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-kraft-deep bg-kraft/50 px-3.5 py-2.5 text-xs font-semibold text-ink-muted hover:text-cinnabar"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              退出
            </button>
          )}
        </div>
      </div>

      {/* Search + Category Tabs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveCategoryId("all")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeCategoryId === "all"
                ? "bg-ink text-parchment"
                : "border border-kraft-deep bg-white text-ink-soft hover:bg-kraft"
            }`}
          >
            全部分类 ({totalItems})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeCategoryId === cat.id
                  ? "bg-cinnabar text-parchment"
                  : "border border-kraft-deep bg-white text-ink-soft hover:bg-kraft"
              }`}
            >
              {cat.title.zh} ({cat.items.length})
            </button>
          ))}
        </div>

        <div className="relative w-full shrink-0 sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索菜名（中文 / 英文）"
            className="w-full rounded-full border border-kraft-deep bg-white py-2 pr-4 pl-9 text-xs text-ink outline-none focus:border-cinnabar"
          />
        </div>
      </div>

      {/* Dish Cards Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {visibleEntries.map(({ category, item }) => {
          const soldOut = item.isAvailable === false;
          return (
            <article
              key={item.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-kraft-deep/80 bg-white p-4 shadow-2xs transition-all sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 gap-3.5">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-kraft-deep/60 bg-kraft">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name.zh}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-muted/50">
                      <ImagePlus className="h-5 w-5" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="truncate font-display text-base font-bold text-ink">
                      {item.name.zh}
                    </h2>
                    {soldOut && (
                      <span className="rounded-full bg-cinnabar px-2 py-0.5 text-[10px] font-bold text-white">
                        已售罄
                      </span>
                    )}
                    {item.featured && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-turmeric/20 px-2 py-0.5 text-[10px] font-bold text-ink">
                        <Star className="h-2.5 w-2.5 fill-current text-[#E59819]" />
                        推荐
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-ink-muted">
                    {item.name.en} · {category.title.zh}
                  </p>

                  {/* Size & Price Pills */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.variants && item.variants.length > 0 ? (
                      item.variants.map((v) => (
                        <span
                          key={v.id}
                          className={`rounded-md px-2 py-0.5 font-sans text-xs font-semibold tabular-nums ${
                            v.isDefault
                              ? "bg-kraft text-cinnabar-dark"
                              : "border border-kraft-deep/70 bg-parchment/70 text-ink-soft"
                          }`}
                        >
                          {v.size.zh} {formatPricePence(v.pricePence)}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-md border border-dashed border-cinnabar/40 px-2 py-0.5 text-xs text-cinnabar-dark">
                        价格待定
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex shrink-0 flex-row items-center justify-end gap-1.5 border-t border-kraft-deep/50 pt-3 sm:flex-col sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3">
                <button
                  type="button"
                  disabled={!snapshot?.hasDb || isBusy}
                  onClick={() => setEditorForm(itemToFormState(category.id, item))}
                  className="inline-flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-parchment hover:bg-cinnabar disabled:opacity-40"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  编辑
                </button>
                <button
                  type="button"
                  disabled={!snapshot?.hasDb || isBusy}
                  onClick={() =>
                    handleQuickToggle(item, { isAvailable: soldOut })
                  }
                  title={soldOut ? "恢复供应" : "标记售罄"}
                  className="inline-flex items-center gap-1 rounded-lg border border-kraft-deep bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:border-cinnabar hover:text-cinnabar disabled:opacity-40"
                >
                  {soldOut ? (
                    <>
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      恢复供应
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      售罄
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={!snapshot?.hasDb || isBusy}
                  onClick={() => handleDelete(item)}
                  aria-label={`删除 ${item.name.zh}`}
                  className="inline-flex items-center justify-center rounded-lg border border-kraft-deep bg-white p-1.5 text-ink-muted hover:border-cinnabar hover:text-cinnabar disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {editorForm &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/80 p-0 backdrop-blur-xs sm:items-center sm:p-4"
            onClick={() => setEditorForm(null)}
          >
            <form
              onSubmit={handleSaveForm}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-kraft-deep bg-parchment shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-kraft-deep bg-white px-5 py-4">
                <h2 className="font-display text-lg font-bold text-ink">
                  {editorForm.id ? "编辑菜品与价格" : "新增菜品"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditorForm(null)}
                  className="rounded-full p-1.5 text-ink-muted hover:bg-kraft hover:text-ink"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                {/* Category & Names */}
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-ink-soft">
                      所属分类 / Category
                    </label>
                    <select
                      value={editorForm.categoryId}
                      onChange={(e) =>
                        setEditorForm({ ...editorForm, categoryId: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border border-kraft-deep bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-cinnabar"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.title.zh} — {cat.title.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-soft">
                      中文名称 *
                    </label>
                    <input
                      type="text"
                      required
                      value={editorForm.nameZh}
                      onChange={(e) =>
                        setEditorForm({ ...editorForm, nameZh: e.target.value })
                      }
                      placeholder="如：招牌烤鸭煎饼"
                      className="mt-1 w-full rounded-xl border border-kraft-deep bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-cinnabar"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-soft">
                      English Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editorForm.nameEn}
                      onChange={(e) =>
                        setEditorForm({ ...editorForm, nameEn: e.target.value })
                      }
                      placeholder="e.g. Roast Duck Jian Bing"
                      className="mt-1 w-full rounded-xl border border-kraft-deep bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-cinnabar"
                    />
                  </div>
                </div>

                {/* Dynamic Size & Price Variants */}
                <div className="rounded-2xl border border-kraft-deep bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">
                      规格与价格（Size &amp; Price）
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setEditorForm({
                            ...editorForm,
                            variants: [
                              ...editorForm.variants,
                              {
                                sizeZh: "中份",
                                sizeEn: "Medium",
                                pricePounds: "",
                                isDefault: false,
                              },
                            ],
                          })
                        }
                        className="rounded-full border border-kraft-deep bg-parchment px-2.5 py-1 text-[11px] font-semibold text-ink-soft hover:border-cinnabar hover:text-cinnabar"
                      >
                        + 中份
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditorForm({
                            ...editorForm,
                            variants: [
                              ...editorForm.variants,
                              {
                                sizeZh: "大份",
                                sizeEn: "Large",
                                pricePounds: "",
                                isDefault: false,
                              },
                            ],
                          })
                        }
                        className="rounded-full border border-kraft-deep bg-parchment px-2.5 py-1 text-[11px] font-semibold text-ink-soft hover:border-cinnabar hover:text-cinnabar"
                      >
                        + 大份
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditorForm({
                            ...editorForm,
                            variants: [
                              ...editorForm.variants,
                              {
                                sizeZh: "标准",
                                sizeEn: "Regular",
                                pricePounds: "",
                                isDefault: editorForm.variants.length === 0,
                              },
                            ],
                          })
                        }
                        className="rounded-full bg-cinnabar/10 px-2.5 py-1 text-[11px] font-bold text-cinnabar hover:bg-cinnabar hover:text-parchment"
                      >
                        + 添加规格
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {editorForm.variants.map((variant, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 items-center gap-2 rounded-xl border border-kraft-deep/70 bg-parchment/40 p-2.5"
                      >
                        <input
                          type="text"
                          value={variant.sizeZh}
                          onChange={(e) => {
                            const next = [...editorForm.variants];
                            next[idx] = { ...next[idx], sizeZh: e.target.value };
                            setEditorForm({ ...editorForm, variants: next });
                          }}
                          placeholder="中文规格"
                          className="col-span-3 rounded-lg border border-kraft-deep bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-cinnabar"
                        />
                        <input
                          type="text"
                          value={variant.sizeEn}
                          onChange={(e) => {
                            const next = [...editorForm.variants];
                            next[idx] = { ...next[idx], sizeEn: e.target.value };
                            setEditorForm({ ...editorForm, variants: next });
                          }}
                          placeholder="Size (EN)"
                          className="col-span-3 rounded-lg border border-kraft-deep bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-cinnabar"
                        />
                        <div className="relative col-span-3">
                          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-ink-muted">
                            £
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.pricePounds}
                            onChange={(e) => {
                              const next = [...editorForm.variants];
                              next[idx] = {
                                ...next[idx],
                                pricePounds: e.target.value,
                              };
                              setEditorForm({ ...editorForm, variants: next });
                            }}
                            placeholder="12.00"
                            className="w-full rounded-lg border border-kraft-deep bg-white py-1.5 pr-2 pl-6 text-xs tabular-nums text-ink outline-none focus:border-cinnabar"
                          />
                        </div>
                        <label className="col-span-2 flex cursor-pointer items-center justify-center gap-1 text-[11px] font-semibold text-ink-soft">
                          <input
                            type="radio"
                            name="default-variant"
                            checked={variant.isDefault}
                            onChange={() => {
                              const next = editorForm.variants.map((v, i) => ({
                                ...v,
                                isDefault: i === idx,
                              }));
                              setEditorForm({ ...editorForm, variants: next });
                            }}
                          />
                          主价
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const next = editorForm.variants.filter(
                              (_, i) => i !== idx
                            );
                            if (
                              next.length > 0 &&
                              !next.some((v) => v.isDefault)
                            ) {
                              next[0].isDefault = true;
                            }
                            setEditorForm({ ...editorForm, variants: next });
                          }}
                          aria-label="删除规格"
                          className="col-span-1 flex items-center justify-center text-ink-muted hover:text-cinnabar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photo Upload (Cloudflare R2) */}
                <div className="rounded-2xl border border-kraft-deep bg-white p-4">
                  <label className="block text-xs font-bold text-ink">
                    菜品照片（自动转换为 WebP 并存入 R2）
                  </label>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-kraft-deep bg-kraft">
                      {editorForm.imageUrl ? (
                        <Image
                          src={editorForm.imageUrl}
                          alt="Dish preview"
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-muted/50">
                          <ImagePlus className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.heic,.heif"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleUploadPhoto(f);
                            e.target.value = "";
                          }}
                        />
                        <button
                          type="button"
                          disabled={isSaving || isUploading || !snapshot?.hasR2}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-parchment hover:bg-cinnabar disabled:opacity-45"
                        >
                          {isUploading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          {isUploading ? "压缩并上传中..." : "拍照 / 上传新图"}
                        </button>
                        {editorForm.imageUrl && (
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() =>
                              setEditorForm({ ...editorForm, imageUrl: "" })
                            }
                            className="text-xs font-semibold text-ink-muted hover:text-cinnabar"
                          >
                            清除图片
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        disabled={isUploading}
                        value={editorForm.imageUrl}
                        onChange={(e) =>
                          setEditorForm({ ...editorForm, imageUrl: e.target.value })
                        }
                        placeholder="/images/roast-duck-jianbing.webp 或 /api/media/dishes/..."
                        className="w-full rounded-xl border border-kraft-deep bg-parchment/50 px-3 py-2 text-xs text-ink outline-none focus:border-cinnabar focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft">
                      中文简介
                    </label>
                    <textarea
                      rows={3}
                      value={editorForm.descZh}
                      onChange={(e) =>
                        setEditorForm({ ...editorForm, descZh: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border border-kraft-deep bg-white px-3.5 py-2 text-xs leading-relaxed text-ink outline-none focus:border-cinnabar"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-soft">
                      English Description
                    </label>
                    <textarea
                      rows={3}
                      value={editorForm.descEn}
                      onChange={(e) =>
                        setEditorForm({ ...editorForm, descEn: e.target.value })
                      }
                      className="mt-1 w-full rounded-xl border border-kraft-deep bg-white px-3.5 py-2 text-xs leading-relaxed text-ink outline-none focus:border-cinnabar"
                    />
                  </div>
                </div>

                {/* Dietary Tags & Switches */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-kraft-deep bg-white p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-ink">饮食标签：</span>
                    {ALL_DIETARY.map((tag) => {
                      const active = editorForm.dietary.includes(tag);
                      return (
                        <label
                          key={tag}
                          className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-ink-soft"
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => {
                              const next = active
                                ? editorForm.dietary.filter((t) => t !== tag)
                                : [...editorForm.dietary, tag];
                              setEditorForm({ ...editorForm, dietary: next });
                            }}
                          />
                          {dietaryLabels[tag].zh} ({dietaryLabels[tag].en})
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-ink">
                      <input
                        type="checkbox"
                        checked={editorForm.featured}
                        onChange={(e) =>
                          setEditorForm({
                            ...editorForm,
                            featured: e.target.checked,
                          })
                        }
                      />
                      首页招牌推荐
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-ink">
                      <input
                        type="checkbox"
                        checked={editorForm.isAvailable}
                        onChange={(e) =>
                          setEditorForm({
                            ...editorForm,
                            isAvailable: e.target.checked,
                          })
                        }
                      />
                      正常在售
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-kraft-deep bg-white px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setEditorForm(null)}
                  className="rounded-full border border-kraft-deep px-5 py-2 text-xs font-semibold text-ink-soft hover:bg-kraft"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cinnabar px-6 py-2 text-xs font-bold text-parchment shadow-xs hover:bg-cinnabar-dark disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  保存并实时上线
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </div>
  );
}
