export type PlayerPosition =
  | "GK"
  | "RB"
  | "CB"
  | "LB"
  | "DM"
  | "CM"
  | "AM"
  | "RW"
  | "LW"
  | "ST";

export type PlayerAttributes = {
  pace: number;
  acceleration: number;
  stamina: number;
  strength: number;
  finishing: number;
  passing: number;
  dribbling: number;
  firstTouch: number;
  vision: number;
  tackling: number;
  marking: number;
  positioning: number;
  composure: number;
  decisions: number;
  workRate: number;
  reflexes?: number;
  handling?: number;
  aerialReach?: number;
  oneOnOnes?: number;
  kicking?: number;
};

export type PlayerCondition = {
  morale: number;
  chemistry: number;
  fatigue: number;
  fitness: number;
  injuryRisk: number;
  suspensionRisk: number;
};

export type Player = {
  id: string;
  saveId: string;
  clubId: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  preferredFoot: "left" | "right";
  positions: PlayerPosition[];
  role: string;
  attributes: PlayerAttributes;
  condition: PlayerCondition;
  traits: string[];
  potential: number;
};

export type PlayerSummary = {
  id: string;
  clubId: string;
  name: string;
  age: number;
  positions: PlayerPosition[];
  role: string;
  morale: number;
  fatigue: number;
  fitness: number;
};

