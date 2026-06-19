// 共用型別

export type Gender = "male" | "female";

export interface Option {
  text: string;
  correct: boolean;
  feedback: string;
}

export interface Question {
  id: string;
  kp: string; // 知識點代碼，如 "1-3"
  kpTitle: string;
  scenario: string;
  question: string;
  options: Option[];
}

export interface KnowledgePoint {
  code: string; // "1-1"
  title: string;
  habit: number; // 1-7
}

export interface Habit {
  id: number; // 1-7
  name: string; // "主動積極"
  group: "self" | "people" | "renew";
  color: string;
  kps: KnowledgePoint[];
}

export type EndingType = "success" | "failure";

export interface Ending {
  id: string;
  type: EndingType;
  title: string;
  summary: string;
  personality: string;
  career: string;
  trap: string;
  truth: string;
}

// 四項基本能力值（0-100）
export interface Stats {
  stamina: number; // 體力
  charm: number; // 魅力
  knowledge: number; // 知識
  social: number; // 人際
}

export type ActionKind = "study" | "train" | "social" | "rest";

// 一週的行動結果（暫存，給「週報」畫面顯示）
export interface WeekReport {
  kind: ActionKind;
  kp?: string;
  kpTitle?: string;
  passed?: boolean;
  correct?: number;
  deltas: Partial<Stats>;
  event?: string; // 本週隨機事件描述（若有）
}

export interface GameState {
  gender: Gender;
  name: string;
  week: number; // 1-52
  stats: Stats;
  masteredKPs: string[]; // 已精通知識點代碼
  log: WeekLog[];
  report?: WeekReport; // 最近一週的行動結果
  finished: boolean;
}

export interface WeekLog {
  week: number;
  kind: ActionKind;
  kp?: string;
  kpTitle?: string;
  correct?: number;
  passed?: boolean;
}
