import type { PlayerPosition } from "./player";

export type MatchImportance = "friendly" | "league" | "cup" | "playoff";

export type TeamMentality = "very-defensive" | "defensive" | "balanced" | "positive" | "attacking";

export type TacticalInstructions = {
  mentality: TeamMentality;
  pressingIntensity: number;
  tempo: number;
  width: number;
  defensiveLine: number;
  directness: number;
  timeWasting: number;
};

export type TacticalRoleAssignment = {
  slot: string;
  playerId: string;
  position: PlayerPosition;
  role: string;
};

export type TacticalProfile = {
  formation: string;
  instructions: TacticalInstructions;
  roles: TacticalRoleAssignment[];
};

