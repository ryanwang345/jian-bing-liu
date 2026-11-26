"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  FolderKanban,
  ImagePlus,
  Images,
  LayoutTemplate,
  Package,
  Palette,
  Plus,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";
import { formatPricePence, type MenuCategory, type MenuItem } from "@/data/menu";
import type { ActiveFestivalThemeState } from "@/lib/festival-theme-service";

interface AdminOverviewViewProps {
  categories: MenuCategory[];
  festivalTheme: ActiveFestivalThemeState | null;
  hasDb: boolean;
  isBusy: boolean;
  onAddProduct: () => void;
  onEditProduct: (categoryId: string, item: MenuItem) => void;
  onQuickToggleAvailable: (item: MenuItem, isAvailable: boolean) => void;
  onNavigateTab: (
    tab:
      | "products"
      | "categories"
      | "themes"
      | "customizer"
      | "gallery"
      | "settings"
  ) => void;
}

export function AdminOverviewView({
  categories,
  festivalTheme,
  hasDb,
  isBusy,
  onAddProduct,
  onEditProduct,
  onQuickToggleAvailable,
  onNavigateTab,
}: AdminOverviewViewProps) {
  const allEntries = categories.flatMap((cat) =>
    cat.items.map((item) => ({ category: cat, item }))
  );
  const totalCount = allEntries.length;
  const activeCount = allEntries.filter(
    ({ item }) => item.isAvailable !== false
  ).length;
  const soldOutEntries = allEntries.filter(
    ({ item }) => item.isAvailable === false
  );
  const featuredCount = allEntries.filter(({ item }) => item.featured).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title + Quick CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">
            欢迎回来 · 煎饼刘管理台
          </h1>
          <p className="mt-0.5 text-xs text-[#616161] sm:text-sm">
            在一个工作台集中管理菜单价格、多规格、售罄状态、分类顺序与全站节日主题。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!hasDb}
            onClick={onAddProduct}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#303030] disabled:opacity-45"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            新增菜品
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab("products")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-3.5 py-2 text-xs font-semibold text-[#303030] shadow-2xs hover:bg-[#f7f7f7]"
          >
            管理全部菜品
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => onNavigateTab("products")}
          className="rounded-xl border border-[#e3e3e3] bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:border-[#b5b5b5]"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#616161]">
            <span>在售菜品</span>
            <CheckCircle2 className="h-4 w-4 text-[#047b5d]" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-[#1a1a1a]">
            {activeCount}
            <span className="ml-1.5 text-xs font-normal text-[#616161]">
              / {totalCount} 道
            </span>
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("products")}
          className="rounded-xl border border-[#e3e3e3] bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:border-[#b5b5b5]"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#616161]">
            <span>已标记售罄</span>
            <Package className="h-4 w-4 text-[#b98900]" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-[#1a1a1a]">
            {soldOutEntries.length}
            <span className="ml-1.5 text-xs font-normal text-[#616161]">
              前台变灰保留
            </span>
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("products")}
          className="rounded-xl border border-[#e3e3e3] bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:border-[#b5b5b5]"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#616161]">
            <span>首页招牌推荐</span>
            <Star className="h-4 w-4 text-[#e59819]" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-[#1a1a1a]">
            {featuredCount}
            <span className="ml-1.5 text-xs font-normal text-[#616161]">
              首页展示前 6 道
            </span>
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("categories")}
          className="rounded-xl border border-[#e3e3e3] bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:border-[#b5b5b5]"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#616161]">
            <span>菜单分类</span>
            <FolderKanban className="h-4 w-4 text-[#303030]" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-[#1a1a1a]">
            {categories.length}
            <span className="ml-1.5 text-xs font-normal text-[#616161]">
              点击排序/管理
            </span>
          </p>
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Sold-Out Quick Restore Card */}
        <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1a1a1a]">
                今日已售罄菜品 ({soldOutEntries.length})
              </h2>
              <p className="mt-0.5 text-xs text-[#616161]">
                标记售罄的菜品在前台会变灰并提示「已售罄」，备好货后点一下即可恢复供应。
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("products")}
              className="text-xs font-semibold text-[#005bd3] hover:underline"
            >
              查看全部菜品 →
            </button>
          </div>

          {soldOutEntries.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-[#e3e3e3] bg-[#fafafa] px-4 py-7 text-center text-xs text-[#616161]">
              当前所有菜品均在正常供应中。
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#ebebeb] rounded-lg border border-[#ebebeb]">
              {soldOutEntries.map(({ category, item }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#e3e3e3] bg-[#f7f7f7]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name.zh}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#999]">
                          <ImagePlus className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onEditProduct(category.id, item)}
                        className="truncate text-left text-xs font-bold text-[#1a1a1a] hover:underline sm:text-sm"
                      >
                        {item.name.zh}
                      </button>
                      <p className="truncate text-[11px] text-[#616161]">
                        {category.title.zh} ·{" "}
                        {item.variants?.[0]
                          ? formatPricePence(item.variants[0].pricePence)
                          : item.price ?? "价格待定"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!hasDb || isBusy}
                    onClick={() => onQuickToggleAvailable(item, true)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#047b5d] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#03624a] disabled:opacity-45"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    恢复供应
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Active Theme + Quick Channels */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1a1a1a]">
                <Palette className="h-4 w-4 text-[#616161]" aria-hidden="true" />
                当前网店主题
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab("themes")}
                className="text-xs font-semibold text-[#005bd3] hover:underline"
              >
                更换主题
              </button>
            </div>

            <div className="mt-3 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-3.5">
              {festivalTheme?.activeFestival ? (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/15"
                      style={{
                        backgroundColor:
                          festivalTheme.activeFestival.theme.cinnabar,
                      }}
                    />
                    <p className="text-xs font-bold text-[#1a1a1a]">
                      {festivalTheme.activeFestival.zh}（
                      {festivalTheme.activeFestival.paletteName.zh}）
                    </p>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#616161]">
                    {festivalTheme.activeFestival.bannerZh}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-[#1a1a1a]">
                    🏮 经典原版暖色主题
                  </p>
                  <p className="mt-1 text-[11px] text-[#616161]">
                    {festivalTheme?.setting === "auto"
                      ? "智能自动模式：添加节日限定菜品后将自动切换对应节日皮肤。"
                      : "固定使用煎饼刘经典暖色厨房风格。"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#1a1a1a]">
              <Sparkles className="h-4 w-4 text-[#b8251c]" aria-hidden="true" />
              快捷通道
            </h2>
            <div className="mt-3 space-y-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onNavigateTab("customizer")}
                className="flex w-full items-center justify-between rounded-lg border border-[#ebebeb] px-3 py-2.5 text-left text-[#303030] hover:bg-[#fafafa]"
              >
                <span className="inline-flex items-center gap-2">
                  <LayoutTemplate className="h-3.5 w-3.5 text-[#616161]" />
                  页面装修与排版（全站文字 / 照片 / 板块顺序）
                </span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab("gallery")}
                className="flex w-full items-center justify-between rounded-lg border border-[#ebebeb] px-3 py-2.5 text-left text-[#303030] hover:bg-[#fafafa]"
              >
                <span className="inline-flex items-center gap-2">
                  <Images className="h-3.5 w-3.5 text-[#616161]" />
                  实拍图集管理（上传与整理照片）
                </span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab("settings")}
                className="flex w-full items-center justify-between rounded-lg border border-[#ebebeb] px-3 py-2.5 text-left text-[#303030] hover:bg-[#fafafa]"
              >
                <span className="inline-flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-[#616161]" />
                  店铺与营业设置（临时店休 / 营业时间 / 电话）
                </span>
                <span>→</span>
              </button>
              <Link
                href="/admin/posts"
                className="flex items-center justify-between rounded-lg border border-[#ebebeb] px-3 py-2.5 text-[#303030] hover:bg-[#fafafa]"
              >
                <span>更新首页社媒展示帖</span>
                <span>→</span>
              </Link>
              <Link
                href="/admin/social"
                className="flex items-center justify-between rounded-lg border border-[#ebebeb] px-3 py-2.5 text-[#303030] hover:bg-[#fafafa]"
              >
                <span>管理小红书 / IG / TikTok 账号</span>
                <span>→</span>
              </Link>
              <a
                href="https://www.fantuanorder.com/store/jian-bing-liu/gb-4753211"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-[#ebebeb] px-3 py-2.5 text-[#303030] hover:bg-[#fafafa]"
              >
                <span>查看饭团外卖门店主页</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#616161]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
