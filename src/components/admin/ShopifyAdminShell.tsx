"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Database,
  ExternalLink,
  FolderKanban,
  HardDrive,
  Home,
  Images,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquareHeart,
  Package,
  Palette,
  Settings,
  Share2,
  Store,
  Ticket,
  X,
} from "lucide-react";

export type MainAdminTab =
  | "overview"
  | "products"
  | "categories"
  | "themes"
  | "customizer"
  | "gallery"
  | "settings";

export type AdminNavKey = MainAdminTab | "posts" | "social" | "coupons";

interface ShopifyAdminShellProps {
  activeNav: AdminNavKey;
  onSelectMainTab?: (tab: MainAdminTab) => void;
  totalProducts?: number;
  soldOutProducts?: number;
  totalCategories?: number;
  hasDb?: boolean;
  hasR2?: boolean;
  identity?: string;
  logoutHref?: string;
  canLogout?: boolean;
  onLogout?: () => void;
  children: ReactNode;
}

export function ShopifyAdminShell({
  activeNav,
  onSelectMainTab,
  totalProducts,
  soldOutProducts,
  totalCategories,
  hasDb = true,
  hasR2 = true,
  identity,
  logoutHref,
  canLogout = false,
  onLogout,
  children,
}: ShopifyAdminShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  type NavItemDef = {
    key: AdminNavKey;
    label: string;
    href: string;
    icon: typeof Home;
    badge?: string | number;
    mainTab?: MainAdminTab;
  };

  const catalogItems: NavItemDef[] = [
    {
      key: "overview",
      label: "首页概览",
      href: "/admin?tab=overview",
      icon: Home,
      mainTab: "overview",
    },
    {
      key: "products",
      label: "全部菜品",
      href: "/admin?tab=products",
      icon: Package,
      badge: totalProducts,
      mainTab: "products",
    },
    {
      key: "categories",
      label: "菜单分类",
      href: "/admin?tab=categories",
      icon: FolderKanban,
      badge: totalCategories,
      mainTab: "categories",
    },
  ];

  const storefrontItems: NavItemDef[] = [
    {
      key: "customizer",
      label: "页面装修与排版",
      href: "/admin?tab=customizer",
      icon: LayoutTemplate,
      mainTab: "customizer",
    },
    {
      key: "gallery",
      label: "实拍图集管理",
      href: "/admin?tab=gallery",
      icon: Images,
      mainTab: "gallery",
    },
    {
      key: "themes",
      label: "节日与主题皮肤",
      href: "/admin?tab=themes",
      icon: Palette,
      mainTab: "themes",
    },
  ];

  const channelAndSettingsItems: NavItemDef[] = [
    {
      key: "coupons",
      label: "新客优惠券与核销",
      href: "/admin/coupons",
      icon: Ticket,
    },
    {
      key: "posts",
      label: "社媒展示帖",
      href: "/admin/posts",
      icon: MessageSquareHeart,
    },
    {
      key: "social",
      label: "社交媒体账号",
      href: "/admin/social",
      icon: Share2,
    },
    {
      key: "settings",
      label: "店铺与营业设置",
      href: "/admin?tab=settings",
      icon: Settings,
      mainTab: "settings",
    },
  ];

  const renderSingleItem = (item: NavItemDef, closeDrawerOnClick: boolean) => {
    const Icon = item.icon;
    const active = activeNav === item.key;
    const commonClass = `flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors ${
      active
        ? "bg-[#fafafa] text-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
        : "text-[#4a4a4a] hover:bg-[#e3e3e3]/70 hover:text-[#1a1a1a]"
    }`;

    if (item.mainTab && onSelectMainTab) {
      return (
        <button
          key={item.key}
          type="button"
          onClick={() => {
            onSelectMainTab(item.mainTab!);
            if (closeDrawerOnClick) setMobileDrawerOpen(false);
          }}
          className={commonClass}
        >
          <span className="flex items-center gap-2.5">
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </span>
          {typeof item.badge === "number" && (
            <span className="rounded-full bg-[#dcdcdc] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#303030]">
              {item.badge}
            </span>
          )}
        </button>
      );
    }

    return (
      <Link
        key={item.key}
        href={item.href}
        onClick={() => {
          if (closeDrawerOnClick) setMobileDrawerOpen(false);
        }}
        className={commonClass}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{item.label}</span>
        </span>
        {typeof item.badge === "number" && (
          <span className="rounded-full bg-[#dcdcdc] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#303030]">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderNavList = (closeDrawerOnClick: boolean) => (
    <nav aria-label="后台主导航" className="flex flex-1 flex-col gap-1 px-3 py-3">
      <p className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#616161] uppercase">
        门店与菜单管理
      </p>
      {catalogItems.map((item) => renderSingleItem(item, closeDrawerOnClick))}

      {typeof soldOutProducts === "number" && soldOutProducts > 0 && (
        <div className="mx-1 mt-1 rounded-lg border border-[#ffd6a4] bg-[#fff5ea] px-2.5 py-1.5 text-[11px] font-semibold text-[#8a5000]">
          当前有 {soldOutProducts} 道菜品标记为已售罄
        </div>
      )}

      <p className="mt-4 px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#616161] uppercase">
        在线网店装修
      </p>
      {storefrontItems.map((item) => renderSingleItem(item, closeDrawerOnClick))}

      <p className="mt-4 px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-[#616161] uppercase">
        社媒渠道与设置
      </p>
      {channelAndSettingsItems.map((item) =>
        renderSingleItem(item, closeDrawerOnClick)
      )}

      <div className="mt-auto space-y-1.5 border-t border-[#dcdcdc] pt-3 text-[11px] text-[#616161]">
        <div className="flex items-center gap-1.5 px-2">
          <Database
            className={`h-3.5 w-3.5 ${hasDb ? "text-[#047b5d]" : "text-[#b98900]"}`}
            aria-hidden="true"
          />
          <span>{hasDb ? "Cloudflare D1 已连接" : "D1 预览模式"}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2">
          <HardDrive
            className={`h-3.5 w-3.5 ${hasR2 ? "text-[#047b5d]" : "text-[#8c8c8c]"}`}
            aria-hidden="true"
          />
          <span>{hasR2 ? "R2 云图库就绪" : "R2 未连接"}</span>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f1f1f1] font-sans text-[#303030]">
      {/* Shopify Dark Top Bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 bg-[#1a1a1a] px-3 text-[#e3e3e3] shadow-xs sm:px-5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="打开导航菜单"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#e3e3e3] hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/10"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#b8251c] text-xs font-bold text-white shadow-xs">
              刘
            </span>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white sm:text-sm">
                煎饼刘 · 管理中心
              </p>
              <p className="hidden text-[10px] text-[#a3a3a3] sm:block">
                Jian Bing Liu · Camden NW1
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#303030] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#404040]"
          >
            <Store className="h-3.5 w-3.5" aria-hidden="true" />
            <span>查看网店菜单</span>
            <ExternalLink className="h-3 w-3 opacity-75" aria-hidden="true" />
          </Link>

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#cccccc] hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <span>网店首页</span>
            <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
          </Link>

          {identity && (
            <span
              title={`已通过 SSO 认证：${identity}`}
              className="hidden max-w-[180px] truncate rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#d4d4d4] md:inline-block"
            >
              {identity}
            </span>
          )}

          {logoutHref ? (
            <a
              href={logoutHref}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#cccccc] transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">退出</span>
            </a>
          ) : (
            canLogout &&
            onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#cccccc] transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">退出</span>
              </button>
            )
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex lg:hidden"
        >
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative z-10 flex w-64 max-w-[82vw] flex-col bg-[#ebebeb] shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-[#dcdcdc] px-4">
              <span className="text-sm font-bold text-[#1a1a1a]">
                煎饼刘 · 导航菜单
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="关闭菜单"
                className="rounded-lg p-1.5 text-[#4a4a4a] hover:bg-black/5"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {renderNavList(true)}
          </aside>
        </div>
      )}

      {/* Desktop Split Frame: Left Polaris Sidebar + Main Workspace */}
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-[#dcdcdc] bg-[#ebebeb] lg:flex lg:flex-col">
          <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col overflow-y-auto">
            {renderNavList(false)}
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
