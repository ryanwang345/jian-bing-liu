"use client";

import { useActionState, useState } from "react";
import { saveSocialProfile } from "@/app/admin/social/actions";
import { SocialIcon } from "@/components/SocialIcon";
import type { SocialProfile } from "@/lib/social-profiles";

interface SocialProfileFormProps {
  profile: SocialProfile;
  writable: boolean;
}

export function SocialProfileForm({ profile, writable }: SocialProfileFormProps) {
  const [status, action, pending] = useActionState(saveSocialProfile, {
    message: "",
    ok: false,
  });
  const [handle, setHandle] = useState(profile.handle);
  const [href, setHref] = useState(profile.href);
  const [visible, setVisible] = useState(profile.visible);
  const [edited, setEdited] = useState(false);
  const fieldClass = "mt-1 block w-full rounded-lg border border-kraft-deep bg-white px-3 py-2 text-base text-ink";

  return (
    <form
      action={action}
      onChange={() => setEdited(true)}
      onSubmit={() => setEdited(false)}
      className="rounded-2xl border border-kraft-deep bg-white p-5"
    >
      <input type="hidden" name="platform" value={profile.platform} />
      <fieldset disabled={!writable || pending} className="space-y-3">
        <legend className="mb-3 flex items-center gap-2 font-semibold">
          <SocialIcon platform={profile.platform} className="h-5 w-5" />
          {profile.label.zh}
        </legend>
        <label className="block text-sm">
          账号 / 昵称
          <input
            name="handle"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            required
            maxLength={100}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm">
          主页链接
          <input
            type="url"
            name="href"
            value={href}
            onChange={(event) => setHref(event.target.value)}
            required
            maxLength={2048}
            className={fieldClass}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="visible"
            checked={visible}
            onChange={(event) => setVisible(event.target.checked)}
          />
          在网站上显示此账号
        </label>
        <button
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          type="submit"
        >
          {pending ? "保存中…" : "保存"}
        </button>
        <span role="status" className={status.ok ? "ml-3 text-sm text-jade" : "ml-3 text-sm text-cinnabar"}>
          {!edited && !pending && status.message}
        </span>
      </fieldset>
    </form>
  );
}
