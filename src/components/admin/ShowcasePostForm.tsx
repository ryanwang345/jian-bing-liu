"use client";

import { useState, type FormEvent } from "react";
import { ExternalLink } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";
import { updateShowcasePost } from "@/app/admin/posts/actions";
import { REDNOTE_PROFILE_URL } from "@/data/reviews";
import type { ManagedPost } from "@/lib/showcase-posts";

const fieldClass = "mt-1 block w-full rounded-lg border border-kraft-deep bg-white px-3 py-2 text-base text-ink";
const buttonClass = "rounded-full border border-kraft-deep px-4 py-2 text-sm font-semibold hover:border-cinnabar disabled:opacity-50";

export function ShowcasePostForm({ post, writable }: { post?: ManagedPost; writable: boolean }) {
  const [editing, setEditing] = useState(!post);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent = submitter instanceof HTMLButtonElement ? submitter.value : "save";
    const data = new FormData(form);
    data.set("intent", intent);
    setPending(true);
    setResult(null);
    try {
      const response = await updateShowcasePost(data);
      setResult(response);
      if (response.ok) {
        if (post) setEditing(false);
        else form.reset();
      }
    } catch {
      setResult({ ok: false, message: "连接失败，请重试。" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-kraft-deep bg-white p-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      <fieldset disabled={pending || !writable} className="min-w-0">
        {post ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex min-w-0 items-start gap-2 font-semibold">
                <SocialIcon platform={post.platform} className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="break-words">{post.title.zh}</span>
              </h3>
              <span className="shrink-0 text-sm text-ink-muted">{!post.visible ? "已撤下" : post.href === REDNOTE_PROFILE_URL ? "随小红书账号展示" : "展示中"}</span>
            </div>
            <p className="mt-1 truncate text-xs text-ink-muted">{post.href}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a href={post.href} target="_blank" rel="noopener noreferrer" className="mr-auto inline-flex items-center gap-1 text-sm text-cinnabar">
                查看原帖 <ExternalLink className="h-3 w-3" />
              </a>
              <button type="button" className={buttonClass} aria-expanded={editing}
                onClick={() => { setEditing(!editing); setResult(null); }}>
                {editing ? "取消编辑" : "编辑"}
              </button>
              {!editing && (
                <button type="submit" value={post.visible ? "hide" : "show"} className={buttonClass}>
                  {post.visible ? "从首页撤下" : "恢复展示"}
                </button>
              )}
            </div>
          </>
        ) : <h2 className="text-lg font-semibold">添加帖子</h2>}

        {editing && (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-semibold">
              帖子链接或分享文字
              <textarea name="href" required maxLength={5000} rows={2} defaultValue={post?.href}
                placeholder="粘贴从平台「分享」里复制的内容" className={fieldClass} />
            </label>
            <label className="block text-sm">
              展示标题（选填）
              <input name="titleZh" maxLength={200} defaultValue={post?.title.zh} className={fieldClass} />
            </label>
            <label className="block text-sm">
              说明（选填）
              <textarea name="captionZh" rows={2} maxLength={2000} defaultValue={post?.caption.zh} className={fieldClass} />
            </label>
            <details>
              <summary className="cursor-pointer text-sm font-semibold">英文标题和说明（选填）</summary>
              <label className="mt-3 block text-sm">
                英文标题
                <input name="titleEn" maxLength={200} defaultValue={post?.title.en === post?.title.zh ? "" : post?.title.en} className={fieldClass} />
              </label>
              <label className="mt-3 block text-sm">
                英文说明
                <textarea name="captionEn" rows={2} maxLength={2000} defaultValue={post?.caption.en === post?.caption.zh ? "" : post?.caption.en} className={fieldClass} />
              </label>
            </details>
            <button type="submit" value="save" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {pending ? "保存中…" : post ? "保存修改" : "添加到首页"}
            </button>
          </div>
        )}
      </fieldset>
      {result && <p role="status" className={`mt-3 text-sm ${result.ok ? "text-jade" : "text-cinnabar"}`}>{result.message}</p>}
    </form>
  );
}
