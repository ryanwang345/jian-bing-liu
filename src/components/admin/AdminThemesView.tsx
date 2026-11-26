"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import {
  festivalGroupLabels,
  festivalPresets,
  type FestivalGroupKey,
} from "@/data/festivals";
import type { ActiveFestivalThemeState } from "@/lib/festival-theme-service";
import { resolveFestivalBanner, type FestivalBannerText } from "@/data/festival-banners";
import { FestivalBannerEditor } from "@/components/admin/FestivalBannerEditor";

interface AdminThemesViewProps {
  festivalTheme: ActiveFestivalThemeState | null;
  hasDb: boolean;
  isUpdating: boolean;
  onSelectTheme: (value: string) => void;
  onSaveBanner: (id: string, text: FestivalBannerText) => Promise<boolean>;
}

const GROUPS: FestivalGroupKey[] = ["chinese", "uk", "islamic"];

export function AdminThemesView({
  festivalTheme,
  hasDb,
  isUpdating,
  onSelectTheme,
  onSaveBanner,
}: AdminThemesViewProps) {
  const currentSetting = festivalTheme?.setting ?? "auto";
  const activeFestival = festivalTheme?.activeFestival ?? null;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">
            网店节日与主题中心
          </h1>
          <p className="mt-0.5 text-xs text-[#616161] sm:text-sm">
            一键切换中国、英国及伊斯兰 26 个节假日全站配色、滚动氛围灯，并可编辑顶部双语祝福横幅标题。
          </p>
        </div>

        {isUpdating && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#303030] shadow-2xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            正在保存主题设置...
          </span>
        )}
      </div>

      {/* Mode Selector Card (Auto vs Classic Default) */}
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          disabled={!hasDb || isUpdating}
          onClick={() => onSelectTheme("auto")}
          className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-all ${
            currentSetting === "auto"
              ? "border-[#005bd3] bg-white ring-2 ring-[#005bd3]/20"
              : "border-[#e3e3e3] bg-white hover:border-[#b5b5b5]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1a1a1a]">
                <Sparkles className="h-4 w-4 text-[#005bd3]" />
                智能自动模式（推荐日常使用）
              </span>
              {currentSetting === "auto" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#cdfee1] px-2.5 py-0.5 text-[11px] font-semibold text-[#0c5132]">
                  <Check className="h-3 w-3" />
                  当前启用
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#616161]">
              当「节日限定菜单」里有在售节日菜品时，网站会自动换上该节日的专属配色与顶部祝福条；平时没有节日菜时自动恢复经典原版暖色。
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={!hasDb || isUpdating}
          onClick={() => onSelectTheme("default")}
          className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-all ${
            currentSetting === "default"
              ? "border-[#005bd3] bg-white ring-2 ring-[#005bd3]/20"
              : "border-[#e3e3e3] bg-white hover:border-[#b5b5b5]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#1a1a1a]">
                <span className="h-3.5 w-3.5 rounded-full bg-[#b8251c]" />
                🏮 经典原版主题（煎饼刘默认暖色）
              </span>
              {currentSetting === "default" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#cdfee1] px-2.5 py-0.5 text-[11px] font-semibold text-[#0c5132]">
                  <Check className="h-3 w-3" />
                  当前启用
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#616161]">
              固定使用煎饼刘经典牛皮纸暖底与朱红印章配色，不显示顶部节日横幅。
            </p>
          </div>
        </button>
      </div>

      {/* Grouped 26 Holiday Theme Cards */}
      {GROUPS.map((groupKey) => (
        <section key={groupKey} className="space-y-3">
          <div>
            <h2 className="text-sm font-bold text-[#1a1a1a]">
              {festivalGroupLabels[groupKey].zh}{" "}
              <span className="font-normal text-[#616161]">
                · {festivalGroupLabels[groupKey].en}
              </span>
            </h2>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {festivalPresets
              .filter((p) => p.group === groupKey)
              .map((preset) => {
                const isSelected = currentSetting === preset.id;
                const isResolved = activeFestival?.id === preset.id;
                const banner = resolveFestivalBanner(preset, festivalTheme?.bannerOverrides ?? {});

                return (
                  <div
                    key={preset.id}
                    className={`flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all ${
                      isSelected
                        ? "border-[#005bd3] ring-2 ring-[#005bd3]/20"
                        : "border-[#e3e3e3] hover:border-[#b5b5b5]"
                    }`}
                  >
                    <div>
                      {/* Mini Banner Preview */}
                      <div
                        className="px-3.5 py-2 text-[11px] font-medium truncate"
                        style={{
                          backgroundColor: preset.theme.bannerBg,
                          color: preset.theme.bannerText,
                        }}
                      >
                        {banner.bannerZh}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-[#1a1a1a]">
                              {preset.zh}
                            </h3>
                            <p className="text-[11px] text-[#616161]">
                              {preset.en}
                            </p>
                          </div>

                          {/* Color Swatch Dots */}
                          <div className="flex shrink-0 items-center -space-x-1">
                            {[
                              preset.theme.parchment,
                              preset.theme.kraftDeep,
                              preset.theme.cinnabar,
                              preset.theme.turmeric,
                            ].map((hex, i) => (
                              <span
                                key={i}
                                className="h-4 w-4 rounded-full border border-black/15"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="mt-2 text-[11px] font-medium text-[#616161]">
                          配色方案：{preset.paletteName.zh} ({preset.paletteName.en})
                        </p>
                        <FestivalBannerEditor
                          preset={preset}
                          saved={banner}
                          disabled={!hasDb || isUpdating}
                          onSave={onSaveBanner}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#f1f1f1] bg-[#fafafa] px-4 py-2.5">
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047b5d]">
                          <Check className="h-3.5 w-3.5" />
                          前台正在展示
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#8c8c8c]">
                          点击右侧立即换肤
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={!hasDb || isUpdating || isSelected}
                        onClick={() => onSelectTheme(preset.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isSelected
                            ? "bg-[#ebebeb] text-[#616161]"
                            : "border border-[#d4d4d4] bg-white text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                        } disabled:opacity-50`}
                      >
                        {isSelected ? "已锁定启用" : "应用此主题"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
