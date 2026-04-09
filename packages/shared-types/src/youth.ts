import type { PlayerPosition } from "./player";

export type YouthPlayerStatus = "academy" | "promoted" | "sold" | "released";

export type YouthPlayer = {
  id: string;
  saveId: string;
  clubId: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  positions: PlayerPosition[];
  /** Overall ability 1–20 (hidden from manager initially, revealed by scouting) */
  ability: number;
  /** Growth potential ceiling 1–20 */
  potential: number;
  /** Personality trait; affects development speed */
  personality: "ambitious" | "laid-back" | "professional" | "maverick";
  weeklyWage: number;
  status: YouthPlayerStatus;
  /** 0–100: how ready they are for first-team football */
  readiness: number;
  joinedOn: string;
};

export type YouthAcademyPayload = {
  clubId: string;
  academyRating: number;       // 1–100
  youthWageBudget: number;     // weekly budget in $
  youthWagesUsed: number;
  players: YouthPlayer[];
};

export type YouthPlayerActionResult = {
  player: YouthPlayer;
  message: string;
  academy: YouthAcademyPayload;
};
