import type { Player, PlayerAttributes } from "./player";

export type ScoutCoverageType = "region" | "league";
export type ScoutAssignmentPriority = "core" | "support" | "opportunistic";
export type ScoutingPipelineStage = "discovered" | "tracked" | "live" | "shortlisted" | "decision";
export type KnowledgeConfidenceBand = "low" | "medium" | "high";
export type TransferInterestLevel = "monitor" | "active" | "priority";
export type TransferDirection = "incoming" | "outgoing";
export type TransferNegotiationStage =
  | "monitoring"
  | "initial-contact"
  | "bid-submitted"
  | "countered"
  | "player-talks"
  | "agreed"
  | "rejected"
  | "collapsed"
  | "completed";
export type TransferNegotiationStatus = "open" | "closed";

export type ScoutProfile = {
  id: string;
  saveId: string;
  clubId: string;
  name: string;
  regionExpertise: string[];
  leagueExpertise: string[];
  judgingAbility: number;
  tacticalKnowledge: number;
  adaptability: number;
  reliability: number;
  efficiency: number;
  overall: number;
};

export type ScoutAssignment = {
  id: string;
  saveId: string;
  clubId: string;
  scoutId: string;
  coverageType: ScoutCoverageType;
  coverageLabel: string;
  priority: ScoutAssignmentPriority;
  capacity: number;
  activeLeads: number;
  progress: number;
  nextReportDue: string;
};

export type PlayerAttributeEstimate = {
  attribute: keyof PlayerAttributes;
  low: number;
  expected: number;
  high: number;
  confidence: number;
  uncertainty: KnowledgeConfidenceBand;
};

export type PlayerKnowledge = {
  id: string;
  saveId: string;
  clubId: string;
  playerId: string;
  scoutIds: string[];
  assignedCoverage: string;
  pipelineStage: ScoutingPipelineStage;
  interest: TransferInterestLevel;
  familiarity: number;
  reportQuality: number;
  fitScore: number;
  estimatedMarketValue: number;
  wageEstimate: number;
  recommendation: string;
  strengths: string[];
  risks: string[];
  unknowns: string[];
  lastUpdated: string;
  attributeEstimates: PlayerAttributeEstimate[];
};

export type ScoutingPlayerCard = {
  player: Pick<Player, "id" | "clubId" | "firstName" | "lastName" | "age" | "positions" | "role" | "nationality" | "potential">;
  knowledge: PlayerKnowledge;
  scoutQualityEffect: {
    averageScoutScore: number;
    expectedAccuracy: number;
    summary: string;
  };
};

export type ScoutingPagePayload = {
  clubId: string;
  scouts: ScoutProfile[];
  assignments: ScoutAssignment[];
  pipeline: {
    discovered: number;
    tracked: number;
    live: number;
    shortlisted: number;
    decision: number;
  };
  players: ScoutingPlayerCard[];
};

export type TransferNegotiationEvent = {
  id: string;
  date: string;
  type: "report" | "contact" | "bid" | "counter" | "decision" | "medical";
  title: string;
  summary: string;
  amount?: number;
};

export type TransferNegotiation = {
  id: string;
  saveId: string;
  clubId: string;
  playerId: string;
  counterpartyClubId: string;
  direction: TransferDirection;
  status: TransferNegotiationStatus;
  stage: TransferNegotiationStage;
  priority: TransferInterestLevel;
  askingPrice: number;
  latestOffer?: number;
  wageDemand?: number;
  probability: number;
  scoutConfidence?: number;
  lastUpdated: string;
  summary: string;
  events: TransferNegotiationEvent[];
};

export type TransferCenterItem = {
  negotiation: TransferNegotiation;
  player: Pick<
    Player,
    "id" | "clubId" | "firstName" | "lastName" | "age" | "positions" | "role" | "potential" | "marketValue"
  >;
  counterpartyClubName: string;
  estimatedValue: number;
};

export type TransferCenterPayload = {
  clubId: string;
  activeNegotiations: TransferCenterItem[];
  incomingTargets: TransferCenterItem[];
  outgoingOffers: TransferCenterItem[];
  completedHistory: TransferCenterItem[];
};
