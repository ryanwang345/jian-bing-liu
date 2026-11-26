"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { SiteContentConfig } from "@/data/site-content";

interface AdminSettingsViewProps {
  content: SiteContentConfig;
  hasDb: boolean;
  isSaving: boolean;
  onSaveContent: (next: SiteContentConfig, successMsg?: string) => Promise<void>;
}

export function AdminSettingsView({
  content,
  hasDb,
  isSaving,
  onSaveContent,
}: AdminSettingsViewProps) {
  const [store, setStore] = useState<SiteContentConfig["store"]>(() =>
    structuredClone(content.store)
  );
  const [newArrivals, setNewArrivals] = useState<
    SiteContentConfig["newArrivals"]
  >(() => structuredClone(content.newArrivals));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void onSaveContent(
      { ...content, store, newArrivals },
      "店铺信息、营业时间与新品横幅设置已保存生效"
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-20">
      <div className="sticky top-14 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#dcdcdc] bg-[#f1f1f1]/95 px-4 py-3 backdrop-blur-xs sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">
            店铺设置与营业时间
          </h1>
          <p className="text-xs text-[#616161]">
            修改营业时间、临时店休开关、联系电话、地址、外卖链接与页脚说明。
          </p>
        </div>

        <button
          type="submit"
          disabled={!hasDb || isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#303030] disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          保存店铺设置
        </button>
      </div>

      {/* Card 1: Emergency Closure & Custom Top Banner */}
      <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-sm font-bold text-[#1a1a1a]">
          今日营业状态与置顶公告条
        </h2>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#ffd6a4] bg-[#fff5ea] p-3.5">
          <div>
            <p className="text-xs font-bold text-[#5e4200] sm:text-sm">
              🛑 开启「今日临时店休」模式
            </p>
            <p className="mt-0.5 text-xs text-[#8a5000]">
              开启后，首页与到店页的营业徽章会立刻变为「今日临时休息」，并在网站最上方醒目显示下方休息通知。
            </p>
          </div>
          <input
            type="checkbox"
            checked={store.temporarilyClosed}
            onChange={(e) =>
              setStore({ ...store, temporarilyClosed: e.target.checked })
            }
            className="h-5 w-5 shrink-0 accent-[#d82c0d]"
          />
        </label>

        {store.temporarilyClosed && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#303030]">
                临时店休中文通知
              </label>
              <input
                type="text"
                value={store.closedNotice.zh}
                onChange={(e) =>
                  setStore({
                    ...store,
                    closedNotice: { ...store.closedNotice, zh: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#303030]">
                Temporary Closure Notice (EN)
              </label>
              <input
                type="text"
                value={store.closedNotice.en}
                onChange={(e) =>
                  setStore({
                    ...store,
                    closedNotice: { ...store.closedNotice, en: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
              />
            </div>
          </div>
        )}

        <div className="border-t border-[#ebebeb] pt-4">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#1a1a1a]">
                📢 开启自定义顶部公告横幅（如上新、打折、假期营业提醒）
              </p>
            </div>
            <input
              type="checkbox"
              checked={store.customAnnouncementEnabled}
              onChange={(e) =>
                setStore({
                  ...store,
                  customAnnouncementEnabled: e.target.checked,
                })
              }
              className="h-4 w-4 accent-[#1a1a1a]"
            />
          </label>

          {store.customAnnouncementEnabled && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={store.customAnnouncement.zh}
                onChange={(e) =>
                  setStore({
                    ...store,
                    customAnnouncement: {
                      ...store.customAnnouncement,
                      zh: e.target.value,
                    },
                  })
                }
                placeholder="中文公告（如：本周新品脆皮烤鸭煎饼 £12 热卖中！）"
                className="w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
              />
              <input
                type="text"
                value={store.customAnnouncement.en}
                onChange={(e) =>
                  setStore({
                    ...store,
                    customAnnouncement: {
                      ...store.customAnnouncement,
                      en: e.target.value,
                    },
                  })
                }
                placeholder="English announcement..."
                className="w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Card 1.5: New Arrivals Banner Settings */}
      <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#1a1a1a]">
              🆕 新品上市横幅设置
            </h2>
            <p className="mt-0.5 text-xs text-[#616161]">
              每当您在「全部菜品」新增菜品或勾选「标为新品上市」时，网站顶部会自动展示新品横幅与跳转按钮。
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 py-1.5 text-xs font-semibold text-[#1a1a1a]">
            <input
              type="checkbox"
              checked={newArrivals.bannerEnabled}
              onChange={(e) =>
                setNewArrivals({
                  ...newArrivals,
                  bannerEnabled: e.target.checked,
                })
              }
              className="h-4 w-4 accent-[#1a1a1a]"
            />
            启用新品横幅
          </label>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              新品标签自动保留天数
            </label>
            <select
              value={String(newArrivals.autoExpireDays)}
              onChange={(e) =>
                setNewArrivals({
                  ...newArrivals,
                  autoExpireDays: Number(e.target.value),
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs font-semibold text-[#1a1a1a]"
            >
              <option value="7">7 天后自动撤下</option>
              <option value="14">14 天后自动撤下</option>
              <option value="30">30 天后自动撤下（推荐）</option>
              <option value="60">60 天后自动撤下</option>
              <option value="0">手动取消前一直显示</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              横幅徽章标题（中文）
            </label>
            <input
              type="text"
              value={newArrivals.title.zh}
              onChange={(e) =>
                setNewArrivals({
                  ...newArrivals,
                  title: { ...newArrivals.title, zh: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              Banner Badge Title (EN)
            </label>
            <input
              type="text"
              value={newArrivals.title.en}
              onChange={(e) =>
                setNewArrivals({
                  ...newArrivals,
                  title: { ...newArrivals.title, en: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              横幅副文案（中文，显示在新品菜名后）
            </label>
            <input
              type="text"
              value={newArrivals.message.zh}
              onChange={(e) =>
                setNewArrivals({
                  ...newArrivals,
                  message: { ...newArrivals.message, zh: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              Banner Subtext (EN)
            </label>
            <input
              type="text"
              value={newArrivals.message.en}
              onChange={(e) =>
                setNewArrivals({
                  ...newArrivals,
                  message: { ...newArrivals.message, en: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              右侧按钮文字（中文）
            </label>
            <input
              type="text"
              value={newArrivals.ctaLabel.zh}
              onChange={(e) =>
                setNewArrivals({
                  ...newArrivals,
                  ctaLabel: { ...newArrivals.ctaLabel, zh: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              CTA Button Label (EN)
            </label>
            <input
              type="text"
              value={newArrivals.ctaLabel.en}
              onChange={(e) =>
                setNewArrivals({
                  ...newArrivals,
                  ctaLabel: { ...newArrivals.ctaLabel, en: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Opening Hours */}
      <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-sm font-bold text-[#1a1a1a]">每日营业时间设置</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              周一至三开门 (HH:MM)
            </label>
            <input
              type="time"
              value={store.monWedOpens}
              onChange={(e) =>
                setStore({ ...store, monWedOpens: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs font-semibold text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              周一至三打烊 (HH:MM)
            </label>
            <input
              type="time"
              value={store.monWedCloses}
              onChange={(e) =>
                setStore({ ...store, monWedCloses: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs font-semibold text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              周四至日开门 (HH:MM)
            </label>
            <input
              type="time"
              value={store.thuSunOpens}
              onChange={(e) =>
                setStore({ ...store, thuSunOpens: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs font-semibold text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              周四至日打烊 (HH:MM)
            </label>
            <input
              type="time"
              value={store.thuSunCloses}
              onChange={(e) =>
                setStore({ ...store, thuSunCloses: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs font-semibold text-[#1a1a1a]"
            />
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              营业时间中文摘要（显示在首页信息栏与页脚）
            </label>
            <input
              type="text"
              value={store.hoursSummaryZh}
              onChange={(e) =>
                setStore({ ...store, hoursSummaryZh: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              Opening Hours Summary (EN)
            </label>
            <input
              type="text"
              value={store.hoursSummaryEn}
              onChange={(e) =>
                setStore({ ...store, hoursSummaryEn: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Brand, Phone, Address & Ordering Links */}
      <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-sm font-bold text-[#1a1a1a]">
          品牌名称、电话、地址与外卖平台链接
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              中文店名
            </label>
            <input
              type="text"
              value={store.nameZh}
              onChange={(e) => setStore({ ...store, nameZh: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              English Brand Name
            </label>
            <input
              type="text"
              value={store.nameEn}
              onChange={(e) => setStore({ ...store, nameEn: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              红印章字
            </label>
            <input
              type="text"
              value={store.sealText}
              onChange={(e) => setStore({ ...store, sealText: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              书法副标语
            </label>
            <input
              type="text"
              value={store.taglineZh}
              onChange={(e) =>
                setStore({ ...store, taglineZh: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              门店联系电话
            </label>
            <input
              type="text"
              value={store.phoneDisplay}
              onChange={(e) =>
                setStore({ ...store, phoneDisplay: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              英文街道地址
            </label>
            <input
              type="text"
              value={store.street}
              onChange={(e) => setStore({ ...store, street: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              邮编 (Postcode)
            </label>
            <input
              type="text"
              value={store.postalCode}
              onChange={(e) =>
                setStore({ ...store, postalCode: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              中文完整地址
            </label>
            <input
              type="text"
              value={store.addressZh}
              onChange={(e) =>
                setStore({ ...store, addressZh: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              在线点餐链接（如饭团外卖 URL）
            </label>
            <input
              type="url"
              value={store.orderOnlineUrl}
              onChange={(e) =>
                setStore({ ...store, orderOnlineUrl: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#303030]">
                外卖平台中文名
              </label>
              <input
                type="text"
                value={store.orderProviderZh}
                onChange={(e) =>
                  setStore({ ...store, orderProviderZh: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#303030]">
                Provider Name (EN)
              </label>
              <input
                type="text"
                value={store.orderProviderEn}
                onChange={(e) =>
                  setStore({ ...store, orderProviderEn: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#303030]">
              Google Maps 路线导航链接
            </label>
            <input
              type="url"
              value={store.googleMapsUrl}
              onChange={(e) =>
                setStore({ ...store, googleMapsUrl: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
        </div>
      </div>

      {/* Card 4: Footer Copy */}
      <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-sm font-bold text-[#1a1a1a]">页脚文字说明</h2>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              页脚左侧品牌简介（中文）
            </label>
            <textarea
              rows={2}
              value={store.footerIntro.zh}
              onChange={(e) =>
                setStore({
                  ...store,
                  footerIntro: { ...store.footerIntro, zh: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              Footer Brand Intro (EN)
            </label>
            <textarea
              rows={2}
              value={store.footerIntro.en}
              onChange={(e) =>
                setStore({
                  ...store,
                  footerIntro: { ...store.footerIntro, en: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              底部服务说明（中文）
            </label>
            <input
              type="text"
              value={store.footerNote.zh}
              onChange={(e) =>
                setStore({
                  ...store,
                  footerNote: { ...store.footerNote, zh: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#303030]">
              Bottom Service Note (EN)
            </label>
            <input
              type="text"
              value={store.footerNote.en}
              onChange={(e) =>
                setStore({
                  ...store,
                  footerNote: { ...store.footerNote, en: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
