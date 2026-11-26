import { redirect } from "next/navigation";
import { ShopifyAdminShell } from "@/components/admin/ShopifyAdminShell";
import { SocialProfileForm } from "@/components/admin/SocialProfileForm";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getSocialProfiles, isSocialAccount } from "@/lib/social-profiles";

export const metadata = {
  title: "社交媒体账号 · 管理中心",
  robots: { index: false, follow: false },
};

export default async function SocialAdminPage() {
  if (!(await getAdminSessionStatus()).authenticated) redirect("/admin");
  const { profiles, writable } = await getSocialProfiles();

  return (
    <ShopifyAdminShell activeNav="social" hasDb={writable}>
      <div className="space-y-5 pb-16">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">
            社交媒体账号
          </h1>
          <p className="mt-1 text-xs text-[#616161] sm:text-sm">
            修改账号名或粘贴新的主页链接，然后点对应平台的「保存」，全站页头、首页与页脚会自动同步。
          </p>
        </div>

        {!writable && (
          <p
            role="status"
            className="rounded-xl border border-[#ffd6a4] bg-[#fff5ea] p-3.5 text-xs font-medium text-[#8a5000]"
          >
            当前仅可预览。请先连接 Cloudflare D1 并应用数据库迁移。
          </p>
        )}

        <div className="space-y-3.5">
          {profiles
            .filter(isSocialAccount)
            .map((profile) => (
              <div
                key={profile.platform}
                className="rounded-xl border border-[#e3e3e3] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                <SocialProfileForm profile={profile} writable={writable} />
              </div>
            ))}
        </div>
      </div>
    </ShopifyAdminShell>
  );
}
