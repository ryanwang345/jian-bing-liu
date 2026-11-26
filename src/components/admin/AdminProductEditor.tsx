"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import {
  festivalGroupLabels,
  festivalPresets,
  matchFestivalPresetId,
  type FestivalGroupKey,
} from "@/data/festivals";
import {
  dietaryLabels,
  type DietaryTagKey,
  type MenuCategory,
  type MenuItem,
} from "@/data/menu";

export interface EditableVariant {
  id?: string;
  sizeZh: string;
  sizeEn: string;
  pricePounds: string;
  isDefault: boolean;
}

export interface DishFormState {
  id?: string;
  draftId?: string;
  uploadedPhotoUrls: string[];
  categoryId: string;
  festivalPresetId: string;
  noteZh: string;
  noteEn: string;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  imageUrl: string;
  dietary: DietaryTagKey[];
  featured: boolean;
  isAvailable: boolean;
  variants: EditableVariant[];
}

const ALL_DIETARY: DietaryTagKey[] = ["halal", "vegetarian", "vegan"];
const FESTIVAL_GROUPS: FestivalGroupKey[] = ["chinese", "uk", "islamic"];

export function itemToFormState(
  categoryId: string,
  item?: MenuItem
): DishFormState {
  if (!item) {
    return {
      draftId: crypto.randomUUID(),
      uploadedPhotoUrls: [],
      categoryId,
      festivalPresetId: "",
      noteZh: "",
      noteEn: "",
      nameZh: "",
      nameEn: "",
      descZh: "",
      descEn: "",
      imageUrl: "",
      dietary: [],
      featured: false,
      isAvailable: true,
      variants: [
        {
          sizeZh: "标准",
          sizeEn: "Regular",
          pricePounds: "10.00",
          isDefault: true,
        },
      ],
    };
  }

  const variants: EditableVariant[] =
    item.variants && item.variants.length > 0
      ? item.variants.map((v, idx) => ({
          id: v.id,
          sizeZh: v.size.zh,
          sizeEn: v.size.en,
          pricePounds: (v.pricePence / 100).toFixed(2),
          isDefault: v.isDefault ?? idx === 0,
        }))
      : [
          {
            sizeZh: "标准",
            sizeEn: "Regular",
            pricePounds: item.price ? item.price.replace(/[^0-9.]/g, "") : "",
            isDefault: true,
          },
        ];

  return {
    id: item.id,
    uploadedPhotoUrls: [],
    categoryId,
    festivalPresetId: matchFestivalPresetId(item.note?.zh, item.note?.en),
    noteZh: item.note?.zh ?? "",
    noteEn: item.note?.en ?? "",
    nameZh: item.name.zh,
    nameEn: item.name.en,
    descZh: item.description.zh,
    descEn: item.description.en,
    imageUrl: item.image ?? "",
    dietary: item.dietary ? [...item.dietary] : [],
    featured: Boolean(item.featured),
    isAvailable: item.isAvailable !== false,
    variants,
  };
}

async function downsizeLargeUpload(file: File): Promise<File> {
  const isPhoto =
    file.type.startsWith("image/") || /\.hei[cf]$/i.test(file.name);
  if (file.size <= 8 * 1024 * 1024 || !isPhoto) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1280;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.84)
    );
    if (!blob || blob.type !== "image/webp") return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "dish";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

interface AdminProductEditorProps {
  form: DishFormState;
  categories: MenuCategory[];
  hasR2: boolean;
  isSaving: boolean;
  onChange: (next: DishFormState) => void;
  onSave: (event: React.FormEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
  showToast: (type: "success" | "error", text: string) => void;
}

export function AdminProductEditor({
  form,
  categories,
  hasR2,
  isSaving,
  onChange,
  onSave,
  onCancel,
  onDelete,
  showToast,
}: AdminProductEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadPhoto = async (file: File) => {
    setIsUploading(true);
    try {
      const optimized = await downsizeLargeUpload(file);
      const formData = new FormData();
      formData.append("file", optimized);

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

      onChange({
        ...form,
        imageUrl: data.url,
        uploadedPhotoUrls: [...form.uploadedPhotoUrls, data.url],
      });
      showToast("success", "照片已上传至 Cloudflare R2");
    } catch {
      showToast("error", "图片上传出错");
    } finally {
      setIsUploading(false);
    }
  };

  const addVariantPreset = (sizeZh: string, sizeEn: string) => {
    onChange({
      ...form,
      variants: [
        ...form.variants,
        {
          sizeZh,
          sizeEn,
          pricePounds: "",
          isDefault: form.variants.length === 0,
        },
      ],
    });
  };

  return (
    <form onSubmit={onSave} className="space-y-5 pb-20">
      {/* Shopify Sticky Action Header */}
      <div className="sticky top-14 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#dcdcdc] bg-[#f1f1f1]/95 px-4 py-3 backdrop-blur-xs sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg border border-[#d4d4d4] bg-white p-1.5 text-[#303030] shadow-2xs hover:bg-[#f7f7f7]"
            aria-label="返回菜品列表"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-[#1a1a1a] sm:text-xl">
                {form.id ? form.nameZh || "编辑菜品" : "新增菜品"}
              </h1>
              {form.id && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    form.isAvailable
                      ? "bg-[#cdfee1] text-[#0c5132]"
                      : "bg-[#ffd6a4] text-[#5e4200]"
                  }`}
                >
                  {form.isAvailable ? "在售中" : "已售罄"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#d4d4d4] bg-white px-3.5 py-2 text-xs font-semibold text-[#303030] shadow-2xs hover:bg-[#f7f7f7]"
          >
            放弃更改
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#303030] disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            保存菜品
          </button>
        </div>
      </div>

      {/* Shopify Two-Column Product Detail Grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left Main Column (2/3) */}
        <div className="space-y-5 lg:col-span-2">
          {/* Card 1: Title & Descriptions */}
          <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm font-bold text-[#1a1a1a]">菜品名称与介绍</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  中文名称 *
                </label>
                <input
                  type="text"
                  required
                  value={form.nameZh}
                  onChange={(e) => onChange({ ...form, nameZh: e.target.value })}
                  placeholder="如：招牌烤鸭煎饼"
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  English Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.nameEn}
                  onChange={(e) => onChange({ ...form, nameEn: e.target.value })}
                  placeholder="e.g. Roast Duck Jian Bing"
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  中文菜品介绍
                </label>
                <textarea
                  rows={3}
                  value={form.descZh}
                  onChange={(e) => onChange({ ...form, descZh: e.target.value })}
                  placeholder="描述口感、配料与特色..."
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs leading-relaxed text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#303030]">
                  English Description
                </label>
                <textarea
                  rows={3}
                  value={form.descEn}
                  onChange={(e) => onChange({ ...form, descEn: e.target.value })}
                  placeholder="Ingredients, texture and preparation..."
                  className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs leading-relaxed text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Media (Cloudflare R2) */}
          <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1a1a1a]">
                菜品实拍图（Cloudflare R2）
              </h2>
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ ...form, imageUrl: "" })}
                  className="text-xs font-semibold text-[#d82c0d] hover:underline"
                >
                  移除图片
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                onClick={() => {
                  if (hasR2 && !isUploading) fileInputRef.current?.click();
                }}
                className="relative flex h-36 w-36 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#c9cccf] bg-[#fafafa] transition-colors hover:border-[#005bd3]"
              >
                {form.imageUrl ? (
                  <Image
                    src={form.imageUrl}
                    alt="菜品预览"
                    fill
                    sizes="144px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center text-[#616161]">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-[11px] font-medium">点击上传照片</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUploadPhoto(f);
                    e.target.value = "";
                  }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploading || !hasR2}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-3.5 py-2 text-xs font-semibold text-[#303030] shadow-2xs hover:bg-[#f7f7f7] disabled:opacity-45"
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {isUploading ? "自动压缩上传中..." : "手机拍照 / 从相册上传"}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#616161]">
                    图片路径（上传后自动填入，也可粘贴已有路径）
                  </label>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) =>
                      onChange({ ...form, imageUrl: e.target.value })
                    }
                    placeholder="/api/media/dishes/... 或 /images/..."
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-[#fafafa] px-3 py-1.5 text-xs text-[#303030] outline-none focus:border-[#005bd3] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Multi-Size & Pricing Variants */}
          <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#1a1a1a]">
                  规格与价格（Variants）
                </h2>
                <p className="text-xs text-[#616161]">
                  支持单规格或多档分量定价；勾选「默认主价」将显示在菜单卡片最醒目位置。
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => addVariantPreset("中份", "Medium")}
                  className="rounded-lg border border-[#d4d4d4] bg-white px-2.5 py-1 text-xs font-semibold text-[#303030] hover:bg-[#f7f7f7]"
                >
                  + 中份
                </button>
                <button
                  type="button"
                  onClick={() => addVariantPreset("大份", "Large")}
                  className="rounded-lg border border-[#d4d4d4] bg-white px-2.5 py-1 text-xs font-semibold text-[#303030] hover:bg-[#f7f7f7]"
                >
                  + 大份
                </button>
                <button
                  type="button"
                  onClick={() => addVariantPreset("8个", "8 Pieces")}
                  className="rounded-lg border border-[#d4d4d4] bg-white px-2.5 py-1 text-xs font-semibold text-[#303030] hover:bg-[#f7f7f7]"
                >
                  + 8个
                </button>
                <button
                  type="button"
                  onClick={() => addVariantPreset("标准", "Regular")}
                  className="rounded-lg bg-[#1a1a1a] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#303030]"
                >
                  + 添加规格
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {form.variants.map((variant, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 items-center gap-2 rounded-lg border border-[#e3e3e3] bg-[#fafafa] p-2.5"
                >
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={variant.sizeZh}
                      onChange={(e) => {
                        const next = [...form.variants];
                        next[idx] = { ...next[idx], sizeZh: e.target.value };
                        onChange({ ...form, variants: next });
                      }}
                      placeholder="中文规格"
                      className="w-full rounded-md border border-[#c9cccf] bg-white px-2.5 py-1.5 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={variant.sizeEn}
                      onChange={(e) => {
                        const next = [...form.variants];
                        next[idx] = { ...next[idx], sizeEn: e.target.value };
                        onChange({ ...form, variants: next });
                      }}
                      placeholder="Size (EN)"
                      className="w-full rounded-md border border-[#c9cccf] bg-white px-2.5 py-1.5 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                    />
                  </div>
                  <div className="relative col-span-3">
                    <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-[#616161]">
                      £
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.pricePounds}
                      onChange={(e) => {
                        const next = [...form.variants];
                        next[idx] = {
                          ...next[idx],
                          pricePounds: e.target.value,
                        };
                        onChange({ ...form, variants: next });
                      }}
                      placeholder="12.00"
                      className="w-full rounded-md border border-[#c9cccf] bg-white py-1.5 pr-2 pl-6 text-xs font-semibold tabular-nums text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                    />
                  </div>
                  <label className="col-span-2 flex cursor-pointer items-center justify-center gap-1 text-[11px] font-semibold text-[#303030]">
                    <input
                      type="radio"
                      name="default-variant"
                      checked={variant.isDefault}
                      onChange={() => {
                        const next = form.variants.map((v, i) => ({
                          ...v,
                          isDefault: i === idx,
                        }));
                        onChange({ ...form, variants: next });
                      }}
                    />
                    默认主价
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = form.variants.filter((_, i) => i !== idx);
                      if (next.length > 0 && !next.some((v) => v.isDefault)) {
                        next[0].isDefault = true;
                      }
                      onChange({ ...form, variants: next });
                    }}
                    aria-label="删除此规格"
                    className="col-span-1 flex items-center justify-center rounded p-1 text-[#616161] hover:bg-[#fee] hover:text-[#d82c0d]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (1/3) */}
        <div className="space-y-5">
          {/* Status Card */}
          <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <label className="block text-sm font-bold text-[#1a1a1a]">
              销售状态
            </label>
            <select
              value={form.isAvailable ? "active" : "sold_out"}
              onChange={(e) =>
                onChange({ ...form, isAvailable: e.target.value === "active" })
              }
              className="mt-2.5 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs font-semibold text-[#1a1a1a] outline-none focus:border-[#005bd3]"
            >
              <option value="active">● 在售中（正常供应）</option>
              <option value="sold_out">○ 已售罄（前台变灰保留展示）</option>
            </select>
            <p className="mt-2 text-[11px] text-[#616161]">
              设为「已售罄」不会删除菜品，顾客依然能看到菜品但会显示灰底与「已售罄」提示。
            </p>
          </div>

          {/* Organization: Category + Festival */}
          <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm font-bold text-[#1a1a1a]">分类与节日归属</h2>

            <div>
              <label className="block text-xs font-semibold text-[#303030]">
                所属菜单分类
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  onChange({ ...form, categoryId: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs font-semibold text-[#1a1a1a] outline-none focus:border-[#005bd3]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title.zh} — {cat.title.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#303030]">
                节日限定标签（中 / 英 / 伊斯兰节假日）
              </label>
              <select
                value={form.festivalPresetId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    onChange({
                      ...form,
                      festivalPresetId: "",
                      noteZh: "",
                      noteEn: "",
                    });
                  } else if (val === "custom") {
                    onChange({ ...form, festivalPresetId: "custom" });
                  } else {
                    const preset = festivalPresets.find((p) => p.id === val);
                    onChange({
                      ...form,
                      festivalPresetId: val,
                      noteZh: preset?.zh ?? "",
                      noteEn: preset?.en ?? "",
                    });
                  }
                }}
                className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
              >
                <option value="">不指定节日（常规菜品）</option>
                {FESTIVAL_GROUPS.map((groupKey) => (
                  <optgroup
                    key={groupKey}
                    label={`── ${festivalGroupLabels[groupKey].zh} (${festivalGroupLabels[groupKey].en}) ──`}
                  >
                    {festivalPresets
                      .filter((p) => p.group === groupKey)
                      .map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.zh} — {preset.en}
                        </option>
                      ))}
                  </optgroup>
                ))}
                <optgroup label="── 其他 ──">
                  <option value="custom">✍️ 自定义节日标签...</option>
                </optgroup>
              </select>

              {form.festivalPresetId === "custom" && (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={form.noteZh}
                    onChange={(e) =>
                      onChange({ ...form, noteZh: e.target.value })
                    }
                    placeholder="中文标签（如：🌸 春季限定）"
                    className="w-full rounded-lg border border-[#c9cccf] px-2.5 py-1.5 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                  />
                  <input
                    type="text"
                    value={form.noteEn}
                    onChange={(e) =>
                      onChange({ ...form, noteEn: e.target.value })
                    }
                    placeholder="English label (e.g. 🌸 Spring Special)"
                    className="w-full rounded-lg border border-[#c9cccf] px-2.5 py-1.5 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dietary & Homepage Featured Card */}
          <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm font-bold text-[#1a1a1a]">饮食筛选与推荐</h2>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 py-2.5 text-xs font-semibold text-[#1a1a1a]">
              <span>⭐ 设为首页「招牌美味」推荐</span>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  onChange({ ...form, featured: e.target.checked })
                }
                className="h-4 w-4 accent-[#1a1a1a]"
              />
            </label>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#303030]">饮食属性标签</p>
              {ALL_DIETARY.map((tag) => {
                const active = form.dietary.includes(tag);
                return (
                  <label
                    key={tag}
                    className="flex cursor-pointer items-center gap-2 text-xs text-[#303030]"
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {
                        const next = active
                          ? form.dietary.filter((t) => t !== tag)
                          : [...form.dietary, tag];
                        onChange({ ...form, dietary: next });
                      }}
                      className="h-4 w-4 accent-[#1a1a1a]"
                    />
                    <span>
                      {dietaryLabels[tag].zh} ({dietaryLabels[tag].en})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Delete Product Card */}
          {form.id && onDelete && (
            <div className="rounded-xl border border-[#fed3d1] bg-[#fff4f4] p-4">
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#d82c0d] bg-white px-3.5 py-2 text-xs font-semibold text-[#d82c0d] hover:bg-[#d82c0d] hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
                永久删除此菜品
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
