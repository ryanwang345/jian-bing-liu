"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import {
  galleryCategoryLabels,
  type GalleryCategoryKey,
  type GalleryItem,
} from "@/data/gallery";
import type { SiteContentConfig } from "@/data/site-content";

const EDITABLE_CATS: Exclude<GalleryCategoryKey, "all">[] = [
  "savoury",
  "sweet",
  "craft",
  "mains",
];

interface AdminGalleryViewProps {
  content: SiteContentConfig;
  hasDb: boolean;
  hasR2: boolean;
  isSaving: boolean;
  onSaveContent: (next: SiteContentConfig, successMsg?: string) => Promise<void>;
  showToast: (type: "success" | "error", text: string) => void;
}

export function AdminGalleryView({
  content,
  hasDb,
  hasR2,
  isSaving,
  onSaveContent,
  showToast,
}: AdminGalleryViewProps) {
  const [draft, setDraft] = useState<SiteContentConfig["pages"]["gallery"]>(
    () => structuredClone(content.pages.gallery)
  );
  const [filterCat, setFilterCat] = useState<GalleryCategoryKey>("all");
  const [isUploading, setIsUploading] = useState(false);
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const handleUploadNewGalleryPhoto = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        showToast("error", data.error || "图片上传失败");
        return;
      }

      const newItem: GalleryItem = {
        id: `gallery-${Date.now().toString(36)}`,
        src: data.url,
        category: filterCat === "all" ? "savoury" : filterCat,
        caption: { zh: "新上传门店实拍", en: "Fresh from our Camden kitchen" },
        alt: { zh: "煎饼刘门店实拍美食", en: "Freshly made dish at Jian Bing Liu" },
        width: 1280,
        height: 960,
      };

      const nextGallery = {
        ...draft,
        items: [newItem, ...draft.items],
      };
      setDraft(nextGallery);
      await onSaveContent(
        {
          ...content,
          pages: { ...content.pages, gallery: nextGallery },
        },
        "新照片已上传并加入实拍图集"
      );
    } catch {
      showToast("error", "图片上传出错");
    } finally {
      setIsUploading(false);
    }
  };

  const moveItem = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= draft.items.length) return;
    const nextItems = [...draft.items];
    const [moved] = nextItems.splice(index, 1);
    nextItems.splice(target, 0, moved);
    setDraft({ ...draft, items: nextItems });
  };

  const updateItem = (index: number, patch: Partial<GalleryItem>) => {
    const nextItems = [...draft.items];
    nextItems[index] = { ...nextItems[index], ...patch };
    setDraft({ ...draft, items: nextItems });
  };

  const removeItem = (index: number) => {
    if (!window.confirm("确定要从实拍图集中移除这张照片吗？")) return;
    setDraft({
      ...draft,
      items: draft.items.filter((_, i) => i !== index),
    });
  };

  const handleSaveAll = () => {
    void onSaveContent(
      {
        ...content,
        pages: { ...content.pages, gallery: draft },
      },
      "实拍图集页面图文与顺序已保存"
    );
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-14 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#dcdcdc] bg-[#f1f1f1]/95 px-4 py-3 backdrop-blur-xs sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">
            实拍图集管理 (/gallery)
          </h1>
          <p className="text-xs text-[#616161]">
            随时上传新照片到图集、修改每张照片的中英文说明、分类与先后顺序（共 {draft.items.length} 张）。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={uploadRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleUploadNewGalleryPhoto(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={!hasDb || !hasR2 || isUploading}
            onClick={() => uploadRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-3.5 py-2 text-xs font-semibold text-[#303030] shadow-2xs hover:bg-[#f7f7f7] disabled:opacity-45"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {isUploading ? "上传中..." : "+ 上传新照片入库"}
          </button>

          <button
            type="button"
            disabled={!hasDb || isSaving}
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#303030] disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            保存图集更改
          </button>
        </div>
      </div>

      {/* Gallery Page Heading Copy */}
      <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-sm font-bold text-[#1a1a1a]">图集页面顶部标题与介绍</h2>
        <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              中文主标题
            </label>
            <input
              type="text"
              value={draft.title.zh}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  title: { ...draft.title, zh: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              English Title
            </label>
            <input
              type="text"
              value={draft.title.en}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  title: { ...draft.title, en: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              中文副标题说明
            </label>
            <input
              type="text"
              value={draft.description.zh}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  description: { ...draft.description, zh: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              English Description
            </label>
            <input
              type="text"
              value={draft.description.en}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  description: { ...draft.description, en: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...EDITABLE_CATS] as GalleryCategoryKey[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCat(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filterCat === cat
                  ? "bg-[#1a1a1a] text-white"
                  : "border border-[#d4d4d4] bg-white text-[#303030] hover:bg-[#f7f7f7]"
              }`}
            >
              {galleryCategoryLabels[cat].zh}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setDraft({
              ...draft,
              items: [
                {
                  id: `gallery-${Date.now().toString(36)}`,
                  src: "/images/roast-duck-jianbing.webp",
                  category: "savoury",
                  caption: { zh: "填写中文图片标题", en: "Enter English caption" },
                  alt: { zh: "煎饼刘美食实拍", en: "Jian Bing Liu dish photo" },
                  width: 1280,
                  height: 960,
                },
                ...draft.items,
              ],
            })
          }
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#005bd3] hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          手动添加一条图片记录
        </button>
      </div>

      {/* Photo Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {draft.items.map((item, idx) => {
          if (filterCat !== "all" && item.category !== filterCat) return null;
          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-[#e3e3e3] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:flex-row"
            >
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg border border-[#e3e3e3] bg-[#f7f7f7] sm:w-32">
                <Image
                  src={item.src}
                  alt={item.caption.zh}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={item.category}
                    onChange={(e) =>
                      updateItem(idx, {
                        category: e.target.value as Exclude<
                          GalleryCategoryKey,
                          "all"
                        >,
                      })
                    }
                    className="rounded-md border border-[#c9cccf] bg-white px-2 py-1 text-xs font-semibold text-[#303030]"
                  >
                    {EDITABLE_CATS.map((c) => (
                      <option key={c} value={c}>
                        {galleryCategoryLabels[c].zh}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      aria-label="上移"
                      className="rounded p-1 text-[#616161] hover:bg-[#f1f1f1] disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === draft.items.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      aria-label="下移"
                      className="rounded p-1 text-[#616161] hover:bg-[#f1f1f1] disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      aria-label="删除图片"
                      className="rounded p-1 text-[#616161] hover:bg-[#fee] hover:text-[#d82c0d]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={item.caption.zh}
                  onChange={(e) =>
                    updateItem(idx, {
                      caption: { ...item.caption, zh: e.target.value },
                      alt: { ...item.alt, zh: e.target.value },
                    })
                  }
                  placeholder="中文图片标题"
                  className="w-full rounded-md border border-[#c9cccf] px-2.5 py-1.5 text-xs font-semibold text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                />
                <input
                  type="text"
                  value={item.caption.en}
                  onChange={(e) =>
                    updateItem(idx, {
                      caption: { ...item.caption, en: e.target.value },
                      alt: { ...item.alt, en: e.target.value },
                    })
                  }
                  placeholder="English photo caption"
                  className="w-full rounded-md border border-[#c9cccf] px-2.5 py-1.5 text-xs text-[#303030] outline-none focus:border-[#005bd3]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
