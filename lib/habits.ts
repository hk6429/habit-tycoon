import { Habit } from "./types";

// 七個習慣 × 五個知識點 = 35 個知識點
export const HABITS: Habit[] = [
  {
    id: 1,
    name: "主動積極",
    group: "self",
    color: "#ef4444",
    kps: [
      { code: "1-1", title: "影響圈 vs 關注圈", habit: 1 },
      { code: "1-2", title: "刺激與回應之間的選擇空間", habit: 1 },
      { code: "1-3", title: "主動語言 vs 被動語言", habit: 1 },
      { code: "1-4", title: "品德成功 vs 表面成功", habit: 1 },
      { code: "1-5", title: "四大天賦", habit: 1 },
    ],
  },
  {
    id: 2,
    name: "以終為始",
    group: "self",
    color: "#f97316",
    kps: [
      { code: "2-1", title: "兩次創造", habit: 2 },
      { code: "2-2", title: "個人使命宣言", habit: 2 },
      { code: "2-3", title: "生活重心", habit: 2 },
      { code: "2-4", title: "願景練習", habit: 2 },
      { code: "2-5", title: "多重角色與目標", habit: 2 },
    ],
  },
  {
    id: 3,
    name: "要事第一",
    group: "self",
    color: "#eab308",
    kps: [
      { code: "3-1", title: "時間管理四象限", habit: 3 },
      { code: "3-2", title: "第二象限", habit: 3 },
      { code: "3-3", title: "學會說不", habit: 3 },
      { code: "3-4", title: "週計畫", habit: 3 },
      { code: "3-5", title: "對自己的承諾", habit: 3 },
    ],
  },
  {
    id: 4,
    name: "雙贏思維",
    group: "people",
    color: "#22c55e",
    kps: [
      { code: "4-1", title: "六種人際模式", habit: 4 },
      { code: "4-2", title: "富足心態", habit: 4 },
      { code: "4-3", title: "情感帳戶", habit: 4 },
      { code: "4-4", title: "雙贏或不交易", habit: 4 },
      { code: "4-5", title: "雙贏協議", habit: 4 },
    ],
  },
  {
    id: 5,
    name: "知彼解己",
    group: "people",
    color: "#14b8a6",
    kps: [
      { code: "5-1", title: "同理心傾聽", habit: 5 },
      { code: "5-2", title: "自傳式回應四種病", habit: 5 },
      { code: "5-3", title: "先理解再求被理解", habit: 5 },
      { code: "5-4", title: "診斷先於開處方", habit: 5 },
      { code: "5-5", title: "有勇氣也有體諒地表達", habit: 5 },
    ],
  },
  {
    id: 6,
    name: "統合綜效",
    group: "people",
    color: "#3b82f6",
    kps: [
      { code: "6-1", title: "統合綜效", habit: 6 },
      { code: "6-2", title: "珍視差異", habit: 6 },
      { code: "6-3", title: "第三選擇", habit: 6 },
      { code: "6-4", title: "化阻力為助力", habit: 6 },
      { code: "6-5", title: "創造性合作", habit: 6 },
    ],
  },
  {
    id: 7,
    name: "不斷更新",
    group: "renew",
    color: "#8b5cf6",
    kps: [
      { code: "7-1", title: "四個層面更新", habit: 7 },
      { code: "7-2", title: "螺旋向上成長", habit: 7 },
      { code: "7-3", title: "磨利鋸子", habit: 7 },
      { code: "7-4", title: "平衡更新", habit: 7 },
      { code: "7-5", title: "教是最好的學", habit: 7 },
    ],
  },
];

export const ALL_KPS = HABITS.flatMap((h) => h.kps);

export const GROUP_LABEL: Record<string, string> = {
  self: "個人成功（自律）",
  people: "公眾成功（人際）",
  renew: "持續更新（韌性）",
};

export function habitById(id: number): Habit {
  return HABITS[id - 1];
}

// 依已精通的知識點計算每個習慣的精通數（0-5）
export function habitCounts(masteredKPs: string[]): number[] {
  const set = new Set(masteredKPs);
  return HABITS.map((h) => h.kps.filter((k) => set.has(k.code)).length);
}
