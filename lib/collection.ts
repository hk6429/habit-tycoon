// 結局收藏：用 localStorage 記錄玩家「親自達成過」的結局，供圖鑑顯示解鎖進度。
const KEY = "habit-tycoon-unlocked";

export function getUnlocked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addUnlocked(id: string): void {
  if (typeof window === "undefined") return;
  const set = new Set(getUnlocked());
  if (set.has(id)) return;
  set.add(id);
  localStorage.setItem(KEY, JSON.stringify([...set]));
}
