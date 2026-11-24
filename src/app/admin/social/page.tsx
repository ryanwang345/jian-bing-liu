import Link from "next/link";
import { redirect } from "next/navigation";
import { SocialProfileForm } from "@/components/admin/SocialProfileForm";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getSocialProfiles, isSocialAccount } from "@/lib/social-profiles";

export const metadata = { title: "社交媒体账号", robots: { index: false, follow: false } };

export default async function SocialAdminPage() {
  if (!(await getAdminSessionStatus()).authenticated) redirect("/admin");
  const { profiles, writable } = await getSocialProfiles();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
      <Link href="/admin" className="text-sm font-semibold text-cinnabar">← 返回管理后台</Link>
      <h1 className="mt-4 font-display text-3xl font-bold">社交媒体账号</h1>
      <p className="mt-2 text-sm text-ink-muted">修改账号或粘贴新的主页链接，然后点该平台的「保存」。</p>
      {!writable && (
        <p role="status" className="mt-4 rounded-xl bg-kraft p-3 text-sm">
          当前仅可预览。请先连接 Cloudflare D1 并应用数据库迁移。
        </p>
      )}
      <div className="mt-6 space-y-4">
        {profiles.filter(isSocialAccount)
          .map((profile) => <SocialProfileForm key={profile.platform} profile={profile} writable={writable} />)}
      </div>
    </div>
  );
}
