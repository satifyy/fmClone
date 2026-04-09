export type FixtureStatus = "scheduled" | "locked" | "simulated" | "postponed";
export type FixturePhase = "upcoming" | "completed" | "postponed";
export type LeagueZoneType = "promotion" | "promotion-playoff" | "playoff" | "midtable" | "relegation";
export type LeagueRowMovement = "up" | "down" | "steady";
export type LeagueMarkerTone = "positive" | "warning" | "danger" | "neutral";

export type Fixture = {
  id: string;
  saveId: string;
  seasonId: string;
  competition: "league" | "cup" | "friendly" | "playoff";
  matchday: number;
  date: string;
  homeClubId: string;
  awayClubId: string;
  status: FixtureStatus;
};

export type FixtureScore = {
  home: number;
  away: number;
};

export type FixtureClubSummary = {
  id: string;
  name: string;
  shortName: string;
};

export type FixtureResultSummary = {
  fixtureId: string;
  seasonId: string;
  competition: Fixture["competition"];
  matchday: number;
  date: string;
  status: FixtureStatus;
  phase: FixturePhase;
  homeClub: FixtureClubSummary;
  awayClub: FixtureClubSummary;
  score?: FixtureScore;
  matchId?: string;
  playedAt?: string;
};

export type FixtureHistoryQuery = {
  seasonId?: string;
  competition?: Fixture["competition"];
  status?: FixturePhase | "all";
  page?: number;
  pageSize?: number;
};

export type FixtureHistoryBucket = {
  phase: FixturePhase;
  total: number;
  fixtures: FixtureResultSummary[];
};

export type FixtureHistoryResponse = {
  seasonId: string;
  seasonLabel: string;
  availableCompetitions: Fixture["competition"][];
  appliedFilters: {
    seasonId: string;
    competition?: Fixture["competition"];
    status: FixturePhase | "all";
    page: number;
    pageSize: number;
  };
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  buckets: FixtureHistoryBucket[];
  fixtures: FixtureResultSummary[];
};

export type MatchdayScoreboard = {
  query: FixtureHistoryQuery & {
    date?: string;
    matchday?: number;
  };
  matchday?: number;
  dates: string[];
  totalFixtures: number;
  completedFixtures: number;
  userClubFixtureId?: string;
  fixtures: FixtureResultSummary[];
};

export type StandingRow = {
  clubId: string;
  clubName: string;
  position?: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  xgFor?: number;
  xgAgainst?: number;
  xgDifference?: number;
  form?: Array<"W" | "D" | "L">;
  movement?: LeagueRowMovement;
  zone?: LeagueZoneType;
  contextualMarkers?: Array<{
    label: string;
    tone: LeagueMarkerTone;
  }>;
};

export type LeagueRule = {
  title: string;
  detail: string;
};

export type LeagueZoneDefinition = {
  type: LeagueZoneType;
  label: string;
  start: number;
  end: number;
  description: string;
};

export type LeagueMetadata = {
  id: string;
  name: string;
  country: string;
  season: string;
  tier: number;
  clubCount: number;
  rules: LeagueRule[];
  zones: LeagueZoneDefinition[];
};

export type LeagueDirectoryEntry = {
  id: string;
  name: string;
  country: string;
  tier: number;
};

export type LeagueTableSnapshot = {
  leagueId: string;
  season: string;
  table: StandingRow[];
};

export type LeagueStandingsPayload = {
  league: LeagueMetadata;
  availableLeagues: LeagueDirectoryEntry[];
  availableSeasons: string[];
  selectedSeason: string;
  isHistorical: boolean;
  summary: {
    matchesPlayed: number;
    goals: number;
    xg: number;
    xgPerMatch: number;
  };
  table: StandingRow[];
};

export type SeasonState = {
  saveId: string;
  seasonId: string;
  year: number;
  label: string;
  currentDate: string;
  phase: "preseason" | "league" | "playoffs" | "offseason";
  currentMatchday: number;
};

export type SeasonArchiveSummary = {
  saveId: string;
  seasonId: string;
  year: number;
  label: string;
  current: boolean;
  completed: boolean;
  competitions: Fixture["competition"][];
  totalFixtures: number;
  completedFixtures: number;
};

export type SeasonArchiveDetail = SeasonArchiveSummary & {
  standings: StandingRow[];
};
