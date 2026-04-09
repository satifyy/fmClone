import type { ClubBoardConfidence } from "./club";
import type { StandingRow } from "./league";

export type TrendPoint = {
  label: string;
  points: number;
  xgFor: number;
  xgAgainst: number;
  morale: number;
  fitness: number;
};

export type SeasonComparisonItem = {
  seasonId: string;
  seasonLabel: string;
  position: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  xgFor: number;
  xgAgainst: number;
};

export type SeasonAnalyticsPayload = {
  seasonId: string;
  seasonLabel: string;
  isHistorical: boolean;
  club: {
    clubId: string;
    clubName: string;
    position: number;
    points: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    xgFor: number;
    xgAgainst: number;
    xgDifference: number;
  };
  playerLeaders: {
    topScorer: {
      playerId: string;
      name: string;
      value: number;
    } | null;
    topCreator: {
      playerId: string;
      name: string;
      value: number;
    } | null;
    topAverageRating: {
      playerId: string;
      name: string;
      value: number;
    } | null;
  };
  league: {
    summary: {
      matchesPlayed: number;
      goals: number;
      xg: number;
      xgPerMatch: number;
    };
    topThree: StandingRow[];
  };
  tactics: {
    formation: string;
    familiarity: number;
    intensity: number;
    projectedFitnessCost: number;
    tacticalStyle: string;
  };
  board: ClubBoardConfidence;
  trends: TrendPoint[];
  historicalComparison: SeasonComparisonItem[];
};
