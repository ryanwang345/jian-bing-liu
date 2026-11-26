"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload } from "lucide-react";

async function resizePhotoForUpload(file: File): Promise<File> {
  const isPhoto =
    file.type.startsWith("image/") || /\.hei[cf]$/i.test(file.name);
  if (file.size <= 6 * 1024 * 1024 || !isPhoto) {
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

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

interface AdminPhotoFieldProps {
  label: string;
  value: string;
  hasR2: boolean;
  onChange: (nextUrl: string) => void;
  showToast: (type: "success" | "error", text: string) => void;
}

export function AdminPhotoField({
  label,
  value,
  hasR2,
  onChange,
  showToast,
}: AdminPhotoFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    try {
      const optimized = await resizePhotoForUpload(file);
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
      onChange(data.url);
      showToast("success", "新照片已上传到 R2（记得点右上角「保存更改」）");
    } catch {
      showToast("error", "图片上传出错");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-3">
      <label className="block text-xs font-bold text-[#1a1a1a]">{label}</label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          onClick={() => {
            if (hasR2 && !isUploading) inputRef.current?.click();
          }}
          className="relative flex h-20 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-[#c9cccf] bg-white"
        >
          {value ? (
            <Image
              src={value}
              alt={label}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <ImagePlus className="h-5 w-5 text-[#8c8c8c]" />
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={!hasR2 || isUploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-3 py-1.5 text-xs font-semibold text-[#303030] hover:bg-[#f1f1f1] disabled:opacity-45"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {isUploading ? "上传中..." : "拍照 / 上传换图"}
          </button>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/... 或 /api/media/..."
            className="w-full rounded-lg border border-[#c9cccf] bg-white px-2.5 py-1 text-xs text-[#303030] outline-none focus:border-[#005bd3]"
          />
        </div>
      </div>
    </div>
  );
}
