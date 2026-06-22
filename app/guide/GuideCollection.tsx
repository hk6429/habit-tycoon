"use client";

import { useEffect, useState } from "react";
import endingsData from "@/data/endings.json";
import { getUnlocked } from "@/lib/collection";

type Ending = { id: string; type: string; title: string; summary: string };
const ENDINGS = endingsData as Ending[];
const byId = (id: string) => ENDINGS.find((e) => e.id === id)!;

// 與 lib/endings.ts 同步的門檻（40 週版）
const A_THRESHOLD: Record<number, number> = { 1: 29, 2: 27, 3: 26, 4: 25, 5: 24 };
const OTH_THRESHOLD: Record<number, number> = { 1: 28, 2: 27, 3: 26, 4: 25, 5: 24 };

const FAMILIES = [
  {
    key: "A",
    name: "A · 均衡圓滿型",
    accent: "#34d399",
    condition: "個人成功 ≥ 10、公眾成功 ≥ 10、持續更新 ≥ 3（三條軸都顧到）",
    note: "三軸兼顧的全人路線，最高階的 A1「領航者」要近乎滿養成。",
  },
  {
    key: "B",
    name: "B · 自律精進型",
    accent: "#fbbf24",
    condition: "個人成功 比 公眾成功 至少多 3（偏自我管理、未達均衡、持續更新 ≤ 3）",
    note: "把自己練得很強，但人際相對少經營。",
  },
  {
    key: "C",
    name: "C · 人際共好型",
    accent: "#60a5fa",
    condition: "公眾成功 比 個人成功 至少多 3（偏人際、未達均衡、持續更新 ≤ 3）",
    note: "很會與人合作，但自我根基相對薄。",
  },
  {
    key: "D",
    name: "D · 韌性更新型",
    accent: "#a78bfa",
    condition: "持續更新 ≥ 4（很重視自我更新，但未達 A 的三軸均衡）",
    note: "走得遠、懂得磨利鋸子的長跑型。",
  },
];

const FAILURES: { id: string; cause: string }[] = [
  { id: "F9", cause: "個人成功 ≥ 10，但 公眾成功 = 0（只顧自己、完全沒經營人際）" },
  { id: "F10", cause: "公眾成功 ≥ 10，但 個人成功 = 0（只顧別人、沒有自我根基）" },
  { id: "F8", cause: "沒精通「1-4 品德成功」、習慣一精通 ≥ 3、總分 ≥ 18（看似有料卻跳過根基）" },
  { id: "F1", cause: "最弱的是「習慣一 主動積極」" },
  { id: "F2", cause: "最弱的是「習慣二 以終為始」" },
  { id: "F3", cause: "最弱的是「習慣三 要事第一」" },
  { id: "F4", cause: "最弱的是「習慣四 雙贏思維」" },
  { id: "F5", cause: "最弱的是「習慣五 知彼解己」" },
  { id: "F6", cause: "最弱的是「習慣六 統合綜效」" },
  { id: "F7", cause: "最弱的是「習慣七 不斷更新」" },
];

const ALL_IDS = [
  ...["A", "B", "C", "D"].flatMap((f) => [1, 2, 3, 4, 5].map((i) => `${f}${i}`)),
  ...FAILURES.map((f) => f.id),
];

function Ribbon({ accent }: { accent: string }) {
  return (
    <span
      className="absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-full shadow"
      style={{ background: accent, color: "#0f172a" }}
    >
      ✓ 已達成
    </span>
  );
}

function EndingCard({
  e,
  accent,
  badge,
  unlocked,
}: {
  e: Ending;
  accent: string;
  badge?: string;
  unlocked: boolean;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden bg-slate-800/60 border transition"
      style={{ borderColor: unlocked ? `${accent}88` : "#1e293b" }}
    >
      <div className="relative aspect-[2/1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/endings/${e.id}.png`}
          alt={e.title}
          className={`w-full h-full object-cover ${unlocked ? "" : "opacity-50 saturate-50"}`}
        />
        <span
          className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${accent}cc`, color: "#0f172a", border: `1px solid ${accent}` }}
        >
          {e.id}
        </span>
        {unlocked && <Ribbon accent={accent} />}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pt-6 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">{e.title}</span>
            {badge && (
              <span className="text-[11px]" style={{ color: accent }}>
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed px-3 py-2.5">{e.summary}</p>
    </div>
  );
}

export default function GuideCollection() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  useEffect(() => {
    setUnlocked(new Set(getUnlocked()));
  }, []);

  const count = ALL_IDS.filter((id) => unlocked.has(id)).length;
  const pct = Math.round((count / ALL_IDS.length) * 100);

  return (
    <>
      {/* 收藏進度（CD4 擁有感）*/}
      <section className="rounded-2xl bg-slate-900 border border-slate-800 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">我的收藏</h2>
          <span className="text-sm text-emerald-300 font-bold">
            已解鎖 {count} / {ALL_IDS.length}
          </span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          每養成出一種結局就會自動點亮收藏。{count === 0 ? "回去玩一場，點亮你的第一個結局吧！" : count === ALL_IDS.length ? "🎉 全 30 種結局蒐集完成，太強了！" : "看看還有哪些結局沒走過——換個養成策略就解得到。"}
        </p>
      </section>

      {/* 四大成功家族 */}
      <h2 className="font-bold text-lg mb-3">20 種成功結局</h2>
      <div className="space-y-4 mb-6">
        {FAMILIES.map((f) => {
          const thr = f.key === "A" ? A_THRESHOLD : OTH_THRESHOLD;
          return (
            <section key={f.key} className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold" style={{ color: f.accent }}>
                  {f.name}
                </h3>
              </div>
              <p className="text-sm text-slate-300 mb-1">
                <b>家族條件：</b>
                {f.condition}
              </p>
              <p className="text-xs text-slate-500 mb-3">{f.note}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const e = byId(`${f.key}${idx}`);
                  return (
                    <EndingCard
                      key={e.id}
                      e={e}
                      accent={f.accent}
                      badge={`總分 ≥ ${thr[idx]}`}
                      unlocked={unlocked.has(e.id)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* 待成長結局 */}
      <h2 className="font-bold text-lg mb-2">10 種待成長結局</h2>
      <p className="text-sm text-slate-400 mb-3">
        只要沒滿足成功門檻就會落入這裡。先看「特定偏差」，再看「最弱的習慣」。
      </p>
      <section className="rounded-2xl bg-slate-900 border border-slate-800 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FAILURES.map((f) => {
            const e = byId(f.id);
            const on = unlocked.has(e.id);
            return (
              <div
                key={e.id}
                className="rounded-xl overflow-hidden bg-slate-800/60 border transition"
                style={{ borderColor: on ? "#f8717188" : "#1e293b" }}
              >
                <div className="relative aspect-[2/1]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/endings/${e.id}.png`}
                    alt={e.title}
                    className={`w-full h-full object-cover ${on ? "" : "opacity-50 saturate-50"}`}
                  />
                  <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-400/90 text-slate-900 border border-red-300">
                    {e.id}
                  </span>
                  {on && <Ribbon accent="#f87171" />}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pt-6 pb-2">
                    <span className="font-bold text-white text-sm">{e.title}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed px-3 py-2.5">成因：{f.cause}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
