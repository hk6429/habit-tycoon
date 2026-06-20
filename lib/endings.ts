import { Ending, Stats } from "./types";
import { habitCounts } from "./habits";
import endingsData from "../data/endings.json";

const ENDINGS = endingsData as Ending[];

export function endingById(id: string): Ending {
  return ENDINGS.find((e) => e.id === id)!;
}

// 規則引擎：依已精通知識點判定唯一結局（不呼叫 LLM）
export function judgeEnding(masteredKPs: string[]): Ending {
  const set = new Set(masteredKPs);
  const c = habitCounts(masteredKPs); // c[0..6] = 習慣1..7 精通數 0-5
  const [h1, h2, h3, h4, h5, h6, h7] = c;
  const SELF = h1 + h2 + h3; // 0-15
  const PEOPLE = h4 + h5 + h6; // 0-15
  const RENEW = h7; // 0-5
  const total = SELF + PEOPLE + RENEW; // 0-35
  const hasCharacter = set.has("1-4"); // 品德成功根基

  // 成功門檻：整體足夠、七習慣無一全空、品德根基在
  const noEmpty = c.every((v) => v >= 1);
  const isSuccess = total >= 24 && noEmpty && hasCharacter;

  if (!isSuccess) {
    return endingById(pickFailure(c, SELF, PEOPLE, total, hasCharacter));
  }
  return endingById(pickSuccess(SELF, PEOPLE, RENEW, total));
}

function pickFailure(
  c: number[],
  SELF: number,
  PEOPLE: number,
  total: number,
  hasCharacter: boolean
): string {
  // 特定偏差（最具體者優先）
  if (SELF >= 10 && PEOPLE === 0) return "F9"; // 聰明的孤島
  if (PEOPLE >= 10 && SELF === 0) return "F10"; // 無方向的好人
  // 表面成功的空殼：做了大半的習慣一、整體有料，卻偏偏跳過品德根基（1-4）
  if (!hasCharacter && c[0] >= 3 && total >= 18) return "F8";

  // 找最弱的習慣（精通數最少；同分取習慣編號小者）
  let weakest = 0;
  for (let i = 1; i < c.length; i++) {
    if (c[i] < c[weakest]) weakest = i;
  }
  return `F${weakest + 1}`; // F1..F7 對應缺習慣1..7
}

function pickSuccess(
  SELF: number,
  PEOPLE: number,
  RENEW: number,
  total: number
): string {
  const balanced = SELF >= 10 && PEOPLE >= 10 && RENEW >= 3;
  let family: string;
  if (balanced) family = "A"; // 均衡圓滿型
  else if (RENEW >= 4) family = "D"; // 韌性更新型
  else if (SELF - PEOPLE >= 3) family = "B"; // 自律精進型
  else if (PEOPLE - SELF >= 3) family = "C"; // 人際共好型
  else family = "A";

  // 分 5 級：均衡(A)家族總分上限 35、跨距大；B/C/D 本質不均衡、總分天花板僅 29，
  // 故級距須各自縮放，否則 tier 3–5 永遠觸發不到（會有 9 個結局變死碼）。
  const tier =
    family === "A"
      ? total >= 35 // 傳說級：唯有精通全部 35 個知識點才觸發 A1「領航者」
        ? 5
        : total >= 32
          ? 4
          : total >= 29
            ? 3
            : total >= 26
              ? 2
              : 1
      : total >= 29
        ? 5
        : total >= 28
          ? 4
          : total >= 26
            ? 3
            : total >= 25
              ? 2
              : 1;

  // 編號方向：數字越小品質越高（A1＝最高階「領航者」、A5＝入門級）
  const idx = 6 - tier;
  return `${family}${idx}`;
}

// 即時傾向：不等養成結束，依目前精通分布給一個友善的風格標籤
export function tendency(masteredKPs: string[]): string {
  const c = habitCounts(masteredKPs);
  const SELF = c[0] + c[1] + c[2];
  const PEOPLE = c[3] + c[4] + c[5];
  const RENEW = c[6];
  const total = SELF + PEOPLE + RENEW;
  if (total < 4) return "還在摸索";
  if (SELF >= 10 && PEOPLE >= 10 && RENEW >= 3) return "均衡圓滿型";
  if (RENEW >= 4) return "韌性更新型";
  if (SELF - PEOPLE >= 3) return "自律精進型";
  if (PEOPLE - SELF >= 3) return "人際共好型";
  return "均衡發展型";
}

// 雷達圖資料：七習慣值 0-50
export function radarValues(masteredKPs: string[]): number[] {
  return habitCounts(masteredKPs).map((n) => n * 10);
}

// 能力軸：依四項能力值的相對高低，推測職業傾向（與品格軸＝習慣結局並列）
export function abilityProfile(stats: Stats): {
  label: string;
  career: string;
} {
  const arr = [
    { key: "knowledge", v: stats.knowledge },
    { key: "social", v: stats.social },
    { key: "charm", v: stats.charm },
    { key: "stamina", v: stats.stamina },
  ].sort((a, b) => b.v - a.v);

  // 最高與次高差距很小 → 視為全能均衡型
  if (arr[0].v - arr[1].v <= 8) {
    return {
      label: "全能型",
      career:
        "四項能力相當均衡，適應力強、可塑性高，適合需要跨域整合的角色——能在不同領域之間切換，也能把不同專長的人兜在一起。",
    };
  }

  const MAP: Record<string, { label: string; career: string }> = {
    knowledge: {
      label: "研究／專業型",
      career:
        "知識特別突出，適合往研究員、專業技術、知識傳播、教學等需要深度與專精的方向發展。",
    },
    social: {
      label: "領導／協作型",
      career:
        "人際特別突出，適合往團隊領導、人際協調、教育輔導、公共服務等以人為核心的方向發展。",
    },
    charm: {
      label: "表達／影響型",
      career:
        "魅力特別突出，適合往創作、表演、公關、行銷、媒體等需要表達與感染力的方向發展。",
    },
    stamina: {
      label: "行動／實作型",
      career:
        "體力與行動力特別突出，適合往實作、運動、創業執行等需要持續投入與抗壓的方向發展。",
    },
  };
  return MAP[arr[0].key];
}
