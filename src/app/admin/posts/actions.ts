"use server";

import { revalidatePath } from "next/cache";
import type { SocialPost } from "@/data/reviews";
import { getAdminSessionStatus } from "@/lib/admin-auth";
import { getMenuDb } from "@/lib/cf-bindings";
import { parsePostLink } from "@/lib/showcase-posts";

export async function updateShowcasePost(form: FormData) {
  if (!(await getAdminSessionStatus()).authenticated) {
    return { ok: false, message: "请重新登录后台。" };
  }
  const db = await getMenuDb();
  if (!db) return { ok: false, message: "未连接到店铺数据库。" };

  const id = form.get("id");
  const intent = form.get("intent");
  let message: string;
  try {
    if (intent === "hide" || intent === "show") {
      const updated = await db.prepare("UPDATE showcase_posts SET visible = ? WHERE id = ? RETURNING id")
        .bind(intent === "show" ? 1 : 0, id).first();
      if (!updated) return { ok: false, message: "找不到这条帖子，请刷新页面。" };
      message = intent === "show" ? "已恢复到首页。" : "已从首页撤下。";
    } else if (intent === "save") {
      const existing = id ? await db.prepare("SELECT content FROM showcase_posts WHERE id = ?")
        .bind(id).first<{ content: string }>() : null;
      if (id && !existing) return { ok: false, message: "找不到这条帖子，请刷新页面。" };
      const original: Omit<SocialPost, "id"> | null = existing ? JSON.parse(existing.content) : null;
      const link = parsePostLink(String(form.get("href") ?? ""));
      if (!link) return { ok: false, message: "请粘贴支持平台的完整帖子链接或分享文字。" };

      const titleZh = String(form.get("titleZh") ?? "").trim();
      const titleEn = String(form.get("titleEn") ?? "").trim();
      const captionZh = String(form.get("captionZh") ?? "").trim();
      const captionEn = String(form.get("captionEn") ?? "").trim();
      if ([titleZh, titleEn].some((value) => value.length > 200) ||
          [captionZh, captionEn].some((value) => value.length > 2000)) {
        return { ok: false, message: "标题最多 200 字，说明最多 2000 字。" };
      }
      // Keep photos, embeds and attribution when editing the same original post.
      const base = original?.href === link.href ? original : { ...link, handle: "" };
      const content = JSON.stringify({
        ...base,
        title: { zh: titleZh || titleEn || link.postType.zh, en: titleEn || titleZh || link.postType.en },
        caption: { zh: captionZh || captionEn, en: captionEn || captionZh },
      });
      if (id) {
        await db.prepare("UPDATE showcase_posts SET content = ? WHERE id = ?").bind(content, id).run();
        message = "帖子已更新。";
      } else {
        const inserted = await db.prepare(
          `INSERT INTO showcase_posts (id, content)
           SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM showcase_posts WHERE json_extract(content, '$.href') = ?)
           RETURNING id`
        ).bind(crypto.randomUUID(), content, link.href).first();
        if (!inserted) return { ok: false, message: "这个链接已在列表里，可以编辑或恢复展示。" };
        message = "已添加到首页。";
      }
    } else {
      return { ok: false, message: "操作无效。" };
    }
  } catch {
    return { ok: false, message: "保存失败，请稍后重试。" };
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { ok: true, message };
}
