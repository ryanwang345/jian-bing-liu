"use client";

import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { FESTIVAL_BANNER_MAX_LENGTH, type FestivalBannerText } from "@/data/festival-banners";
import type { FestivalPreset } from "@/data/festivals";

interface FestivalBannerEditorProps {
  preset: FestivalPreset;
  saved: FestivalBannerText;
  disabled: boolean;
  onSave: (id: string, text: FestivalBannerText) => Promise<boolean>;
}

export function FestivalBannerEditor({ preset, saved, disabled, onSave }: FestivalBannerEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FestivalBannerText>(saved);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setDraft(saved); setEditing(true); }}
        aria-label={`编辑${preset.zh}的节日标题`}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] px-3 py-1.5 text-sm font-semibold text-[#303030] hover:bg-[#f5f5f5] disabled:opacity-50"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        编辑节日标题
      </button>
    );
  }

  return (
    <form
      className="mt-4 space-y-3 border-t border-[#e3e3e3] pt-3"
      onSubmit={async (event) => {
        event.preventDefault();
        if (disabled || saving) return;
        setSaving(true);
        try {
          if (await onSave(preset.id, draft)) setEditing(false);
        } finally {
          setSaving(false);
        }
      }}
    >
      <p id={`${preset.id}-banner-help`} className="text-sm text-[#616161]">
        修改网店顶部祝福横幅；每种语言最多 {FESTIVAL_BANNER_MAX_LENGTH} 个字符，留空使用默认文案。
      </p>
      {([ ["bannerZh", "中文标题"], ["bannerEn", "英文标题"] ] as const).map(([field, label]) => (
        <div key={field}>
          <label htmlFor={`${preset.id}-${field}`} className="mb-1 block text-sm font-semibold text-[#303030]">{label}</label>
          <textarea
            id={`${preset.id}-${field}`}
            aria-describedby={`${preset.id}-banner-help`}
            value={draft[field]}
            placeholder={preset[field]}
            maxLength={FESTIVAL_BANNER_MAX_LENGTH}
            disabled={disabled || saving}
            rows={3}
            onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
            className="w-full resize-y rounded-lg border border-[#8c8c8c] bg-white px-3 py-2 text-base text-[#1a1a1a] focus:border-[#005bd3] focus:outline-none focus:ring-2 focus:ring-[#005bd3]/20 disabled:opacity-50"
          />
        </div>
      ))}
      <div
        className="rounded-lg p-3 text-sm break-words shadow-xs"
        style={{
          backgroundImage: `linear-gradient(105deg, ${preset.theme.bannerBg} 0%, ${preset.theme.bannerBgEnd} 60%, ${preset.theme.bannerBg} 100%)`,
          color: preset.theme.bannerText,
          borderBottom: `2px solid ${preset.theme.bannerAccent}`,
        }}
      >
        <p>{draft.bannerZh.trim() || preset.bannerZh}</p>
        <p className="mt-2">{draft.bannerEn.trim() || preset.bannerEn}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={disabled || saving} className="inline-flex items-center gap-1 rounded-lg bg-[#303030] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          {saving ? "保存中..." : "保存标题"}
        </button>
        <button type="button" disabled={disabled || saving} onClick={() => setEditing(false)} className="rounded-lg border border-[#d4d4d4] px-3 py-2 text-sm text-[#303030] disabled:opacity-50">取消</button>
        <button type="button" disabled={disabled || saving} onClick={() => setDraft({ bannerZh: preset.bannerZh, bannerEn: preset.bannerEn })} className="rounded-lg px-2 py-2 text-sm text-[#005bd3] disabled:opacity-50">恢复默认文案</button>
      </div>
      <p className="text-sm text-[#616161]">预览及恢复默认后，点击「保存标题」生效。</p>
    </form>
  );
}
