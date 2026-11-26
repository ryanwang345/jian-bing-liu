"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { AdminPhotoField } from "@/components/admin/AdminPhotoField";
import {
  HOME_SECTION_LABELS,
  type EditableStoryHighlight,
  type HomeSectionId,
  type SiteContentConfig,
} from "@/data/site-content";
import type { LocalizedText } from "@/lib/i18n";

type CustomizerSubTab =
  | "home"
  | "stories"
  | "storyPage"
  | "menuPage"
  | "visitPage";

interface AdminCustomizerViewProps {
  content: SiteContentConfig;
  hasDb: boolean;
  hasR2: boolean;
  isSaving: boolean;
  onSaveContent: (
    next: SiteContentConfig,
    successMsg?: string
  ) => Promise<void>;
  onResetAllContent: () => Promise<void>;
  onNavigateMainTab?: (
    tab: "products" | "categories" | "themes" | "gallery" | "settings"
  ) => void;
  showToast: (type: "success" | "error", text: string) => void;
}

function BilingualInput({
  labelZh,
  labelEn,
  value,
  onChange,
  multiline = false,
  rows = 2,
}: {
  labelZh: string;
  labelEn: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-semibold text-[#303030]">
          {labelZh}
        </label>
        {multiline ? (
          <textarea
            rows={rows}
            value={value.zh}
            onChange={(e) => onChange({ ...value, zh: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs leading-relaxed text-[#1a1a1a] outline-none focus:border-[#005bd3]"
          />
        ) : (
          <input
            type="text"
            value={value.zh}
            onChange={(e) => onChange({ ...value, zh: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
          />
        )}
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#303030]">
          {labelEn}
        </label>
        {multiline ? (
          <textarea
            rows={rows}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs leading-relaxed text-[#1a1a1a] outline-none focus:border-[#005bd3]"
          />
        ) : (
          <input
            type="text"
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs text-[#1a1a1a] outline-none focus:border-[#005bd3]"
          />
        )}
      </div>
    </div>
  );
}

export function AdminCustomizerView({
  content,
  hasDb,
  hasR2,
  isSaving,
  onSaveContent,
  onResetAllContent,
  onNavigateMainTab,
  showToast,
}: AdminCustomizerViewProps) {
  const [draft, setDraft] = useState<SiteContentConfig>(() =>
    structuredClone(content)
  );
  const [subTab, setSubTab] = useState<CustomizerSubTab>("home");
  const [selectedSectionId, setSelectedSectionId] =
    useState<HomeSectionId>("hero");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const moveHomeSection = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= draft.home.sections.length) return;
    const nextSections = [...draft.home.sections];
    const [moved] = nextSections.splice(index, 1);
    nextSections.splice(target, 0, moved);
    setDraft({
      ...draft,
      home: { ...draft.home, sections: nextSections },
    });
  };

  const reorderHomeSectionDrag = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const nextSections = [...draft.home.sections];
    const [moved] = nextSections.splice(fromIdx, 1);
    nextSections.splice(toIdx, 0, moved);
    setDraft({
      ...draft,
      home: { ...draft.home, sections: nextSections },
    });
  };

  const toggleSectionVisible = (id: HomeSectionId) => {
    setDraft({
      ...draft,
      home: {
        ...draft.home,
        sections: draft.home.sections.map((sec) =>
          sec.id === id ? { ...sec, visible: !sec.visible } : sec
        ),
      },
    });
  };

  const handleSave = () => {
    void onSaveContent(draft, "全站页面排版、照片与文字已保存生效");
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "确定要将全站页面排版、照片与文案恢复为出厂默认状态吗？（不会影响您的菜单菜品与价格）"
      )
    ) {
      return;
    }
    void onResetAllContent();
  };

  const selectedSection = draft.home.sections.find(
    (s) => s.id === selectedSectionId
  );

  const renderSelectedHomeSectionEditor = () => {
    const { home } = draft;

    switch (selectedSectionId) {
      case "hero": {
        const hero = home.hero;
        const setHero = (patch: Partial<typeof hero>) =>
          setDraft({
            ...draft,
            home: { ...home, hero: { ...hero, ...patch } },
          });

        return (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-3.5">
                <div>
                  <p className="text-xs font-bold text-[#1a1a1a]">
                    📱 手机端照片置顶显示
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#616161]">
                    开启后手机打开首页先看到煎饼大图，再看标题介绍。
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hero.mobilePhotoFirst}
                  onChange={(e) =>
                    setHero({ mobilePhotoFirst: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#1a1a1a]"
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-3.5">
                <div>
                  <p className="text-xs font-bold text-[#1a1a1a]">
                    🖥️ 电脑端左文右图布局
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#616161]">
                    取消勾选即可切换为「左图右文」对调排版。
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hero.desktopPhotoRight}
                  onChange={(e) =>
                    setHero({ desktopPhotoRight: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#1a1a1a]"
                />
              </label>
            </div>

            <div className="space-y-3 rounded-xl border border-[#ebebeb] p-4">
              <h3 className="text-xs font-bold text-[#1a1a1a]">
                首屏大标题（中文三段 & 英文三段）
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161]">
                    中文第一行
                  </label>
                  <input
                    type="text"
                    value={hero.headlineZhLine1}
                    onChange={(e) =>
                      setHero({ headlineZhLine1: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161]">
                    中文第二行前缀
                  </label>
                  <input
                    type="text"
                    value={hero.headlineZhLine2}
                    onChange={(e) =>
                      setHero({ headlineZhLine2: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#b8251c]">
                    中文红字高亮词
                  </label>
                  <input
                    type="text"
                    value={hero.headlineZhHighlight}
                    onChange={(e) =>
                      setHero({ headlineZhHighlight: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-2.5 py-1.5 text-xs font-semibold text-[#b8251c]"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161]">
                    EN Prefix
                  </label>
                  <input
                    type="text"
                    value={hero.headlineEnPrefix}
                    onChange={(e) =>
                      setHero({ headlineEnPrefix: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#b8251c]">
                    EN Highlight
                  </label>
                  <input
                    type="text"
                    value={hero.headlineEnHighlight}
                    onChange={(e) =>
                      setHero({ headlineEnHighlight: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-2.5 py-1.5 text-xs font-semibold text-[#b8251c]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161]">
                    EN Suffix
                  </label>
                  <input
                    type="text"
                    value={hero.headlineEnSuffix}
                    onChange={(e) =>
                      setHero({ headlineEnSuffix: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-2.5 py-1.5 text-xs text-[#1a1a1a]"
                  />
                </div>
              </div>

              <BilingualInput
                labelZh="首屏中文介绍段落"
                labelEn="Hero Description (EN)"
                value={hero.description}
                onChange={(v) => setHero({ description: v })}
                multiline
                rows={3}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-[#ebebeb] p-4">
              <h3 className="text-xs font-bold text-[#1a1a1a]">
                首屏三个按钮文字
              </h3>
              <BilingualInput
                labelZh="主按钮（查看菜单）中文"
                labelEn="Primary Button (EN)"
                value={hero.primaryCta}
                onChange={(v) => setHero({ primaryCta: v })}
              />
              <BilingualInput
                labelZh="外卖按钮中文"
                labelEn="Order Button (EN)"
                value={hero.orderCta}
                onChange={(v) => setHero({ orderCta: v })}
              />
              <BilingualInput
                labelZh="导航按钮中文"
                labelEn="Directions Button (EN)"
                value={hero.directionsCta}
                onChange={(v) => setHero({ directionsCta: v })}
              />
            </div>

            <div className="space-y-4 rounded-xl border border-[#ebebeb] p-4">
              <h3 className="text-xs font-bold text-[#1a1a1a]">
                首屏三图拼图与图注
              </h3>

              <AdminPhotoField
                label="① 首屏上方主大图"
                value={hero.mainPhoto}
                hasR2={hasR2}
                onChange={(url) => setHero({ mainPhoto: url })}
                showToast={showToast}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <BilingualInput
                    labelZh="主大图底部中文说明"
                    labelEn="Main Photo Caption (EN)"
                    value={hero.mainPhotoCaption}
                    onChange={(v) => setHero({ mainPhotoCaption: v })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#303030]">
                    主大图角标价格
                  </label>
                  <input
                    type="text"
                    value={hero.mainPhotoPrice}
                    onChange={(e) =>
                      setHero({ mainPhotoPrice: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                  />
                </div>
              </div>

              <AdminPhotoField
                label="② 左下拼图照片"
                value={hero.subPhotoLeft}
                hasR2={hasR2}
                onChange={(url) => setHero({ subPhotoLeft: url })}
                showToast={showToast}
              />
              <BilingualInput
                labelZh="左下照片标题（中文）"
                labelEn="Bottom-Left Title (EN)"
                value={hero.subPhotoLeftTitle}
                onChange={(v) => setHero({ subPhotoLeftTitle: v })}
              />
              <BilingualInput
                labelZh="左下照片副标题/价格（中文）"
                labelEn="Bottom-Left Subtitle (EN)"
                value={hero.subPhotoLeftSub}
                onChange={(v) => setHero({ subPhotoLeftSub: v })}
              />

              <AdminPhotoField
                label="③ 右下拼图照片"
                value={hero.subPhotoRight}
                hasR2={hasR2}
                onChange={(url) => setHero({ subPhotoRight: url })}
                showToast={showToast}
              />
              <BilingualInput
                labelZh="右下照片标题（中文）"
                labelEn="Bottom-Right Title (EN)"
                value={hero.subPhotoRightTitle}
                onChange={(v) => setHero({ subPhotoRightTitle: v })}
              />
              <BilingualInput
                labelZh="右下照片副标题/价格（中文）"
                labelEn="Bottom-Right Subtitle (EN)"
                value={hero.subPhotoRightSub}
                onChange={(v) => setHero({ subPhotoRightSub: v })}
              />
            </div>
          </div>
        );
      }

      case "infoStrip":
        return (
          <div className="space-y-3 rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4 text-xs text-[#303030]">
            <p className="font-bold text-[#1a1a1a]">
              地址、电话与每日营业时间自动读取自「店铺与营业设置」
            </p>
            <p className="leading-relaxed text-[#616161]">
              您可以在左侧列表随时隐藏/显示此信息栏，或上下拖动调整它在首页的位置。如需修改门牌地址、联系电话、营业时间或开启临时店休，请前往店铺设置：
            </p>
            {onNavigateMainTab && (
              <button
                type="button"
                onClick={() => onNavigateMainTab("settings")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#303030]"
              >
                前往「店铺与营业设置」 →
              </button>
            )}
          </div>
        );

      case "ticker":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#616161]">
                横向循环滚动的卖点短句（共 {home.tickerItems.length} 条）。
              </p>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    home: {
                      ...home,
                      tickerItems: [
                        ...home.tickerItems,
                        { zh: "新亮点标语", en: "NEW HIGHLIGHT" },
                      ],
                    },
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#d4d4d4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1a1a1a] hover:bg-[#f7f7f7]"
              >
                <Plus className="h-3.5 w-3.5" />
                新增滚动词条
              </button>
            </div>

            {home.tickerItems.map((item, idx) => (
              <div
                key={idx}
                className="space-y-2 rounded-xl border border-[#ebebeb] bg-[#fafafa] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1a1a1a]">
                    第 {idx + 1} 条
                  </span>
                  <button
                    type="button"
                    disabled={home.tickerItems.length <= 1}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        home: {
                          ...home,
                          tickerItems: home.tickerItems.filter(
                            (_, i) => i !== idx
                          ),
                        },
                      })
                    }
                    className="rounded p-1 text-[#616161] hover:bg-[#fee] hover:text-[#d82c0d] disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <BilingualInput
                  labelZh="中文短句"
                  labelEn="English Ticker Text"
                  value={item}
                  onChange={(next) => {
                    const nextArr = [...home.tickerItems];
                    nextArr[idx] = next;
                    setDraft({
                      ...draft,
                      home: { ...home, tickerItems: nextArr },
                    });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case "featuredMenu": {
        const fm = home.featuredMenu;
        const setFm = (patch: Partial<typeof fm>) =>
          setDraft({
            ...draft,
            home: { ...home, featuredMenu: { ...fm, ...patch } },
          });

        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#ebebeb] bg-[#fafafa] p-3.5">
              <label className="block text-xs font-bold text-[#1a1a1a]">
                电脑端菜品卡片列数排版
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {([3, 2] as const).map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => setFm({ columns: cols })}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                      fm.columns === cols
                        ? "bg-[#1a1a1a] text-white"
                        : "border border-[#d4d4d4] bg-white text-[#303030] hover:bg-[#f7f7f7]"
                    }`}
                  >
                    {cols === 3
                      ? "3 列标准卡片（默认）"
                      : "2 列宽幅大图卡片"}
                  </button>
                ))}
              </div>
            </div>

            <BilingualInput
              labelZh="小眉头（中文）"
              labelEn="Eyebrow (EN)"
              value={fm.eyebrow}
              onChange={(v) => setFm({ eyebrow: v })}
            />
            <div>
              <label className="block text-xs font-semibold text-[#303030]">
                右侧毛笔书法装饰词（建议 4 字）
              </label>
              <input
                type="text"
                value={fm.chineseAccent}
                onChange={(e) => setFm({ chineseAccent: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
              />
            </div>
            <BilingualInput
              labelZh="板块主标题（中文）"
              labelEn="Section Title (EN)"
              value={fm.title}
              onChange={(v) => setFm({ title: v })}
            />
            <BilingualInput
              labelZh="板块副标题说明（中文）"
              labelEn="Section Description (EN)"
              value={fm.description}
              onChange={(v) => setFm({ description: v })}
              multiline
            />

            {onNavigateMainTab && (
              <div className="rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-3 text-xs text-[#616161]">
                提示：具体展示哪几道招牌菜，可在「全部菜品」里点菜品旁的星星「推荐」自由勾选。
                <button
                  type="button"
                  onClick={() => onNavigateMainTab("products")}
                  className="ml-2 font-semibold text-[#005bd3] hover:underline"
                >
                  去挑选推荐菜品 →
                </button>
              </div>
            )}
          </div>
        );
      }

      case "combos": {
        const combos = home.combos;
        const setCombos = (patch: Partial<typeof combos>) =>
          setDraft({
            ...draft,
            home: { ...home, combos: { ...combos, ...patch } },
          });

        return (
          <div className="space-y-4">
            <BilingualInput
              labelZh="小眉头（中文）"
              labelEn="Eyebrow (EN)"
              value={combos.eyebrow}
              onChange={(v) => setCombos({ eyebrow: v })}
            />
            <div>
              <label className="block text-xs font-semibold text-[#303030]">
                毛笔书法装饰词
              </label>
              <input
                type="text"
                value={combos.chineseAccent}
                onChange={(e) => setCombos({ chineseAccent: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
              />
            </div>
            <BilingualInput
              labelZh="主标题（中文）"
              labelEn="Section Title (EN)"
              value={combos.title}
              onChange={(v) => setCombos({ title: v })}
            />
            <BilingualInput
              labelZh="副标题介绍（中文）"
              labelEn="Description (EN)"
              value={combos.description}
              onChange={(v) => setCombos({ description: v })}
              multiline
            />

            <div className="space-y-4 pt-2">
              {combos.cards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="space-y-3 rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-4"
                >
                  <p className="text-xs font-bold text-[#1a1a1a]">
                    搭配卡片 #{idx + 1}
                  </p>
                  <AdminPhotoField
                    label={`搭配卡片 #${idx + 1} 照片`}
                    value={card.image}
                    hasR2={hasR2}
                    onChange={(url) => {
                      const nextCards = [...combos.cards];
                      nextCards[idx] = { ...card, image: url };
                      setCombos({ cards: nextCards });
                    }}
                    showToast={showToast}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#303030]">
                        价格标签（如 £12 – £13）
                      </label>
                      <input
                        type="text"
                        value={card.price}
                        onChange={(e) => {
                          const nextCards = [...combos.cards];
                          nextCards[idx] = { ...card, price: e.target.value };
                          setCombos({ cards: nextCards });
                        }}
                        className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs text-[#1a1a1a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#303030]">
                        点击跳转链接
                      </label>
                      <input
                        type="text"
                        value={card.href}
                        onChange={(e) => {
                          const nextCards = [...combos.cards];
                          nextCards[idx] = { ...card, href: e.target.value };
                          setCombos({ cards: nextCards });
                        }}
                        className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs text-[#1a1a1a]"
                      />
                    </div>
                  </div>
                  <BilingualInput
                    labelZh="左上角小标签（中文）"
                    labelEn="Badge Tag (EN)"
                    value={card.tag}
                    onChange={(v) => {
                      const nextCards = [...combos.cards];
                      nextCards[idx] = { ...card, tag: v };
                      setCombos({ cards: nextCards });
                    }}
                  />
                  <BilingualInput
                    labelZh="卡片标题（中文）"
                    labelEn="Card Title (EN)"
                    value={card.title}
                    onChange={(v) => {
                      const nextCards = [...combos.cards];
                      nextCards[idx] = { ...card, title: v };
                      setCombos({ cards: nextCards });
                    }}
                  />
                  <BilingualInput
                    labelZh="卡片介绍（中文）"
                    labelEn="Card Description (EN)"
                    value={card.desc}
                    onChange={(v) => {
                      const nextCards = [...combos.cards];
                      nextCards[idx] = { ...card, desc: v };
                      setCombos({ cards: nextCards });
                    }}
                    multiline
                  />
                  <BilingualInput
                    labelZh="底部按钮文字（中文）"
                    labelEn="Button Label (EN)"
                    value={card.cta}
                    onChange={(v) => {
                      const nextCards = [...combos.cards];
                      nextCards[idx] = { ...card, cta: v };
                      setCombos({ cards: nextCards });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "reviews":
        return (
          <div className="space-y-3 rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4 text-xs text-[#303030]">
            <p className="font-bold text-[#1a1a1a]">
              Google 街坊好评与小红书/IG 社媒动态墙
            </p>
            <p className="leading-relaxed text-[#616161]">
              您可以在左侧控制此板块是否显示或调整它在首页的上下顺序。要添加新的小红书、Instagram、TikTok 帖子或修改社媒主页链接，请点击下方快捷入口：
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/admin/posts"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#303030]"
              >
                管理社媒展示帖 →
              </Link>
              <Link
                href="/admin/social"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-3.5 py-2 text-xs font-semibold text-[#303030] hover:bg-[#f7f7f7]"
              >
                管理社媒账号链接 →
              </Link>
            </div>
          </div>
        );

      case "audience":
        return (
          <div className="space-y-4">
            {home.audience.cards.map((card, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-4"
              >
                <p className="text-xs font-bold text-[#1a1a1a]">
                  特色人群卡片 #{idx + 1}
                </p>
                <BilingualInput
                  labelZh="顶部徽章（中文）"
                  labelEn="Badge (EN)"
                  value={card.badge}
                  onChange={(v) => {
                    const nextCards = [...home.audience.cards];
                    nextCards[idx] = { ...card, badge: v };
                    setDraft({
                      ...draft,
                      home: { ...home, audience: { cards: nextCards } },
                    });
                  }}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#303030]">
                      右上书法词
                    </label>
                    <input
                      type="text"
                      value={card.accentZh}
                      onChange={(e) => {
                        const nextCards = [...home.audience.cards];
                        nextCards[idx] = { ...card, accentZh: e.target.value };
                        setDraft({
                          ...draft,
                          home: { ...home, audience: { cards: nextCards } },
                        });
                      }}
                      className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs text-[#1a1a1a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#303030]">
                      跳转链接
                    </label>
                    <input
                      type="text"
                      value={card.href}
                      onChange={(e) => {
                        const nextCards = [...home.audience.cards];
                        nextCards[idx] = { ...card, href: e.target.value };
                        setDraft({
                          ...draft,
                          home: { ...home, audience: { cards: nextCards } },
                        });
                      }}
                      className="mt-1 w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-xs text-[#1a1a1a]"
                    />
                  </div>
                </div>
                <BilingualInput
                  labelZh="标题（中文）"
                  labelEn="Title (EN)"
                  value={card.title}
                  onChange={(v) => {
                    const nextCards = [...home.audience.cards];
                    nextCards[idx] = { ...card, title: v };
                    setDraft({
                      ...draft,
                      home: { ...home, audience: { cards: nextCards } },
                    });
                  }}
                />
                <BilingualInput
                  labelZh="正文介绍（中文）"
                  labelEn="Description (EN)"
                  value={card.description}
                  onChange={(v) => {
                    const nextCards = [...home.audience.cards];
                    nextCards[idx] = { ...card, description: v };
                    setDraft({
                      ...draft,
                      home: { ...home, audience: { cards: nextCards } },
                    });
                  }}
                  multiline
                />
                <BilingualInput
                  labelZh="底部按钮文字（中文）"
                  labelEn="CTA Label (EN)"
                  value={card.cta}
                  onChange={(v) => {
                    const nextCards = [...home.audience.cards];
                    nextCards[idx] = { ...card, cta: v };
                    setDraft({
                      ...draft,
                      home: { ...home, audience: { cards: nextCards } },
                    });
                  }}
                />
              </div>
            ))}
          </div>
        );

      case "craftShowcase": {
        const cs = home.craftShowcase;
        return (
          <div className="space-y-4">
            <BilingualInput
              labelZh="幻灯片区顶部大标题（中文）"
              labelEn="Showcase Heading (EN)"
              value={cs.heading}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  home: {
                    ...home,
                    craftShowcase: { ...cs, heading: v },
                  },
                })
              }
            />

            {cs.slides.map((slide, idx) => {
              const updateSlide = (patch: Partial<typeof slide>) => {
                const nextSlides = [...cs.slides];
                nextSlides[idx] = { ...slide, ...patch };
                setDraft({
                  ...draft,
                  home: {
                    ...home,
                    craftShowcase: { ...cs, slides: nextSlides },
                  },
                });
              };

              return (
                <div
                  key={slide.id || idx}
                  className="space-y-3 rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-4"
                >
                  <p className="text-xs font-bold text-[#1a1a1a]">
                    第 {slide.number || `0${idx + 1}`} 幕幻灯片
                  </p>
                  <AdminPhotoField
                    label={`第 ${idx + 1} 幕背景大图`}
                    value={slide.image}
                    hasR2={hasR2}
                    onChange={(url) => updateSlide({ image: url })}
                    showToast={showToast}
                  />
                  <BilingualInput
                    labelZh="切换标签名（中文）"
                    labelEn="Tab Label (EN)"
                    value={slide.tabLabel}
                    onChange={(v) => updateSlide({ tabLabel: v })}
                  />
                  <BilingualInput
                    labelZh="小眉头（中文）"
                    labelEn="Eyebrow (EN)"
                    value={slide.eyebrow}
                    onChange={(v) => updateSlide({ eyebrow: v })}
                  />
                  <BilingualInput
                    labelZh="标题（中文）"
                    labelEn="Slide Title (EN)"
                    value={slide.title}
                    onChange={(v) => updateSlide({ title: v })}
                  />
                  <BilingualInput
                    labelZh="说明文字（中文）"
                    labelEn="Slide Description (EN)"
                    value={slide.description}
                    onChange={(v) => updateSlide({ description: v })}
                    multiline
                  />
                  <BilingualInput
                    labelZh="高亮数字（如 0 食用色素 / £8 起）"
                    labelEn="Metric Value (EN)"
                    value={slide.metricValue}
                    onChange={(v) => updateSlide({ metricValue: v })}
                  />
                  <BilingualInput
                    labelZh="数字下方小字说明（中文）"
                    labelEn="Metric Subtext (EN)"
                    value={slide.metricLabel}
                    onChange={(v) => updateSlide({ metricLabel: v })}
                  />
                  <BilingualInput
                    labelZh="按钮文字（中文）"
                    labelEn="Button Text (EN)"
                    value={slide.cta}
                    onChange={(v) => updateSlide({ cta: v })}
                  />
                </div>
              );
            })}
          </div>
        );
      }

      case "storyBand": {
        const sb = home.storyBand;
        const setSb = (patch: Partial<typeof sb>) =>
          setDraft({
            ...draft,
            home: { ...home, storyBand: { ...sb, ...patch } },
          });

        return (
          <div className="space-y-4">
            <AdminPhotoField
              label="左侧竖版主照片"
              value={sb.photoMain}
              hasR2={hasR2}
              onChange={(url) => setSb({ photoMain: url })}
              showToast={showToast}
            />
            <AdminPhotoField
              label="右上拼图照片"
              value={sb.photoTopRight}
              hasR2={hasR2}
              onChange={(url) => setSb({ photoTopRight: url })}
              showToast={showToast}
            />
            <AdminPhotoField
              label="右下拼图照片"
              value={sb.photoBottomRight}
              hasR2={hasR2}
              onChange={(url) => setSb({ photoBottomRight: url })}
              showToast={showToast}
            />

            <BilingualInput
              labelZh="小眉头（中文）"
              labelEn="Eyebrow (EN)"
              value={sb.eyebrow}
              onChange={(v) => setSb({ eyebrow: v })}
            />
            <div>
              <label className="block text-xs font-semibold text-[#303030]">
                毛笔书法词
              </label>
              <input
                type="text"
                value={sb.chineseAccent}
                onChange={(e) => setSb({ chineseAccent: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
              />
            </div>
            <BilingualInput
              labelZh="故事标题（中文）"
              labelEn="Story Headline (EN)"
              value={sb.title}
              onChange={(v) => setSb({ title: v })}
            />
            <BilingualInput
              labelZh="故事引言（中文）"
              labelEn="Story Lead (EN)"
              value={sb.lead}
              onChange={(v) => setSb({ lead: v })}
              multiline
              rows={3}
            />

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-[#1a1a1a]">三项匠心坚持</p>
              {sb.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="space-y-2.5 rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#1a1a1a]">
                      坚持 #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={pillar.chinese}
                      onChange={(e) => {
                        const nextPillars = [...sb.pillars];
                        nextPillars[idx] = {
                          ...pillar,
                          chinese: e.target.value,
                        };
                        setSb({ pillars: nextPillars });
                      }}
                      placeholder="四字印章词"
                      className="w-32 rounded-md border border-[#c9cccf] bg-white px-2 py-1 text-xs text-[#1a1a1a]"
                    />
                  </div>
                  <BilingualInput
                    labelZh="标题（中文）"
                    labelEn="Pillar Title (EN)"
                    value={pillar.title}
                    onChange={(v) => {
                      const nextPillars = [...sb.pillars];
                      nextPillars[idx] = { ...pillar, title: v };
                      setSb({ pillars: nextPillars });
                    }}
                  />
                  <BilingualInput
                    labelZh="说明（中文）"
                    labelEn="Pillar Description (EN)"
                    value={pillar.description}
                    onChange={(v) => {
                      const nextPillars = [...sb.pillars];
                      nextPillars[idx] = { ...pillar, description: v };
                      setSb({ pillars: nextPillars });
                    }}
                    multiline
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "galleryStrip": {
        const gs = home.galleryStrip;
        const setGs = (patch: Partial<typeof gs>) =>
          setDraft({
            ...draft,
            home: { ...home, galleryStrip: { ...gs, ...patch } },
          });

        return (
          <div className="space-y-4">
            <BilingualInput
              labelZh="小眉头（中文）"
              labelEn="Eyebrow (EN)"
              value={gs.eyebrow}
              onChange={(v) => setGs({ eyebrow: v })}
            />
            <BilingualInput
              labelZh="标题（中文）"
              labelEn="Title (EN)"
              value={gs.title}
              onChange={(v) => setGs({ title: v })}
            />
            <BilingualInput
              labelZh="说明（中文）"
              labelEn="Description (EN)"
              value={gs.description}
              onChange={(v) => setGs({ description: v })}
              multiline
            />

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs font-bold text-[#1a1a1a]">
                首页展示精选照片（{gs.photos.length} 张）
              </p>
              <button
                type="button"
                onClick={() =>
                  setGs({
                    photos: [
                      ...gs.photos,
                      {
                        src: "/images/roast-duck-jianbing.webp",
                        label: { zh: "新照片标题", en: "New Photo" },
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#d4d4d4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1a1a1a] hover:bg-[#f7f7f7]"
              >
                <Plus className="h-3.5 w-3.5" />
                增加一张
              </button>
            </div>

            {gs.photos.map((photo, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-xl border border-[#e3e3e3] bg-[#fafafa] p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1a1a1a]">
                    精选图 #{idx + 1}
                  </span>
                  <button
                    type="button"
                    disabled={gs.photos.length <= 1}
                    onClick={() =>
                      setGs({
                        photos: gs.photos.filter((_, i) => i !== idx),
                      })
                    }
                    className="rounded p-1 text-[#616161] hover:bg-[#fee] hover:text-[#d82c0d] disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <AdminPhotoField
                  label={`精选图 #${idx + 1}`}
                  value={photo.src}
                  hasR2={hasR2}
                  onChange={(url) => {
                    const nextPhotos = [...gs.photos];
                    nextPhotos[idx] = { ...photo, src: url };
                    setGs({ photos: nextPhotos });
                  }}
                  showToast={showToast}
                />
                <BilingualInput
                  labelZh="底部图注（中文）"
                  labelEn="Photo Label (EN)"
                  value={photo.label}
                  onChange={(v) => {
                    const nextPhotos = [...gs.photos];
                    nextPhotos[idx] = { ...photo, label: v };
                    setGs({ photos: nextPhotos });
                  }}
                />
              </div>
            ))}
          </div>
        );
      }

      case "ctaBanner": {
        const cta = home.ctaBanner;
        const setCta = (patch: Partial<typeof cta>) =>
          setDraft({
            ...draft,
            home: { ...home, ctaBanner: { ...cta, ...patch } },
          });

        return (
          <div className="space-y-4">
            <BilingualInput
              labelZh="顶部小字（中文）"
              labelEn="Eyebrow (EN)"
              value={cta.eyebrow}
              onChange={(v) => setCta({ eyebrow: v })}
            />
            <BilingualInput
              labelZh="横幅大标题（中文）"
              labelEn="Banner Headline (EN)"
              value={cta.title}
              onChange={(v) => setCta({ title: v })}
            />
            <BilingualInput
              labelZh="补充说明（中文）"
              labelEn="Description (EN)"
              value={cta.description}
              onChange={(v) => setCta({ description: v })}
              multiline
            />
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-14 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#dcdcdc] bg-[#f1f1f1]/95 px-4 py-3 backdrop-blur-xs sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">
            全站页面装修与排版
          </h1>
          <p className="text-xs text-[#616161]">
            自由调整首页 11 大板块的显示/隐藏与上下顺序，随时替换全站任何照片与中英文文案。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!hasDb || isSaving}
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4d4d4] bg-white px-3 py-2 text-xs font-semibold text-[#4a4a4a] shadow-2xs hover:bg-[#f7f7f7] disabled:opacity-45"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            恢复默认文案与排版
          </button>

          <button
            type="button"
            disabled={!hasDb || isSaving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#303030] disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            保存页面更改
          </button>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#e3e3e3] bg-white p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {(
          [
            { id: "home", label: "🏠 首页板块与布局" },
            { id: "stories", label: "⭕ 首屏快拍圆圈" },
            { id: "storyPage", label: "📖 品牌故事页 (/our-story)" },
            { id: "menuPage", label: "📋 菜单页文案 (/menu)" },
            { id: "visitPage", label: "📍 到店导航页 (/visit-us)" },
          ] as Array<{ id: CustomizerSubTab; label: string }>
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              subTab === t.id
                ? "bg-[#1a1a1a] text-white shadow-2xs"
                : "text-[#4a4a4a] hover:bg-[#f1f1f1]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: Home Sections Layout + Inspector */}
      {subTab === "home" && (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left Rail: Section Order & Visibility */}
          <div className="space-y-3 rounded-xl border border-[#e3e3e3] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-5 lg:self-start">
            <div>
              <h2 className="text-sm font-bold text-[#1a1a1a]">
                首页板块顺序与显示开关
              </h2>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#616161]">
                点板块名称在右侧编辑图文；拖拽或点 ↑ ↓ 调整首页从上到下的顺序；点眼睛图标可随时隐藏/显示任意板块。
              </p>
            </div>

            <div className="space-y-1.5">
              {draft.home.sections.map((sec, idx) => {
                const isSelected = sec.id === selectedSectionId;
                const label = HOME_SECTION_LABELS[sec.id];
                return (
                  <div
                    key={sec.id}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null) {
                        reorderHomeSectionDrag(dragIndex, idx);
                        setDragIndex(null);
                      }
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 transition-colors ${
                      isSelected
                        ? "border-[#1a1a1a] bg-[#f7f7f7] shadow-2xs"
                        : "border-[#ebebeb] bg-white hover:border-[#c9cccf]"
                    } ${!sec.visible ? "opacity-60" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedSectionId(sec.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <GripVertical
                        className="h-4 w-4 shrink-0 cursor-grab text-[#8c8c8c]"
                        aria-hidden="true"
                      />
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#ebebeb] text-[11px] font-bold tabular-nums text-[#303030]">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#1a1a1a]">
                          {label.zh}
                        </p>
                        <p className="truncate text-[10px] text-[#616161]">
                          {label.en}
                        </p>
                      </div>
                    </button>

                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveHomeSection(idx, -1)}
                        aria-label="上移板块"
                        className="rounded p-1 text-[#616161] hover:bg-[#ebebeb] disabled:opacity-25"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === draft.home.sections.length - 1}
                        onClick={() => moveHomeSection(idx, 1)}
                        aria-label="下移板块"
                        className="rounded p-1 text-[#616161] hover:bg-[#ebebeb] disabled:opacity-25"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSectionVisible(sec.id)}
                        title={sec.visible ? "点击隐藏此板块" : "点击恢复显示"}
                        className={`ml-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
                          sec.visible
                            ? "bg-[#e3f1ed] text-[#047b5d]"
                            : "bg-[#ebebeb] text-[#616161]"
                        }`}
                      >
                        {sec.visible ? (
                          <>
                            <Eye className="h-3 w-3" />
                            显示
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            隐藏
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Inspector: Selected Section Content & Photos */}
          <div className="rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#ebebeb] pb-3.5">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-[#616161] uppercase">
                  当前编辑板块
                </span>
                <h2 className="text-base font-bold text-[#1a1a1a]">
                  {HOME_SECTION_LABELS[selectedSectionId].zh}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {selectedSection && (
                  <button
                    type="button"
                    onClick={() => toggleSectionVisible(selectedSectionId)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      selectedSection.visible
                        ? "border-[#b7e1d4] bg-[#eef8f5] text-[#047b5d]"
                        : "border-[#d4d4d4] bg-[#f7f7f7] text-[#616161]"
                    }`}
                  >
                    {selectedSection.visible ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        前台正在显示
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        前台已隐藏（点击开启）
                      </>
                    )}
                  </button>
                )}

                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-lg border border-[#d4d4d4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#303030] hover:bg-[#f7f7f7]"
                >
                  预览首页
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {renderSelectedHomeSectionEditor()}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Story Highlights Circles */}
      {subTab === "stories" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e3e3e3] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div>
              <h2 className="text-sm font-bold text-[#1a1a1a]">
                首页顶部快拍圆圈精选（共 {draft.home.storyHighlights.length} 个）
              </h2>
              <p className="text-xs text-[#616161]">
                类似 Instagram 精选快拍圆圈，顾客点开后可全屏浏览大图、介绍与跳转按钮。
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextItem: EditableStoryHighlight = {
                  id: `story-${Date.now().toString(36)}`,
                  label: { zh: "新品推荐", en: "New Special" },
                  tag: { zh: "现点现做", en: "Fresh Daily" },
                  headline: { zh: "填写弹窗主标题", en: "Enter Story Headline" },
                  caption: {
                    zh: "填写详细美食介绍...",
                    en: "Enter story description...",
                  },
                  hashtag: "124 Camden Rd · NW1",
                  image: "/images/roast-duck-jianbing.webp",
                  ctaLabel: { zh: "查看完整菜单", en: "View Menu" },
                  href: "/menu",
                };
                setDraft({
                  ...draft,
                  home: {
                    ...draft.home,
                    storyHighlights: [nextItem, ...draft.home.storyHighlights],
                  },
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#303030]"
            >
              <Plus className="h-3.5 w-3.5" />
              新增一个快拍圆圈
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {draft.home.storyHighlights.map((story, idx) => {
              const updateStory = (patch: Partial<EditableStoryHighlight>) => {
                const nextList = [...draft.home.storyHighlights];
                nextList[idx] = { ...story, ...patch };
                setDraft({
                  ...draft,
                  home: { ...draft.home, storyHighlights: nextList },
                });
              };

              const moveStory = (delta: -1 | 1) => {
                const target = idx + delta;
                if (
                  target < 0 ||
                  target >= draft.home.storyHighlights.length
                ) {
                  return;
                }
                const nextList = [...draft.home.storyHighlights];
                const [moved] = nextList.splice(idx, 1);
                nextList.splice(target, 0, moved);
                setDraft({
                  ...draft,
                  home: { ...draft.home, storyHighlights: nextList },
                });
              };

              return (
                <div
                  key={story.id || idx}
                  className="space-y-3 rounded-xl border border-[#e3e3e3] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-center justify-between border-b border-[#ebebeb] pb-2.5">
                    <span className="text-xs font-bold text-[#1a1a1a]">
                      快拍 #{idx + 1} · {story.label.zh}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveStory(-1)}
                        className="rounded p-1 text-[#616161] hover:bg-[#f1f1f1] disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === draft.home.storyHighlights.length - 1}
                        onClick={() => moveStory(1)}
                        className="rounded p-1 text-[#616161] hover:bg-[#f1f1f1] disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={draft.home.storyHighlights.length <= 1}
                        onClick={() => {
                          if (!window.confirm(`确定删除快拍「${story.label.zh}」吗？`))
                            return;
                          setDraft({
                            ...draft,
                            home: {
                              ...draft.home,
                              storyHighlights:
                                draft.home.storyHighlights.filter(
                                  (_, i) => i !== idx
                                ),
                            },
                          });
                        }}
                        className="rounded p-1 text-[#616161] hover:bg-[#fee] hover:text-[#d82c0d] disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <AdminPhotoField
                    label="快拍封面与弹窗照片"
                    value={story.image}
                    hasR2={hasR2}
                    onChange={(url) => updateStory({ image: url })}
                    showToast={showToast}
                  />
                  <BilingualInput
                    labelZh="圆圈下方短标题（中文）"
                    labelEn="Circle Label (EN)"
                    value={story.label}
                    onChange={(v) => updateStory({ label: v })}
                  />
                  <BilingualInput
                    labelZh="弹窗顶部角标（中文）"
                    labelEn="Popup Tag (EN)"
                    value={story.tag}
                    onChange={(v) => updateStory({ tag: v })}
                  />
                  <BilingualInput
                    labelZh="弹窗大标题（中文）"
                    labelEn="Popup Headline (EN)"
                    value={story.headline}
                    onChange={(v) => updateStory({ headline: v })}
                  />
                  <BilingualInput
                    labelZh="弹窗详细介绍（中文）"
                    labelEn="Popup Caption (EN)"
                    value={story.caption}
                    onChange={(v) => updateStory({ caption: v })}
                    multiline
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#303030]">
                        底部小标签
                      </label>
                      <input
                        type="text"
                        value={story.hashtag}
                        onChange={(e) =>
                          updateStory({ hashtag: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#303030]">
                        按钮跳转链接
                      </label>
                      <input
                        type="text"
                        value={story.href}
                        onChange={(e) =>
                          updateStory({
                            href: e.target.value,
                            external: /^https?:\/\//i.test(e.target.value),
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-[#c9cccf] px-3 py-2 text-xs text-[#1a1a1a]"
                      />
                    </div>
                  </div>
                  <BilingualInput
                    labelZh="弹窗按钮文字（中文）"
                    labelEn="Button Text (EN)"
                    value={story.ctaLabel}
                    onChange={(v) => updateStory({ ctaLabel: v })}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Our Story Page (/our-story) */}
      {subTab === "storyPage" && (
        <div className="space-y-5">
          <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1a1a1a]">
                品牌故事页首屏照片与正文 (/our-story)
              </h2>
              <Link
                href="/our-story"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#005bd3] hover:underline"
              >
                打开故事页预览
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <AdminPhotoField
              label="故事页右侧主照片"
              value={draft.pages.story.heroPhoto}
              hasR2={hasR2}
              onChange={(url) =>
                setDraft({
                  ...draft,
                  pages: {
                    ...draft.pages,
                    story: { ...draft.pages.story, heroPhoto: url },
                  },
                })
              }
              showToast={showToast}
            />

            <BilingualInput
              labelZh="小眉头（中文）"
              labelEn="Eyebrow (EN)"
              value={draft.pages.story.eyebrow}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  pages: {
                    ...draft.pages,
                    story: { ...draft.pages.story, eyebrow: v },
                  },
                })
              }
            />
            <BilingualInput
              labelZh="故事主标题（中文）"
              labelEn="Headline (EN)"
              value={draft.pages.story.headline}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  pages: {
                    ...draft.pages,
                    story: { ...draft.pages.story, headline: v },
                  },
                })
              }
            />
            <BilingualInput
              labelZh="首段导语（中文）"
              labelEn="Lead Paragraph (EN)"
              value={draft.pages.story.lead}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  pages: {
                    ...draft.pages,
                    story: { ...draft.pages.story, lead: v },
                  },
                })
              }
              multiline
              rows={3}
            />

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#1a1a1a]">
                  故事正文段落（共 {draft.pages.story.paragraphs.length} 段）
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      pages: {
                        ...draft.pages,
                        story: {
                          ...draft.pages.story,
                          paragraphs: [
                            ...draft.pages.story.paragraphs,
                            { zh: "新段落内容...", en: "New paragraph..." },
                          ],
                        },
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#d4d4d4] bg-white px-2.5 py-1 text-xs font-semibold text-[#1a1a1a] hover:bg-[#f7f7f7]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  新增一段
                </button>
              </div>

              {draft.pages.story.paragraphs.map((para, idx) => (
                <div
                  key={idx}
                  className="space-y-2 rounded-xl border border-[#ebebeb] bg-[#fafafa] p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1a1a1a]">
                      第 {idx + 1} 段
                    </span>
                    <button
                      type="button"
                      disabled={draft.pages.story.paragraphs.length <= 1}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          pages: {
                            ...draft.pages,
                            story: {
                              ...draft.pages.story,
                              paragraphs: draft.pages.story.paragraphs.filter(
                                (_, i) => i !== idx
                              ),
                            },
                          },
                        })
                      }
                      className="rounded p-1 text-[#616161] hover:bg-[#fee] hover:text-[#d82c0d] disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <BilingualInput
                    labelZh="中文段落"
                    labelEn="English Paragraph"
                    value={para}
                    onChange={(v) => {
                      const nextParas = [...draft.pages.story.paragraphs];
                      nextParas[idx] = v;
                      setDraft({
                        ...draft,
                        pages: {
                          ...draft.pages,
                          story: {
                            ...draft.pages.story,
                            paragraphs: nextParas,
                          },
                        },
                      });
                    }}
                    multiline
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3 Griddle Craft Steps */}
          <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm font-bold text-[#1a1a1a]">
              三步摊煎饼工艺图文
            </h2>
            <BilingualInput
              labelZh="工艺区大标题（中文）"
              labelEn="Craft Section Title (EN)"
              value={draft.pages.story.stepsTitle}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  pages: {
                    ...draft.pages,
                    story: { ...draft.pages.story, stepsTitle: v },
                  },
                })
              }
            />
            <BilingualInput
              labelZh="工艺区副标题（中文）"
              labelEn="Craft Description (EN)"
              value={draft.pages.story.stepsDescription}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  pages: {
                    ...draft.pages,
                    story: { ...draft.pages.story, stepsDescription: v },
                  },
                })
              }
              multiline
            />

            <div className="grid gap-4 lg:grid-cols-3">
              {draft.pages.story.steps.map((st, idx) => (
                <div
                  key={idx}
                  className="space-y-3 rounded-xl border border-[#ebebeb] bg-[#fafafa] p-3.5"
                >
                  <p className="text-xs font-bold text-[#1a1a1a]">
                    步骤 #{idx + 1}
                  </p>
                  <AdminPhotoField
                    label={`步骤 #${idx + 1} 照片`}
                    value={st.image}
                    hasR2={hasR2}
                    onChange={(url) => {
                      const nextSteps = [...draft.pages.story.steps];
                      nextSteps[idx] = { ...st, image: url };
                      setDraft({
                        ...draft,
                        pages: {
                          ...draft.pages,
                          story: { ...draft.pages.story, steps: nextSteps },
                        },
                      });
                    }}
                    showToast={showToast}
                  />
                  <BilingualInput
                    labelZh="步骤标题（中文）"
                    labelEn="Step Title (EN)"
                    value={st.title}
                    onChange={(v) => {
                      const nextSteps = [...draft.pages.story.steps];
                      nextSteps[idx] = { ...st, title: v };
                      setDraft({
                        ...draft,
                        pages: {
                          ...draft.pages,
                          story: { ...draft.pages.story, steps: nextSteps },
                        },
                      });
                    }}
                  />
                  <BilingualInput
                    labelZh="步骤说明（中文）"
                    labelEn="Step Description (EN)"
                    value={st.description}
                    onChange={(v) => {
                      const nextSteps = [...draft.pages.story.steps];
                      nextSteps[idx] = { ...st, description: v };
                      setDraft({
                        ...draft,
                        pages: {
                          ...draft.pages,
                          story: { ...draft.pages.story, steps: nextSteps },
                        },
                      });
                    }}
                    multiline
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3 Brand Detail Cards */}
          <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm font-bold text-[#1a1a1a]">
              底部三张门店细节卡片（纸袋、红旗、蕾丝脆边）
            </h2>
            <BilingualInput
              labelZh="细节区标题（中文）"
              labelEn="Details Title (EN)"
              value={draft.pages.story.detailsTitle}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  pages: {
                    ...draft.pages,
                    story: { ...draft.pages.story, detailsTitle: v },
                  },
                })
              }
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {draft.pages.story.detailCards.map((dc, idx) => (
                <div
                  key={idx}
                  className="space-y-3 rounded-xl border border-[#ebebeb] bg-[#fafafa] p-3.5"
                >
                  <AdminPhotoField
                    label={`细节图 #${idx + 1}`}
                    value={dc.image}
                    hasR2={hasR2}
                    onChange={(url) => {
                      const nextCards = [...draft.pages.story.detailCards];
                      nextCards[idx] = { ...dc, image: url };
                      setDraft({
                        ...draft,
                        pages: {
                          ...draft.pages,
                          story: {
                            ...draft.pages.story,
                            detailCards: nextCards,
                          },
                        },
                      });
                    }}
                    showToast={showToast}
                  />
                  <BilingualInput
                    labelZh="图片说明（中文）"
                    labelEn="Caption (EN)"
                    value={dc.caption}
                    onChange={(v) => {
                      const nextCards = [...draft.pages.story.detailCards];
                      nextCards[idx] = { ...dc, caption: v };
                      setDraft({
                        ...draft,
                        pages: {
                          ...draft.pages,
                          story: {
                            ...draft.pages.story,
                            detailCards: nextCards,
                          },
                        },
                      });
                    }}
                    multiline
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Menu Page Copy (/menu) */}
      {subTab === "menuPage" && (
        <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1a1a1a]">
              菜单页顶部介绍与底部过敏原说明 (/menu)
            </h2>
            <Link
              href="/menu"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#005bd3] hover:underline"
            >
              打开菜单页预览
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <BilingualInput
            labelZh="小眉头（中文）"
            labelEn="Eyebrow (EN)"
            value={draft.pages.menu.eyebrow}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  menu: { ...draft.pages.menu, eyebrow: v },
                },
              })
            }
          />
          <BilingualInput
            labelZh="菜单页主标题（中文）"
            labelEn="Menu Page Title (EN)"
            value={draft.pages.menu.title}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  menu: { ...draft.pages.menu, title: v },
                },
              })
            }
          />
          <BilingualInput
            labelZh="菜单页顶部说明（中文）"
            labelEn="Menu Page Intro (EN)"
            value={draft.pages.menu.description}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  menu: { ...draft.pages.menu, description: v },
                },
              })
            }
            multiline
          />
          <BilingualInput
            labelZh="底部提示框标题（中文）"
            labelEn="Allergen Box Title (EN)"
            value={draft.pages.menu.allergenTitle}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  menu: { ...draft.pages.menu, allergenTitle: v },
                },
              })
            }
          />
          <BilingualInput
            labelZh="清真与蔬食说明（中文）"
            labelEn="Halal & Vegetarian Note (EN)"
            value={draft.pages.menu.dietaryNote}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  menu: { ...draft.pages.menu, dietaryNote: v },
                },
              })
            }
            multiline
            rows={3}
          />
          <BilingualInput
            labelZh="过敏原温馨提示（中文）"
            labelEn="Allergen Warning (EN)"
            value={draft.pages.menu.allergenNote}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  menu: { ...draft.pages.menu, allergenNote: v },
                },
              })
            }
            multiline
            rows={3}
          />
          <BilingualInput
            labelZh="价格同步说明（中文）"
            labelEn="Pricing Note (EN)"
            value={draft.pages.menu.pricingNote}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  menu: { ...draft.pages.menu, pricingNote: v },
                },
              })
            }
          />
        </div>
      )}

      {/* SUB-TAB 5: Visit Us Page (/visit-us) */}
      {subTab === "visitPage" && (
        <div className="space-y-4 rounded-xl border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1a1a1a]">
              到店导航页照片与文案 (/visit-us)
            </h2>
            <Link
              href="/visit-us"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#005bd3] hover:underline"
            >
              打开到店页预览
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <AdminPhotoField
            label="门头外观照片"
            value={draft.pages.visit.storefrontPhoto}
            hasR2={hasR2}
            onChange={(url) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  visit: { ...draft.pages.visit, storefrontPhoto: url },
                },
              })
            }
            showToast={showToast}
          />
          <BilingualInput
            labelZh="门头照片下方图注（中文）"
            labelEn="Storefront Photo Caption (EN)"
            value={draft.pages.visit.storefrontCaption}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  visit: { ...draft.pages.visit, storefrontCaption: v },
                },
              })
            }
          />
          <BilingualInput
            labelZh="页面主标题（中文）"
            labelEn="Visit Page Title (EN)"
            value={draft.pages.visit.title}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  visit: { ...draft.pages.visit, title: v },
                },
              })
            }
          />
          <BilingualInput
            labelZh="页面顶部说明（中文）"
            labelEn="Visit Page Description (EN)"
            value={draft.pages.visit.description}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  visit: { ...draft.pages.visit, description: v },
                },
              })
            }
            multiline
          />
          <BilingualInput
            labelZh="营业时间底部温馨提示（中文）"
            labelEn="Opening Hours Hint (EN)"
            value={draft.pages.visit.hoursHint}
            onChange={(v) =>
              setDraft({
                ...draft,
                pages: {
                  ...draft.pages,
                  visit: { ...draft.pages.visit, hoursHint: v },
                },
              })
            }
          />

          {onNavigateMainTab && (
            <div className="rounded-xl border border-[#ebebeb] bg-[#fafafa] p-3 text-xs text-[#616161]">
              如需修改门牌地址、联系电话、每日开门打烊时间或 Google 地图链接：
              <button
                type="button"
                onClick={() => onNavigateMainTab("settings")}
                className="ml-2 font-semibold text-[#005bd3] hover:underline"
              >
                前往「店铺与营业设置」 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
