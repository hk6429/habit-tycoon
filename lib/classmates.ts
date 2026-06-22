import { Gender } from "./types";

// 預設「同班同學」：各自走出一種有代表性的結局，給玩家對照與談資（CD5 社會影響與關聯）。
// 刻意涵蓋自律型 / 人際型 / 均衡型 / 待成長型四種路線，讓比較有戲。
export interface Classmate {
  name: string;
  gender: Gender;
  endingId: string;
  blurb: string; // 一句話講他這一年怎麼走的
}

export const CLASSMATES: Classmate[] = [
  {
    name: "林子睿",
    gender: "male",
    endingId: "B1",
    blurb: "把自己練得超強，計畫排得滿滿，就是不太找人合作。",
  },
  {
    name: "陳語安",
    gender: "female",
    endingId: "C1",
    blurb: "人緣超好、誰都能聊，但常忘了先把自己顧好。",
  },
  {
    name: "吳函青",
    gender: "female",
    endingId: "A4",
    blurb: "不特別搶眼，卻三條軸都穩穩顧到，走得從容。",
  },
  {
    name: "黃柏勳",
    gender: "male",
    endingId: "F3",
    blurb: "整天忙得團團轉，卻沒先想清楚什麼才是要事。",
  },
];
