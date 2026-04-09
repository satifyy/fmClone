import type { Player, PlayerPosition } from "./player";

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

export type TacticalSlotRoleOption = {
  role: string;
  label: string;
};

export type TacticalBoardSlot = {
  id: string;
  label: string;
  line: "goalkeeper" | "defense" | "midfield" | "attack";
  lane: number;
  position: PlayerPosition;
  allowedPositions: PlayerPosition[];
  role: string;
  roleOptions: TacticalSlotRoleOption[];
  player: Player | null;
  familiarity: number;
  fitScore: number;
};

export type TacticalPlayerFamiliarity = {
  playerId: string;
  slotId: string;
  role: string;
  value: number;
};

export type TacticalBoardSummary = {
  familiarity: number;
  intensity: number;
  projectedFitnessCost: number;
  tacticalStyle: string;
  playerRoleFamiliarity: TacticalPlayerFamiliarity[];
};

export type TacticalValidation = {
  valid: boolean;
  issues: string[];
};

export type TacticalBoardDto = {
  clubId: string;
  formation: string;
  availableFormations: string[];
  instructions: TacticalInstructions;
  starters: TacticalBoardSlot[];
  bench: Player[];
  squad: Player[];
  summary: TacticalBoardSummary;
  validation: TacticalValidation;
};

export type TacticsUpdateRequest = {
  formation: string;
  instructions: TacticalInstructions;
  roles: TacticalRoleAssignment[];
  benchPlayerIds: string[];
};
