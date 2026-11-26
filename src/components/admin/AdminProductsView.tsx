"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  dietaryLabels,
  formatPricePence,
  type DietaryTagKey,
  type MenuCategory,
  type MenuItem,
} from "@/data/menu";
import type { BulkMenuAction } from "@/lib/menu-service";

type StatusTab = "all" | "active" | "sold_out" | "featured" | "festive";

interface AdminProductsViewProps {
  categories: MenuCategory[];
  hasDb: boolean;
  source: "d1" | "fallback";
  isBusy: boolean;
  initialCategoryFilter?: string;
  onCreateProduct: (defaultCategoryId: string) => void;
  onEditProduct: (categoryId: string, item: MenuItem) => void;
  onQuickToggle: (
    item: MenuItem,
    patch: { isAvailable?: boolean; featured?: boolean }
  ) => void;
  onRunBulkAction: (action: BulkMenuAction, successText: string) => Promise<void>;
  onSeedDatabase: () => void;
}

export function AdminProductsView({
  categories,
  hasDb,
  source,
  isBusy,
  initialCategoryFilter = "all",
  onCreateProduct,
  onEditProduct,
  onQuickToggle,
  onRunBulkAction,
  onSeedDatabase,
}: AdminProductsViewProps) {
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>(
    initialCategoryFilter
  );
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Quick inline price editor state
  const [quickPriceItemId, setQuickPriceItemId] = useState<string | null>(null);
  const [quickPriceDrafts, setQuickPriceDrafts] = useState<
    Array<{ id?: string; sizeZh: string; sizeEn: string; pounds: string; isDefault: boolean }>
  >([]);
  const [isSavingQuickPrice, setIsSavingQuickPrice] = useState(false);

  // Sync external jump-to-category
  useEffect(() => {
    setCategoryFilter(initialCategoryFilter);
  }, [initialCategoryFilter]);

  const allEntries = useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.items.map((item) => ({ category: cat, item }))
      ),
    [categories]
  );

  const tabCounts = useMemo(() => {
    return {
      all: allEntries.length,
      active: allEntries.filter(({ item }) => item.isAvailable !== false).length,
      sold_out: allEntries.filter(({ item }) => item.isAvailable === false).length,
      featured: allEntries.filter(({ item }) => item.featured).length,
      festive: allEntries.filter(
        ({ category, item }) =>
          category.id === "festive-specials" || Boolean(item.note?.zh)
      ).length,
    };
  }, [allEntries]);

  const visibleEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allEntries.filter(({ category, item }) => {
      if (statusTab === "active" && item.isAvailable === false) return false;
      if (statusTab === "sold_out" && item.isAvailable !== false) return false;
      if (statusTab === "featured" && !item.featured) return false;
      if (
        statusTab === "festive" &&
        category.id !== "festive-specials" &&
        !item.note?.zh
      ) {
        return false;
      }

      if (categoryFilter !== "all" && category.id !== categoryFilter) {
        return false;
      }

      if (
        dietaryFilter !== "all" &&
        !item.dietary?.includes(dietaryFilter as DietaryTagKey)
      ) {
        return false;
      }

      if (q) {
        const hay = `${item.name.zh} ${item.name.en} ${item.description.zh} ${item.description.en} ${item.note?.zh ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allEntries, statusTab, categoryFilter, dietaryFilter, searchQuery]);

  // Reordering is enabled when viewing a single category with no text/status filters hiding sibling items
  const canReorder =
    hasDb &&
    categoryFilter !== "all" &&
    statusTab === "all" &&
    dietaryFilter === "all" &&
    !searchQuery.trim();

  const visibleIds = visibleEntries.map(({ item }) => item.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const next = new Set(selectedIds);
      visibleIds.forEach((id) => next.delete(id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      visibleIds.forEach((id) => next.add(id));
      setSelectedIds(next);
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const moveItemInCategory = (index: number, delta: -1 | 1) => {
    if (!canReorder) return;
    const target = index + delta;
    if (target < 0 || target >= visibleEntries.length) return;
    const ids = visibleEntries.map((e) => e.item.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(target, 0, moved);
    void onRunBulkAction(
      { type: "reorder-items", categoryId: categoryFilter, orderedIds: ids },
      "已更新分类内菜品顺序"
    );
  };

  const handleDropItem = (targetIndex: number) => {
    if (!canReorder || dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const ids = visibleEntries.map((e) => e.item.id);
    const [moved] = ids.splice(dragIndex, 1);
    ids.splice(targetIndex, 0, moved);
    setDragIndex(null);
    void onRunBulkAction(
      { type: "reorder-items", categoryId: categoryFilter, orderedIds: ids },
      "已更新分类内菜品顺序"
    );
  };

  const openQuickPrice = (item: MenuItem) => {
    setQuickPriceItemId(item.id);
    if (item.variants && item.variants.length > 0) {
      setQuickPriceDrafts(
        item.variants.map((v, idx) => ({
          id: v.id,
          sizeZh: v.size.zh,
          sizeEn: v.size.en,
          pounds: (v.pricePence / 100).toFixed(2),
          isDefault: v.isDefault ?? idx === 0,
        }))
      );
    } else {
      setQuickPriceDrafts([
        {
          sizeZh: "标准",
          sizeEn: "Regular",
          pounds: item.price ? item.price.replace(/[^0-9.]/g, "") : "10.00",
          isDefault: true,
        },
      ]);
    }
  };

  const saveQuickPrice = async (item: MenuItem) => {
    const parsed = quickPriceDrafts
      .filter((d) => d.pounds.trim() !== "")
      .map((d) => ({
        id: d.id,
        sizeZh: d.sizeZh.trim() || "标准",
        sizeEn: d.sizeEn.trim() || "Regular",
        pricePence: Math.round(Number.parseFloat(d.pounds) * 100),
        isDefault: d.isDefault,
      }))
      .filter((d) => Number.isFinite(d.pricePence) && d.pricePence >= 0);

    setIsSavingQuickPrice(true);
    try {
      await onRunBulkAction(
        { type: "quick-prices", itemId: item.id, variants: parsed },
        `已更新「${item.name.zh}」价格`
      );
      setQuickPriceItemId(null);
    } finally {
      setIsSavingQuickPrice(false);
    }
  };

  const selectedArray = Array.from(selectedIds);

  return (
    <div className="space-y-4 pb-24">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">
            全部菜品
          </h1>
          <p className="mt-0.5 text-xs text-[#616161] sm:text-sm">
            像管理商品一样勾选批量改状态、快速改价、按分类筛选拖拽排序。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasDb && source === "fallback" && (
            <button
              type="button"
              disabled={isBusy}
              onClick={onSeedDatabase}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-3.5 py-2 text-xs font-semibold text-[#303030] hover:bg-[#f7f7f7] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isBusy ? "animate-spin" : ""}`}
              />
              导入默认菜单到 D1
            </button>
          )}

          <button
            type="button"
            disabled={!hasDb}
            onClick={() =>
              onCreateProduct(
                categoryFilter !== "all"
                  ? categoryFilter
                  : categories.find((c) => c.id !== "festive-specials")?.id ||
                      categories[0]?.id ||
                      "savoury-crepes"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#303030] disabled:opacity-45"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            新增菜品
          </button>
        </div>
      </div>

      {/* Main Shopify Polaris Index Card */}
      <div className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {/* Status Filter Tabs */}
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-[#ebebeb] px-3 pt-2">
          {(
            [
              { key: "all", label: `全部 (${tabCounts.all})` },
              { key: "active", label: `在售中 (${tabCounts.active})` },
              { key: "sold_out", label: `已售罄 (${tabCounts.sold_out})` },
              { key: "featured", label: `招牌推荐 (${tabCounts.featured})` },
              { key: "festive", label: `✨ 节日限定 (${tabCounts.festive})` },
            ] as const
          ).map((tab) => {
            const active = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                className={`shrink-0 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "border-[#1a1a1a] text-[#1a1a1a]"
                    : "border-transparent text-[#616161] hover:text-[#1a1a1a]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search + Category & Dietary Filters */}
        <div className="flex flex-col gap-2.5 border-b border-[#ebebeb] bg-[#fafafa] p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#616161]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索菜品中文名、英文名或节日标签..."
              className="w-full rounded-lg border border-[#c9cccf] bg-white py-1.5 pr-3 pl-8 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="按菜单分类筛选"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-[#c9cccf] bg-white px-3 py-1.5 text-xs font-semibold text-[#303030] outline-none focus:border-[#005bd3]"
            >
              <option value="all">所有分类 ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.id === "festive-specials" ? "✨ " : ""}
                  {cat.title.zh} ({cat.items.length})
                </option>
              ))}
            </select>

            <select
              aria-label="按饮食标签筛选"
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="rounded-lg border border-[#c9cccf] bg-white px-3 py-1.5 text-xs font-semibold text-[#303030] outline-none focus:border-[#005bd3]"
            >
              <option value="all">全部饮食属性</option>
              <option value="halal">清真 (Halal)</option>
              <option value="vegetarian">蛋奶素 (Vegetarian)</option>
              <option value="vegan">纯素 (Vegan)</option>
            </select>
          </div>
        </div>

        {/* Reorder Helper Banner */}
        {canReorder && visibleEntries.length > 1 && (
          <div className="border-b border-[#ebebeb] bg-[#f0f7ff] px-4 py-2 text-[11px] font-medium text-[#005bd3]">
            💡 已筛选单个分类：可直接拖拽左侧手柄或点击 ↑↓ 按钮调整该分类下的菜品展示顺序。
          </div>
        )}

        {/* Table Header */}
        <div className="hidden grid-cols-12 items-center border-b border-[#e3e3e3] bg-[#f7f7f7] px-4 py-2 text-[11px] font-semibold text-[#616161] uppercase lg:grid">
          <div className="col-span-5 flex items-center gap-3">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              aria-label="全选当前列表菜品"
              className="h-4 w-4 rounded accent-[#1a1a1a]"
            />
            <span>菜品</span>
          </div>
          <div className="col-span-2">状态（点按切换）</div>
          <div className="col-span-2">所属分类</div>
          <div className="col-span-2">规格与价格</div>
          <div className="col-span-1 text-right">操作</div>
        </div>

        {/* Empty State */}
        {visibleEntries.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-bold text-[#1a1a1a]">
              {searchQuery.trim()
                ? "没有找到符合筛选条件的菜品"
                : categoryFilter === "festive-specials"
                  ? "当前还没有节日限定菜品"
                  : "当前列表暂无菜品"}
            </p>
            <p className="mt-1 text-xs text-[#616161]">
              {categoryFilter === "festive-specials"
                ? "平时为空时前台菜单会自动隐藏该分类；添加节日菜品后会自动置顶显示。"
                : "您可以清除筛选条件，或点击右上角新增菜品。"}
            </p>
            {hasDb && !searchQuery.trim() && (
              <button
                type="button"
                onClick={() =>
                  onCreateProduct(
                    categoryFilter !== "all" ? categoryFilter : "savoury-crepes"
                  )
                }
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#303030]"
              >
                <Plus className="h-4 w-4" />
                新增菜品到此分类
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#ebebeb]">
            {visibleEntries.map(({ category, item }, idx) => {
              const isSelected = selectedIds.has(item.id);
              const soldOut = item.isAvailable === false;
              const isQuickPricing = quickPriceItemId === item.id;

              return (
                <div
                  key={item.id}
                  draggable={canReorder && !isBusy}
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => {
                    if (canReorder) e.preventDefault();
                  }}
                  onDrop={() => handleDropItem(idx)}
                  className={`px-4 py-3 transition-colors hover:bg-[#fafafa] ${
                    isSelected ? "bg-[#f4f8ff]" : ""
                  } ${dragIndex === idx ? "opacity-55" : ""}`}
                >
                  <div className="flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:items-center">
                    {/* Col 1: Checkbox + Sort + Image + Name */}
                    <div className="flex min-w-0 items-center gap-3 lg:col-span-5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(item.id)}
                        aria-label={`选择 ${item.name.zh}`}
                        className="h-4 w-4 shrink-0 rounded accent-[#1a1a1a]"
                      />

                      {canReorder && (
                        <div className="flex shrink-0 items-center gap-0.5 text-[#8c8c8c]">
                          <GripVertical className="hidden h-4 w-4 cursor-grab sm:inline" />
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={idx === 0 || isBusy}
                              onClick={() => moveItemInCategory(idx, -1)}
                              aria-label="上移"
                              className="rounded p-0.5 hover:bg-[#e3e3e3] disabled:opacity-25"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={
                                idx === visibleEntries.length - 1 || isBusy
                              }
                              onClick={() => moveItemInCategory(idx, 1)}
                              aria-label="下移"
                              className="rounded p-0.5 hover:bg-[#e3e3e3] disabled:opacity-25"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => onEditProduct(category.id, item)}
                        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#e3e3e3] bg-[#f7f7f7]"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name.zh}
                            fill
                            sizes="48px"
                            className={`object-cover ${soldOut ? "grayscale opacity-70" : ""}`}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[#999]">
                            <ImagePlus className="h-4 w-4" />
                          </span>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditProduct(category.id, item)}
                            className="truncate text-left text-sm font-bold text-[#1a1a1a] hover:text-[#005bd3] hover:underline"
                          >
                            {item.name.zh}
                          </button>
                          {item.featured && (
                            <span
                              title="首页招牌推荐"
                              className="inline-flex items-center gap-0.5 rounded bg-[#fff5d6] px-1.5 py-0.5 text-[10px] font-bold text-[#7a5200]"
                            >
                              <Star className="h-2.5 w-2.5 fill-current text-[#e59819]" />
                              推荐
                            </span>
                          )}
                          {item.note?.zh && (
                            <span className="rounded-full bg-[#ffe9e8] px-2 py-0.5 text-[10px] font-semibold text-[#9e1c1c]">
                              {item.note.zh}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#616161]">
                          <span className="truncate">{item.name.en}</span>
                          {item.dietary?.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-[#f1f1f1] px-1.5 py-0.2 text-[10px] font-medium text-[#4a4a4a]"
                            >
                              {dietaryLabels[tag].zh}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Col 2: One-Click Status Pill */}
                    <div className="flex items-center justify-between gap-2 lg:col-span-2">
                      <button
                        type="button"
                        disabled={!hasDb || isBusy}
                        onClick={() =>
                          onQuickToggle(item, { isAvailable: soldOut })
                        }
                        title={
                          soldOut
                            ? "点击立即恢复正常供应"
                            : "点击标记为已售罄（前台变灰保留）"
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-85 disabled:opacity-45 ${
                          soldOut
                            ? "bg-[#ffd6a4] text-[#5e4200]"
                            : "bg-[#cdfee1] text-[#0c5132]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            soldOut ? "bg-[#8a5000]" : "bg-[#047b5d]"
                          }`}
                        />
                        {soldOut ? "已售罄" : "在售中"}
                      </button>

                      {/* Mobile Category Label */}
                      <span className="text-xs text-[#616161] lg:hidden">
                        {category.title.zh}
                      </span>
                    </div>

                    {/* Col 3: Category (Desktop) */}
                    <div className="hidden truncate text-xs font-medium text-[#4a4a4a] lg:col-span-2 lg:block">
                      {category.id === "festive-specials" ? "✨ " : ""}
                      {category.title.zh}
                    </div>

                    {/* Col 4: Sizes & Prices + Inline Quick Price Trigger */}
                    <div className="flex flex-wrap items-center justify-between gap-2 lg:col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {item.variants && item.variants.length > 0 ? (
                          item.variants.map((v) => (
                            <span
                              key={v.id}
                              className={`rounded px-1.5 py-0.5 text-xs tabular-nums ${
                                v.isDefault
                                  ? "bg-[#f1f1f1] font-bold text-[#1a1a1a]"
                                  : "text-[#616161]"
                              }`}
                            >
                              {v.size.zh} {formatPricePence(v.pricePence)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#8c8c8c]">
                            价格待定
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Col 5: Actions */}
                    <div className="flex items-center justify-end gap-1.5 lg:col-span-1">
                      <button
                        type="button"
                        disabled={!hasDb}
                        onClick={() =>
                          isQuickPricing
                            ? setQuickPriceItemId(null)
                            : openQuickPrice(item)
                        }
                        className="rounded-lg border border-[#d4d4d4] bg-white px-2 py-1 text-[11px] font-semibold text-[#303030] hover:bg-[#f7f7f7] disabled:opacity-40"
                      >
                        改价
                      </button>
                      <button
                        type="button"
                        disabled={!hasDb}
                        onClick={() => onEditProduct(category.id, item)}
                        aria-label={`编辑 ${item.name.zh}`}
                        className="rounded-lg border border-[#d4d4d4] bg-white p-1.5 text-[#303030] hover:bg-[#f7f7f7] disabled:opacity-40"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Quick Price Drawer */}
                  {isQuickPricing && (
                    <div className="mt-3 rounded-xl border border-[#c9cccf] bg-[#f7f7f7] p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1a1a1a]">
                          快速改价 · {item.name.zh}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setQuickPriceDrafts([
                                ...quickPriceDrafts,
                                {
                                  sizeZh: "中份",
                                  sizeEn: "Medium",
                                  pounds: "",
                                  isDefault: false,
                                },
                              ])
                            }
                            className="text-xs font-semibold text-[#005bd3] hover:underline"
                          >
                            + 增加规格
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickPriceItemId(null)}
                            className="rounded p-0.5 text-[#616161] hover:bg-black/5"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {quickPriceDrafts.map((draft, dIdx) => (
                          <div
                            key={dIdx}
                            className="flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-2.5 py-1.5"
                          >
                            <input
                              type="text"
                              value={draft.sizeZh}
                              onChange={(e) => {
                                const next = [...quickPriceDrafts];
                                next[dIdx] = {
                                  ...next[dIdx],
                                  sizeZh: e.target.value,
                                };
                                setQuickPriceDrafts(next);
                              }}
                              className="w-14 border-b border-transparent text-xs font-semibold text-[#303030] outline-none focus:border-[#005bd3]"
                              placeholder="规格"
                            />
                            <span className="text-xs font-bold text-[#616161]">
                              £
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={draft.pounds}
                              onChange={(e) => {
                                const next = [...quickPriceDrafts];
                                next[dIdx] = {
                                  ...next[dIdx],
                                  pounds: e.target.value,
                                };
                                setQuickPriceDrafts(next);
                              }}
                              className="w-16 text-xs font-bold tabular-nums text-[#1a1a1a] outline-none"
                            />
                            {quickPriceDrafts.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setQuickPriceDrafts(
                                    quickPriceDrafts.filter((_, i) => i !== dIdx)
                                  )
                                }
                                className="text-[#8c8c8c] hover:text-[#d82c0d]"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          disabled={isSavingQuickPrice}
                          onClick={() => void saveQuickPrice(item)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#047b5d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#03624a] disabled:opacity-50"
                        >
                          {isSavingQuickPrice ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          保存价格
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shopify Floating Bulk Action Bar */}
      {selectedArray.length > 0 && (
        <div className="fixed inset-x-4 bottom-5 z-40 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#303030] bg-[#1a1a1a] px-4 py-3 text-xs text-white shadow-2xl">
          <div className="flex items-center gap-2.5">
            <span className="rounded-md bg-white/15 px-2 py-0.5 font-bold tabular-nums">
              已选 {selectedArray.length} 项
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-[#cccccc] hover:text-white hover:underline"
            >
              取消选择
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={!hasDb || isBusy}
              onClick={async () => {
                await onRunBulkAction(
                  {
                    type: "set-available",
                    ids: selectedArray,
                    isAvailable: true,
                  },
                  `已将 ${selectedArray.length} 道菜品设为在售中`
                );
                setSelectedIds(new Set());
              }}
              className="rounded-lg bg-[#047b5d] px-2.5 py-1.5 font-semibold text-white hover:bg-[#03624a] disabled:opacity-45"
            >
              恢复供应
            </button>

            <button
              type="button"
              disabled={!hasDb || isBusy}
              onClick={async () => {
                await onRunBulkAction(
                  {
                    type: "set-available",
                    ids: selectedArray,
                    isAvailable: false,
                  },
                  `已将 ${selectedArray.length} 道菜品标记为已售罄`
                );
                setSelectedIds(new Set());
              }}
              className="rounded-lg bg-[#303030] px-2.5 py-1.5 font-semibold text-white hover:bg-[#444] disabled:opacity-45"
            >
              标记售罄
            </button>

            <button
              type="button"
              disabled={!hasDb || isBusy}
              onClick={async () => {
                await onRunBulkAction(
                  { type: "set-featured", ids: selectedArray, featured: true },
                  `已将 ${selectedArray.length} 道菜品设为招牌推荐`
                );
                setSelectedIds(new Set());
              }}
              className="rounded-lg bg-[#303030] px-2.5 py-1.5 font-semibold text-white hover:bg-[#444] disabled:opacity-45"
            >
              设为推荐
            </button>

            <select
              aria-label="批量移动到其他分类"
              disabled={!hasDb || isBusy}
              value=""
              onChange={async (e) => {
                const targetCat = e.target.value;
                if (!targetCat) return;
                const catName =
                  categories.find((c) => c.id === targetCat)?.title.zh ??
                  targetCat;
                await onRunBulkAction(
                  {
                    type: "move-category",
                    ids: selectedArray,
                    categoryId: targetCat,
                  },
                  `已将 ${selectedArray.length} 道菜品移至「${catName}」`
                );
                setSelectedIds(new Set());
              }}
              className="rounded-lg bg-[#303030] px-2.5 py-1.5 font-semibold text-white outline-none hover:bg-[#444]"
            >
              <option value="">移动到分类...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title.zh}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!hasDb || isBusy}
              onClick={async () => {
                if (
                  !window.confirm(
                    `确定要永久删除选中的 ${selectedArray.length} 道菜品吗？如果只是卖完了，建议点「标记售罄」。`
                  )
                ) {
                  return;
                }
                await onRunBulkAction(
                  { type: "delete", ids: selectedArray },
                  `已删除 ${selectedArray.length} 道菜品`
                );
                setSelectedIds(new Set());
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-[#d82c0d] px-2.5 py-1.5 font-semibold text-white hover:bg-[#b52208] disabled:opacity-45"
            >
              <Trash2 className="h-3.5 w-3.5" />
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
