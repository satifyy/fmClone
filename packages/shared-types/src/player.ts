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

export type PlayerSquadStatus = "starters" | "bench" | "reserves" | "injured" | "suspended";

export type PlayerValueSnapshot = {
  amount: number;
  currency: "USD";
  trend: "rising" | "steady" | "falling";
  confidence: number;
  modifiers: {
    base: number;
    hype: number; // multiplier
    form: number; // multiplier
    ageCurve: number; // multiplier
  };
};

export type PlayerFormSnapshot = {
  score: number;
  trend: "up" | "steady" | "down";
  summary: string;
  recentRatings: number[];
  sampleSize?: number;
  appearances?: number;
  starts?: number;
  minutes: number;
  goals?: number;
  assists?: number;
  averageRating?: number;
  goalContributions: number;
  cleanSheets: number;
};

export type PlayerContract = {
  expiresOn: string;
  yearsRemaining: number;
  weeklyWage: number;
  squadStatus: "regular starter" | "rotation" | "prospect" | "emergency cover" | "transfer listed";
  releaseClause?: number;
};

export type PlayerRoleFit = {
  score: number;
  tacticalRole: string;
  summary: string;
};

export type PlayerDevelopment = {
  trajectory: "accelerating" | "steady" | "plateauing";
  trend: "up" | "steady" | "down";
  recentGrowth: number;
  ceiling: number;
  summary: string;
};

export type PlayerSeasonStats = {
  appearances: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  averageRating: number;
};

export type PlayerHistoryEntry = {
  season: string;
  clubName: string;
  competition: string;
  appearances: number;
  goals: number;
  assists: number;
  averageRating: number;
  minutes: number;
};

export type PlayerInjuryRecord = {
  type: string;
  status: "fit" | "rehab" | "out";
  occurredOn: string;
  expectedReturn?: string;
  daysOut: number;
  gamesMissed: number;
};

export type PlayerScoutingKnowledge = {
  scope: "full" | "partial" | "limited";
  confidence: number;
  lastUpdated: string;
  summary: string;
  knownStrengths: string[];
  unknowns: string[];
};

export type PlayerInteractionSnapshot = {
  action: "enquire" | "bid" | "talk";
  status: "monitoring" | "considering" | "engaged" | "paused";
  note: string;
  updatedAt: string;
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
  squadStatus: PlayerSquadStatus;
  marketValue: PlayerValueSnapshot;
  recentForm: PlayerFormSnapshot;
  contract: PlayerContract;
  roleFit: PlayerRoleFit;
  development: PlayerDevelopment;
  seasonStats: PlayerSeasonStats;
  history: PlayerHistoryEntry[];
  injuries: PlayerInjuryRecord[];
  scouting: PlayerScoutingKnowledge;
  interaction?: PlayerInteractionSnapshot;
};

export type SquadGroup = {
  status: PlayerSquadStatus;
  label: string;
  description: string;
  players: Player[];
};

export type ClubSquad = {
  clubId: string;
  formation: string;
  players: Player[];
  groups: SquadGroup[];
};

export type SquadStatus = PlayerSquadStatus;
export type SquadPlayer = Player;
export type PlayerRecentForm = PlayerFormSnapshot;

export type PlayerSummary = {
  id: string;
  clubId: string;
  name: string;
  age: number;
  positions: PlayerPosition[];
  role: string;
  squadStatus: PlayerSquadStatus;
  morale: number;
  fatigue: number;
  fitness: number;
  marketValue: PlayerValueSnapshot;
  recentForm: PlayerFormSnapshot;
  seasonStats: PlayerSeasonStats;
};
