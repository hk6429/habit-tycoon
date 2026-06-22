import type { Metadata } from "next";
import GuideCollection from "./GuideCollection";

export const metadata: Metadata = {
  title: "結局圖鑑 · 30 種結局怎麼養成｜習慣養成工廠",
  description: "習慣養成工廠 30 種結局的達成條件一覽：成功共同條件、四大成功家族與門檻、十種待成長結局的成因，並追蹤你親自解鎖了哪幾種。",
};

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

      <GuideCollection />

      <div className="text-center">
        <a href="/" className="inline-block rounded-lg bg-slate-700 hover:bg-slate-600 px-8 py-3 font-semibold">
          開始養成，挑一個結局
        </a>
      </div>
    </main>
  );
}
