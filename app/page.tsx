"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActionKind,
  GameState,
  Gender,
  Question,
  Stats,
} from "@/lib/types";
import { HABITS, habitCounts, habitById, GROUP_LABEL } from "@/lib/habits";
import { questionsForKP } from "@/lib/questions";
import { judgeEnding, radarValues, abilityProfile, tendency } from "@/lib/endings";
import {
  TOTAL_WEEKS,
  TOTAL_KPS,
  PASS_THRESHOLD,
  QUIZ_SIZE,
  STUDY_MIN_STAMINA,
  ACTION_DELTAS,
  ACTION_INFO,
  studyDeltas,
  advanceWeek,
  isFinished,
  newGame,
  saveGame,
  loadGame,
  clearGame,
  weeksLeft,
} from "@/lib/game";

type Screen = "intro" | "title" | "setup" | "hub" | "quiz" | "result" | "term" | "ending";

// 期中評語觸發週（每約一學期看一次暫定走向）
const TERM_WEEKS = [11, 21, 31];
type Expr = "neutral" | "happy" | "sad";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SCENE: Record<string, string> = {
  self: "/scenes/self.png",
  people: "/scenes/people.png",
  renew: "/scenes/renew.png",
};

function spriteSrc(gender: Gender, expr: Expr): string {
  return `/sprites/${gender === "male" ? "m" : "f"}-${expr}.png`;
}

function sceneForKp(kp: string): string {
  return SCENE[habitById(parseInt(kp.split("-")[0], 10)).group];
}

const STAT_META: { key: keyof Stats; label: string; icon: string; color: string }[] = [
  { key: "stamina", label: "體力", icon: "❤️", color: "#ef4444" },
  { key: "knowledge", label: "知識", icon: "📘", color: "#3b82f6" },
  { key: "social", label: "人際", icon: "🤝", color: "#22c55e" },
  { key: "charm", label: "魅力", icon: "✨", color: "#eab308" },
];

// 2:1 視覺小說式舞台：背景場景 + 去背角色立繪疊合
function Stage({
  bg,
  sprite,
  children,
}: {
  bg: string;
  sprite?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden shadow-lg ring-1 ring-slate-800">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />
      {sprite && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sprite}
          alt=""
          className="absolute bottom-0 right-3 h-[97%] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
        />
      )}
      {children && <div className="absolute inset-0">{children}</div>}
    </div>
  );
}

function StatBars({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {STAT_META.map((m) => (
        <div key={m.key} className="flex items-center gap-2 text-sm">
          <span className="w-12 shrink-0 text-slate-300">
            {m.icon} {m.label}
          </span>
          <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${stats[m.key]}%`, background: m.color }}
            />
          </div>
          <span className="w-8 text-right text-slate-400">{stats[m.key]}</span>
        </div>
      ))}
    </div>
  );
}

function HabitBars({ masteredKPs }: { masteredKPs: string[] }) {
  const counts = habitCounts(masteredKPs);
  return (
    <div className="space-y-1.5">
      {HABITS.map((h, i) => (
        <div key={h.id} className="flex items-center gap-2 text-xs">
          <span className="w-24 shrink-0 text-slate-300">
            {h.id}. {h.name}
          </span>
          <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(counts[i] / 5) * 100}%`, background: h.color }}
            />
          </div>
          <span className="w-9 text-right text-slate-400">{counts[i]}/5</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [game, setGame] = useState<GameState | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [studyKp, setStudyKp] = useState("");

  useEffect(() => {
    setHasSave(!!loadGame());
  }, []);

  function persist(g: GameState) {
    setGame(g);
    saveGame(g);
  }

  function handleAction(kind: Exclude<ActionKind, "study">) {
    if (!game) return;
    persist(advanceWeek(game, kind, { deltas: ACTION_DELTAS[kind] }));
    setScreen("result");
  }

  function handleStudyDone(kp: string, passed: boolean, correct: number, kpTitle: string) {
    if (!game) return;
    persist(
      advanceWeek(game, "study", {
        deltas: studyDeltas(kp, passed),
        kp,
        kpTitle,
        passed,
        correct,
      })
    );
    setScreen("result");
  }

  function resetGame() {
    clearGame();
    setGame(null);
    setHasSave(false);
    setScreen("title");
  }

  if (screen === "intro") {
    return <Intro onDone={() => setScreen("title")} />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 flex justify-center">
      <div className="w-full max-w-2xl">
        {screen === "title" && (
          <Title
            hasSave={hasSave}
            onNew={() => setScreen("setup")}
            onContinue={() => {
              const g = loadGame();
              if (g) {
                setGame(g);
                setScreen(g.finished ? "ending" : "hub");
              }
            }}
          />
        )}
        {screen === "setup" && (
          <Setup
            onStart={(name, gender) => {
              persist(newGame(name, gender));
              setScreen("hub");
            }}
          />
        )}
        {screen === "hub" && game && (
          <Hub
            game={game}
            onStudy={(kp) => {
              setStudyKp(kp);
              setScreen("quiz");
            }}
            onAction={handleAction}
            onFinish={() => {
              persist({ ...game, finished: true });
              setScreen("ending");
            }}
            onReset={resetGame}
          />
        )}
        {screen === "quiz" && game && (
          <Quiz game={game} kp={studyKp} onDone={handleStudyDone} />
        )}
        {screen === "result" && game && (
          <Result
            game={game}
            onNext={() => {
              if (isFinished(game)) {
                persist({ ...game, finished: true });
                setScreen("ending");
              } else if (TERM_WEEKS.includes(game.week)) {
                setScreen("term");
              } else {
                setScreen("hub");
              }
            }}
          />
        )}
        {screen === "term" && game && (
          <TermReview game={game} onNext={() => setScreen("hub")} />
        )}
        {screen === "ending" && game && (
          <EndingView game={game} onRestart={resetGame} />
        )}
      </div>
    </main>
  );
}

/* ---------------- 開場影片 ---------------- */
function Intro({ onDone }: { onDone: () => void }) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <video
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={onDone}
        onError={onDone}
        className="max-h-screen max-w-full object-contain"
      />
      <button
        onClick={onDone}
        className="absolute bottom-6 right-6 text-sm text-white/70 hover:text-white bg-black/40 rounded-full px-4 py-2"
      >
        跳過 ▸
      </button>
    </main>
  );
}

/* ---------------- 標題 ---------------- */
function Title({
  hasSave,
  onNew,
  onContinue,
}: {
  hasSave: boolean;
  onNew: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="text-center pt-8">
      <div className="mb-6">
        <Stage bg="/title.png" />
      </div>
      <p className="text-slate-400 text-sm mb-8">
        用一學年 40 週，養成一個八年級孩子的成功品格
      </p>
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        {hasSave && (
          <button
            onClick={onContinue}
            className="bg-emerald-600 hover:bg-emerald-500 rounded-lg py-3 font-semibold"
          >
            繼續上次進度
          </button>
        )}
        <button
          onClick={onNew}
          className="bg-slate-700 hover:bg-slate-600 rounded-lg py-3 font-semibold"
        >
          開始新養成
        </button>
      </div>
      <p className="text-slate-600 text-xs mt-12">
        每週可：進修 / 鍛鍊 / 社交 / 休息 — 體力有限，養成靠取捨
      </p>
    </div>
  );
}

/* ---------------- 角色設定 ---------------- */
function Setup({ onStart }: { onStart: (name: string, gender: Gender) => void }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  return (
    <div className="pt-6">
      <div className="mb-5">
        <Stage bg={SCENE.self} sprite={spriteSrc(gender, "neutral")} />
      </div>
      <h2 className="text-2xl font-bold mb-6">創建你的學生</h2>
      <label className="block text-sm text-slate-400 mb-2">名字</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="幫他取個名字"
        className="w-full bg-slate-800 rounded-lg px-4 py-3 mb-6 outline-none focus:ring-2 ring-emerald-500"
      />
      <label className="block text-sm text-slate-400 mb-2">性別</label>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {(["male", "female"] as Gender[]).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={`rounded-lg py-4 font-semibold border-2 ${
              gender === g
                ? "border-emerald-500 bg-emerald-600/20"
                : "border-slate-700 bg-slate-800"
            }`}
          >
            {g === "male" ? "男生" : "女生"}
          </button>
        ))}
      </div>
      <button
        disabled={!name.trim()}
        onClick={() => onStart(name.trim(), gender)}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg py-3 font-semibold"
      >
        開始養成
      </button>
    </div>
  );
}

/* ---------------- 主畫面（週）：行動選擇 ---------------- */
function Hub({
  game,
  onStudy,
  onAction,
  onFinish,
  onReset,
}: {
  game: GameState;
  onStudy: (kp: string) => void;
  onAction: (kind: Exclude<ActionKind, "study">) => void;
  onFinish: () => void;
  onReset: () => void;
}) {
  const [picking, setPicking] = useState(false);
  const mastered = new Set(game.masteredKPs);
  const done = isFinished(game);
  const canStudy = game.stats.stamina >= STUDY_MIN_STAMINA;

  return (
    <div className="pt-4">
      <div className="mb-4">
        <Stage bg={SCENE.self} sprite={spriteSrc(game.gender, "neutral")} />
      </div>

      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold">
          {game.name}（{game.gender === "male" ? "男" : "女"}）
        </h2>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          重新開始
        </button>
      </div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-slate-400 text-sm">
          第 {Math.min(game.week, TOTAL_WEEKS)} / {TOTAL_WEEKS} 週 · 精通{" "}
          {game.masteredKPs.length} / {TOTAL_KPS} · 剩 {Math.max(weeksLeft(game), 0)} 週
        </p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 shrink-0">
          傾向：{tendency(game.masteredKPs)}
        </span>
      </div>

      <div className="bg-slate-900 rounded-xl p-4 mb-3">
        <StatBars stats={game.stats} />
      </div>
      <div className="bg-slate-900 rounded-xl p-3 mb-5">
        <HabitBars masteredKPs={game.masteredKPs} />
      </div>

      {done ? (
        <div className="text-center">
          <p className="mb-4 text-slate-300">
            {game.masteredKPs.length >= TOTAL_KPS
              ? "🎉 35 個知識點全部精通了！"
              : "這一年的養成時間結束了。"}
          </p>
          <button
            onClick={onFinish}
            className="bg-emerald-600 hover:bg-emerald-500 rounded-lg py-3 px-8 font-semibold"
          >
            查看結局
          </button>
        </div>
      ) : picking ? (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-slate-400">
              這週進修哪個知識點？（答對 {PASS_THRESHOLD}/{QUIZ_SIZE} 過關）
            </p>
            <button
              onClick={() => setPicking(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              ← 返回
            </button>
          </div>
          <div className="space-y-3">
            {HABITS.map((h) => {
              const remaining = h.kps.filter((k) => !mastered.has(k.code));
              if (remaining.length === 0) return null;
              return (
                <div key={h.id}>
                  <div className="text-xs text-slate-500 mb-1">
                    習慣 {h.id}：{h.name}（{GROUP_LABEL[h.group]}）
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {remaining.map((k) => (
                      <button
                        key={k.code}
                        onClick={() => onStudy(k.code)}
                        className="text-sm bg-slate-800 hover:bg-slate-700 border rounded-lg px-3 py-2"
                        style={{ borderColor: h.color + "55" }}
                      >
                        {k.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-slate-400 mb-3">這週要做什麼？</p>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              kind="study"
              gender={game.gender}
              disabled={!canStudy}
              hint={!canStudy ? "體力不足，先休息" : undefined}
              onClick={() => setPicking(true)}
            />
            <ActionButton
              kind="train"
              gender={game.gender}
              onClick={() => onAction("train")}
            />
            <ActionButton
              kind="social"
              gender={game.gender}
              onClick={() => onAction("social")}
            />
            <ActionButton
              kind="rest"
              gender={game.gender}
              onClick={() => onAction("rest")}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ActionButton({
  kind,
  gender,
  onClick,
  disabled,
  hint,
}: {
  kind: ActionKind;
  gender: Gender;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  const info = ACTION_INFO[kind];
  const img = `/actions/${gender === "male" ? "m" : "f"}-${kind}.png`;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-left bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-slate-700">
        <img
          src={img}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="absolute top-1.5 left-2 text-2xl drop-shadow-lg">
          {info.icon}
        </span>
      </div>
      <div className="p-3">
        <div className="text-lg font-semibold mb-0.5">{info.label}</div>
        <div className="text-xs text-slate-400">{hint ?? info.desc}</div>
      </div>
    </button>
  );
}

/* ---------------- 測驗（進修） ---------------- */
function Quiz({
  game,
  kp,
  onDone,
}: {
  game: GameState;
  kp: string;
  onDone: (kp: string, passed: boolean, correct: number, kpTitle: string) => void;
}) {
  const questions = useMemo<Question[]>(() => {
    return questionsForKP(kp).map((q) => ({ ...q, options: shuffle(q.options) }));
  }, [kp]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const q = questions[idx];
  const kpTitle = q?.kpTitle ?? "";

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (q.options[i].correct) setCorrect((c) => c + 1);
  }

  function next() {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      onDone(kp, correct >= PASS_THRESHOLD, correct, kpTitle);
    }
  }

  if (!q) return null;
  const chosen = picked !== null ? q.options[picked] : null;
  const expr: Expr = chosen ? (chosen.correct ? "happy" : "sad") : "neutral";

  return (
    <div className="pt-4">
      <div className="mb-4">
        <Stage bg={sceneForKp(kp)} sprite={spriteSrc(game.gender, expr)} />
      </div>

      <div className="flex justify-between text-sm text-slate-400 mb-2">
        <span>{kpTitle}</span>
        <span>
          第 {idx + 1} / {questions.length} 題 · 答對 {correct}
        </span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-emerald-500"
          style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-slate-900 rounded-xl p-4 mb-4">
        {/* 該知識點的情境插圖（尚未生成時自動隱藏） */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/kp/${kp}.png`}
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          className="w-full aspect-[2/1] object-cover rounded-lg mb-3"
        />
        <p className="text-slate-200 mb-3 leading-relaxed">{q.scenario}</p>
        <p className="font-semibold text-emerald-400">{q.question}</p>
      </div>

      <div className="space-y-2">
        {q.options.map((o, i) => {
          const isPicked = picked === i;
          let cls = "bg-slate-800 hover:bg-slate-700 border-slate-700";
          if (picked !== null) {
            if (o.correct) cls = "bg-emerald-700/40 border-emerald-500";
            else if (isPicked) cls = "bg-red-800/40 border-red-500";
            else cls = "bg-slate-800 border-slate-700 opacity-60";
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={`w-full text-left rounded-lg px-4 py-3 border ${cls}`}
            >
              {o.text}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            chosen.correct
              ? "bg-emerald-900/40 text-emerald-200"
              : "bg-amber-900/30 text-amber-200"
          }`}
        >
          {chosen.correct ? "✓ " : "✗ "}
          {chosen.feedback}
        </div>
      )}

      {picked !== null && (
        <button
          onClick={next}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg py-3 font-semibold"
        >
          {idx + 1 < questions.length ? "下一題" : "看本週結果"}
        </button>
      )}
    </div>
  );
}

/* ---------------- 週報（行動結果 + 數值變化 + 事件） ---------------- */
function Result({ game, onNext }: { game: GameState; onNext: () => void }) {
  const r = game.report;
  if (!r) return null;
  const info = ACTION_INFO[r.kind];
  const isStudy = r.kind === "study";
  const expr: Expr = isStudy ? (r.passed ? "happy" : "sad") : "neutral";
  // 進修：用該知識點場景＋立繪（依答對與否變表情）；
  // 鍛鍊／社交／休息：用該行動的專屬插圖當場景，插圖已含角色故不再疊立繪。
  const bg =
    isStudy && r.kp
      ? sceneForKp(r.kp)
      : `/actions/${game.gender === "male" ? "m" : "f"}-${r.kind}.png`;

  return (
    <div className="pt-6 text-center">
      <div className="mb-5">
        <Stage bg={bg} sprite={isStudy ? spriteSrc(game.gender, expr) : undefined}>
          <div className="absolute inset-0 bg-slate-950/35 flex flex-col items-center justify-center">
            <div className="text-5xl mb-1">
              {isStudy ? (r.passed ? "🎯" : "💤") : info.icon}
            </div>
            <div className="text-lg font-bold text-white drop-shadow">
              {isStudy
                ? r.passed
                  ? "知識點精通！"
                  : "這週沒過關"
                : `${info.label}完成`}
            </div>
          </div>
        </Stage>
      </div>

      {isStudy && (
        <p className="text-slate-300 mb-1">
          {r.kpTitle}　答對 {r.correct} / {QUIZ_SIZE} 題
        </p>
      )}

      <div className="inline-flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm mb-4">
        {STAT_META.map((m) => {
          const d = r.deltas[m.key];
          if (!d) return null;
          return (
            <span key={m.key} className={d > 0 ? "text-emerald-400" : "text-red-400"}>
              {m.icon} {m.label} {d > 0 ? "+" : ""}
              {d}
            </span>
          );
        })}
      </div>

      {r.event && (
        <div className="bg-indigo-900/40 text-indigo-200 rounded-lg p-3 text-sm mb-4 max-w-md mx-auto">
          ✦ 突發事件：{r.event}
        </div>
      )}

      <div className="bg-slate-900 rounded-xl p-3 mb-5 text-left">
        <StatBars stats={game.stats} />
      </div>

      <button
        onClick={onNext}
        className="bg-emerald-600 hover:bg-emerald-500 rounded-lg py-3 px-8 font-semibold"
      >
        繼續
      </button>
    </div>
  );
}

/* ---------------- 結局（品格軸 × 能力軸） ---------------- */
/* ---------------- 期中評語（暫定走向預告） ---------------- */
function TermReview({ game, onNext }: { game: GameState; onNext: () => void }) {
  const term = TERM_WEEKS.indexOf(game.week) + 1;
  const provisional = useMemo(() => judgeEnding(game.masteredKPs), [game.masteredKPs]);
  const lean = tendency(game.masteredKPs);
  const success = provisional.type === "success";
  return (
    <div className="pt-6 pb-12 text-center">
      <div className="mb-5 rounded-xl overflow-hidden">
        <Stage bg={`/endings/${provisional.id}.png`} />
      </div>
      <p className="text-slate-400 text-sm mb-1">期中回顧 · 第 {term} 階段</p>
      <p className="text-slate-300 mb-1">如果現在就結束養成，{game.name}會是——</p>
      <h2 className="text-2xl font-bold mb-2">{provisional.title}</h2>
      <span
        className={`inline-block text-xs px-3 py-1 rounded-full mb-4 ${
          success ? "bg-emerald-700/50 text-emerald-200" : "bg-amber-800/40 text-amber-200"
        }`}
      >
        目前傾向：{lean} · 精通 {game.masteredKPs.length}/{TOTAL_KPS}
      </span>
      <div className="bg-slate-900 rounded-xl p-4 mb-5">
        <HabitBars masteredKPs={game.masteredKPs} />
      </div>
      <p className="text-slate-300 text-sm mb-5 px-2">
        {success
          ? "走得不錯。剩下的週數，要再補強弱項、還是把長處磨亮？由你決定。"
          : "還有機會翻盤。看看上面哪個習慣最弱，接下來幾週補一補，結局會很不一樣。"}
      </p>
      <button
        onClick={onNext}
        className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-lg py-3 font-semibold"
      >
        繼續下半段
      </button>
    </div>
  );
}

function EndingView({ game, onRestart }: { game: GameState; onRestart: () => void }) {
  const ending = useMemo(() => judgeEnding(game.masteredKPs), [game.masteredKPs]);
  const ability = useMemo(() => abilityProfile(game.stats), [game.stats]);
  const values = radarValues(game.masteredKPs);
  const success = ending.type === "success";
  const legendary = ending.id === "A1"; // 傳說級：全 35 知識點精通
  const [shared, setShared] = useState(false);

  function share() {
    const c = habitCounts(game.masteredKPs);
    const text = `我在《習慣養成記》養成了【${ending.title}】（${ending.id}）\n七習慣精通 ${game.masteredKPs.length}/${TOTAL_KPS}　分布 ${c.join("/")}\n${ending.summary}\n\n你會養成哪一種人？ https://habit-tycoon.vercel.app`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2200);
      });
    }
  }

  return (
    <div className="pt-6 pb-12">
      <div
        className={`mb-5 rounded-xl ${
          legendary
            ? "p-1 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_40px_rgba(245,200,80,0.5)]"
            : ""
        }`}
      >
        <Stage bg={`/endings/${ending.id}.png`} />
      </div>
      {legendary && (
        <div className="text-center mb-2">
          <span className="inline-block text-sm font-bold px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-lg">
            🏆 傳說級結局 · 全 35 知識點精通
          </span>
        </div>
      )}
      <div className="text-center mb-2">
        <span
          className={`text-xs px-3 py-1 rounded-full ${
            success
              ? "bg-emerald-700/50 text-emerald-200"
              : "bg-amber-800/40 text-amber-200"
          }`}
        >
          {success ? "成功結局" : "偏差／待成長結局"} · {ending.id} · 能力傾向：
          {ability.label}
        </span>
      </div>
      <h1
        className={`text-3xl font-bold text-center mb-1 ${
          legendary
            ? "bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent"
            : ""
        }`}
      >
        {ending.title}
      </h1>
      <p className="text-center text-slate-400 mb-6">{ending.summary}</p>

      <div className="bg-slate-900 rounded-xl p-4 mb-5">
        <Radar values={values} />
        <p className="text-center text-sm text-slate-400 mt-2 mb-3">
          精通 {game.masteredKPs.length} / {TOTAL_KPS} 個知識點
        </p>
        <HabitBars masteredKPs={game.masteredKPs} />
        <div className="border-t border-slate-800 my-3" />
        <StatBars stats={game.stats} />
      </div>

      <Section title="性格側寫" body={ending.personality} />
      <Section title="職業推測（品格軸）" body={ending.career} />
      <Section
        title={`能力傾向與職業（${ability.label}）`}
        body={ability.career}
        accent="emerald"
      />
      <Section title="人生陷阱警告" body={ending.trap} accent="amber" />
      <Section title="給你的真心話" body={ending.truth} accent="emerald" />

      <button
        onClick={share}
        className="w-full mt-6 border-2 border-indigo-500 text-indigo-300 hover:bg-indigo-500/10 rounded-lg py-3 font-semibold"
      >
        {shared ? "✓ 已複製，貼給朋友比比看" : "📣 分享我的結局"}
      </button>
      <button
        onClick={onRestart}
        className="w-full mt-2 bg-slate-700 hover:bg-slate-600 rounded-lg py-3 font-semibold"
      >
        再養成一次
      </button>
    </div>
  );
}

function Radar({ values }: { values: number[] }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 95;
  const max = 50;
  const angle = (i: number) => (Math.PI * 2 * i) / 7 - Math.PI / 2;
  const point = (i: number, v: number): [number, number] => {
    const rr = (v / max) * r;
    return [cx + rr * Math.cos(angle(i)), cy + rr * Math.sin(angle(i))];
  };
  const grid = (lvl: number) =>
    HABITS.map((_, i) => point(i, max * lvl).join(",")).join(" ");
  const poly = values.map((v, i) => point(i, v).join(",")).join(" ");
  return (
    <svg width={size} height={size} className="mx-auto">
      {[0.25, 0.5, 0.75, 1].map((l) => (
        <polygon key={l} points={grid(l)} fill="none" stroke="#334155" strokeWidth={1} />
      ))}
      {HABITS.map((h, i) => {
        const [x, y] = point(i, max);
        return <line key={h.id} x1={cx} y1={cy} x2={x} y2={y} stroke="#334155" strokeWidth={1} />;
      })}
      <polygon points={poly} fill="rgba(16,185,129,0.35)" stroke="#10b981" strokeWidth={2} />
      {HABITS.map((h, i) => {
        const [x, y] = point(i, max + 9);
        return (
          <text key={h.id} x={x} y={y} fontSize={11} fill="#cbd5e1" textAnchor="middle" dominantBaseline="middle">
            {h.id}
          </text>
        );
      })}
    </svg>
  );
}

function Section({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent?: "amber" | "emerald";
}) {
  const color =
    accent === "amber"
      ? "text-amber-400"
      : accent === "emerald"
      ? "text-emerald-400"
      : "text-slate-200";
  return (
    <div className="mb-4">
      <h3 className={`font-semibold mb-1 ${color}`}>{title}</h3>
      <p className="text-slate-300 text-sm leading-relaxed">{body}</p>
    </div>
  );
}
