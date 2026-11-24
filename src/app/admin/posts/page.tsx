import Link from "next/link";
import { redirect } from "next/navigation";
import { ShowcasePostForm } from "@/components/admin/ShowcasePostForm";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getShowcasePosts } from "@/lib/showcase-posts";

export const metadata = { title: "展示帖子", robots: { index: false, follow: false } };

export default async function ShowcasePostsPage() {
  if (!(await getAdminSessionStatus()).authenticated) redirect("/admin");
  const { posts, writable } = await getShowcasePosts(false);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
      <Link href="/admin" className="text-sm font-semibold text-cinnabar">← 返回管理后台</Link>
      <h1 className="mt-4 font-display text-3xl font-bold">展示帖子</h1>
      <p className="mt-2 text-sm text-ink-muted">
        粘贴小红书、Instagram、TikTok、Threads、Reddit 或饭团链接，新帖子会排在首页「社交动态」最前面。
      </p>
      {!writable && <p role="status" className="mt-4 rounded-xl bg-kraft p-3 text-sm">当前仅可预览。请先连接 Cloudflare D1 并应用数据库迁移。</p>}
      <div className="mt-5"><ShowcasePostForm writable={writable} /></div>
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">帖子列表</h2>
        <Link href="/#social-posts" target="_blank" className="text-sm font-semibold text-cinnabar">查看首页展示 ↗</Link>
      </div>
      <div className="mt-3 space-y-3">
        {posts.map((post) => <ShowcasePostForm key={post.id} post={post} writable={writable} />)}
      </div>
    </div>
  );
}
