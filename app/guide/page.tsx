import type { Metadata } from "next";
import endingsData from "@/data/endings.json";

export const metadata: Metadata = {
  title: "結局圖鑑 · 30 種結局怎麼養成｜習慣養成工廠",
  description: "習慣養成工廠 30 種結局的達成條件一覽：成功共同條件、四大成功家族與門檻、十種待成長結局的成因。",
};

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

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {children}
    </span>
  );
}

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 text-slate-200">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-extrabold">結局圖鑑</h1>
        <a href="/" className="text-sm text-slate-400 hover:text-slate-200 underline">← 回首頁</a>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        一學年 40 週，最多能精通 30 個知識點。你把心力放在哪三條軸上，就決定了你會養成哪一種結局。
      </p>

      {/* 三條軸 + 成功共同條件 */}
      <section className="rounded-2xl bg-slate-900 border border-slate-800 p-5 mb-5">
        <h2 className="font-bold mb-3">怎麼判定結局？三條軸 + 共同條件</h2>
        <ul className="text-sm space-y-1.5 text-slate-300">
          <li>🟥 <b>個人成功</b>＝習慣 1+2+3 精通數（主動積極／以終為始／要事第一），上限 15</li>
          <li>🟦 <b>公眾成功</b>＝習慣 4+5+6 精通數（雙贏思維／知彼解己／統合綜效），上限 15</li>
          <li>🟪 <b>持續更新</b>＝習慣 7 精通數（不斷更新），上限 5</li>
        </ul>
        <div className="mt-4 text-sm text-slate-300">
          <p className="font-semibold text-emerald-400 mb-1">成功結局的共同門檻（三者全滿足）</p>
          <ul className="space-y-1 list-disc list-inside text-slate-300">
            <li>精通總數 ≥ 24（三軸相加）</li>
            <li>七個習慣「每個都至少精通 1 個」（不能整個習慣掛零）</li>
            <li>必須精通「1-4 品德成功 vs 表面成功」（品格根基）</li>
          </ul>
          <p className="text-slate-500 text-xs mt-2">少了任何一條，就會落入下方的「待成長結局」。</p>
        </div>
      </section>

      {/* 四大成功家族 */}
      <h2 className="font-bold text-lg mb-3">20 種成功結局</h2>
      <div className="space-y-4 mb-6">
        {FAMILIES.map((f) => {
          const thr = f.key === "A" ? A_THRESHOLD : OTH_THRESHOLD;
          return (
            <section key={f.key} className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold" style={{ color: f.accent }}>{f.name}</h3>
              </div>
              <p className="text-sm text-slate-300 mb-1">
                <b>家族條件：</b>{f.condition}
              </p>
              <p className="text-xs text-slate-500 mb-3">{f.note}</p>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const e = byId(`${f.key}${idx}`);
                  return (
                    <div key={e.id} className="flex items-start gap-3 rounded-lg bg-slate-800/60 px-3 py-2">
                      <Tag color={f.accent}>{e.id}</Tag>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{e.title}</span>
                          <span className="text-[11px] text-slate-400">總分 ≥ {thr[idx]}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{e.summary}</p>
                      </div>
                    </div>
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
        <div className="space-y-2">
          {FAILURES.map((f) => {
            const e = byId(f.id);
            return (
              <div key={e.id} className="flex items-start gap-3 rounded-lg bg-slate-800/60 px-3 py-2">
                <Tag color="#f87171">{e.id}</Tag>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{e.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    成因：{f.cause}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="text-center">
        <a href="/" className="inline-block rounded-lg bg-slate-700 hover:bg-slate-600 px-8 py-3 font-semibold">
          開始養成，挑一個結局
        </a>
      </div>
    </main>
  );
}
