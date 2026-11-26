import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ShopifyAdminShell } from "@/components/admin/ShopifyAdminShell";
import { ShowcasePostForm } from "@/components/admin/ShowcasePostForm";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getShowcasePosts } from "@/lib/showcase-posts";

export const metadata = {
  title: "社媒展示帖 · 管理中心",
  robots: { index: false, follow: false },
};

export default async function ShowcasePostsPage() {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) redirect("/admin");
  const { posts, writable } = await getShowcasePosts(false);

  return (
    <ShopifyAdminShell
      activeNav="posts"
      hasDb={writable}
      identity={session.identity}
      logoutHref={session.logoutUrl}
    >
      <div className="space-y-5 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">
              社媒展示帖
            </h1>
            <p className="mt-1 text-xs text-[#616161] sm:text-sm">
              粘贴小红书、Instagram、TikTok、Threads、Reddit 或饭团链接，新帖子会排在首页「社交动态」最前面。
            </p>
          </div>
          <Link
            href="/#social-posts"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-3.5 py-2 text-xs font-semibold text-[#303030] shadow-2xs hover:bg-[#f7f7f7]"
          >
            <span>查看首页展示</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {!writable && (
          <p
            role="status"
            className="rounded-xl border border-[#ffd6a4] bg-[#fff5ea] p-3.5 text-xs font-medium text-[#8a5000]"
          >
            当前仅可预览。请先连接 Cloudflare D1 并应用数据库迁移。
          </p>
        )}

        <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-3 text-sm font-bold text-[#1a1a1a]">添加新展示帖</h2>
          <ShowcasePostForm writable={writable} />
        </div>

        <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="mb-3 text-sm font-bold text-[#1a1a1a]">
            已添加帖子 ({posts.length})
          </h2>
          <div className="space-y-3">
            {posts.map((post) => (
              <ShowcasePostForm key={post.id} post={post} writable={writable} />
            ))}
          </div>
        </div>
      </div>
    </ShopifyAdminShell>
  );
}
