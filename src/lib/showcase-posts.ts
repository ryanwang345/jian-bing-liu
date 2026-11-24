import { socialPosts, type SocialPost } from "@/data/reviews";
import { getMenuDb } from "@/lib/cf-bindings";

export type ManagedPost = SocialPost & { visible: boolean };

export async function getShowcasePosts(onlyVisible: boolean) {
  const db = await getMenuDb();
  if (db) {
    try {
      const where = onlyVisible ? "WHERE visible = 1" : "";
      const { results } = await db.prepare(
        `SELECT id, content, visible FROM showcase_posts ${where} ORDER BY position DESC`
      ).all<{ id: string; content: string; visible: number }>();
      const posts: ManagedPost[] = results.map((row) => ({
        ...JSON.parse(row.content),
        id: row.id,
        visible: row.visible === 1,
      }));
      return { posts, writable: true };
    } catch (error) {
      // An older database still serves the original showcase until it is migrated.
      if (!String(error).includes("no such table")) throw error;
    }
  }
  return { posts: socialPosts.map((post) => ({ ...post, visible: true })), writable: false };
}

const platforms = {
  instagram: { hosts: ["instagram.com"], label: { zh: "Instagram 帖子", en: "Instagram post" } },
  tiktok: { hosts: ["tiktok.com"], label: { zh: "TikTok 视频", en: "TikTok video" } },
  rednote: { hosts: ["xiaohongshu.com", "xhslink.com", "xhslink.cn"], label: { zh: "小红书笔记", en: "RedNote post" } },
  threads: { hosts: ["threads.net", "threads.com"], label: { zh: "Threads 帖子", en: "Threads post" } },
  reddit: { hosts: ["reddit.com", "redd.it"], label: { zh: "Reddit 帖子", en: "Reddit post" } },
  fantuan: { hosts: ["fantuanorder.com"], label: { zh: "饭团外卖", en: "Fantuan" } },
} satisfies Record<SocialPost["platform"], { hosts: string[]; label: SocialPost["title"] }>;

export function parsePostLink(input: string) {
  // Mobile apps such as RedNote copy a share message together with the URL.
  const match = input.match(/https?:\/\/[^\s<>"，。！？、）【】]+/i);
  if (!match || match[0].length > 2048 || !URL.canParse(match[0])) return null;
  const url = new URL(match[0]);
  if (url.username || url.password || url.port || url.pathname === "/") return null;
  const platform = (Object.keys(platforms) as SocialPost["platform"][]).find((key) =>
    platforms[key].hosts.some((host) => url.hostname === host || url.hostname.endsWith("." + host))
  );
  if (!platform) return null;

  url.protocol = "https:";
  let embedUrl: string | undefined;
  if (platform === "instagram") {
    const post = url.pathname.match(/^\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)\/?$/);
    if (post) embedUrl = `https://www.instagram.com/${post[1]}/${post[2]}/embed/captioned/`;
  } else if (platform === "tiktok") {
    const video = url.pathname.match(/^\/@[^/]+\/video\/(\d+)\/?$/);
    if (video) embedUrl = `https://www.tiktok.com/player/v1/${video[1]}`;
  } else if (platform === "threads" && /^\/@[\w.]+\/post\/[\w-]+\/?$/.test(url.pathname)) {
    embedUrl = `https://www.threads.com${url.pathname.replace(/\/$/, "")}/embed`;
  }
  return { platform, postType: platforms[platform].label, href: url.href, embedUrl };
}
