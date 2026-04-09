import type { Fixture } from "./league";
import type { Player, PlayerPosition } from "./player";
import type { MatchImportance, TacticalProfile } from "./tactics";

export type TeamMatchState = {
  clubId: string;
  clubName: string;
  managerStyle: string;
  tactics: TacticalProfile;
  lineup: Player[];
  bench: Player[];
  chemistry: number;
  morale: number;
};

export type FixtureInput = Pick<Fixture, "id" | "competition" | "date" | "homeClubId" | "awayClubId">;

export type MatchContext = {
  fixture: FixtureInput;
  homeTeam: TeamMatchState;
  awayTeam: TeamMatchState;
  environment: {
    homeAdvantage: number;
    weather?: string;
    importance: MatchImportance;
  };
  seed: number;
};

export type MatchEventType =
  | "possession-win"
  | "turnover"
  | "progression"
  | "chance-created"
  | "shot"
  | "shot-on-target"
  | "goal"
  | "foul"
  | "yellow-card"
  | "red-card"
  | "injury"
  | "corner"
  | "free-kick"
  | "offside"
  | "substitution"
  | "tactical-shift";

export type MatchEvent = {
  minute: number;
  team: "home" | "away";
  type: MatchEventType;
  playerId?: string;
  secondaryPlayerId?: string;
  description: string;
  xg?: number;
};

export type MatchStats = {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  xg: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
};

export type PlayerRating = {
  playerId: string;
  clubId: string;
  rating: number;
  impact: "poor" | "average" | "good" | "excellent";
};

export type InjuryEvent = {
  playerId: string;
  clubId: string;
  minute: number;
  severity: "minor" | "moderate" | "major";
  daysOut: number;
};

export type CardEvent = {
  playerId: string;
  clubId: string;
  minute: number;
  card: "yellow" | "red";
};

export type TacticalNote = {
  team: "home" | "away";
  minute: number;
  note: string;
};

export type PlayerDelta = {
  playerId: string;
  moraleDelta: number;
  fatigueDelta: number;
  fitnessDelta: number;
};

export type ClubDelta = {
  clubId: string;
  moraleDelta: number;
};

export type PostMatchEffects = {
  playerDeltas: PlayerDelta[];
  clubDeltas: ClubDelta[];
};

export type MatchSimulationResult = {
  score: { home: number; away: number };
  stats: MatchStats;
  events: MatchEvent[];
  playerRatings: PlayerRating[];
  injuries: InjuryEvent[];
  cards: CardEvent[];
  tacticalNotes: TacticalNote[];
  postMatchEffects: PostMatchEffects;
};

export type MatchEventFeed = {
  mode: "post-match";
  isLive: boolean;
  availableModes: Array<"post-match" | "stepwise" | "live">;
  events: MatchEvent[];
};

export type MatchDetail = {
  id: string;
  fixtureId: string;
  playedAt: string;
  result: MatchSimulationResult;
  eventFeed: MatchEventFeed;
};

export type PositionFit = {
  playerId: string;
  position: PlayerPosition;
  fit: number;
};
