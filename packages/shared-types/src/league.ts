export type FixtureStatus = "scheduled" | "locked" | "simulated";

export type Fixture = {
  id: string;
  saveId: string;
  competition: "league" | "cup" | "friendly" | "playoff";
  matchday: number;
  date: string;
  homeClubId: string;
  awayClubId: string;
  status: FixtureStatus;
};

export type StandingRow = {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type SeasonState = {
  saveId: string;
  seasonId: string;
  year: number;
  currentDate: string;
  phase: "preseason" | "league" | "playoffs" | "offseason";
  currentMatchday: number;
};

