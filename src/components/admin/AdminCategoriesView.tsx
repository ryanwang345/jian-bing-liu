"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { MenuCategory } from "@/data/menu";
import type { AdminMenuSnapshot } from "@/lib/menu-service";

interface AdminCategoriesViewProps {
  categories: MenuCategory[];
  hasDb: boolean;
  onSnapshotChange: (snapshot: AdminMenuSnapshot) => void;
  onJumpToCategoryProducts: (categoryId: string) => void;
  showToast: (type: "success" | "error", text: string) => void;
}

interface CategoryFormState {
  id?: string;
  titleZh: string;
  titleEn: string;
  chineseTitle: string;
  subtitleZh: string;
  subtitleEn: string;
}

export function AdminCategoriesView({
  categories,
  hasDb,
  onSnapshotChange,
  onJumpToCategoryProducts,
  showToast,
}: AdminCategoriesViewProps) {
  const [form, setForm] = useState<CategoryFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const openCreate = () => {
    setForm({
      titleZh: "",
      titleEn: "",
      chineseTitle: "",
      subtitleZh: "",
      subtitleEn: "",
    });
  };

  const openEdit = (cat: MenuCategory) => {
    setForm({
      id: cat.id,
      titleZh: cat.title.zh,
      titleEn: cat.title.en,
      chineseTitle: cat.chineseTitle,
      subtitleZh: cat.subtitle.zh,
      subtitleEn: cat.subtitle.en,
    });
  };

  const persistOrder = async (nextCategories: MenuCategory[]) => {
    setIsReordering(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orderedIds: nextCategories.map((c) => c.id),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        snapshot?: AdminMenuSnapshot;
      };
      if (!res.ok || !data.snapshot) {
        showToast("error", data.error || "分类排序保存失败");
        return;
      }
      onSnapshotChange(data.snapshot);
      showToast("success", "分类顺序已更新，前台菜单已同步");
    } catch {
      showToast("error", "网络错误，排序未保存");
    } finally {
      setIsReordering(false);
    }
  };

  const moveCategory = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    void persistOrder(next);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...categories];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    void persistOrder(next);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          ...form,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        snapshot?: AdminMenuSnapshot;
      };
      if (!res.ok || !data.snapshot) {
        showToast("error", data.error || "保存分类失败");
        return;
      }
      onSnapshotChange(data.snapshot);
      setForm(null);
      showToast("success", `已保存分类「${form.titleZh}」`);
    } catch {
      showToast("error", "保存分类失败");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: MenuCategory) => {
    if (cat.items.length > 0) {
      showToast(
        "error",
        `「${cat.title.zh}」下还有 ${cat.items.length} 道菜品，请先移走菜品后再删除分类`
      );
      return;
    }
    if (!window.confirm(`确定要删除空分类「${cat.title.zh}」吗？`)) return;

    setIsReordering(true);
    try {
      const res = await fetch(
        `/api/admin/categories?id=${encodeURIComponent(cat.id)}`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        snapshot?: AdminMenuSnapshot;
      };
      if (!res.ok || !data.snapshot) {
        showToast("error", data.error || "删除分类失败");
        return;
      }
      onSnapshotChange(data.snapshot);
      showToast("success", `已删除分类「${cat.title.zh}」`);
    } catch {
      showToast("error", "删除分类失败");
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">
            菜单分类管理
          </h1>
          <p className="mt-0.5 text-xs text-[#616161] sm:text-sm">
            管理菜单分区名称与中英文介绍；拖拽行或点击 ↑↓ 即可调整前台菜单展示顺序（空分类在前台会自动隐藏）。
          </p>
        </div>

        <button
          type="button"
          disabled={!hasDb}
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#303030] disabled:opacity-45"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          新增分类
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="hidden grid-cols-12 border-b border-[#e3e3e3] bg-[#f7f7f7] px-4 py-2.5 text-[11px] font-semibold text-[#616161] uppercase md:grid">
          <div className="col-span-1">排序</div>
          <div className="col-span-4">分类名称（中 / 英）</div>
          <div className="col-span-3">前台状态与菜品数</div>
          <div className="col-span-4 text-right">操作</div>
        </div>

        <div className="divide-y divide-[#ebebeb]">
          {categories.map((cat, idx) => {
            const activeItems = cat.items.filter(
              (i) => i.isAvailable !== false
            ).length;
            const soldOutItems = cat.items.length - activeItems;

            return (
              <div
                key={cat.id}
                draggable={hasDb && !isReordering}
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                className={`flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-[#fafafa] md:grid md:grid-cols-12 md:items-center ${
                  dragIndex === idx ? "bg-[#f1f1f1] opacity-65" : ""
                }`}
              >
                {/* Sort Controls */}
                <div className="flex items-center gap-1 text-[#616161] md:col-span-1">
                  <GripVertical
                    className="hidden h-4 w-4 cursor-grab text-[#999] md:inline"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    disabled={!hasDb || isReordering || idx === 0}
                    onClick={() => moveCategory(idx, -1)}
                    aria-label="上移分类"
                    className="rounded p-1 hover:bg-[#ebebeb] disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      !hasDb || isReordering || idx === categories.length - 1
                    }
                    onClick={() => moveCategory(idx, 1)}
                    aria-label="下移分类"
                    className="rounded p-1 hover:bg-[#ebebeb] disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Title & Subtitle */}
                <div className="min-w-0 md:col-span-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#1a1a1a]">
                      {cat.id === "festive-specials" ? "✨ " : ""}
                      {cat.title.zh}
                    </span>
                    <span className="rounded bg-[#f1f1f1] px-1.5 py-0.5 text-[11px] font-medium text-[#616161]">
                      {cat.chineseTitle}
                    </span>
                  </div>
                  <p className="truncate text-xs text-[#616161]">
                    {cat.title.en}
                  </p>
                </div>

                {/* Counts & Storefront Visibility */}
                <div className="flex flex-wrap items-center gap-2 md:col-span-3">
                  {cat.items.length > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#cdfee1] px-2.5 py-0.5 text-[11px] font-semibold text-[#0c5132]">
                      ● 前台展示中
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ebebeb] px-2.5 py-0.5 text-[11px] font-semibold text-[#616161]">
                      ○ 空分类自动隐藏
                    </span>
                  )}
                  <span className="text-xs text-[#616161] tabular-nums">
                    {activeItems} 在售
                    {soldOutItems > 0 ? ` · ${soldOutItems} 售罄` : ""}
                  </span>
                </div>

                {/* Row Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 md:col-span-4">
                  <button
                    type="button"
                    onClick={() => onJumpToCategoryProducts(cat.id)}
                    className="rounded-lg border border-[#d4d4d4] bg-white px-3 py-1.5 text-xs font-semibold text-[#303030] hover:bg-[#f7f7f7]"
                  >
                    管理菜品 ({cat.items.length})
                  </button>
                  <button
                    type="button"
                    disabled={!hasDb}
                    onClick={() => openEdit(cat)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#d4d4d4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#303030] hover:bg-[#f7f7f7] disabled:opacity-40"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    编辑
                  </button>
                  <button
                    type="button"
                    disabled={!hasDb || cat.id === "festive-specials"}
                    onClick={() => void handleDelete(cat)}
                    aria-label={`删除 ${cat.title.zh}`}
                    title={
                      cat.id === "festive-specials"
                        ? "系统保留的节日限定分类无需删除（为空时前台自动隐藏）"
                        : "删除空分类"
                    }
                    className="rounded-lg border border-[#d4d4d4] bg-white p-1.5 text-[#616161] hover:border-[#d82c0d] hover:text-[#d82c0d] disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Create / Edit Modal */}
      {form &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setForm(null)}
          >
            <form
              onSubmit={handleSave}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#e3e3e3] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#ebebeb] px-5 py-4">
                <h2 className="text-base font-bold text-[#1a1a1a]">
                  {form.id ? "编辑菜单分类" : "新增菜单分类"}
                </h2>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="rounded-lg p-1 text-[#616161] hover:bg-[#f1f1f1]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#303030]">
                      分类中文名称 *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.titleZh}
                      onChange={(e) =>
                        setForm({ ...form, titleZh: e.target.value })
                      }
                      placeholder="如：招牌咸味煎饼"
                      className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#303030]">
                      Category Title (EN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.titleEn}
                      onChange={(e) =>
                        setForm({ ...form, titleEn: e.target.value })
                      }
                      placeholder="e.g. Savoury Jian Bing"
                      className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#303030]">
                    右侧毛笔书法短标题（建议 4 个字，选填）
                  </label>
                  <input
                    type="text"
                    value={form.chineseTitle}
                    onChange={(e) =>
                      setForm({ ...form, chineseTitle: e.target.value })
                    }
                    placeholder="如：咸味煎饼"
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#303030]">
                    中文分类简介
                  </label>
                  <textarea
                    rows={2}
                    value={form.subtitleZh}
                    onChange={(e) =>
                      setForm({ ...form, subtitleZh: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#303030]">
                    English Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={form.subtitleEn}
                    onChange={(e) =>
                      setForm({ ...form, subtitleEn: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#ebebeb] bg-[#fafafa] px-5 py-3.5">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="rounded-lg border border-[#d4d4d4] bg-white px-4 py-2 text-xs font-semibold text-[#303030] hover:bg-[#f7f7f7]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#303030] disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  保存分类
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </div>
  );
}
