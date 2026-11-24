"use server";

import { revalidatePath } from "next/cache";
import { restaurant } from "@/data/restaurant";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getMenuDb } from "@/lib/cf-bindings";
import { isSocialAccount } from "@/lib/social-profiles";

export async function saveSocialProfile(
  _previous: { message: string; ok: boolean },
  form: FormData
) {
  const session = await getAdminSessionStatus();
  if (!session.authenticated) return { ok: false, message: "请重新登录后台。" };

  const platform = form.get("platform");
  const handle = form.get("handle");
  const href = form.get("href");
  const account = restaurant.verifiedSocialLinks.find((link) => link.platform === platform);
  if (!account || !isSocialAccount(account)) {
    return { ok: false, message: "请选择有效的平台。" };
  }
  if (typeof handle !== "string" || !handle.trim() || handle.trim().length > 100) {
    return { ok: false, message: "请填写有效的账号名称（最多 100 个字符）。" };
  }
  const url = typeof href === "string" && href.length <= 2048 && URL.canParse(href)
    ? new URL(href)
    : null;
  if (!url || !["https:", "http:"].includes(url.protocol)) {
    return { ok: false, message: "请输入以 https:// 或 http:// 开头的完整主页链接。" };
  }

  try {
    const db = await getMenuDb();
    if (!db) return { ok: false, message: "未连接到店铺数据库。" };
    await db.prepare(
      `INSERT INTO social_profiles (platform, handle, href, visible) VALUES (?, ?, ?, ?)
       ON CONFLICT(platform) DO UPDATE SET
         handle = excluded.handle, href = excluded.href, visible = excluded.visible`
    ).bind(account.platform, handle.trim(), url.href, form.has("visible") ? 1 : 0).run();
  } catch {
    return { ok: false, message: "保存失败，请稍后重试。" };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "已保存，网站已更新。" };
}
