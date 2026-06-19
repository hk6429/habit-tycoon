import { Question } from "./types";
import h1 from "../data/habit1.json";
import h2 from "../data/habit2.json";
import h3 from "../data/habit3.json";
import h4 from "../data/habit4.json";
import h5 from "../data/habit5.json";
import h6 from "../data/habit6.json";
import h7 from "../data/habit7.json";

export const ALL_QUESTIONS: Question[] = [
  ...(h1 as Question[]),
  ...(h2 as Question[]),
  ...(h3 as Question[]),
  ...(h4 as Question[]),
  ...(h5 as Question[]),
  ...(h6 as Question[]),
  ...(h7 as Question[]),
];

// 取得某知識點的 10 道題
export function questionsForKP(kp: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.kp === kp);
}
