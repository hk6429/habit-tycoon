#!/usr/bin/env python3
"""結局可達性回歸驗證 — 對照 lib/endings.ts 的判定規則。

每次調整門檻（lib/endings.ts）或機制（lib/game.ts 的 TOTAL_WEEKS / STUDY_COST）後重跑：

    python3 scripts/verify-endings.py

預期輸出「可達: 30 / 30、缺漏: 無」。若有缺漏，代表某些結局在 40 週體力上限下永遠觸發不到，需回去調門檻或級距。

MMAX 推導（與 lib/game.ts 同步）：
  40 週、每週一個行動，精通 1 個 KP 花 STUDY_COST(=12) 體力（更新類淨 9），
  體力 ≥16 才能進修、休息 +30、起始 65。
  S 次進修 + R 次休息、S+R=40：65 + 30R − 12S ≥ 0 → S ≤ 30。
  故 40 週最多精通 30 個 KP。改 TOTAL_WEEKS / STUDY_COST 時要重算這個值。
"""
from itertools import product

MMAX = 30  # 40 週體力上限下最多精通的 KP 數（見檔頭推導）

# 門檻：與 lib/endings.ts 的 pickSuccess 完全同步
A_TIERS = [(29, 5), (27, 4), (26, 3), (25, 2)]   # 否則 tier 1
OTH_TIERS = [(28, 5), (27, 4), (26, 3), (25, 2)]  # B/C/D
SUCCESS_MIN = 24


def tier_of(total, tiers):
    for thr, t in tiers:
        if total >= thr:
            return t
    return 1


def judge(c, has_char):
    """Python 版 judgeEnding(masteredKPs) — 與 lib/endings.ts 一致。"""
    h1, h2, h3, h4, h5, h6, h7 = c
    SELF, PEOPLE, RENEW = h1 + h2 + h3, h4 + h5 + h6, h7
    total = SELF + PEOPLE + RENEW
    no_empty = all(v >= 1 for v in c)
    is_success = total >= SUCCESS_MIN and no_empty and has_char

    if not is_success:
        if SELF >= 10 and PEOPLE == 0:
            return "F9"
        if PEOPLE >= 10 and SELF == 0:
            return "F10"
        if (not has_char) and c[0] >= 3 and total >= 18:
            return "F8"
        weakest = min(range(7), key=lambda i: c[i])  # 同分取編號小者
        return f"F{weakest + 1}"

    if SELF >= 10 and PEOPLE >= 10 and RENEW >= 3:
        fam = "A"
    elif RENEW >= 4:
        fam = "D"
    elif SELF - PEOPLE >= 3:
        fam = "B"
    elif PEOPLE - SELF >= 3:
        fam = "C"
    else:
        fam = "A"
    tier = tier_of(total, A_TIERS if fam == "A" else OTH_TIERS)
    return f"{fam}{6 - tier}"  # 數字越小越高階


def main():
    reach = {}
    for c in product(range(6), repeat=7):  # 每習慣精通 0..5
        if sum(c) > MMAX:
            continue
        # 品德根基(1-4)可行性：c[0]==5 必含、c[0]==0 必不含、其餘兩者皆可
        for has_char in ([True] if c[0] == 5 else [False] if c[0] == 0 else [True, False]):
            reach.setdefault(judge(list(c), has_char), []).append((c, has_char))

    all_ids = [f"{f}{i}" for f in "ABCD" for i in range(1, 6)] + [f"F{i}" for i in range(1, 11)]
    missing = [e for e in all_ids if e not in reach]
    print(f"可達: {len(all_ids) - len(missing)} / {len(all_ids)}")
    print(f"缺漏: {missing if missing else '無'}")
    print("--- 各結局一組最省力可行向量 (c=習慣1..7精通數, 品德根基) ---")
    for e in all_ids:
        if e in reach:
            c, hc = min(reach[e], key=lambda x: sum(x[0]))
            print(f"{e}: 總分{sum(c):>2} c={c} 品德根基={'有' if hc else '無'}")
        else:
            print(f"{e}: ❌ 不可達")
    raise SystemExit(1 if missing else 0)


if __name__ == "__main__":
    main()
