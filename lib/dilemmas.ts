import { Stats } from "./types";

// 兩難抉擇事件（CD7 不可預測與好奇）：固定在 4 個週次觸發，給養成過程加入有敘事的選擇，
// 取代純數值的被動隨機事件。只動能力值、不授予知識點，故不影響 30 結局的可達性。
export interface DilemmaOption {
  label: string;
  deltas: Partial<Stats>;
  result: string; // 選了之後的一句旁白
}
export interface Dilemma {
  habitHint: string; // 呼應哪個習慣的兩難
  prompt: string;
  options: [DilemmaOption, DilemmaOption];
}

// 觸發週次（避開期中回顧 11/21/31，平均分布在四個學季）
export const DILEMMA_WEEKS = [6, 16, 26, 36];

export const DILEMMAS: Dilemma[] = [
  {
    habitHint: "習慣三・要事第一",
    prompt:
      "明天要小考，今晚社團卻臨時要趕成果發表。兩件事都重要，你只能選一個重心。",
    options: [
      {
        label: "先顧好小考，跟社團說明天再補",
        deltas: { knowledge: 8, social: -4 },
        result: "考試考得不錯，但有同學覺得你不夠挺團隊。",
      },
      {
        label: "陪社團趕完發表，小考碰運氣",
        deltas: { social: 8, knowledge: -4, charm: 3 },
        result: "發表很成功、人氣上升，但小考有點吃虧。",
      },
    ],
  },
  {
    habitHint: "習慣四・雙贏思維",
    prompt: "分組報告，組員想用最省事的做法交差，你卻想做得更好。意見僵住了。",
    options: [
      {
        label: "提出折衷方案，找出大家都能接受的做法",
        deltas: { social: 7, charm: 4, stamina: -4 },
        result: "雖然多花了力氣溝通，但全組都更投入了。",
      },
      {
        label: "自己默默扛下，把報告做到最好",
        deltas: { knowledge: 6, stamina: -8 },
        result: "報告很漂亮，但你累壞了，組員也沒學到東西。",
      },
    ],
  },
  {
    habitHint: "習慣五・知彼解己",
    prompt: "好朋友最近怪怪的，找你訴苦。你正好也忙得焦頭爛額。",
    options: [
      {
        label: "停下來，先好好聽他說",
        deltas: { social: 9, stamina: -5 },
        result: "他覺得被理解，你們的友誼更深了。",
      },
      {
        label: "急著給建議，三句話打發",
        deltas: { social: -5, knowledge: 2 },
        result: "他覺得沒被聽懂，悻悻地走了。",
      },
    ],
  },
  {
    habitHint: "習慣七・不斷更新",
    prompt: "連續衝刺好幾週，身體開始發出警訊。週末有一場很想參加的活動。",
    options: [
      {
        label: "這個週末徹底休息，把鋸子磨利",
        deltas: { stamina: 22, charm: 2 },
        result: "好好充電後，你回來時狀態煥然一新。",
      },
      {
        label: "硬撐去參加，機會難得",
        deltas: { charm: 6, social: 4, stamina: -12 },
        result: "活動很精彩，但你的體力透支得更嚴重了。",
      },
    ],
  },
];
