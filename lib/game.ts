import { ActionKind, GameState, Stats, WeekReport } from "./types";
import { ALL_KPS, habitById } from "./habits";

export const TOTAL_WEEKS = 40;
export const QUIZ_SIZE = 10; // 每知識點題數
export const PASS_THRESHOLD = 6; // 答對幾題才精通（6/10，容許錯幾題，降低挫折）
export const TOTAL_KPS = ALL_KPS.length; // 35
export const STAT_MAX = 100;

// 進修要花體力；體力不足就讀不動，必須先休息或鍛鍊（稀缺資源 → 取捨）
// 16→12：縮短為一學年 40 週後，40 週最多能精通 30 個 KP（已模擬驗證 30 結局皆可達）；
// 體力仍是稀缺資源，全押進修＋休息就長不出魅力／人際（取捨仍在）。
export const STUDY_COST = 12;
export const STUDY_MIN_STAMINA = 16;

const STORAGE_KEY = "habit-tycoon-save";

export function newGame(name: string, gender: GameState["gender"]): GameState {
  return {
    gender,
    name,
    week: 1,
    stats: { stamina: 65, charm: 12, knowledge: 12, social: 12 },
    masteredKPs: [],
    log: [],
    finished: false,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(STAT_MAX, n));
}

export function applyDeltas(stats: Stats, d: Partial<Stats>): Stats {
  return {
    stamina: clamp(stats.stamina + (d.stamina ?? 0)),
    charm: clamp(stats.charm + (d.charm ?? 0)),
    knowledge: clamp(stats.knowledge + (d.knowledge ?? 0)),
    social: clamp(stats.social + (d.social ?? 0)),
  };
}

// 非進修行動的效果
export const ACTION_DELTAS: Record<Exclude<ActionKind, "study">, Partial<Stats>> = {
  train: { stamina: 12, charm: 4 }, // 鍛鍊
  social: { social: 9, charm: 5, stamina: -6 }, // 社交
  rest: { stamina: 30 }, // 休息
};

export const ACTION_INFO: Record<
  ActionKind,
  { label: string; icon: string; desc: string }
> = {
  study: { label: "進修", icon: "📚", desc: `精通知識點 ＋知識（體力 −${STUDY_COST}）` },
  train: { label: "鍛鍊", icon: "💪", desc: "體力 ＋12、魅力 ＋4" },
  social: { label: "社交", icon: "🤝", desc: "人際 ＋9、魅力 ＋5（體力 −6）" },
  rest: { label: "休息", icon: "😴", desc: "體力 ＋30（這週不進度）" },
};

// 進修（答完題）的能力值變化：依習慣群不同，順帶長對應能力
export function studyDeltas(kp: string, passed: boolean): Partial<Stats> {
  const group = habitById(parseInt(kp.split("-")[0], 10)).group;
  const d: Partial<Stats> = { stamina: -STUDY_COST };
  if (passed) {
    d.knowledge = 3;
    if (group === "self") d.knowledge = 5;
    if (group === "people") {
      d.social = 5;
      d.charm = 2;
    }
    if (group === "renew") {
      d.stamina = -STUDY_COST + 3;
      d.charm = 1;
    }
  } else {
    d.knowledge = 1; // 沒過關也學到一點
  }
  return d;
}

// 隨機事件池（每週約 20% 機率）
const EVENTS: { text: string; d: Partial<Stats> }[] = [
  { text: "撿到學霸的共筆，讀起來特別順！", d: { knowledge: 6 } },
  { text: "不小心感冒了，渾身沒力。", d: { stamina: -15 } },
  { text: "被老師選為小老師幫同學講解，很有成就感。", d: { social: 8, knowledge: 3 } },
  { text: "週末睡得很飽，精神超好。", d: { stamina: 14 } },
  { text: "和好朋友鬧了點小彆扭。", d: { social: -6, stamina: -4 } },
  { text: "運動會替班上奪牌，超有面子！", d: { charm: 8, stamina: 5 } },
  { text: "熬夜滑手機，隔天超累。", d: { stamina: -10, knowledge: -3 } },
  { text: "讀到一本很喜歡的書，靈感滿滿。", d: { knowledge: 5, charm: 3 } },
  { text: "社團成果發表被大家稱讚。", d: { charm: 6, social: 5 } },
  { text: "幫家裡做了很多事，雖然累但被肯定。", d: { social: 5, stamina: -6 } },
];

export function rollEvent(): { text: string; d: Partial<Stats> } | null {
  if (Math.random() < 0.2) {
    return EVENTS[Math.floor(Math.random() * EVENTS.length)];
  }
  return null;
}

// 推進一週：套用行動效果 + 隨機事件，回傳新狀態
export function advanceWeek(
  state: GameState,
  kind: ActionKind,
  opts: {
    deltas: Partial<Stats>;
    kp?: string;
    kpTitle?: string;
    passed?: boolean;
    correct?: number;
  }
): GameState {
  let stats = applyDeltas(state.stats, opts.deltas);
  const event = rollEvent();
  if (event) stats = applyDeltas(stats, event.d);

  const masteredKPs =
    opts.passed && opts.kp
      ? Array.from(new Set([...state.masteredKPs, opts.kp]))
      : state.masteredKPs;

  const report: WeekReport = {
    kind,
    kp: opts.kp,
    kpTitle: opts.kpTitle,
    passed: opts.passed,
    correct: opts.correct,
    deltas: opts.deltas,
    event: event?.text,
  };

  return {
    ...state,
    week: state.week + 1,
    stats,
    masteredKPs,
    report,
    log: [
      ...state.log,
      {
        week: state.week,
        kind,
        kp: opts.kp,
        kpTitle: opts.kpTitle,
        correct: opts.correct,
        passed: opts.passed,
      },
    ],
  };
}

export function isFinished(s: GameState): boolean {
  return s.week > TOTAL_WEEKS || s.masteredKPs.length >= TOTAL_KPS;
}

export function saveGame(s: GameState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const g = JSON.parse(raw) as GameState;
    // 舊版存檔沒有能力值欄位 → 視為不相容，重新開始
    if (!g || typeof g.stats?.stamina !== "number") return null;
    return g;
  } catch {
    return null;
  }
}

export function clearGame() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function weeksLeft(s: GameState): number {
  return TOTAL_WEEKS - s.week + 1;
}
