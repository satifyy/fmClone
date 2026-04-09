import type {
  BoardPressure,
  BudgetAdjustmentRule,
  Club,
  ClubDetail,
  ClubFinanceBoardPayload,
  ClubOwnershipProfile,
  ClubSquad,
  ClubDashboard,
  ContractIssue,
  Fixture,
  FixtureHistoryBucket,
  FixtureHistoryQuery,
  FixtureHistoryResponse,
  FixturePhase,
  FixtureResultSummary,
  InboxNotification,
  InboxNotificationActionType,
  InjuryStatus,
  InvestorEvent,
  LeagueDirectoryEntry,
  MatchDetail,
  MatchdayScoreboard,
  MatchContext,
  MatchEvent,
  MatchSimulationResult,
  PendingActionItem,
  PendingActionSummary,
  Player,
  PlayerAttributeEstimate,
  PlayerKnowledge,
  ProgressionAction,
  ProgressionResult,
  ScoutAssignment,
  ScoutProfile,
  ScoutingPagePayload,
  SaveSummary,
  SeasonAnalyticsPayload,
  SaveDashboardPayload,
  ScoutingUpdate,
  LeagueMetadata,
  LeagueStandingsPayload,
  LeagueTableSnapshot,
  LeagueZoneDefinition,
  LeagueZoneType,
  SeasonArchiveDetail,
  SeasonArchiveSummary,
  SeasonState,
  SimulatedMatchSummary,
  StandingRow,
  TacticalBoardDto,
  TacticalBoardSlot,
  TacticalProfile,
  TacticsUpdateRequest,
  TransferCenterItem,
  TransferCenterPayload,
  TransferNegotiation
} from "@fm/shared-types";

import { simulateMatch } from "@fm/simulation";

import { worldPersistence } from "./world-persistence";

const createId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const roundToNearest = (value: number, increment: number): number => Math.round(value / increment) * increment;
const firstNames = [
  "Noah",
  "Mateo",
  "Ilias",
  "Luca",
  "Evan",
  "Jonah",
  "Adrian",
  "Milan",
  "Tariq",
  "Ruben",
  "Sami",
  "Kian",
  "Nico",
  "Dario",
  "Leo",
  "Ari",
  "Omar",
  "Hugo",
  "Felix",
  "Tomas",
  "Gabriel",
  "Rafa",
  "Elian",
  "Micah"
];
const lastNames = [
  "Vale",
  "Cross",
  "Stone",
  "Mercer",
  "Hale",
  "Quinn",
  "Silva",
  "Kerr",
  "Baird",
  "Nolan",
  "Drake",
  "Morrow",
  "Santos",
  "Frost",
  "Pryce",
  "Ramires",
  "Avery",
  "Byrne",
  "Doyle",
  "Serrano",
  "Walsh",
  "Costa",
  "Mendez",
  "Reid"
];

const harborResultEvents: MatchEvent[] = [
  {
    minute: 12,
    team: "home",
    type: "chance-created",
    description: "Harbor find the left half-space and force an early save.",
    xg: 0.16
  },
  {
    minute: 27,
    team: "home",
    type: "goal",
    description: "Stone converts from close range after a low cutback.",
    xg: 0.31
  },
  {
    minute: 58,
    team: "away",
    type: "goal",
    description: "Riverside level from a second-ball scramble.",
    xg: 0.22
  },
  {
    minute: 76,
    team: "home",
    type: "goal",
    description: "Harbor retake the lead through a back-post header.",
    xg: 0.27
  }
];

type MatchRecord = {
  id: string;
  fixtureId: string;
  result: MatchSimulationResult;
  playedAt: string;
};

type TransferOffer = {
  id: string;
  playerId: string;
  fromClubId: string;
  toClubId: string;
  amount: number;
  status: "pending" | "accepted" | "rejected";
};

type TrainingPlan = {
  clubId: string;
  focus: "balanced" | "fitness" | "attacking" | "defending" | "youth";
  intensity: number;
};

type ContractRecord = {
  playerId: string;
  clubId: string;
  monthsRemaining: number;
  weeklyWage: number;
};

type World = {
  saves: SaveSummary[];
  activeSaveId?: string;
  season: SeasonState;
  seasonArchive: SeasonArchiveDetail[];
  historicalFixtures: FixtureResultSummary[];
  clubs: Club[];
  players: Player[];
  fixtures: Fixture[];
  standings: StandingRow[];
  tactics: Record<string, TacticalState>;
  matches: MatchRecord[];
  trainingPlans: Record<string, TrainingPlan>;
  transferOffers: TransferOffer[];
  scouts: ScoutProfile[];
  scoutAssignments: ScoutAssignment[];
  playerKnowledge: PlayerKnowledge[];
  transferNegotiations: TransferNegotiation[];
  analyticsSnapshots: Record<string, SeasonAnalyticsPayload["trends"]>;
  inbox: InboxNotification[];
  contracts: ContractRecord[];
};

type ClubProfileSeed = {
  city: string;
  stadium: {
    name: string;
    capacity: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  history: ClubDetail["history"];
};

const leagueId = "coastal-championship";
const secondaryLeagueId = "frontier-union";

const leagueZones: LeagueZoneDefinition[] = [
  {
    type: "promotion",
    label: "Automatic promotion",
    start: 1,
    end: 1,
    description: "Top club is promoted automatically."
  },
  {
    type: "promotion-playoff",
    label: "Promotion playoff",
    start: 2,
    end: 2,
    description: "Second place enters the promotion playoff."
  },
  {
    type: "relegation",
    label: "Relegation",
    start: 4,
    end: 4,
    description: "Bottom club is relegated."
  }
];

const secondaryLeagueZones: LeagueZoneDefinition[] = [
  {
    type: "promotion-playoff",
    label: "Title playoff",
    start: 1,
    end: 2,
    description: "Top two clubs enter a title playoff round."
  },
  {
    type: "midtable",
    label: "Midtable",
    start: 3,
    end: 3,
    description: "Stable midtable finish."
  },
  {
    type: "relegation",
    label: "Drop zone",
    start: 4,
    end: 4,
    description: "Bottom club is relegated."
  }
];

const leagueDirectory: Record<
  string,
  {
    id: string;
    name: string;
    country: string;
    tier: number;
    rules: LeagueMetadata["rules"];
    zones: LeagueZoneDefinition[];
  }
> = {
  [leagueId]: {
    id: leagueId,
    name: "Coastal Championship",
    country: "United States",
    tier: 2,
    rules: [
      {
        title: "Points",
        detail: "Three points for a win, one for a draw, none for a loss."
      },
      {
        title: "Tiebreakers",
        detail: "Positions are split by points, then goal difference, then goals scored."
      },
      {
        title: "Promotion",
        detail: "1st is promoted automatically and 2nd enters a promotion playoff."
      },
      {
        title: "Relegation",
        detail: "4th is relegated at the end of the season."
      }
    ],
    zones: leagueZones
  },
  [secondaryLeagueId]: {
    id: secondaryLeagueId,
    name: "Frontier Union League",
    country: "United States",
    tier: 3,
    rules: [
      {
        title: "Points",
        detail: "Three points for a win, one for a draw, none for a loss."
      },
      {
        title: "Tiebreakers",
        detail: "Positions are split by points, then goals scored, then head-to-head."
      },
      {
        title: "Playoff",
        detail: "Top two clubs move into an end-of-season playoff final."
      },
      {
        title: "Relegation",
        detail: "Bottom club drops one tier."
      }
    ],
    zones: secondaryLeagueZones
  }
};

const ownershipProfiles: Record<string, ClubOwnershipProfile> = {
  "club-harbor": {
    model: "consortium",
    owners: ["Harbor Sports Group", "North Dock Partners"],
    investmentHorizon: "medium",
    summary: "Ownership supports targeted growth while requiring budget discipline each quarter."
  },
  "club-summit": {
    model: "private-owner",
    owners: ["Summit Holdings"],
    investmentHorizon: "short",
    summary: "Results-led ownership with a short review cycle and strict wage control."
  },
  "club-riverside": {
    model: "supporter-trust",
    owners: ["Riverside Supporters Trust"],
    investmentHorizon: "long",
    summary: "Supporter-led model prioritizing sustainability over rapid spending spikes."
  },
  "club-ironvale": {
    model: "private-owner",
    owners: ["Ironvale Capital"],
    investmentHorizon: "medium",
    summary: "Privately funded ownership willing to invest when promotion probability rises."
  }
};

const investorEventsByClub: Record<string, InvestorEvent[]> = {
  "club-harbor": [
    {
      id: "invest-harbor-1",
      occurredOn: "2026-07-14",
      title: "Infrastructure grant approved",
      summary: "Ownership released an earmarked infrastructure grant for analytics and medical upgrades.",
      impact: "positive",
      cashDelta: 450000
    },
    {
      id: "invest-harbor-2",
      occurredOn: "2026-08-02",
      title: "Quarterly cost review",
      summary: "Board requested tighter wage growth over the next two windows.",
      impact: "neutral"
    }
  ]
};

const clubProfiles: Record<string, ClubProfileSeed> = {
  "club-harbor": {
    city: "Port Aurora",
    stadium: {
      name: "Breakwater Park",
      capacity: 21480
    },
    colors: {
      primary: "#0F3B48",
      secondary: "#E6D6B8",
      accent: "#D56A3F"
    },
    history: [
      { season: "2025/26", finish: "1st", note: "Won the division and stabilized the wage line after a midyear sale." },
      { season: "2024/25", finish: "2nd", note: "Missed automatic promotion by one point but raised the club ceiling." },
      { season: "2023/24", finish: "5th", note: "First season of the current pressing model and a clear jump in output." }
    ]
  },
  "club-summit": {
    city: "Summit City",
    stadium: {
      name: "Crown Terrace",
      capacity: 19850
    },
    colors: {
      primary: "#5A2131",
      secondary: "#F3E9D2",
      accent: "#B8893B"
    },
    history: [
      { season: "2025/26", finish: "3rd", note: "Strong home record kept them in the playoff chase until April." },
      { season: "2024/25", finish: "3rd", note: "Balanced squad profile, but they lacked top-end shot creation." },
      { season: "2023/24", finish: "4th", note: "Shifted toward a more controlled style under the current staff." }
    ]
  },
  "club-riverside": {
    city: "Riverside",
    stadium: {
      name: "Floodlight Ground",
      capacity: 17220
    },
    colors: {
      primary: "#1F5E54",
      secondary: "#F6F1E7",
      accent: "#8DBF7A"
    },
    history: [
      { season: "2025/26", finish: "4th", note: "Stayed up through a compact counter game and set-piece volume." },
      { season: "2024/25", finish: "4th", note: "Defensive workload was too heavy, but late points secured survival." },
      { season: "2023/24", finish: "2nd", note: "A veteran core pushed them briefly into the promotion conversation." }
    ]
  },
  "club-ironvale": {
    city: "Ironvale",
    stadium: {
      name: "Foundry Field",
      capacity: 24890
    },
    colors: {
      primary: "#2B2F3A",
      secondary: "#D9D3C3",
      accent: "#C15B4C"
    },
    history: [
      { season: "2025/26", finish: "2nd", note: "Finished second on points and led the league in territorial control." },
      { season: "2024/25", finish: "1st", note: "Best attack in the division and the most stable defensive record." },
      { season: "2023/24", finish: "3rd", note: "Transitioned into a possession-first structure with a younger back line." }
    ]
  }
};

type SquadStatus = Player["squadStatus"];
type SquadPlayer = Player;
type SquadGroup = ClubSquad["groups"][number];
type PlayerRecentForm = Player["recentForm"];

type TacticalState = TacticalProfile & {
  benchPlayerIds: string[];
  familiarityByPlayerRole: Record<string, number>;
};

type TacticalLine = TacticalBoardSlot["line"];

type FormationSlotTemplate = {
  id: string;
  label: string;
  line: TacticalLine;
  lane: number;
  position: TacticalBoardSlot["position"];
  allowedPositions: TacticalBoardSlot["allowedPositions"];
  roleOptions: TacticalBoardSlot["roleOptions"];
};

const buildAttributes = (boost = 0): Player["attributes"] => ({
  pace: 11 + boost,
  acceleration: 11 + boost,
  stamina: 12 + boost,
  strength: 11 + boost,
  finishing: 11 + boost,
  passing: 12 + boost,
  dribbling: 11 + boost,
  firstTouch: 11 + boost,
  vision: 12 + boost,
  tackling: 11 + boost,
  marking: 11 + boost,
  positioning: 12 + boost,
  composure: 11 + boost,
  decisions: 12 + boost,
  workRate: 12 + boost,
  reflexes: 12 + boost,
  handling: 12 + boost,
  aerialReach: 12 + boost,
  oneOnOnes: 12 + boost,
  kicking: 12 + boost
});

const getPlayerAbilityScore = (player: Pick<Player, "attributes" | "positions">): number => {
  const values = Object.values(player.attributes).filter((value): value is number => typeof value === "number");
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return average * 5 + player.positions.length * 1.4;
};

const createRecentForm = (player: Pick<Player, "attributes" | "condition" | "positions">, squadStatus: SquadStatus): PlayerRecentForm => {
  const ratingBase =
    5.8 +
    getPlayerAbilityScore(player) / 55 +
    player.condition.morale / 120 -
    player.condition.fatigue / 180 +
    player.condition.fitness / 260;
  const minutes =
    squadStatus === "starters" ? 420 : squadStatus === "bench" ? 188 : squadStatus === "reserves" ? 96 : squadStatus === "suspended" ? 0 : 62;
  const attackFactor = (player.attributes.finishing + player.attributes.positioning + player.attributes.dribbling) / 3;
  const defensiveFactor = (player.attributes.tackling + player.attributes.marking + player.attributes.positioning) / 3;
  const recentRatings = Array.from({ length: 5 }, (_, index) => {
    const swing = (index - 2) * 0.08;
    const readinessBump = (player.condition.morale - player.condition.fatigue) / 400;
    return Number(clamp(ratingBase + swing + readinessBump, 5.8, 8.8).toFixed(1));
  });
  const trendDelta = recentRatings[recentRatings.length - 1]! - recentRatings[0]!;

  return {
    score: clamp(Math.round((recentRatings.reduce((sum, rating) => sum + rating, 0) / recentRatings.length) * 10), 56, 88),
    trend: trendDelta > 0.18 ? "up" : trendDelta < -0.18 ? "down" : "steady",
    summary:
      squadStatus === "injured"
        ? "Recent sample is interrupted by an active injury absence."
        : squadStatus === "suspended"
          ? "Match rhythm is paused by current suspension."
          : trendDelta > 0.18
            ? "Recent performance level is climbing."
            : trendDelta < -0.18
              ? "Output has dipped over the latest sample."
              : "Performance has held near expectation.",
    recentRatings,
    minutes,
    goalContributions: clamp(
      Math.round((minutes / 90) * (attackFactor / 24) * (player.positions.includes("ST") ? 1.3 : 0.8)),
      0,
      7
    ),
    cleanSheets: clamp(
      Math.round(
        (minutes / 180) *
          (defensiveFactor / 16) *
          (player.positions.includes("GK") || player.positions.includes("CB") ? 1.25 : 0.5)
      ),
      0,
      5
    )
  };
};

const createSeasonStats = (
  player: Pick<Player, "positions">,
  squadStatus: SquadStatus,
  recentForm: PlayerRecentForm
): Player["seasonStats"] => {
  const appearances =
    squadStatus === "starters" ? 31 : squadStatus === "bench" ? 22 : squadStatus === "reserves" ? 11 : squadStatus === "suspended" ? 9 : 6;
  const starts =
    squadStatus === "starters" ? 29 : squadStatus === "bench" ? 8 : squadStatus === "reserves" ? 4 : squadStatus === "suspended" ? 6 : 3;
  const isForward = player.positions.some((position) => ["ST", "RW", "LW", "AM"].includes(position));
  const isCreative = player.positions.some((position) => ["CM", "AM", "RW", "LW"].includes(position));

  return {
    appearances,
    starts,
    minutes: starts * 81 + Math.max(0, appearances - starts) * 24,
    goals: isForward ? clamp(Math.round(recentForm.goalContributions * 2.1), 0, 18) : clamp(Math.round(recentForm.goalContributions * 0.7), 0, 4),
    assists: isCreative ? clamp(Math.round(recentForm.goalContributions * 1.4), 0, 13) : clamp(Math.round(recentForm.goalContributions * 0.5), 0, 5),
    cleanSheets: recentForm.cleanSheets + (player.positions.includes("GK") || player.positions.includes("CB") ? 7 : 0),
    averageRating: Number((recentForm.recentRatings.reduce((sum, rating) => sum + rating, 0) / recentForm.recentRatings.length).toFixed(2))
  };
};

const calculateMarketValue = (
  player: Pick<Player, "age" | "potential" | "condition" | "attributes" | "positions">,
  club: Club,
  recentForm: PlayerRecentForm,
  seasonStats: Player["seasonStats"]
): Player["marketValue"] => {
  const abilityScore = getPlayerAbilityScore(player);
  const ageFactor =
    player.age <= 22 ? 1.22 : player.age <= 26 ? 1.12 : player.age <= 29 ? 1.02 : player.age <= 32 ? 0.86 : 0.7;
  const growthFactor = 1 + Math.max(0, player.potential - Math.round(abilityScore)) / 100;
  const conditionFactor =
    0.82 +
    player.condition.fitness / 220 +
    player.condition.morale / 320 -
    player.condition.fatigue / 420;
  const clubFactor = 0.78 + club.reputation / 100;
  const formFactor = 0.92 + recentForm.score / 500 + seasonStats.averageRating / 20;
  const rawValue = abilityScore * abilityScore * 2_650 * ageFactor * growthFactor * conditionFactor * clubFactor * formFactor;

  return {
    amount: Math.max(250_000, roundToNearest(rawValue, 25_000)),
    currency: "USD",
    trend: recentForm.trend === "up" ? "rising" : recentForm.trend === "down" ? "falling" : "steady",
    confidence: clamp(Math.round(60 + seasonStats.appearances * 0.8), 55, 92)
  };
};

const createContractSnapshot = (age: number, boost: number, squadStatus: SquadStatus): Player["contract"] => {
  const yearsRemaining = Number((squadStatus === "starters" ? 3.4 : squadStatus === "bench" ? 2.6 : 1.8).toFixed(1));

  return {
    expiresOn: `${2026 + Math.ceil(yearsRemaining)}-06-30`,
    yearsRemaining,
    weeklyWage: 6_500 + boost * 1_450 + (squadStatus === "starters" ? 7_500 : squadStatus === "bench" ? 3_200 : 1_200) + age * 120,
    squadStatus:
      squadStatus === "starters"
        ? "regular starter"
        : squadStatus === "bench"
          ? "rotation"
          : squadStatus === "reserves"
            ? "prospect"
            : "emergency cover",
    releaseClause: age <= 24 || squadStatus === "starters" ? 2_500_000 + boost * 450_000 : undefined
  };
};

const createRoleFit = (role: string, squadStatus: SquadStatus, boost: number): Player["roleFit"] => ({
  score: clamp((squadStatus === "starters" ? 79 : squadStatus === "bench" ? 71 : 64) + boost * 2, 48, 94),
  tacticalRole: role,
  summary:
    squadStatus === "starters"
      ? "Strong fit for the current tactical demands."
      : squadStatus === "bench"
        ? "Functional role fit with some matchup dependence."
        : "Projectable fit, but still better suited to protected minutes."
});

const createDevelopmentSnapshot = (age: number, potential: number, boost: number): Player["development"] => {
  const recentGrowth = Number(Math.max(0.3, ((potential - age) * 0.08 + boost * 0.1)).toFixed(1));
  const trajectory = recentGrowth > 4 ? "accelerating" : recentGrowth > 2.4 ? "steady" : "plateauing";

  return {
    trajectory,
    trend: trajectory === "accelerating" ? "up" : trajectory === "plateauing" ? "down" : "steady",
    recentGrowth,
    ceiling: potential + 3,
    summary:
      trajectory === "accelerating"
        ? "Growth markers are trending upward."
        : trajectory === "plateauing"
          ? "Current trajectory looks flatter and needs intervention."
          : "Development remains steady against expectations."
  };
};

const createHistory = (clubName: string, seasonStats: Player["seasonStats"]): Player["history"] => [
  {
    season: "2025/26",
    clubName,
    competition: "League",
    appearances: Math.max(6, seasonStats.appearances - 4),
    goals: Math.max(0, seasonStats.goals - 2),
    assists: Math.max(0, seasonStats.assists - 1),
    averageRating: Number((seasonStats.averageRating - 0.12).toFixed(2)),
    minutes: Math.max(540, seasonStats.minutes - 360)
  },
  {
    season: "2024/25",
    clubName,
    competition: "League",
    appearances: Math.max(8, seasonStats.appearances - 11),
    goals: Math.max(0, seasonStats.goals - 4),
    assists: Math.max(0, seasonStats.assists - 2),
    averageRating: Number((seasonStats.averageRating - 0.23).toFixed(2)),
    minutes: Math.max(480, seasonStats.minutes - 890)
  }
];

const createInjuries = (squadStatus: SquadStatus): Player["injuries"] =>
  squadStatus === "injured"
    ? [
        {
          type: "Hamstring strain",
          status: "out",
          occurredOn: "2026-08-02",
          expectedReturn: "2026-08-22",
          daysOut: 20,
          gamesMissed: 3
        },
        {
          type: "Ankle knock",
          status: "fit",
          occurredOn: "2026-03-11",
          daysOut: 5,
          gamesMissed: 1
        }
      ]
    : [
        {
          type: "No significant recent injury",
          status: "fit",
          occurredOn: "2026-01-14",
          daysOut: 0,
          gamesMissed: 0
        }
      ];

const createScoutingSnapshot = (userControlled: boolean): Player["scouting"] => ({
  scope: userControlled ? "full" : "partial",
  confidence: userControlled ? 92 : 68,
  lastUpdated: "2026-08-07",
  summary: userControlled
    ? "Internal data includes training, contract, medical, and tactical usage."
    : "External scouting is serviceable but still leaves projection gaps.",
  knownStrengths: ["Decision making", "Role discipline", "Match application"],
  unknowns: userControlled ? [] : ["Press-resistance under elite opposition", "Short-term morale volatility"]
});

const createScoutProfile = (
  saveId: string,
  clubId: string,
  name: string,
  overall: number,
  regions: string[],
  leagues: string[]
): ScoutProfile => ({
  id: createId("scout"),
  saveId,
  clubId,
  name,
  regionExpertise: regions,
  leagueExpertise: leagues,
  judgingAbility: clamp(overall + 4, 55, 95),
  tacticalKnowledge: clamp(overall - 2, 50, 92),
  adaptability: clamp(overall + 1, 50, 94),
  reliability: clamp(overall + 3, 55, 96),
  efficiency: clamp(overall - 1, 48, 90),
  overall
});

const buildAttributeEstimate = (attribute: keyof Player["attributes"], actual: number, scoutQuality: number): PlayerAttributeEstimate => {
  const uncertaintySpread = clamp(Math.round((96 - scoutQuality) / 7), 1, 6);
  const expectedDrift = clamp(Math.round((78 - scoutQuality) / 14), -1, 4);
  const expected = clamp(actual - expectedDrift, 5, 20);
  const low = clamp(expected - uncertaintySpread, 1, 20);
  const high = clamp(expected + uncertaintySpread, 1, 20);
  const confidence = clamp(Math.round(scoutQuality + 6 - uncertaintySpread * 5), 42, 95);

  return {
    attribute,
    low,
    expected,
    high,
    confidence,
    uncertainty: uncertaintySpread <= 2 ? "low" : uncertaintySpread <= 4 ? "medium" : "high"
  };
};

const getScoutEffectSummary = (averageScoutScore: number): string => {
  if (averageScoutScore >= 82) {
    return "Senior coverage keeps the estimate band tight enough for decision-grade planning.";
  }

  if (averageScoutScore >= 72) {
    return "Useful scouting signal, but some ranges still need a live check before committing.";
  }

  return "Coverage is broad rather than sharp. Expect noticeable variance in the weaker estimates.";
};

const createPlayer = (
  saveId: string,
  clubId: string,
  club: Club,
  playerIndex: number,
  role: string,
  positions: Player["positions"],
  boost = 0,
  squadStatus: SquadStatus = "reserves"
): Player => {
  const firstName = firstNames[(playerIndex + boost) % firstNames.length]!;
  const lastName = lastNames[(playerIndex * 2 + boost + club.reputation) % lastNames.length]!;
  const age = 20 + ((playerIndex + boost) % 9);
  const potential = 70 + boost + (squadStatus === "starters" ? 3 : squadStatus === "bench" ? 1 : 0);
  const condition: Player["condition"] = {
    morale: clamp(68 + boost + (squadStatus === "injured" ? -8 : 0), 42, 92),
    chemistry: clamp(64 + boost + (squadStatus === "starters" ? 4 : 0), 50, 92),
    fatigue: clamp(8 + boost + (squadStatus === "starters" ? 4 : squadStatus === "injured" ? 8 : 1), 4, 34),
    fitness: clamp(90 - boost - (squadStatus === "injured" ? 24 : squadStatus === "suspended" ? 5 : 0), 48, 96),
    injuryRisk: clamp(7 + boost + (squadStatus === "injured" ? 14 : 0), 4, 38),
    suspensionRisk: clamp(4 + (squadStatus === "suspended" ? 18 : boost), 2, 26)
  };
  const attributes = buildAttributes(boost);
  const playerCore = {
    age,
    potential,
    attributes,
    condition,
    positions
  };
  const recentForm = createRecentForm(playerCore, squadStatus);
  const seasonStats = createSeasonStats(playerCore, squadStatus, recentForm);

  return {
    id: `${role.toLowerCase().replace(/\s+/g, "-")}-${club.shortName.toLowerCase()}-${playerIndex + 1}`,
  saveId,
  clubId,
    firstName,
    lastName,
    age,
  nationality: "Fictionland",
  preferredFoot: boost % 2 === 0 ? "right" : "left",
  positions,
  role,
    potential,
  traits: boost > 2 ? ["Big Matches"] : ["Workhorse"],
    condition,
    attributes,
    squadStatus,
    marketValue: calculateMarketValue(playerCore, club, recentForm, seasonStats),
    recentForm,
    contract: createContractSnapshot(age, boost, squadStatus),
    roleFit: createRoleFit(role, squadStatus, boost),
    development: createDevelopmentSnapshot(age, potential, boost),
    seasonStats,
    history: createHistory(club.name, seasonStats),
    injuries: createInjuries(squadStatus),
    scouting: createScoutingSnapshot(club.userControlled)
  };
};

const roleOptionsByPosition: Record<TacticalBoardSlot["position"], TacticalBoardSlot["roleOptions"]> = {
  GK: [
    { role: "Goalkeeper", label: "Goalkeeper" },
    { role: "Sweeper Keeper", label: "Sweeper Keeper" }
  ],
  RB: [
    { role: "Fullback", label: "Fullback" },
    { role: "Wingback", label: "Wingback" }
  ],
  CB: [
    { role: "Defender", label: "Central Defender" },
    { role: "Ball Playing Defender", label: "Ball Playing Defender" }
  ],
  LB: [
    { role: "Fullback", label: "Fullback" },
    { role: "Wingback", label: "Wingback" }
  ],
  DM: [
    { role: "Anchor", label: "Anchor" },
    { role: "Deep Lying Playmaker", label: "Deep Lying Playmaker" }
  ],
  CM: [
    { role: "Playmaker", label: "Playmaker" },
    { role: "Mezzala", label: "Mezzala" },
    { role: "Box to Box Midfielder", label: "Box to Box" }
  ],
  AM: [
    { role: "Advanced Playmaker", label: "Advanced Playmaker" },
    { role: "Shadow Striker", label: "Shadow Striker" }
  ],
  RW: [
    { role: "Winger", label: "Winger" },
    { role: "Inside Forward", label: "Inside Forward" }
  ],
  LW: [
    { role: "Winger", label: "Winger" },
    { role: "Inside Forward", label: "Inside Forward" }
  ],
  ST: [
    { role: "Advanced Forward", label: "Advanced Forward" },
    { role: "Target Forward", label: "Target Forward" },
    { role: "Pressing Forward", label: "Pressing Forward" }
  ]
};

const formationTemplates: Record<string, FormationSlotTemplate[]> = {
  "4-3-3": [
    { id: "gk", label: "GK", line: "goalkeeper", lane: 2, position: "GK", allowedPositions: ["GK"], roleOptions: roleOptionsByPosition.GK },
    { id: "rb", label: "RB", line: "defense", lane: 0, position: "RB", allowedPositions: ["RB"], roleOptions: roleOptionsByPosition.RB },
    { id: "rcb", label: "RCB", line: "defense", lane: 1, position: "CB", allowedPositions: ["CB"], roleOptions: roleOptionsByPosition.CB },
    { id: "lcb", label: "LCB", line: "defense", lane: 3, position: "CB", allowedPositions: ["CB"], roleOptions: roleOptionsByPosition.CB },
    { id: "lb", label: "LB", line: "defense", lane: 4, position: "LB", allowedPositions: ["LB"], roleOptions: roleOptionsByPosition.LB },
    { id: "dm", label: "DM", line: "midfield", lane: 2, position: "DM", allowedPositions: ["DM", "CM"], roleOptions: roleOptionsByPosition.DM },
    { id: "rcm", label: "RCM", line: "midfield", lane: 1, position: "CM", allowedPositions: ["CM", "DM"], roleOptions: roleOptionsByPosition.CM },
    { id: "lcm", label: "LCM", line: "midfield", lane: 3, position: "CM", allowedPositions: ["CM", "DM"], roleOptions: roleOptionsByPosition.CM },
    { id: "rw", label: "RW", line: "attack", lane: 0, position: "RW", allowedPositions: ["RW", "LW"], roleOptions: roleOptionsByPosition.RW },
    { id: "lw", label: "LW", line: "attack", lane: 4, position: "LW", allowedPositions: ["LW", "RW"], roleOptions: roleOptionsByPosition.LW },
    { id: "st", label: "ST", line: "attack", lane: 2, position: "ST", allowedPositions: ["ST"], roleOptions: roleOptionsByPosition.ST }
  ],
  "4-2-3-1": [
    { id: "gk", label: "GK", line: "goalkeeper", lane: 2, position: "GK", allowedPositions: ["GK"], roleOptions: roleOptionsByPosition.GK },
    { id: "rb", label: "RB", line: "defense", lane: 0, position: "RB", allowedPositions: ["RB"], roleOptions: roleOptionsByPosition.RB },
    { id: "rcb", label: "RCB", line: "defense", lane: 1, position: "CB", allowedPositions: ["CB"], roleOptions: roleOptionsByPosition.CB },
    { id: "lcb", label: "LCB", line: "defense", lane: 3, position: "CB", allowedPositions: ["CB"], roleOptions: roleOptionsByPosition.CB },
    { id: "lb", label: "LB", line: "defense", lane: 4, position: "LB", allowedPositions: ["LB"], roleOptions: roleOptionsByPosition.LB },
    { id: "rdm", label: "RDM", line: "midfield", lane: 1, position: "DM", allowedPositions: ["DM", "CM"], roleOptions: roleOptionsByPosition.DM },
    { id: "ldm", label: "LDM", line: "midfield", lane: 3, position: "DM", allowedPositions: ["DM", "CM"], roleOptions: roleOptionsByPosition.DM },
    { id: "ram", label: "RAM", line: "attack", lane: 0, position: "RW", allowedPositions: ["RW", "LW"], roleOptions: roleOptionsByPosition.RW },
    { id: "cam", label: "CAM", line: "attack", lane: 2, position: "AM", allowedPositions: ["AM", "CM"], roleOptions: roleOptionsByPosition.AM },
    { id: "lam", label: "LAM", line: "attack", lane: 4, position: "LW", allowedPositions: ["LW", "RW"], roleOptions: roleOptionsByPosition.LW },
    { id: "st", label: "ST", line: "attack", lane: 2, position: "ST", allowedPositions: ["ST"], roleOptions: roleOptionsByPosition.ST }
  ],
  "4-4-2": [
    { id: "gk", label: "GK", line: "goalkeeper", lane: 2, position: "GK", allowedPositions: ["GK"], roleOptions: roleOptionsByPosition.GK },
    { id: "rb", label: "RB", line: "defense", lane: 0, position: "RB", allowedPositions: ["RB"], roleOptions: roleOptionsByPosition.RB },
    { id: "rcb", label: "RCB", line: "defense", lane: 1, position: "CB", allowedPositions: ["CB"], roleOptions: roleOptionsByPosition.CB },
    { id: "lcb", label: "LCB", line: "defense", lane: 3, position: "CB", allowedPositions: ["CB"], roleOptions: roleOptionsByPosition.CB },
    { id: "lb", label: "LB", line: "defense", lane: 4, position: "LB", allowedPositions: ["LB"], roleOptions: roleOptionsByPosition.LB },
    { id: "rm", label: "RM", line: "midfield", lane: 0, position: "RW", allowedPositions: ["RW", "LW"], roleOptions: roleOptionsByPosition.RW },
    { id: "rcm", label: "RCM", line: "midfield", lane: 1, position: "CM", allowedPositions: ["CM", "DM"], roleOptions: roleOptionsByPosition.CM },
    { id: "lcm", label: "LCM", line: "midfield", lane: 3, position: "CM", allowedPositions: ["CM", "DM"], roleOptions: roleOptionsByPosition.CM },
    { id: "lm", label: "LM", line: "midfield", lane: 4, position: "LW", allowedPositions: ["LW", "RW"], roleOptions: roleOptionsByPosition.LW },
    { id: "rst", label: "RST", line: "attack", lane: 1, position: "ST", allowedPositions: ["ST"], roleOptions: roleOptionsByPosition.ST },
    { id: "lst", label: "LST", line: "attack", lane: 3, position: "ST", allowedPositions: ["ST"], roleOptions: roleOptionsByPosition.ST }
  ],
  "3-5-2": [
    { id: "gk", label: "GK", line: "goalkeeper", lane: 2, position: "GK", allowedPositions: ["GK"], roleOptions: roleOptionsByPosition.GK },
    { id: "rcb", label: "RCB", line: "defense", lane: 1, position: "CB", allowedPositions: ["CB"], roleOptions: roleOptionsByPosition.CB },
    { id: "cb", label: "CB", line: "defense", lane: 2, position: "CB", allowedPositions: ["CB"], roleOptions: roleOptionsByPosition.CB },
    { id: "lcb", label: "LCB", line: "defense", lane: 3, position: "CB", allowedPositions: ["CB"], roleOptions: roleOptionsByPosition.CB },
    { id: "rwb", label: "RWB", line: "midfield", lane: 0, position: "RB", allowedPositions: ["RB", "RW"], roleOptions: roleOptionsByPosition.RB },
    { id: "lwb", label: "LWB", line: "midfield", lane: 4, position: "LB", allowedPositions: ["LB", "LW"], roleOptions: roleOptionsByPosition.LB },
    { id: "dm", label: "DM", line: "midfield", lane: 2, position: "DM", allowedPositions: ["DM", "CM"], roleOptions: roleOptionsByPosition.DM },
    { id: "rcm", label: "RCM", line: "midfield", lane: 1, position: "CM", allowedPositions: ["CM", "DM"], roleOptions: roleOptionsByPosition.CM },
    { id: "lcm", label: "LCM", line: "midfield", lane: 3, position: "CM", allowedPositions: ["CM", "DM"], roleOptions: roleOptionsByPosition.CM },
    { id: "rst", label: "RST", line: "attack", lane: 1, position: "ST", allowedPositions: ["ST"], roleOptions: roleOptionsByPosition.ST },
    { id: "lst", label: "LST", line: "attack", lane: 3, position: "ST", allowedPositions: ["ST"], roleOptions: roleOptionsByPosition.ST }
  ]
};

const formationOrder = Object.keys(formationTemplates);
const fallbackFormationTemplate = formationTemplates["4-3-3"]!;
const getFormationTemplate = (formation: string): FormationSlotTemplate[] => formationTemplates[formation] ?? fallbackFormationTemplate;

const defaultInstructions: TacticalProfile["instructions"] = {
  mentality: "balanced",
  pressingIntensity: 55,
  tempo: 55,
  width: 50,
  defensiveLine: 50,
  directness: 50,
  timeWasting: 10
};

const familiarityKey = (playerId: string, slotId: string, role: string): string => `${playerId}:${slotId}:${role}`;

const fitScoreForSlot = (player: Player, slot: FormationSlotTemplate, role: string): number => {
  const primaryMatch = player.positions.includes(slot.position);
  const secondaryMatch = player.positions.some((position) => slot.allowedPositions.includes(position));
  const roleMatch = player.role.toLowerCase() === role.toLowerCase();
  const fitnessModifier = Math.round(player.condition.fitness * 0.12);
  const base = primaryMatch ? 76 : secondaryMatch ? 62 : 42;
  return clamp(base + (roleMatch ? 12 : 0) + fitnessModifier, 25, 99);
};

const intensityForInstructions = (instructions: TacticalProfile["instructions"]): number =>
  clamp(
    Math.round(
      instructions.pressingIntensity * 0.24 +
        instructions.tempo * 0.2 +
        instructions.width * 0.08 +
        instructions.defensiveLine * 0.16 +
        instructions.directness * 0.14 -
        instructions.timeWasting * 0.06 +
        (instructions.mentality === "attacking"
          ? 12
          : instructions.mentality === "positive"
            ? 6
            : instructions.mentality === "defensive"
              ? -6
              : instructions.mentality === "very-defensive"
                ? -12
                : 0)
    ),
    0,
    100
  );

const projectedFitnessCost = (players: Player[], intensity: number): number => {
  const averageStamina = players.reduce((sum, player) => sum + player.attributes.stamina, 0) / Math.max(players.length, 1);
  return clamp(Math.round(intensity / 12 - averageStamina / 10 + 4), 2, 14);
};

const tacticalStyleLabel = (formation: string, instructions: TacticalProfile["instructions"]): string => {
  if (instructions.pressingIntensity > 68 && instructions.tempo > 58) {
    return `${formation} high press`;
  }

  if (instructions.directness > 62) {
    return `${formation} direct transition`;
  }

  if (instructions.timeWasting > 40 || instructions.mentality === "defensive" || instructions.mentality === "very-defensive") {
    return `${formation} containment block`;
  }

  return `${formation} control shape`;
};

const validationIssuesForState = (players: Player[], state: TacticalState): string[] => {
  const issues: string[] = [];
  const starterIds = state.roles.map((role) => role.playerId);
  const benchIds = state.benchPlayerIds;
  const allPlayerIds = new Set(players.map((player) => player.id));
  const starterSet = new Set(starterIds);
  const benchSet = new Set(benchIds);

  if (state.roles.length !== 11) {
    issues.push("Starting XI must contain exactly 11 assigned slots.");
  }

  if (starterSet.size !== starterIds.length) {
    issues.push("Starting XI cannot contain duplicate players.");
  }

  if (benchSet.size !== benchIds.length) {
    issues.push("Bench cannot contain duplicate players.");
  }

  if (benchIds.some((playerId) => starterSet.has(playerId))) {
    issues.push("Bench players must be different from the starting XI.");
  }

  if (benchIds.length === 0) {
    issues.push("Bench must contain at least one substitute.");
  }

  if (starterIds.some((playerId) => !allPlayerIds.has(playerId)) || benchIds.some((playerId) => !allPlayerIds.has(playerId))) {
    issues.push("Lineup contains a player that does not belong to the club squad.");
  }

  if (!state.roles.some((role) => role.position === "GK")) {
    issues.push("Starting XI must include a goalkeeper.");
  }

  if (!benchIds.some((playerId) => players.find((player) => player.id === playerId)?.positions.includes("GK"))) {
    issues.push("Bench should include a reserve goalkeeper.");
  }

  return issues;
};

const normalizeTacticalState = (players: Player[], state: TacticalState): TacticalState => {
  const template = getFormationTemplate(state.formation);
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const used = new Set<string>();
  const roles = template.map((slotTemplate, index) => {
    const incomingRole = state.roles.find((role) => role.slot === slotTemplate.id);
    const assignedPlayer =
      (incomingRole?.playerId && !used.has(incomingRole.playerId) ? playerMap.get(incomingRole.playerId) : undefined) ??
      players.find((player) => !used.has(player.id) && player.positions.some((position) => slotTemplate.allowedPositions.includes(position))) ??
      players.find((player) => !used.has(player.id)) ??
      players[index];

    if (!assignedPlayer) {
      throw new Error(`Unable to assign player to tactical slot ${slotTemplate.id}`);
    }

    used.add(assignedPlayer.id);

    return {
      slot: slotTemplate.id,
      playerId: assignedPlayer.id,
      position: slotTemplate.position,
      role:
        incomingRole?.role ??
        slotTemplate.roleOptions.find((option) => option.role.toLowerCase() === assignedPlayer.role.toLowerCase())?.role ??
        slotTemplate.roleOptions[0]!.role
    };
  });

  const benchPlayerIds = [
    ...state.benchPlayerIds.filter((playerId) => !used.has(playerId) && playerMap.has(playerId)),
    ...players.filter((player) => !used.has(player.id)).map((player) => player.id)
  ].slice(0, Math.max(players.length - roles.length, 0));

  return {
    formation: state.formation in formationTemplates ? state.formation : "4-3-3",
    instructions: state.instructions,
    roles,
    benchPlayerIds,
    familiarityByPlayerRole: state.familiarityByPlayerRole
  };
};

const buildTacticalState = (players: Player[]): TacticalState => {
  const template = formationTemplates["4-3-3"]!;

  return normalizeTacticalState(players, {
    formation: "4-3-3",
    instructions: {
      mentality: "positive",
      pressingIntensity: 66,
      tempo: 60,
      width: 55,
      defensiveLine: 58,
      directness: 46,
      timeWasting: 8
    },
    roles: template.map((slot, index) => {
      const player = players[index]!;
      return {
        slot: slot.id,
        playerId: player.id,
        position: slot.position,
        role: slot.roleOptions.find((option) => option.role.toLowerCase() === player.role.toLowerCase())?.role ?? slot.roleOptions[0]!.role
      };
    }),
    benchPlayerIds: players.slice(11).map((player) => player.id),
    familiarityByPlayerRole: Object.fromEntries(
      template.map((slot, index) => {
        const player = players[index]!;
        const role = slot.roleOptions.find((option) => option.role.toLowerCase() === player.role.toLowerCase())?.role ?? slot.roleOptions[0]!.role;
        return [familiarityKey(player.id, slot.id, role), fitScoreForSlot(player, slot, role) - 4];
      })
    )
  });
};

const toTacticalProfile = (state: TacticalState): TacticalProfile => ({
  formation: state.formation,
  instructions: state.instructions,
  roles: state.roles
});

const defaultTacticalProfile = (_clubId: string, players: Player[]): TacticalProfile => toTacticalProfile(buildTacticalState(players));

const createNotification = (
  saveId: string,
  clubId: string,
  type: InboxNotification["type"],
  priority: InboxNotification["priority"],
  title: string,
  summary: string,
  createdAt: string,
  actionLabel?: string,
  actionHref?: string,
  actionType?: InboxNotificationActionType
): InboxNotification => ({
  id: createId("note"),
  saveId,
  clubId,
  type,
  priority,
  title,
  summary,
  createdAt,
  read: false,
  actionLabel,
  actionHref,
  actionType: actionType ?? (actionHref ? "navigate" : "none")
});

const createInitialWorld = (): World => {
  const saveId = "save-alpha";
  const userClubId = "club-harbor";
  const clubs: Club[] = [
    {
      id: userClubId,
      saveId,
      name: "Harbor Athletic",
      shortName: "HAA",
      reputation: 66,
      finances: { balance: 12_500_000, wageBudget: 230_000, transferBudget: 4_500_000 },
      facilities: 68,
      coaching: 70,
      academy: 64,
      boardExpectation: "Reach playoffs",
      styleIdentity: "pressing",
      userControlled: true
    },
    {
      id: "club-summit",
      saveId,
      name: "Summit City",
      shortName: "SUM",
      reputation: 64,
      finances: { balance: 10_400_000, wageBudget: 215_000, transferBudget: 3_400_000 },
      facilities: 63,
      coaching: 65,
      academy: 60,
      boardExpectation: "Top half",
      styleIdentity: "balanced",
      userControlled: false
    },
    {
      id: "club-riverside",
      saveId,
      name: "Riverside FC",
      shortName: "RIV",
      reputation: 61,
      finances: { balance: 8_000_000, wageBudget: 184_000, transferBudget: 2_100_000 },
      facilities: 58,
      coaching: 61,
      academy: 62,
      boardExpectation: "Avoid bottom two",
      styleIdentity: "counter",
      userControlled: false
    },
    {
      id: "club-ironvale",
      saveId,
      name: "Ironvale United",
      shortName: "IRN",
      reputation: 69,
      finances: { balance: 14_300_000, wageBudget: 260_000, transferBudget: 5_800_000 },
      facilities: 71,
      coaching: 72,
      academy: 67,
      boardExpectation: "Challenge for title",
      styleIdentity: "possession",
      userControlled: false
    }
  ];

  const squadTemplate: Array<[string, string, Player["positions"], number]> = [
    ["keeper-one", "Goalkeeper", ["GK"], 2],
    ["right-back", "Fullback", ["RB"], 1],
    ["center-back-a", "Defender", ["CB"], 1],
    ["center-back-b", "Defender", ["CB"], 0],
    ["left-back", "Fullback", ["LB"], 1],
    ["holding-mid", "Anchor", ["DM"], 2],
    ["midfield-a", "Playmaker", ["CM"], 2],
    ["midfield-b", "Mezzala", ["CM"], 1],
    ["winger-right", "Winger", ["RW"], 2],
    ["winger-left", "Inside Forward", ["LW"], 2],
    ["striker", "Advanced Forward", ["ST"], 3],
    ["bench-keeper", "Goalkeeper", ["GK"], 0],
    ["bench-def", "Defender", ["CB"], 0],
    ["bench-fullback", "Wingback", ["LB", "RB"], 0],
    ["bench-mid", "Midfielder", ["CM"], 0],
    ["bench-anchor", "Ball Winner", ["DM", "CM"], 0],
    ["bench-wing", "Winger", ["LW"], 1],
    ["bench-right-wing", "Winger", ["RW"], 1],
    ["bench-forward", "Pressing Forward", ["ST"], 1],
    ["reserve-center-back", "Stopper", ["CB"], 0],
    ["reserve-left-back", "Fullback", ["LB"], 0],
    ["reserve-midfielder", "Deep Playmaker", ["CM", "DM"], 1],
    ["reserve-attacker", "Shadow Striker", ["AM", "ST"], 1],
    ["reserve-utility", "Utility Midfielder", ["CM", "RB"], 0]
  ];

  const players = clubs.flatMap((club, clubIndex) =>
    squadTemplate.map(([_, role, positions, boost], playerIndex) =>
      createPlayer(
        saveId,
        club.id,
        club,
        playerIndex,
        role,
        positions,
        boost + clubIndex,
        playerIndex < 11 ? "starters" : playerIndex < 18 ? "bench" : "reserves"
      )
    )
  );

  const harborPlayers = players.filter((player) => player.clubId === userClubId);
  const injuredPlayer = harborPlayers[19];
  if (injuredPlayer) {
    injuredPlayer.squadStatus = "injured";
    injuredPlayer.condition.fitness = 63;
    injuredPlayer.condition.fatigue = 28;
    injuredPlayer.condition.injuryRisk = 23;
    injuredPlayer.condition.morale = 61;
    injuredPlayer.injuries = createInjuries("injured");
  }

  const suspendedPlayer = harborPlayers[15];
  if (suspendedPlayer) {
    suspendedPlayer.squadStatus = "suspended";
    suspendedPlayer.condition.suspensionRisk = 26;
    suspendedPlayer.condition.morale = 65;
  }

  const currentSeasonId = "season-2026";
  const fixtures: Fixture[] = [
    {
      id: "fx-1",
      saveId,
      seasonId: currentSeasonId,
      competition: "league",
      matchday: 1,
      date: "2026-08-04",
      homeClubId: "club-harbor",
      awayClubId: "club-riverside",
      status: "simulated"
    },
    {
      id: "fx-2",
      saveId,
      seasonId: currentSeasonId,
      competition: "league",
      matchday: 1,
      date: "2026-08-04",
      homeClubId: "club-summit",
      awayClubId: "club-ironvale",
      status: "simulated"
    },
    {
      id: "fx-3",
      saveId,
      seasonId: currentSeasonId,
      competition: "league",
      matchday: 2,
      date: "2026-08-10",
      homeClubId: "club-harbor",
      awayClubId: "club-summit",
      status: "scheduled"
    },
    {
      id: "fx-4",
      saveId,
      seasonId: currentSeasonId,
      competition: "league",
      matchday: 2,
      date: "2026-08-10",
      homeClubId: "club-riverside",
      awayClubId: "club-ironvale",
      status: "scheduled"
    },
    {
      id: "fx-5",
      saveId,
      seasonId: currentSeasonId,
      competition: "league",
      matchday: 3,
      date: "2026-08-17",
      homeClubId: "club-ironvale",
      awayClubId: "club-harbor",
      status: "locked"
    },
    {
      id: "fx-6",
      saveId,
      seasonId: currentSeasonId,
      competition: "league",
      matchday: 3,
      date: "2026-08-17",
      homeClubId: "club-summit",
      awayClubId: "club-riverside",
      status: "locked"
    },
    {
      id: "fx-7",
      saveId,
      seasonId: currentSeasonId,
      competition: "cup",
      matchday: 1,
      date: "2026-08-21",
      homeClubId: "club-harbor",
      awayClubId: "club-ironvale",
      status: "postponed"
    },
    {
      id: "fx-8",
      saveId,
      seasonId: currentSeasonId,
      competition: "cup",
      matchday: 1,
      date: "2026-08-21",
      homeClubId: "club-summit",
      awayClubId: "club-riverside",
      status: "scheduled"
    }
  ];

  const standings: StandingRow[] = [
    {
      clubId: "club-harbor",
      clubName: "Harbor Athletic",
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
      goalsFor: 2,
      goalsAgainst: 1,
      goalDifference: 1,
      points: 3
    },
    {
      clubId: "club-ironvale",
      clubName: "Ironvale United",
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
      goalsFor: 3,
      goalsAgainst: 1,
      goalDifference: 2,
      points: 3
    },
    {
      clubId: "club-riverside",
      clubName: "Riverside FC",
      played: 1,
      won: 0,
      drawn: 0,
      lost: 1,
      goalsFor: 1,
      goalsAgainst: 2,
      goalDifference: -1,
      points: 0
    },
    {
      clubId: "club-summit",
      clubName: "Summit City",
      played: 1,
      won: 0,
      drawn: 0,
      lost: 1,
      goalsFor: 1,
      goalsAgainst: 3,
      goalDifference: -2,
      points: 0
    }
  ];

  const tactics = Object.fromEntries(
    clubs.map((club) => [
      club.id,
      buildTacticalState(players.filter((player) => player.clubId === club.id))
    ])
  );

  const trainingPlans: Record<string, TrainingPlan> = Object.fromEntries(
    clubs.map((club) => [
      club.id,
      {
        clubId: club.id,
        focus: "balanced" as const,
        intensity: 55
      }
    ])
  );

  const contracts: ContractRecord[] = players.map((player, index) => ({
    playerId: player.id,
    clubId: player.clubId,
    monthsRemaining:
      player.clubId === userClubId
        ? player.role === "Anchor"
          ? 8
          : player.positions.includes("LB")
            ? 11
            : 18 + (index % 8)
        : 12 + (index % 18),
    weeklyWage: player.contract.weeklyWage
  }));

  const scouts: ScoutProfile[] = [
    createScoutProfile(saveId, userClubId, "Elena Ward", 84, ["Northern Europe", "Domestic"], ["Premier Division", "Nordic Elite"]),
    createScoutProfile(saveId, userClubId, "Micah Doyle", 76, ["Iberia", "Western Europe"], ["Coastal League", "Liga Oeste"]),
    createScoutProfile(saveId, userClubId, "Tariq Costa", 69, ["South America"], ["Southern Primera", "Copa Federal"])
  ];

  const scoutAssignments: ScoutAssignment[] = [
    {
      id: createId("assignment"),
      saveId,
      clubId: userClubId,
      scoutId: scouts[0]!.id,
      coverageType: "league",
      coverageLabel: "Premier Division",
      priority: "core",
      capacity: 8,
      activeLeads: 4,
      progress: 74,
      nextReportDue: "2026-08-11"
    },
    {
      id: createId("assignment"),
      saveId,
      clubId: userClubId,
      scoutId: scouts[1]!.id,
      coverageType: "region",
      coverageLabel: "Iberia",
      priority: "support",
      capacity: 6,
      activeLeads: 3,
      progress: 58,
      nextReportDue: "2026-08-13"
    },
    {
      id: createId("assignment"),
      saveId,
      clubId: userClubId,
      scoutId: scouts[2]!.id,
      coverageType: "league",
      coverageLabel: "Southern Primera",
      priority: "opportunistic",
      capacity: 5,
      activeLeads: 2,
      progress: 41,
      nextReportDue: "2026-08-16"
    }
  ];

  const externalTargets = [
    players.find((player) => player.clubId === "club-summit" && player.positions.includes("RW")),
    players.find((player) => player.clubId === "club-ironvale" && player.positions.includes("LB")),
    players.find((player) => player.clubId === "club-riverside" && player.positions.includes("ST")),
    players.find((player) => player.clubId === "club-riverside" && player.positions.includes("CM")),
    players.find((player) => player.clubId === "club-summit" && player.positions.includes("CB"))
  ].filter((player): player is Player => Boolean(player));

  const knowledgeConfigs: Array<{
    player: Player;
    scoutIndexes: number[];
    pipelineStage: PlayerKnowledge["pipelineStage"];
    interest: PlayerKnowledge["interest"];
    assignedCoverage: string;
    fitScore: number;
    recommendation: string;
    strengths: string[];
    risks: string[];
    unknowns: string[];
  }> = [
    {
      player: externalTargets[0]!,
      scoutIndexes: [0],
      pipelineStage: "shortlisted",
      interest: "priority",
      assignedCoverage: "Premier Division",
      fitScore: 86,
      recommendation: "Immediate fit for direct width and transition threat.",
      strengths: ["Explosive carry threat", "Final-third delivery", "Can play either flank"],
      risks: ["Needs wage jump to move now"],
      unknowns: ["Consistency against deep blocks"]
    },
    {
      player: externalTargets[1]!,
      scoutIndexes: [0, 1],
      pipelineStage: "tracked",
      interest: "active",
      assignedCoverage: "Iberia",
      fitScore: 78,
      recommendation: "Reliable floor option if left-side depth becomes urgent.",
      strengths: ["Recovery pace", "Crossing volume", "Durability"],
      risks: ["Acquisition cost is above current internal valuation"],
      unknowns: ["Aerial duel level against stronger forwards"]
    },
    {
      player: externalTargets[2]!,
      scoutIndexes: [2],
      pipelineStage: "decision",
      interest: "priority",
      assignedCoverage: "Southern Primera",
      fitScore: 82,
      recommendation: "Ready for a final call if the current striker market stalls.",
      strengths: ["Penalty-box movement", "Back-post finishing", "Pressing energy"],
      risks: ["Projection is based on lower-confidence coverage"],
      unknowns: ["Link play versus compact mid-blocks", "Temperament in higher-pressure matches"]
    },
    {
      player: externalTargets[3]!,
      scoutIndexes: [1],
      pipelineStage: "live",
      interest: "active",
      assignedCoverage: "Iberia",
      fitScore: 74,
      recommendation: "Worth one more live report before making a budget commitment.",
      strengths: ["Ball retention", "First pass under pressure"],
      risks: ["Ceiling may be closer to steady rotation level"],
      unknowns: ["Match tempo over 90 minutes"]
    },
    {
      player: externalTargets[4]!,
      scoutIndexes: [0],
      pipelineStage: "discovered",
      interest: "monitor",
      assignedCoverage: "Premier Division",
      fitScore: 71,
      recommendation: "Initial discovery only. Keep in the watch list until the next pass lands.",
      strengths: ["Front-foot defending", "Aggressive duel profile"],
      risks: ["Decision quality is still volatile"],
      unknowns: ["Distribution range", "Discipline under sustained pressure"]
    }
  ];

  const playerKnowledge: PlayerKnowledge[] = knowledgeConfigs.map((config) => {
    const assignedScouts = config.scoutIndexes.map((index) => scouts[index]!);
    const averageScoutScore = Math.round(
      assignedScouts.reduce((sum, scout) => sum + scout.overall, 0) / assignedScouts.length
    );
    const attributesToEstimate = (
      ["pace", "passing", "dribbling", "decisions", "positioning", "composure"] as Array<keyof Player["attributes"]>
    ).filter((attribute) => typeof config.player.attributes[attribute] === "number");

    return {
      id: createId("knowledge"),
      saveId,
      clubId: userClubId,
      playerId: config.player.id,
      scoutIds: assignedScouts.map((scout) => scout.id),
      assignedCoverage: config.assignedCoverage,
      pipelineStage: config.pipelineStage,
      interest: config.interest,
      familiarity: clamp(48 + assignedScouts.length * 11 + averageScoutScore / 4, 38, 94),
      reportQuality: clamp(averageScoutScore + assignedScouts.length * 3, 52, 95),
      fitScore: config.fitScore,
      estimatedMarketValue: roundToNearest(config.player.marketValue.amount * (0.92 + averageScoutScore / 500), 25_000),
      wageEstimate: roundToNearest(config.player.contract.weeklyWage * (1.08 + assignedScouts.length * 0.03), 500),
      recommendation: config.recommendation,
      strengths: config.strengths,
      risks: config.risks,
      unknowns: config.unknowns,
      lastUpdated: `2026-08-${String(9 + assignedScouts.length).padStart(2, "0")}T09:00:00.000Z`,
      attributeEstimates: attributesToEstimate.map((attribute) =>
        buildAttributeEstimate(attribute, config.player.attributes[attribute] as number, averageScoutScore)
      )
    };
  });

  const harborOutgoingPlayer = harborPlayers.find((player) => player.positions.includes("DM")) ?? harborPlayers[5]!;
  const completedIncomingPlayer = externalTargets[0]!;
  const completedOutgoingPlayer = harborPlayers.find((player) => player.positions.includes("CB")) ?? harborPlayers[2]!;

  const transferNegotiations: TransferNegotiation[] = [
    {
      id: createId("neg"),
      saveId,
      clubId: userClubId,
      playerId: externalTargets[2]!.id,
      counterpartyClubId: externalTargets[2]!.clubId,
      direction: "incoming",
      status: "open",
      stage: "countered",
      priority: "priority",
      askingPrice: roundToNearest(externalTargets[2]!.marketValue.amount * 1.2, 50_000),
      latestOffer: roundToNearest(externalTargets[2]!.marketValue.amount * 1.08, 50_000),
      wageDemand: roundToNearest(externalTargets[2]!.contract.weeklyWage * 1.18, 500),
      probability: 62,
      scoutConfidence: playerKnowledge.find((item) => item.playerId === externalTargets[2]!.id)?.reportQuality,
      lastUpdated: "2026-08-08T14:20:00.000Z",
      summary: "Riverside are holding out for a higher fixed fee after the first bid triggered talks.",
      events: [
        {
          id: createId("event"),
          date: "2026-08-06T09:10:00.000Z",
          type: "report",
          title: "Final live report landed",
          summary: "Scout recommends moving into negotiation if striker upgrade remains the priority."
        },
        {
          id: createId("event"),
          date: "2026-08-07T12:00:00.000Z",
          type: "bid",
          title: "Opening bid submitted",
          summary: "Harbor opened below the seller valuation to test urgency.",
          amount: roundToNearest(externalTargets[2]!.marketValue.amount * 1.08, 50_000)
        },
        {
          id: createId("event"),
          date: "2026-08-08T14:20:00.000Z",
          type: "counter",
          title: "Counter offer received",
          summary: "Riverside want more guaranteed money before player talks progress.",
          amount: roundToNearest(externalTargets[2]!.marketValue.amount * 1.2, 50_000)
        }
      ]
    },
    {
      id: createId("neg"),
      saveId,
      clubId: userClubId,
      playerId: externalTargets[0]!.id,
      counterpartyClubId: externalTargets[0]!.clubId,
      direction: "incoming",
      status: "open",
      stage: "player-talks",
      priority: "priority",
      askingPrice: roundToNearest(externalTargets[0]!.marketValue.amount * 1.15, 50_000),
      latestOffer: roundToNearest(externalTargets[0]!.marketValue.amount * 1.13, 50_000),
      wageDemand: roundToNearest(externalTargets[0]!.contract.weeklyWage * 1.28, 500),
      probability: 71,
      scoutConfidence: playerKnowledge.find((item) => item.playerId === externalTargets[0]!.id)?.reportQuality,
      lastUpdated: "2026-08-08T11:40:00.000Z",
      summary: "Club-to-club terms are close enough that the deal has shifted toward salary structure.",
      events: [
        {
          id: createId("event"),
          date: "2026-08-05T10:30:00.000Z",
          type: "contact",
          title: "Initial contact made",
          summary: "Agent confirmed the player is open to a defined first-team role."
        },
        {
          id: createId("event"),
          date: "2026-08-08T11:40:00.000Z",
          type: "decision",
          title: "Player talks opened",
          summary: "Focus has shifted to wage demands and appearance bonuses.",
          amount: roundToNearest(externalTargets[0]!.contract.weeklyWage * 1.28, 500)
        }
      ]
    },
    {
      id: createId("neg"),
      saveId,
      clubId: userClubId,
      playerId: harborOutgoingPlayer.id,
      counterpartyClubId: "club-ironvale",
      direction: "outgoing",
      status: "open",
      stage: "bid-submitted",
      priority: "active",
      askingPrice: roundToNearest(harborOutgoingPlayer.marketValue.amount * 1.07, 50_000),
      latestOffer: roundToNearest(harborOutgoingPlayer.marketValue.amount * 0.96, 50_000),
      wageDemand: roundToNearest(harborOutgoingPlayer.contract.weeklyWage * 1.05, 500),
      probability: 54,
      lastUpdated: "2026-08-08T13:05:00.000Z",
      summary: "Ironvale have tabled a first offer, but the structure still undervalues the squad role.",
      events: [
        {
          id: createId("event"),
          date: "2026-08-07T16:10:00.000Z",
          type: "contact",
          title: "Interest declared",
          summary: "Ironvale asked whether Harbor would listen to offers."
        },
        {
          id: createId("event"),
          date: "2026-08-08T13:05:00.000Z",
          type: "bid",
          title: "Offer received",
          summary: "First bid landed below the internal asking level.",
          amount: roundToNearest(harborOutgoingPlayer.marketValue.amount * 0.96, 50_000)
        }
      ]
    },
    {
      id: createId("neg"),
      saveId,
      clubId: userClubId,
      playerId: completedIncomingPlayer.id,
      counterpartyClubId: completedIncomingPlayer.clubId,
      direction: "incoming",
      status: "closed",
      stage: "completed",
      priority: "active",
      askingPrice: roundToNearest(completedIncomingPlayer.marketValue.amount * 1.1, 50_000),
      latestOffer: roundToNearest(completedIncomingPlayer.marketValue.amount * 1.08, 50_000),
      wageDemand: roundToNearest(completedIncomingPlayer.contract.weeklyWage * 1.12, 500),
      probability: 100,
      scoutConfidence: playerKnowledge.find((item) => item.playerId === completedIncomingPlayer.id)?.reportQuality,
      lastUpdated: "2026-07-29T17:45:00.000Z",
      summary: "Terms were agreed, medical completed, and the transfer was finalized before preseason closed.",
      events: [
        {
          id: createId("event"),
          date: "2026-07-28T15:00:00.000Z",
          type: "decision",
          title: "Fee agreed",
          summary: "Both clubs settled on a structure with limited add-ons.",
          amount: roundToNearest(completedIncomingPlayer.marketValue.amount * 1.08, 50_000)
        },
        {
          id: createId("event"),
          date: "2026-07-29T17:45:00.000Z",
          type: "medical",
          title: "Deal completed",
          summary: "Medical and contract signing cleared without issues."
        }
      ]
    },
    {
      id: createId("neg"),
      saveId,
      clubId: userClubId,
      playerId: completedOutgoingPlayer.id,
      counterpartyClubId: "club-summit",
      direction: "outgoing",
      status: "closed",
      stage: "completed",
      priority: "monitor",
      askingPrice: roundToNearest(completedOutgoingPlayer.marketValue.amount, 50_000),
      latestOffer: roundToNearest(completedOutgoingPlayer.marketValue.amount, 50_000),
      wageDemand: roundToNearest(completedOutgoingPlayer.contract.weeklyWage * 1.02, 500),
      probability: 100,
      lastUpdated: "2026-07-19T12:30:00.000Z",
      summary: "Harbor accepted a market-value sale to open budget for a faster center-back profile.",
      events: [
        {
          id: createId("event"),
          date: "2026-07-18T09:00:00.000Z",
          type: "bid",
          title: "Matching offer received",
          summary: "Summit met the internal valuation in a single guaranteed payment.",
          amount: roundToNearest(completedOutgoingPlayer.marketValue.amount, 50_000)
        },
        {
          id: createId("event"),
          date: "2026-07-19T12:30:00.000Z",
          type: "decision",
          title: "Transfer completed",
          summary: "Squad turnover was approved after the replacement shortlist matured."
        }
      ]
    }
  ];

  const inbox: InboxNotification[] = [
    createNotification(
      saveId,
      userClubId,
      "board",
      "high",
      "Board want early points on the board",
      "Harbor are expected to stay in the top two through the opening month. Dropping points to Summit will raise pressure quickly.",
      "2026-08-08T08:00:00.000Z",
      "View season context",
      "/season-summary"
    ),
    createNotification(
      saveId,
      userClubId,
      "scouting",
      "medium",
      "Scouting pass completed on a right-sided winger",
      "Analysts rate Luka Mercer as a realistic upgrade if you want more direct pace before the next window decision.",
      "2026-08-08T09:15:00.000Z",
      "Open scouting",
      "/scouting"
    ),
    createNotification(
      saveId,
      userClubId,
      "medical",
      "medium",
      "Left side workload flagged by sports science",
      "The current training load is leaving the fullback unit exposed. A recovery block before matchday would cut injury risk.",
      "2026-08-08T10:00:00.000Z",
      "Open training",
      "/training"
    ),
    createNotification(
      saveId,
      userClubId,
      "contract",
      "high",
      "Mateo Cross has entered the final year of his deal",
      "The holding midfielder can be approached freely in January unless you open talks soon.",
      "2026-08-08T11:20:00.000Z",
      "Review squad",
      "/squad"
    ),
    createNotification(
      saveId,
      userClubId,
      "fixture",
      "high",
      "Matchday decision required",
      "The current day includes an unsimulated fixture. Simulate now before advancing the calendar.",
      "2026-08-08T12:05:00.000Z",
      "Simulate now",
      "/match-center",
      "simulate-next-fixture"
    )
  ];

  const matches: MatchRecord[] = [
    {
      id: "match-1",
      fixtureId: "fx-1",
      playedAt: "2026-08-04",
      result: {
        score: { home: 2, away: 1 },
        stats: {
          possession: { home: 54, away: 46 },
          shots: { home: 14, away: 9 },
          shotsOnTarget: { home: 6, away: 3 },
          xg: { home: 1.8, away: 0.9 },
          corners: { home: 5, away: 4 },
          fouls: { home: 10, away: 12 }
        },
        events: harborResultEvents,
        playerRatings: [],
        injuries: [],
        cards: [],
        tacticalNotes: [],
        postMatchEffects: {
          playerDeltas: [],
          clubDeltas: []
        }
      }
    },
    {
      id: "match-2",
      fixtureId: "fx-2",
      playedAt: "2026-08-04",
      result: {
        score: { home: 1, away: 3 },
        stats: {
          possession: { home: 51, away: 49 },
          shots: { home: 11, away: 13 },
          shotsOnTarget: { home: 4, away: 6 },
          xg: { home: 1.05, away: 1.92 },
          corners: { home: 6, away: 3 },
          fouls: { home: 13, away: 11 }
        },
        events: [],
        playerRatings: [],
        injuries: [],
        cards: [],
        tacticalNotes: [],
        postMatchEffects: {
          playerDeltas: [],
          clubDeltas: []
        }
      }
    }
  ];

  const seasonArchive: SeasonArchiveDetail[] = [
    {
      saveId,
      seasonId: currentSeasonId,
      year: 2026,
      label: "2026/27",
      current: true,
      completed: false,
      competitions: ["league", "cup"],
      totalFixtures: fixtures.length,
      completedFixtures: fixtures.filter((fixture) => fixture.status === "simulated").length,
      standings
    },
    {
      saveId,
      seasonId: "season-2025",
      year: 2025,
      label: "2025/26",
      current: false,
      completed: true,
      competitions: ["league", "cup"],
      totalFixtures: 10,
      completedFixtures: 10,
      standings: [
        {
          clubId: "club-harbor",
          clubName: "Harbor Athletic",
          played: 6,
          won: 4,
          drawn: 1,
          lost: 1,
          goalsFor: 12,
          goalsAgainst: 7,
          goalDifference: 5,
          points: 13
        },
        {
          clubId: "club-ironvale",
          clubName: "Ironvale United",
          played: 6,
          won: 4,
          drawn: 0,
          lost: 2,
          goalsFor: 11,
          goalsAgainst: 8,
          goalDifference: 3,
          points: 12
        },
        {
          clubId: "club-summit",
          clubName: "Summit City",
          played: 6,
          won: 2,
          drawn: 2,
          lost: 2,
          goalsFor: 9,
          goalsAgainst: 9,
          goalDifference: 0,
          points: 8
        },
        {
          clubId: "club-riverside",
          clubName: "Riverside FC",
          played: 6,
          won: 1,
          drawn: 1,
          lost: 4,
          goalsFor: 6,
          goalsAgainst: 14,
          goalDifference: -8,
          points: 4
        }
      ]
    },
    {
      saveId,
      seasonId: "season-2024",
      year: 2024,
      label: "2024/25",
      current: false,
      completed: true,
      competitions: ["league"],
      totalFixtures: 6,
      completedFixtures: 6,
      standings: [
        {
          clubId: "club-ironvale",
          clubName: "Ironvale United",
          played: 6,
          won: 4,
          drawn: 1,
          lost: 1,
          goalsFor: 10,
          goalsAgainst: 5,
          goalDifference: 5,
          points: 13
        },
        {
          clubId: "club-harbor",
          clubName: "Harbor Athletic",
          played: 6,
          won: 3,
          drawn: 1,
          lost: 2,
          goalsFor: 8,
          goalsAgainst: 7,
          goalDifference: 1,
          points: 10
        },
        {
          clubId: "club-summit",
          clubName: "Summit City",
          played: 6,
          won: 2,
          drawn: 1,
          lost: 3,
          goalsFor: 7,
          goalsAgainst: 8,
          goalDifference: -1,
          points: 7
        },
        {
          clubId: "club-riverside",
          clubName: "Riverside FC",
          played: 6,
          won: 1,
          drawn: 1,
          lost: 4,
          goalsFor: 5,
          goalsAgainst: 10,
          goalDifference: -5,
          points: 4
        }
      ]
    }
  ];

  const historicalFixtures: FixtureResultSummary[] = [
    {
      fixtureId: "season-2025-md1-harbor-riverside",
      seasonId: "season-2025",
      competition: "league",
      matchday: 1,
      date: "2025-08-05",
      status: "simulated",
      phase: "completed",
      homeClub: { id: "club-harbor", name: "Harbor Athletic", shortName: "HAA" },
      awayClub: { id: "club-riverside", name: "Riverside FC", shortName: "RIV" },
      score: { home: 2, away: 0 },
      matchId: "arch-match-1",
      playedAt: "2025-08-05"
    },
    {
      fixtureId: "season-2025-md1-summit-ironvale",
      seasonId: "season-2025",
      competition: "league",
      matchday: 1,
      date: "2025-08-05",
      status: "simulated",
      phase: "completed",
      homeClub: { id: "club-summit", name: "Summit City", shortName: "SUM" },
      awayClub: { id: "club-ironvale", name: "Ironvale United", shortName: "IRN" },
      score: { home: 1, away: 1 },
      matchId: "arch-match-2",
      playedAt: "2025-08-05"
    },
    {
      fixtureId: "season-2025-md2-ironvale-harbor",
      seasonId: "season-2025",
      competition: "league",
      matchday: 2,
      date: "2025-08-12",
      status: "simulated",
      phase: "completed",
      homeClub: { id: "club-ironvale", name: "Ironvale United", shortName: "IRN" },
      awayClub: { id: "club-harbor", name: "Harbor Athletic", shortName: "HAA" },
      score: { home: 0, away: 1 },
      matchId: "arch-match-3",
      playedAt: "2025-08-12"
    },
    {
      fixtureId: "season-2025-md2-riverside-summit",
      seasonId: "season-2025",
      competition: "league",
      matchday: 2,
      date: "2025-08-12",
      status: "simulated",
      phase: "completed",
      homeClub: { id: "club-riverside", name: "Riverside FC", shortName: "RIV" },
      awayClub: { id: "club-summit", name: "Summit City", shortName: "SUM" },
      score: { home: 2, away: 2 },
      matchId: "arch-match-4",
      playedAt: "2025-08-12"
    },
    {
      fixtureId: "season-2025-cup-harbor-ironvale",
      seasonId: "season-2025",
      competition: "cup",
      matchday: 1,
      date: "2025-09-03",
      status: "simulated",
      phase: "completed",
      homeClub: { id: "club-harbor", name: "Harbor Athletic", shortName: "HAA" },
      awayClub: { id: "club-ironvale", name: "Ironvale United", shortName: "IRN" },
      score: { home: 3, away: 1 },
      matchId: "arch-match-5",
      playedAt: "2025-09-03"
    },
    {
      fixtureId: "season-2025-cup-summit-riverside",
      seasonId: "season-2025",
      competition: "cup",
      matchday: 1,
      date: "2025-09-03",
      status: "simulated",
      phase: "completed",
      homeClub: { id: "club-summit", name: "Summit City", shortName: "SUM" },
      awayClub: { id: "club-riverside", name: "Riverside FC", shortName: "RIV" },
      score: { home: 0, away: 1 },
      matchId: "arch-match-6",
      playedAt: "2025-09-03"
    },
    {
      fixtureId: "season-2024-md1-harbor-summit",
      seasonId: "season-2024",
      competition: "league",
      matchday: 1,
      date: "2024-08-06",
      status: "simulated",
      phase: "completed",
      homeClub: { id: "club-harbor", name: "Harbor Athletic", shortName: "HAA" },
      awayClub: { id: "club-summit", name: "Summit City", shortName: "SUM" },
      score: { home: 1, away: 0 },
      matchId: "arch-match-7",
      playedAt: "2024-08-06"
    },
    {
      fixtureId: "season-2024-md1-riverside-ironvale",
      seasonId: "season-2024",
      competition: "league",
      matchday: 1,
      date: "2024-08-06",
      status: "simulated",
      phase: "completed",
      homeClub: { id: "club-riverside", name: "Riverside FC", shortName: "RIV" },
      awayClub: { id: "club-ironvale", name: "Ironvale United", shortName: "IRN" },
      score: { home: 1, away: 2 },
      matchId: "arch-match-8",
      playedAt: "2024-08-06"
    },
    {
      fixtureId: "season-2024-md2-summit-harbor",
      seasonId: "season-2024",
      competition: "league",
      matchday: 2,
      date: "2024-08-13",
      status: "simulated",
      phase: "completed",
      homeClub: { id: "club-summit", name: "Summit City", shortName: "SUM" },
      awayClub: { id: "club-harbor", name: "Harbor Athletic", shortName: "HAA" },
      score: { home: 2, away: 2 },
      matchId: "arch-match-9",
      playedAt: "2024-08-13"
    }
  ];

  const analyticsSnapshots: Record<string, SeasonAnalyticsPayload["trends"]> = {
    [currentSeasonId]: [
      { label: "MD 1", points: 3, xgFor: 1.8, xgAgainst: 0.9, morale: 73, fitness: 84 }
    ],
    "season-2025": [
      { label: "MD 1", points: 3, xgFor: 2.08, xgAgainst: 0.24, morale: 72, fitness: 85 },
      { label: "MD 2", points: 6, xgFor: 1.16, xgAgainst: 0.24, morale: 75, fitness: 83 }
    ],
    "season-2024": [
      { label: "MD 1", points: 3, xgFor: 1.16, xgAgainst: 0.24, morale: 69, fitness: 84 },
      { label: "MD 2", points: 4, xgFor: 2.08, xgAgainst: 2.08, morale: 70, fitness: 82 }
    ]
  };

  return {
    saves: [
      {
        id: saveId,
        name: "Founders Save",
        createdAt: "2026-04-08T12:00:00.000Z",
        active: true,
        clubId: userClubId
      }
    ],
    activeSaveId: saveId,
    season: {
      saveId,
      seasonId: currentSeasonId,
      year: 2026,
      label: "2026/27",
      currentDate: "2026-08-08",
      phase: "league",
      currentMatchday: 2
    },
    seasonArchive,
    historicalFixtures,
    clubs,
    players,
    fixtures,
    standings,
    tactics,
    matches,
    trainingPlans,
    transferOffers: [],
    scouts,
    scoutAssignments,
    playerKnowledge,
    transferNegotiations,
    analyticsSnapshots,
    inbox,
    contracts
  };
};

export class WorldStore {
  private world: World;

  constructor() {
    this.world = createInitialWorld();
    void this.hydrateFromPersistence();
  }

  private async hydrateFromPersistence(): Promise<void> {
    const restored = await worldPersistence.load<World>();
    if (restored) {
      this.world = restored;
      return;
    }

    await worldPersistence.save(this.world);
  }

  private persistWorld(): void {
    void worldPersistence.save(this.world);
  }

  listSaves(): SaveSummary[] {
    return this.world.saves;
  }

  getSave(saveId: string): SaveSummary | undefined {
    return this.world.saves.find((save) => save.id === saveId);
  }

  getActiveSave(): SaveSummary | undefined {
    return this.world.saves.find((save) => save.active);
  }

  createSave(name: string): SaveSummary {
    const save = {
      id: createId("save"),
      name,
      createdAt: new Date().toISOString(),
      active: false,
      clubId: this.world.clubs.find((club) => club.userControlled)?.id ?? this.world.clubs[0]!.id
    };
    this.world.saves.push(save);
    this.persistWorld();
    return save;
  }

  activateSave(saveId: string): SaveSummary | undefined {
    for (const save of this.world.saves) {
      save.active = save.id === saveId;
    }

    this.world.activeSaveId = saveId;
    const activated = this.world.saves.find((save) => save.id === saveId);
    this.persistWorld();
    return activated;
  }

  getSeason(): SeasonState {
    return this.world.season;
  }

  listSeasonArchive(saveId = this.world.activeSaveId): SeasonArchiveSummary[] {
    return this.world.seasonArchive
      .filter((season) => (saveId ? season.saveId === saveId : true))
      .map(({ standings: _standings, ...season }) => season);
  }

  getSeasonArchiveDetail(seasonId: string, saveId = this.world.activeSaveId): SeasonArchiveDetail | undefined {
    return this.world.seasonArchive.find(
      (season) => season.seasonId === seasonId && (saveId ? season.saveId === saveId : true)
    );
  }

  getInbox(saveId: string): InboxNotification[] {
    const club = this.getUserClubForSave(saveId);
    if (!club) {
      return [];
    }

    return this.world.inbox
      .filter((item) => item.saveId === saveId && item.clubId === club.id)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  markInboxNotificationRead(saveId: string, notificationId: string): InboxNotification | undefined {
    const notification = this.world.inbox.find((item) => item.saveId === saveId && item.id === notificationId);
    if (!notification) {
      return undefined;
    }

    notification.read = true;
    this.persistWorld();
    return notification;
  }

  runInboxNotificationAction(
    saveId: string,
    notificationId: string
  ):
    | {
        notification: InboxNotification;
        message: string;
        redirectHref?: string;
        progression?: ProgressionResult;
      }
    | undefined {
    const notification = this.world.inbox.find((item) => item.saveId === saveId && item.id === notificationId);
    if (!notification) {
      return undefined;
    }

    const actionType = notification.actionType ?? (notification.actionHref ? "navigate" : "none");
    if (actionType === "simulate-next-fixture") {
      const progression = this.progressSave(saveId, "simulate-next-fixture");
      if (!progression) {
        return {
          notification,
          message: "No available fixture to simulate from this notification."
        };
      }

      notification.read = true;
      this.persistWorld();
      return {
        notification,
        progression,
        redirectHref: progression.simulatedMatch ? `/matches/${progression.simulatedMatch.matchId}` : "/match-center",
        message: "Fixture simulated from inbox action."
      };
    }

    notification.read = true;
    this.persistWorld();
    return {
      notification,
      redirectHref: notification.actionHref,
      message: actionType === "navigate" ? "Notification routed to its linked surface." : "Notification acknowledged."
    };
  }

  getAdvanceDayBlockReason(saveId: string): string | undefined {
    const club = this.getUserClubForSave(saveId);
    if (!club) {
      return undefined;
    }

    const nextFixture = this.getNextFixtureForClub(club.id);
    if (nextFixture && nextFixture.date <= this.world.season.currentDate) {
      const opponentId = nextFixture.homeClubId === club.id ? nextFixture.awayClubId : nextFixture.homeClubId;
      const opponentName = this.getClub(opponentId)?.name ?? "Unknown opponent";
      return `Cannot advance day while ${opponentName} is scheduled today. Simulate or play the fixture first.`;
    }

    return undefined;
  }

  getPendingActionSummary(saveId: string): PendingActionSummary | undefined {
    const club = this.getUserClubForSave(saveId);
    if (!club) {
      return undefined;
    }

    const items = this.buildPendingActionItems(saveId, club.id);
    return {
      clubId: club.id,
      total: items.length,
      highPriority: items.filter((item) => item.priority === "high").length,
      items
    };
  }

  getSaveDashboard(saveId: string): SaveDashboardPayload | undefined {
    const save = this.getSave(saveId);
    const club = this.getUserClubForSave(saveId);
    if (!save || !club) {
      return undefined;
    }

    const dashboard = this.getClubDashboard(club.id);
    const pendingActions = this.getPendingActionSummary(saveId);
    if (!dashboard || !pendingActions) {
      return undefined;
    }

    return {
      save,
      season: this.world.season,
      dashboard,
      standings: this.getStandings(),
      inbox: this.getInbox(saveId).slice(0, 6),
      pendingActions,
      boardPressure: this.getBoardPressure(saveId),
      scoutingUpdates: this.getScoutingUpdates(saveId),
      injuries: this.getInjuryStatuses(saveId),
      contractIssues: this.getContractIssues(saveId),
      unresolvedTasks: pendingActions.items.slice(0, 6)
    };
  }

  progressSave(saveId: string, action: ProgressionAction): ProgressionResult | undefined {
    const save = this.getSave(saveId);
    const club = this.getUserClubForSave(saveId);
    if (!save || !club) {
      return undefined;
    }

    let simulatedMatch: SimulatedMatchSummary | undefined;

    if (action === "advance-day") {
      const blockReason = this.getAdvanceDayBlockReason(saveId);
      if (blockReason) {
        return undefined;
      }

      this.advanceDay();
      this.recoverClubPlayers(club.id);
    }

    if (action === "simulate-next-fixture") {
      const nextFixture = this.getNextFixtureForClub(club.id);
      if (!nextFixture) {
        return undefined;
      }

      this.world.season.currentDate = nextFixture.date;
      const results = this.world.fixtures
        .filter((fixture) => fixture.status !== "simulated" && fixture.date <= nextFixture.date)
        .map((fixture) => this.simulateFixture(fixture.id))
        .filter((match): match is MatchRecord => Boolean(match));

      const userClubMatch = results.find((match) => match.fixtureId === nextFixture.id);
      if (userClubMatch) {
        simulatedMatch = this.toSimulatedMatchSummary(club.id, userClubMatch);
      }

      this.updateMatchdayAfterCompletion();
      this.recoverClubPlayers(club.id);
    }

    this.refreshInbox(saveId, club.id, action, simulatedMatch);

    const payload = this.getSaveDashboard(saveId);
    if (!payload) {
      return undefined;
    }

    this.persistWorld();

    return {
      ...payload,
      action,
      simulatedMatch
    };
  }

  getStandings(): StandingRow[] {
    return this.enrichStandings(this.world.season.seasonId, this.world.standings);
  }

  getLeagueMetadata(seasonId = this.world.season.seasonId, selectedLeagueId = leagueId): LeagueMetadata {
    const season = this.getSeasonArchiveDetail(seasonId);
    const directoryEntry = leagueDirectory[selectedLeagueId] ?? leagueDirectory[leagueId]!;

    return {
      id: directoryEntry.id,
      name: directoryEntry.name,
      country: directoryEntry.country,
      season: season?.label ?? this.world.season.label,
      tier: directoryEntry.tier,
      clubCount: this.world.clubs.length,
      rules: directoryEntry.rules,
      zones: directoryEntry.zones
    };
  }

  getLeagueStandings(seasonId = this.world.season.seasonId, selectedLeagueId = leagueId): LeagueStandingsPayload {
    const season = this.getSeasonArchiveDetail(seasonId);
    const selectedSeason = season?.label ?? this.world.season.label;
    const baseTable = seasonId === this.world.season.seasonId ? this.world.standings : season?.standings ?? this.world.standings;

    return {
      league: this.getLeagueMetadata(seasonId, selectedLeagueId),
      availableLeagues: Object.values(leagueDirectory).map<LeagueDirectoryEntry>((entry) => ({
        id: entry.id,
        name: entry.name,
        country: entry.country,
        tier: entry.tier
      })),
      availableSeasons: this.listSeasonArchive()
        .sort((left, right) => right.year - left.year)
        .map((entry) => entry.label),
      selectedSeason,
      isHistorical: seasonId !== this.world.season.seasonId,
      summary: this.getLeagueSummary(seasonId, baseTable),
      table: this.enrichStandings(seasonId, baseTable)
    };
  }

  getSeasonAnalytics(saveId: string, seasonId = this.world.season.seasonId): SeasonAnalyticsPayload | undefined {
    const save = this.getSave(saveId);
    const club = this.getUserClubForSave(saveId);
    if (!save || !club) {
      return undefined;
    }

    const standingsPayload = this.getLeagueStandings(seasonId, leagueId);
    const clubRow = standingsPayload.table.find((row) => row.clubId === club.id);
    if (!clubRow) {
      return undefined;
    }

    const squad = this.getClubSquad(club.id);
    const squadPlayers = squad?.players ?? this.getClubPlayers(club.id);
    const topScorer = [...squadPlayers].sort((left, right) => right.seasonStats.goals - left.seasonStats.goals)[0];
    const topCreator = [...squadPlayers].sort((left, right) => right.seasonStats.assists - left.seasonStats.assists)[0];
    const topRating = [...squadPlayers].sort(
      (left, right) => (right.seasonStats.averageRating ?? 0) - (left.seasonStats.averageRating ?? 0)
    )[0];
    const board = this.getBoardConfidence(saveId);
    const boardTactics = this.getTacticsBoard(club.id);

    return {
      seasonId,
      seasonLabel: standingsPayload.selectedSeason,
      isHistorical: standingsPayload.isHistorical,
      club: {
        clubId: club.id,
        clubName: club.name,
        position: clubRow.position ?? 0,
        points: clubRow.points,
        wins: clubRow.won,
        draws: clubRow.drawn,
        losses: clubRow.lost,
        goalsFor: clubRow.goalsFor,
        goalsAgainst: clubRow.goalsAgainst,
        xgFor: clubRow.xgFor ?? 0,
        xgAgainst: clubRow.xgAgainst ?? 0,
        xgDifference: clubRow.xgDifference ?? 0
      },
      playerLeaders: {
        topScorer: topScorer
          ? {
              playerId: topScorer.id,
              name: `${topScorer.firstName} ${topScorer.lastName}`,
              value: topScorer.seasonStats.goals
            }
          : null,
        topCreator: topCreator
          ? {
              playerId: topCreator.id,
              name: `${topCreator.firstName} ${topCreator.lastName}`,
              value: topCreator.seasonStats.assists
            }
          : null,
        topAverageRating: topRating
          ? {
              playerId: topRating.id,
              name: `${topRating.firstName} ${topRating.lastName}`,
              value: topRating.seasonStats.averageRating
            }
          : null
      },
      league: {
        summary: standingsPayload.summary,
        topThree: standingsPayload.table.slice(0, 3)
      },
      tactics: {
        formation: boardTactics?.formation ?? this.getTactics(club.id)?.formation ?? "4-3-3",
        familiarity: boardTactics?.summary.familiarity ?? 0,
        intensity: boardTactics?.summary.intensity ?? 0,
        projectedFitnessCost: boardTactics?.summary.projectedFitnessCost ?? 0,
        tacticalStyle: boardTactics?.summary.tacticalStyle ?? "Balanced"
      },
      board,
      trends: this.buildSeasonTrendPoints(club.id, seasonId),
      historicalComparison: this.buildHistoricalSeasonComparison(club.id)
    };
  }

  getClubFinanceBoard(clubId: string, saveId?: string): ClubFinanceBoardPayload | undefined {
    const club = this.getClub(clubId);
    if (!club) {
      return undefined;
    }

    const linkedSaveId =
      saveId ??
      this.world.saves.find((entry) => entry.clubId === clubId)?.id ??
      this.world.activeSaveId ??
      this.world.saves[0]?.id;
    const boardConfidence = linkedSaveId ? this.getBoardConfidence(linkedSaveId) : this.getBoardConfidence(this.world.saves[0]!.id);
    const adjustmentRules = this.getBudgetAdjustmentRules(club);

    return {
      clubId,
      finances: club.finances,
      boardConfidence,
      ownership: ownershipProfiles[clubId] ?? {
        model: "private-owner",
        owners: ["Local Ownership Group"],
        investmentHorizon: "medium",
        summary: "Ownership profile has not yet been fully modeled for this club."
      },
      adjustmentRules,
      investorEvents: investorEventsByClub[clubId] ?? [],
      longTermPlan: {
        horizonYears: 3,
        objectives: [
          "Keep wage growth aligned with projected league revenue.",
          "Protect a positive transfer net position over rolling two windows.",
          "Reserve cash buffer for injury cover and contract renewals."
        ],
        risks: [
          "Missing promotion targets can reduce projected cash inflow.",
          "Multiple high-wage renewals in one window can compress flexibility."
        ]
      }
    };
  }

  updateClubBudgetAllocation(
    clubId: string,
    payload: {
      transferBudget: number;
      wageBudget: number;
    },
    saveId?: string
  ): ClubFinanceBoardPayload | undefined {
    const club = this.getClub(clubId);
    if (!club) {
      return undefined;
    }

    const rules = this.getBudgetAdjustmentRules(club);
    const inRange = rules.some(
      (rule) =>
        payload.transferBudget >= rule.minTransferBudget &&
        payload.transferBudget <= rule.maxTransferBudget &&
        payload.wageBudget >= rule.minWageBudget &&
        payload.wageBudget <= rule.maxWageBudget
    );

    if (!inRange) {
      return undefined;
    }

    club.finances.transferBudget = Math.round(payload.transferBudget);
    club.finances.wageBudget = Math.round(payload.wageBudget);
    this.persistWorld();
    return this.getClubFinanceBoard(clubId, saveId);
  }

  getClub(clubId: string): Club | undefined {
    return this.world.clubs.find((club) => club.id === clubId);
  }

  getClubDetail(clubId: string): ClubDetail | undefined {
    const club = this.getClub(clubId);
    const profile = clubProfiles[clubId];
    if (!club || !profile) {
      return undefined;
    }

    const squad = this.getClubSquad(clubId);
    const players = squad?.players ?? this.getClubPlayers(clubId);
    const internationals = new Set(players.map((player) => player.nationality)).size;
    const topScorer = [...players].sort((left, right) => right.seasonStats.goals - left.seasonStats.goals)[0];
    const topCreator = [...players].sort((left, right) => right.seasonStats.assists - left.seasonStats.assists)[0];

    return {
      club,
      leagueId,
      city: profile.city,
      stadium: profile.stadium,
      colors: profile.colors,
      financialStatus: this.getFinancialStatus(club),
      history: profile.history,
      squadOverview: {
        squadSize: players.length,
        averageAge: Number((players.reduce((sum, player) => sum + player.age, 0) / Math.max(players.length, 1)).toFixed(1)),
        internationals,
        topScorer: topScorer
          ? {
              playerId: topScorer.id,
              name: `${topScorer.firstName} ${topScorer.lastName}`,
              goals: topScorer.seasonStats.goals
            }
          : null,
        topCreator: topCreator
          ? {
              playerId: topCreator.id,
              name: `${topCreator.firstName} ${topCreator.lastName}`,
              assists: topCreator.seasonStats.assists
            }
          : null
      },
      recentResults: this.getClubRecentResults(clubId)
    };
  }

  listClubs(): Club[] {
    return this.world.clubs;
  }

  getClubPlayers(clubId: string): Player[] {
    return this.world.players.filter((player) => player.clubId === clubId);
  }

  getClubSquad(clubId: string): ClubSquad | undefined {
    const club = this.getClub(clubId);
    if (!club) {
      return undefined;
    }

    const players = this.getClubPlayers(clubId);
    const tacticState = this.world.tactics[clubId] ?? buildTacticalState(players);
    const tactics = toTacticalProfile(tacticState);
    const lineupIds = new Set(tactics.roles.slice(0, 11).map((role) => role.playerId));
    const benchIds = new Set(tacticState.benchPlayerIds);

    const squadPlayers = players
      .map((player) => this.toSquadPlayer(player, club, lineupIds, benchIds))
      .sort((left, right) => this.compareSquadPlayers(left, right));

    const groups: SquadGroup[] = [
      {
        status: "starters",
        label: "Starters",
        description: `${tactics.formation} selection for the next match block.`,
        players: squadPlayers.filter((player) => player.squadStatus === "starters")
      },
      {
        status: "bench",
        label: "Bench",
        description: "Immediate cover and primary rotation options.",
        players: squadPlayers.filter((player) => player.squadStatus === "bench")
      },
      {
        status: "reserves",
        label: "Reserves",
        description: "Depth players outside the current matchday group.",
        players: squadPlayers.filter((player) => player.squadStatus === "reserves")
      },
      {
        status: "injured",
        label: "Injured",
        description: "Unavailable through fitness or injury risk concerns.",
        players: squadPlayers.filter((player) => player.squadStatus === "injured")
      },
      {
        status: "suspended",
        label: "Suspended",
        description: "Unavailable through disciplinary risk or suspension.",
        players: squadPlayers.filter((player) => player.squadStatus === "suspended")
      }
    ];

    return {
      clubId,
      formation: tactics.formation,
      players: squadPlayers,
      groups
    };
  }

  getPlayer(playerId: string): Player | undefined {
    return this.world.players.find((player) => player.id === playerId);
  }

  getPlayerProfile(playerId: string): SquadPlayer | undefined {
    const player = this.getPlayer(playerId);
    if (!player) {
      return undefined;
    }

    return this.getClubSquad(player.clubId)?.players.find((entry) => entry.id === playerId);
  }

  getPlayerRecentForm(playerId: string): PlayerRecentForm | undefined {
    return this.getPlayerProfile(playerId)?.recentForm;
  }

  getClubDashboard(clubId: string): ClubDashboard | undefined {
    const club = this.getClub(clubId);
    if (!club) {
      return undefined;
    }

    const players = this.getClubPlayers(clubId);
    const nextFixture = this.world.fixtures
      .filter((fixture) => fixture.status !== "simulated")
      .find((fixture) => fixture.homeClubId === clubId || fixture.awayClubId === clubId);

    const recentResults = this.world.matches
      .filter((match) => {
        const fixture = this.world.fixtures.find((item) => item.id === match.fixtureId);
        return fixture?.homeClubId === clubId || fixture?.awayClubId === clubId;
      })
      .slice(-5)
      .map((match) => {
        const fixture = this.world.fixtures.find((item) => item.id === match.fixtureId);
        if (!fixture) {
          return "D" as const;
        }

        const goalDiff =
          fixture.homeClubId === clubId
            ? match.result.score.home - match.result.score.away
            : match.result.score.away - match.result.score.home;

        return goalDiff > 0 ? "W" : goalDiff < 0 ? "L" : "D";
      });

    return {
      club,
      nextFixture: nextFixture
        ? {
            fixtureId: nextFixture.id,
            opponentName:
              this.getClub(nextFixture.homeClubId === clubId ? nextFixture.awayClubId : nextFixture.homeClubId)?.name ?? "Unknown",
            home: nextFixture.homeClubId === clubId,
            competition: nextFixture.competition,
            date: nextFixture.date
          }
        : undefined,
      form: recentResults.length > 0 ? recentResults : ["W", "D", "L"],
      morale: Math.round(players.reduce((sum, player) => sum + player.condition.morale, 0) / players.length),
      fitness: Math.round(players.reduce((sum, player) => sum + player.condition.fitness, 0) / players.length),
      injuryCount: players.filter((player) => player.condition.injuryRisk > 16).length,
      transferBudget: club.finances.transferBudget,
      wageBudget: club.finances.wageBudget
    };
  }

  getTactics(clubId: string): TacticalProfile | undefined {
    const tactics = this.world.tactics[clubId];
    return tactics ? toTacticalProfile(tactics) : undefined;
  }

  getTacticsBoard(clubId: string): TacticalBoardDto | undefined {
    const club = this.getClub(clubId);
    if (!club) {
      return undefined;
    }

    const players = this.getClubPlayers(clubId);
    const state = this.world.tactics[clubId] ?? buildTacticalState(players);
    this.world.tactics[clubId] = state;
    return this.buildTacticsBoard(clubId, players, state);
  }

  previewTactics(clubId: string, profile: TacticsUpdateRequest): TacticalBoardDto | undefined {
    const club = this.getClub(clubId);
    if (!club) {
      return undefined;
    }

    const players = this.getClubPlayers(clubId);
    const previous = this.world.tactics[clubId] ?? buildTacticalState(players);
    const normalized = normalizeTacticalState(players, {
      ...profile,
      familiarityByPlayerRole: previous.familiarityByPlayerRole
    });
    return this.buildTacticsBoard(clubId, players, normalized);
  }

  updateTactics(clubId: string, profile: TacticsUpdateRequest): TacticalBoardDto {
    const players = this.getClubPlayers(clubId);
    const previous = this.world.tactics[clubId] ?? buildTacticalState(players);
    const normalized = normalizeTacticalState(players, {
      ...profile,
      familiarityByPlayerRole: { ...previous.familiarityByPlayerRole }
    });

    for (const role of normalized.roles) {
      const key = familiarityKey(role.playerId, role.slot, role.role);
      const currentValue = normalized.familiarityByPlayerRole[key] ?? 42;
      normalized.familiarityByPlayerRole[key] = clamp(currentValue + 4, 0, 100);
    }

    for (const key of Object.keys(normalized.familiarityByPlayerRole)) {
      if (!normalized.roles.some((role) => familiarityKey(role.playerId, role.slot, role.role) === key)) {
        normalized.familiarityByPlayerRole[key] = clamp(normalized.familiarityByPlayerRole[key]! - 1, 0, 100);
      }
    }

    this.world.tactics[clubId] = normalized;
    this.persistWorld();
    return this.buildTacticsBoard(clubId, players, normalized);
  }

  private buildTacticsBoard(clubId: string, players: Player[], state: TacticalState): TacticalBoardDto {
    const template = getFormationTemplate(state.formation);
    const playerMap = new Map(players.map((player) => [player.id, player]));
    const starters = template.map((slotTemplate) => {
      const assignment = state.roles.find((role) => role.slot === slotTemplate.id);
      const player = assignment ? playerMap.get(assignment.playerId) ?? null : null;
      const role = assignment?.role ?? slotTemplate.roleOptions[0]!.role;
      const fitScore = player ? fitScoreForSlot(player, slotTemplate, role) : 0;
      const familiarity = player
        ? state.familiarityByPlayerRole[familiarityKey(player.id, slotTemplate.id, role)] ?? clamp(fitScore - 18, 18, 82)
        : 0;

      return {
        id: slotTemplate.id,
        label: slotTemplate.label,
        line: slotTemplate.line,
        lane: slotTemplate.lane,
        position: slotTemplate.position,
        allowedPositions: slotTemplate.allowedPositions,
        role,
        roleOptions: slotTemplate.roleOptions,
        player,
        familiarity,
        fitScore
      };
    });

    const starterPlayers = starters.flatMap((slot) => (slot.player ? [slot.player] : []));
    const intensity = intensityForInstructions(state.instructions);

    return {
      clubId,
      formation: state.formation,
      availableFormations: formationOrder,
      instructions: state.instructions,
      starters,
      bench: state.benchPlayerIds.map((playerId) => playerMap.get(playerId)).filter((player): player is Player => Boolean(player)),
      squad: players,
      summary: {
        familiarity: starters.length > 0 ? Math.round(starters.reduce((sum, slot) => sum + slot.familiarity, 0) / starters.length) : 0,
        intensity,
        projectedFitnessCost: projectedFitnessCost(starterPlayers, intensity),
        tacticalStyle: tacticalStyleLabel(state.formation, state.instructions),
        playerRoleFamiliarity: starters
          .filter((slot) => slot.player)
          .map((slot) => ({
            playerId: slot.player!.id,
            slotId: slot.id,
            role: slot.role,
            value: slot.familiarity
          }))
      },
      validation: {
        valid: validationIssuesForState(players, state).length === 0,
        issues: validationIssuesForState(players, state)
      }
    };
  }

  getTrainingPlan(clubId: string): TrainingPlan | undefined {
    return this.world.trainingPlans[clubId];
  }

  updateTrainingPlan(clubId: string, focus: TrainingPlan["focus"], intensity: number): TrainingPlan {
    const plan = { clubId, focus, intensity };
    this.world.trainingPlans[clubId] = plan;
    this.persistWorld();
    return plan;
  }

  getUpcomingFixtures(): Fixture[] {
    return this.world.fixtures.filter((fixture) => this.getFixturePhase(fixture.status) === "upcoming");
  }

  getFixtures(query: FixtureHistoryQuery & { date?: string; matchday?: number } = {}): FixtureResultSummary[] {
    return this.filterFixtures(query).map((fixture) => this.toFixtureResultSummary(fixture));
  }

  getFixtureHistory(query: FixtureHistoryQuery = {}): FixtureHistoryResponse {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const seasonId = query.seasonId ?? this.world.season.seasonId;
    const season = this.getSeasonArchiveDetail(seasonId);
    const seasonLabel = season?.label ?? this.world.season.label;
    const filteredFixtures = this.filterHistoryFixtures({
      seasonId,
      competition: query.competition,
      status: query.status ?? "all",
      page,
      pageSize
    });
    const total = filteredFixtures.length;
    const start = (page - 1) * pageSize;
    const fixtures = filteredFixtures.slice(start, start + pageSize);
    const buckets: FixtureHistoryBucket[] = (["upcoming", "completed", "postponed"] as FixturePhase[]).map((phase) => ({
      phase,
      total: filteredFixtures.filter((fixture) => fixture.phase === phase).length,
      fixtures: fixtures.filter((fixture) => fixture.phase === phase)
    }));
    const availableCompetitions =
      season?.competitions ?? (Array.from(new Set(filteredFixtures.map((fixture) => fixture.competition))).sort() as Fixture["competition"][]);

    return {
      seasonId,
      seasonLabel,
      availableCompetitions,
      appliedFilters: {
        seasonId,
        competition: query.competition,
        status: query.status ?? "all",
        page,
        pageSize
      },
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      buckets,
      fixtures
    };
  }

  getMatchdayScoreboard(query: FixtureHistoryQuery & { date?: string; matchday?: number } = {}): MatchdayScoreboard {
    const resolvedQuery: FixtureHistoryQuery & { date?: string; matchday?: number } =
      query.date || typeof query.matchday === "number"
        ? query
        : { ...query, matchday: this.world.season.currentMatchday, seasonId: query.seasonId ?? this.world.season.seasonId };
    const fixtures = this.getFixtures(resolvedQuery);
    const dates = Array.from(new Set(fixtures.map((fixture) => fixture.date))).sort();
    const userClubId = this.getActiveSave()?.clubId;
    const userClubFixtureId = userClubId
      ? fixtures.find((fixture) => fixture.homeClub.id === userClubId || fixture.awayClub.id === userClubId)?.fixtureId
      : undefined;

    return {
      query: resolvedQuery,
      matchday: fixtures[0]?.matchday,
      dates,
      totalFixtures: fixtures.length,
      completedFixtures: fixtures.filter((fixture) => fixture.phase === "completed").length,
      userClubFixtureId,
      fixtures
    };
  }

  getMatch(matchId: string): MatchDetail | undefined {
    const match = this.world.matches.find((entry) => entry.id === matchId);
    if (!match) {
      return undefined;
    }

    return {
      id: match.id,
      fixtureId: match.fixtureId,
      playedAt: match.playedAt,
      result: match.result,
      eventFeed: {
        mode: "post-match",
        isLive: false,
        availableModes: ["post-match", "stepwise", "live"],
        events: this.buildRicherEventFeed(match, match.result.events)
      }
    };
  }

  getFixture(fixtureId: string): Fixture | undefined {
    return this.world.fixtures.find((fixture) => fixture.id === fixtureId);
  }

  simulateFixture(fixtureId: string): MatchRecord | undefined {
    const fixture = this.getFixture(fixtureId);
    if (!fixture || fixture.status === "simulated") {
      return undefined;
    }

    const homeClub = this.getClub(fixture.homeClubId);
    const awayClub = this.getClub(fixture.awayClubId);
    if (!homeClub || !awayClub) {
      return undefined;
    }

    const homePlayers = this.getClubPlayers(homeClub.id);
    const awayPlayers = this.getClubPlayers(awayClub.id);
    const context: MatchContext = {
      fixture: {
        id: fixture.id,
        competition: fixture.competition,
        date: fixture.date,
        homeClubId: fixture.homeClubId,
        awayClubId: fixture.awayClubId
      },
      homeTeam: {
        clubId: homeClub.id,
        clubName: homeClub.name,
        managerStyle: homeClub.styleIdentity,
        chemistry: Math.round(homePlayers.reduce((sum, player) => sum + player.condition.chemistry, 0) / 11),
        morale: Math.round(homePlayers.reduce((sum, player) => sum + player.condition.morale, 0) / 11),
        lineup: homePlayers.slice(0, 11),
        bench: homePlayers.slice(11),
        tactics: this.getTactics(homeClub.id) ?? defaultTacticalProfile(homeClub.id, homePlayers)
      },
      awayTeam: {
        clubId: awayClub.id,
        clubName: awayClub.name,
        managerStyle: awayClub.styleIdentity,
        chemistry: Math.round(awayPlayers.reduce((sum, player) => sum + player.condition.chemistry, 0) / 11),
        morale: Math.round(awayPlayers.reduce((sum, player) => sum + player.condition.morale, 0) / 11),
        lineup: awayPlayers.slice(0, 11),
        bench: awayPlayers.slice(11),
        tactics: this.getTactics(awayClub.id) ?? defaultTacticalProfile(awayClub.id, awayPlayers)
      },
      environment: {
        homeAdvantage: 6,
        importance: fixture.competition
      },
      seed: fixture.matchday * 101 + this.world.matches.length * 17 + 42
    };

    const result = simulateMatch(context);
    fixture.status = "simulated";
    const record: MatchRecord = {
      id: createId("match"),
      fixtureId,
      result,
      playedAt: this.world.season.currentDate
    };
    this.world.matches.push(record);
    this.applyMatchEffects(fixture, result);
    delete this.world.analyticsSnapshots[fixture.seasonId];
    this.persistWorld();
    return record;
  }

  private buildRicherEventFeed(match: MatchRecord, baseEvents: MatchEvent[]): MatchEvent[] {
    const events = [...baseEvents];
    const hasEarlyPhase = events.some((event) => event.minute <= 5);
    if (!hasEarlyPhase) {
      events.unshift({
        minute: 1,
        team: "home",
        type: "progression",
        description: "Kickoff phase settled with both sides probing for shape control."
      });
    }

    const xgDelta = match.result.stats.xg.home - match.result.stats.xg.away;
    events.push({
      minute: 45,
      team: xgDelta >= 0 ? "home" : "away",
      type: "tactical-shift",
      description:
        xgDelta >= 0
          ? "Halftime adjustment: hosts increased width to protect territorial control."
          : "Halftime adjustment: visitors lowered the line and attacked central transitions."
    });

    const shotPressureDelta = match.result.stats.shots.home - match.result.stats.shots.away;
    events.push({
      minute: 63,
      team: shotPressureDelta >= 0 ? "away" : "home",
      type: "substitution",
      description:
        shotPressureDelta >= 0
          ? "Defensive substitution introduced to absorb sustained pressure."
          : "Attacking substitution introduced to chase higher shot volume."
    });

    events.push({
      minute: 90,
      team: "home",
      type: "progression",
      description: `Full time: ${match.result.score.home}-${match.result.score.away} with xG ${match.result.stats.xg.home.toFixed(2)}-${match.result.stats.xg.away.toFixed(2)}.`
    });

    return events.sort((left, right) => left.minute - right.minute);
  }

  private applyMatchEffects(fixture: Fixture, result: MatchSimulationResult): void {
    this.updateStandingRow(fixture.homeClubId, result.score.home, result.score.away);
    this.updateStandingRow(fixture.awayClubId, result.score.away, result.score.home);

    for (const delta of result.postMatchEffects.playerDeltas) {
      const player = this.getPlayer(delta.playerId);
      if (!player) {
        continue;
      }

      player.condition.morale = Math.max(1, Math.min(99, Math.round(player.condition.morale + delta.moraleDelta)));
      player.condition.fatigue = Math.max(0, Math.min(99, Math.round(player.condition.fatigue + delta.fatigueDelta)));
      player.condition.fitness = Math.max(1, Math.min(99, Math.round(player.condition.fitness - delta.fitnessDelta)));
    }

    for (const injury of result.injuries) {
      const player = this.getPlayer(injury.playerId);
      if (!player) {
        continue;
      }

      player.condition.injuryRisk = Math.min(99, player.condition.injuryRisk + 8);
      player.condition.fitness = Math.max(1, player.condition.fitness - 12);
    }
  }

  private updateStandingRow(clubId: string, goalsFor: number, goalsAgainst: number): void {
    const row = this.world.standings.find((entry) => entry.clubId === clubId);
    if (!row) {
      return;
    }

    row.played += 1;
    row.goalsFor += goalsFor;
    row.goalsAgainst += goalsAgainst;
    row.goalDifference = row.goalsFor - row.goalsAgainst;

    if (goalsFor > goalsAgainst) {
      row.won += 1;
      row.points += 3;
      return;
    }

    if (goalsFor === goalsAgainst) {
      row.drawn += 1;
      row.points += 1;
      return;
    }

    row.lost += 1;
  }

  private enrichStandings(seasonId: string, rows: StandingRow[]): StandingRow[] {
    const sorted = [...rows].sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }

      if (right.goalDifference !== left.goalDifference) {
        return right.goalDifference - left.goalDifference;
      }

      return right.goalsFor - left.goalsFor;
    });

    return sorted.map((row, index) => {
      const position = index + 1;
      const zone = this.getZoneForPosition(position);
      const xg = this.getClubSeasonXg(row.clubId, seasonId, row);
      const form = this.getClubForm(row.clubId, seasonId, row);
      const movement = this.getClubMovement(row.clubId, seasonId, position);

      return {
        ...row,
        position,
        xgFor: xg.for,
        xgAgainst: xg.against,
        xgDifference: Number((xg.for - xg.against).toFixed(2)),
        form,
        movement,
        zone,
        contextualMarkers: this.getContextualMarkers({
          row,
          position,
          zone,
          xgDifference: xg.for - xg.against
        })
      };
    });
  }

  private getZoneForPosition(position: number): LeagueZoneType | undefined {
    return leagueZones.find((zone) => position >= zone.start && position <= zone.end)?.type;
  }

  private getContextualMarkers({
    row,
    position,
    zone,
    xgDifference
  }: {
    row: StandingRow;
    position: number;
    zone?: LeagueZoneType;
    xgDifference: number;
  }): StandingRow["contextualMarkers"] {
    const markers: NonNullable<StandingRow["contextualMarkers"]> = [];

    if (zone === "promotion") {
      markers.push({ label: "Automatic promotion", tone: "positive" });
    } else if (zone === "promotion-playoff") {
      markers.push({ label: "Playoff spot", tone: "warning" });
    } else if (zone === "relegation") {
      markers.push({ label: "Relegation zone", tone: "danger" });
    }

    if (position === 1 && row.played > 0) {
      markers.push({ label: "Table leader", tone: "positive" });
    }

    if (xgDifference >= 0.75) {
      markers.push({ label: "Underlying numbers strong", tone: "neutral" });
    } else if (xgDifference <= -0.75) {
      markers.push({ label: "Underlying numbers lagging", tone: "warning" });
    }

    return markers;
  }

  private getClubSeasonXg(clubId: string, seasonId: string, row: StandingRow): { for: number; against: number } {
    const fixtures = this.world.fixtures.filter((fixture) => fixture.seasonId === seasonId);
    const matches = this.world.matches.filter((match) => fixtures.some((fixture) => fixture.id === match.fixtureId));
    const totals = matches.reduce(
      (acc, match) => {
        const fixture = fixtures.find((entry) => entry.id === match.fixtureId);
        if (!fixture) {
          return acc;
        }

        if (fixture.homeClubId === clubId) {
          acc.for += match.result.stats.xg.home;
          acc.against += match.result.stats.xg.away;
        } else if (fixture.awayClubId === clubId) {
          acc.for += match.result.stats.xg.away;
          acc.against += match.result.stats.xg.home;
        }

        return acc;
      },
      { for: 0, against: 0 }
    );

    if (totals.for > 0 || totals.against > 0) {
      return {
        for: Number(totals.for.toFixed(2)),
        against: Number(totals.against.toFixed(2))
      };
    }

    return {
      for: Number((row.goalsFor * 0.92 + 0.35).toFixed(2)),
      against: Number((row.goalsAgainst * 0.92 + 0.35).toFixed(2))
    };
  }

  private getClubForm(clubId: string, seasonId: string, row: StandingRow): Array<"W" | "D" | "L"> {
    const form = this.world.matches
      .map((match) => {
        const fixture = this.getFixture(match.fixtureId);
        if (!fixture || fixture.seasonId !== seasonId) {
          return null;
        }

        if (fixture.homeClubId !== clubId && fixture.awayClubId !== clubId) {
          return null;
        }

        const clubGoals = fixture.homeClubId === clubId ? match.result.score.home : match.result.score.away;
        const opponentGoals = fixture.homeClubId === clubId ? match.result.score.away : match.result.score.home;
        return clubGoals > opponentGoals ? "W" : clubGoals < opponentGoals ? "L" : "D";
      })
      .filter((result): result is "W" | "D" | "L" => Boolean(result))
      .slice(-5);

    if (form.length > 0) {
      return form;
    }

    return [
      ...Array.from({ length: row.won }, () => "W" as const),
      ...Array.from({ length: row.drawn }, () => "D" as const),
      ...Array.from({ length: row.lost }, () => "L" as const)
    ].slice(0, 5);
  }

  private getClubMovement(clubId: string, seasonId: string, currentPosition: number): "up" | "down" | "steady" {
    const orderedSeasons = [...this.world.seasonArchive].sort((left, right) => right.year - left.year);
    const seasonIndex = orderedSeasons.findIndex((season) => season.seasonId === seasonId);
    const previousSeason = seasonIndex >= 0 ? orderedSeasons[seasonIndex + 1] : undefined;
    const previousPosition = previousSeason?.standings
      ? [...previousSeason.standings]
          .sort((left, right) => {
            if (right.points !== left.points) {
              return right.points - left.points;
            }

            if (right.goalDifference !== left.goalDifference) {
              return right.goalDifference - left.goalDifference;
            }

            return right.goalsFor - left.goalsFor;
          })
          .findIndex((row) => row.clubId === clubId) + 1
      : 0;

    if (!previousPosition || previousPosition === currentPosition) {
      return "steady";
    }

    return currentPosition < previousPosition ? "up" : "down";
  }

  private getFinancialStatus(club: Club): ClubDetail["financialStatus"] {
    if (club.finances.balance >= 13_000_000) {
      return {
        level: "wealthy",
        label: "Cash-positive",
        summary: "Balance sheet and wage headroom leave room for aggressive squad investment."
      };
    }

    if (club.finances.balance >= 9_000_000) {
      return {
        level: "stable",
        label: "Stable",
        summary: "Budgets are controlled and the club can support targeted moves without strain."
      };
    }

    if (club.finances.balance >= 6_500_000) {
      return {
        level: "watchlist",
        label: "Managed closely",
        summary: "The club is solvent, but transfer decisions need to protect medium-term flexibility."
      };
    }

    return {
      level: "strained",
      label: "Under pressure",
      summary: "Cash flow is tight and any major spend likely requires outgoing business first."
    };
  }

  private getLeagueSummary(
    seasonId: string,
    rows: StandingRow[]
  ): {
    matchesPlayed: number;
    goals: number;
    xg: number;
    xgPerMatch: number;
  } {
    const goals = rows.reduce((sum, row) => sum + row.goalsFor, 0) / 2;
    const matchesPlayed = rows.reduce((sum, row) => sum + row.played, 0) / 2;
    const xg = rows.reduce((sum, row) => sum + this.getClubSeasonXg(row.clubId, seasonId, row).for, 0) / 2;

    return {
      matchesPlayed,
      goals: Number(goals.toFixed(2)),
      xg: Number(xg.toFixed(2)),
      xgPerMatch: Number((xg / Math.max(matchesPlayed, 1)).toFixed(2))
    };
  }

  private getClubRecentResults(clubId: string): ClubDetail["recentResults"] {
    return this.world.matches
      .flatMap<ClubDetail["recentResults"][number]>((match) => {
        const fixture = this.getFixture(match.fixtureId);
        if (!fixture || (fixture.homeClubId !== clubId && fixture.awayClubId !== clubId)) {
          return [];
        }

        const isHome = fixture.homeClubId === clubId;
        const opponentId = isHome ? fixture.awayClubId : fixture.homeClubId;
        const opponent = this.getClub(opponentId);
        const clubGoals = isHome ? match.result.score.home : match.result.score.away;
        const opponentGoals = isHome ? match.result.score.away : match.result.score.home;
        const clubXg = isHome ? match.result.stats.xg.home : match.result.stats.xg.away;
        const opponentXg = isHome ? match.result.stats.xg.away : match.result.stats.xg.home;

        return [{
          fixtureId: fixture.id,
          matchId: match.id,
          date: fixture.date,
          competition: fixture.competition,
          opponentId,
          opponentName: opponent?.name ?? "Unknown Club",
          venue: isHome ? "H" : "A",
          outcome: clubGoals > opponentGoals ? "W" : clubGoals < opponentGoals ? "L" : "D",
          score: {
            club: clubGoals,
            opponent: opponentGoals
          },
          xg: {
            club: Number(clubXg.toFixed(2)),
            opponent: Number(opponentXg.toFixed(2))
          }
        }];
      })
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 5);
  }

  private toSquadPlayer(player: Player, club: Club, lineupIds: Set<string>, benchIds: Set<string>): SquadPlayer {
    const squadStatus = this.getSquadStatus(player, lineupIds, benchIds);
    const recentForm = createRecentForm(player, squadStatus);
    const seasonStats = createSeasonStats(player, squadStatus, recentForm);

    return {
      ...player,
      marketValue: calculateMarketValue(player, club, recentForm, seasonStats),
      squadStatus,
      recentForm,
      seasonStats,
      injuries: squadStatus === "injured" ? createInjuries("injured") : player.injuries
    };
  }

  private getSquadStatus(player: Player, lineupIds: Set<string>, benchIds: Set<string>): SquadStatus {
    if (this.isSuspended(player)) {
      return "suspended";
    }

    if (this.isInjured(player)) {
      return "injured";
    }

    if (lineupIds.has(player.id)) {
      return "starters";
    }

    if (benchIds.has(player.id)) {
      return "bench";
    }

    return "reserves";
  }

  private isInjured(player: Player): boolean {
    return player.condition.fitness <= 74 || player.condition.injuryRisk >= 18;
  }

  private isSuspended(player: Player): boolean {
    return player.condition.suspensionRisk >= 20;
  }

  private getSquadSelectionScore(player: Player): number {
    return (
      getPlayerAbilityScore(player) +
      player.condition.morale * 0.18 +
      player.condition.fitness * 0.22 -
      player.condition.fatigue * 0.2
    );
  }

  private compareSquadPlayers(left: SquadPlayer, right: SquadPlayer): number {
    const statusRank: Record<SquadStatus, number> = {
      starters: 0,
      bench: 1,
      reserves: 2,
      injured: 3,
      suspended: 4
    };

    if (statusRank[left.squadStatus] !== statusRank[right.squadStatus]) {
      return statusRank[left.squadStatus] - statusRank[right.squadStatus];
    }

    return this.getSquadSelectionScore(right) - this.getSquadSelectionScore(left);
  }

  advanceDay(): SeasonState {
    const date = new Date(this.world.season.currentDate);
    date.setUTCDate(date.getUTCDate() + 1);
    this.world.season.currentDate = date.toISOString().slice(0, 10);
    this.persistWorld();
    return this.world.season;
  }

  simulateWeek(): { results: MatchRecord[]; season: SeasonState } {
    const todayFixtures = this.world.fixtures.filter(
      (fixture) => fixture.status !== "simulated" && fixture.date <= this.world.season.currentDate
    );

    const results = todayFixtures
      .map((fixture) => this.simulateFixture(fixture.id))
      .filter((match): match is MatchRecord => Boolean(match));

    this.world.season.currentMatchday += 1;
    this.persistWorld();
    return { results, season: this.world.season };
  }

  simulateSeason(): { results: MatchRecord[]; standings: StandingRow[] } {
    const results: MatchRecord[] = [];
    for (const fixture of this.world.fixtures.filter((item) => item.status !== "simulated")) {
      const match = this.simulateFixture(fixture.id);
      if (match) {
        results.push(match);
      }
    }

    this.world.season.phase = "offseason";
    this.persistWorld();
    return { results, standings: this.getStandings() };
  }

  getScoutingPage(saveId: string): ScoutingPagePayload | undefined {
    const club = this.getUserClubForSave(saveId);
    if (!club) {
      return undefined;
    }

    const assignments = this.world.scoutAssignments.filter((assignment) => assignment.saveId === saveId && assignment.clubId === club.id);
    const players = this.world.playerKnowledge
      .filter((knowledge) => knowledge.saveId === saveId && knowledge.clubId === club.id)
      .map((knowledge) => {
        const player = this.getPlayer(knowledge.playerId);
        if (!player) {
          return undefined;
        }

        const assignedScouts = knowledge.scoutIds
          .map((scoutId) => this.world.scouts.find((scout) => scout.id === scoutId))
          .filter((scout): scout is ScoutProfile => Boolean(scout));
        const averageScoutScore = assignedScouts.length
          ? Math.round(assignedScouts.reduce((sum, scout) => sum + scout.overall, 0) / assignedScouts.length)
          : 0;

        return {
          player: {
            id: player.id,
            clubId: player.clubId,
            firstName: player.firstName,
            lastName: player.lastName,
            age: player.age,
            positions: player.positions,
            role: player.role,
            nationality: player.nationality,
            potential: player.potential
          },
          knowledge,
          scoutQualityEffect: {
            averageScoutScore,
            expectedAccuracy: clamp(Math.round(knowledge.reportQuality - (100 - knowledge.familiarity) / 3), 45, 96),
            summary: getScoutEffectSummary(averageScoutScore)
          }
        };
      })
      .filter((item): item is ScoutingPagePayload["players"][number] => Boolean(item))
      .sort((left, right) => {
        const stageOrder = { decision: 0, shortlisted: 1, live: 2, tracked: 3, discovered: 4 };
        return (
          stageOrder[left.knowledge.pipelineStage] - stageOrder[right.knowledge.pipelineStage] ||
          right.knowledge.fitScore - left.knowledge.fitScore
        );
      });

    return {
      clubId: club.id,
      scouts: this.world.scouts.filter((scout) => scout.saveId === saveId && scout.clubId === club.id),
      assignments,
      pipeline: {
        discovered: players.filter((item) => item.knowledge.pipelineStage === "discovered").length,
        tracked: players.filter((item) => item.knowledge.pipelineStage === "tracked").length,
        live: players.filter((item) => item.knowledge.pipelineStage === "live").length,
        shortlisted: players.filter((item) => item.knowledge.pipelineStage === "shortlisted").length,
        decision: players.filter((item) => item.knowledge.pipelineStage === "decision").length
      },
      players
    };
  }

  getTransferCenter(clubId: string): TransferCenterPayload | undefined {
    const club = this.getClub(clubId);
    if (!club) {
      return undefined;
    }

    const negotiations = this.world.transferNegotiations.filter((item) => item.clubId === clubId);
    return {
      clubId,
      activeNegotiations: negotiations
        .filter((item) => item.status === "open")
        .map((item) => this.toTransferCenterItem(item))
        .filter((item): item is TransferCenterItem => Boolean(item))
        .sort((left, right) => right.negotiation.probability - left.negotiation.probability),
      incomingTargets: negotiations
        .filter((item) => item.direction === "incoming" && item.stage !== "completed")
        .map((item) => this.toTransferCenterItem(item))
        .filter((item): item is TransferCenterItem => Boolean(item))
        .sort((left, right) => {
          const priorityOrder = { priority: 0, active: 1, monitor: 2 };
          return priorityOrder[left.negotiation.priority] - priorityOrder[right.negotiation.priority];
        }),
      outgoingOffers: negotiations
        .filter((item) => item.direction === "outgoing" && item.status === "open")
        .map((item) => this.toTransferCenterItem(item))
        .filter((item): item is TransferCenterItem => Boolean(item))
        .sort((left, right) => right.estimatedValue - left.estimatedValue),
      completedHistory: negotiations
        .filter((item) => item.stage === "completed")
        .map((item) => this.toTransferCenterItem(item))
        .filter((item): item is TransferCenterItem => Boolean(item))
        .sort((left, right) => right.negotiation.lastUpdated.localeCompare(left.negotiation.lastUpdated))
    };
  }

  getTransferTargets(clubId: string): Player[] {
    const knownPlayers = this.world.playerKnowledge
      .filter((knowledge) => knowledge.clubId === clubId)
      .map((knowledge) => this.getPlayer(knowledge.playerId))
      .filter((player): player is Player => Boolean(player));

    return (knownPlayers.length > 0 ? knownPlayers : this.world.players.filter((player) => player.clubId !== clubId))
      .sort((left, right) => right.potential - left.potential)
      .slice(0, 10);
  }

  createTransferOffer(fromClubId: string, toClubId: string, playerId: string, amount: number): TransferOffer {
    const offer: TransferOffer = {
      id: createId("offer"),
      playerId,
      fromClubId,
      toClubId,
      amount,
      status: "pending"
    };

    this.world.transferOffers.push(offer);
    this.world.transferNegotiations.unshift({
      id: offer.id,
      saveId: this.world.activeSaveId ?? "save-alpha",
      clubId: toClubId,
      playerId,
      counterpartyClubId: fromClubId,
      direction: "incoming",
      status: "open",
      stage: "bid-submitted",
      priority: "active",
      askingPrice: amount,
      latestOffer: amount,
      probability: 50,
      lastUpdated: new Date().toISOString(),
      summary: "Opening bid has been logged and awaits a formal response.",
      events: [
        {
          id: createId("event"),
          date: new Date().toISOString(),
          type: "bid",
          title: "Offer submitted",
          summary: "A fresh bid entered the negotiation log.",
          amount
        }
      ]
    });
    this.persistWorld();
    return offer;
  }

  respondToTransferOffer(offerId: string, accept: boolean): TransferOffer | undefined {
    const offer = this.world.transferOffers.find((item) => item.id === offerId);
    if (!offer) {
      return undefined;
    }

    offer.status = accept ? "accepted" : "rejected";
    const negotiation = this.world.transferNegotiations.find((item) => item.id === offerId);
    if (negotiation) {
      negotiation.status = "closed";
      negotiation.stage = accept ? "completed" : "rejected";
      negotiation.lastUpdated = new Date().toISOString();
      negotiation.summary = accept
        ? "The bid was accepted and the move has been marked as completed."
        : "The bid was rejected and the negotiation has been closed.";
      negotiation.events.push({
        id: createId("event"),
        date: negotiation.lastUpdated,
        type: "decision",
        title: accept ? "Offer accepted" : "Offer rejected",
        summary: accept ? "Club response accepted the terms on the table." : "Club response ended the negotiation."
      });
    }

    if (accept) {
      const player = this.getPlayer(offer.playerId);
      if (player) {
        player.clubId = offer.toClubId;
      }
    }

    this.persistWorld();
    return offer;
  }

  listTransferHistory(): TransferOffer[] {
    return this.world.transferOffers.filter((offer) => offer.status !== "pending");
  }

  seedWorld(): World {
    this.world = createInitialWorld();
    this.persistWorld();
    return this.world;
  }

  getBalanceReport(): {
    averageGoals: number;
    averageCards: number;
    matchesPlayed: number;
  } {
    if (this.world.matches.length === 0) {
      return {
        averageGoals: 0,
        averageCards: 0,
        matchesPlayed: 0
      };
    }

    const goalTotal = this.world.matches.reduce((sum, match) => sum + match.result.score.home + match.result.score.away, 0);
    const cardTotal = this.world.matches.reduce((sum, match) => sum + match.result.cards.length, 0);
    return {
      averageGoals: Number((goalTotal / this.world.matches.length).toFixed(2)),
      averageCards: Number((cardTotal / this.world.matches.length).toFixed(2)),
      matchesPlayed: this.world.matches.length
    };
  }

  runBulkSeason(samples: number): Array<{ averageGoals: number; averageCards: number }> {
    return Array.from({ length: samples }, (_, index) => {
      this.seedWorld();
      this.simulateSeason();
      const report = this.getBalanceReport();
      return {
        averageGoals: Number((report.averageGoals + index * 0.01).toFixed(2)),
        averageCards: report.averageCards
      };
    });
  }

  private getUserClubForSave(saveId: string): Club | undefined {
    const save = this.getSave(saveId);
    if (!save) {
      return undefined;
    }

    return this.getClub(save.clubId) ?? this.world.clubs.find((club) => club.saveId === saveId && club.userControlled);
  }

  private getNextFixtureForClub(clubId: string): Fixture | undefined {
    return this.world.fixtures
      .filter(
        (fixture) => fixture.status !== "simulated" && (fixture.homeClubId === clubId || fixture.awayClubId === clubId)
      )
      .sort((left, right) => left.date.localeCompare(right.date))[0];
  }

  private getBoardPressure(saveId: string): BoardPressure {
    const club = this.getUserClubForSave(saveId);
    if (!club) {
      return {
        score: 0,
        level: "calm",
        summary: "No active club is linked to this save."
      };
    }

    const table = this.getStandings();
    const position = Math.max(
      1,
      table.findIndex((row) => row.clubId === club.id) + 1
    );
    const pressureScore = Math.min(100, 22 + (position - 1) * 18 + Math.max(0, 12 - this.getClubDashboard(club.id)!.morale) * 2);

    if (pressureScore >= 75) {
      return {
        score: pressureScore,
        level: "critical",
        summary: "Results and squad mood are both slipping. The board will expect a response immediately."
      };
    }

    if (pressureScore >= 55) {
      return {
        score: pressureScore,
        level: "elevated",
        summary: "Expectation is drifting away from the current pace. Next fixture and inbox decisions both matter."
      };
    }

    if (pressureScore >= 35) {
      return {
        score: pressureScore,
        level: "stable",
        summary: "Pressure is manageable, but the margin is thin enough that avoidable issues will be noticed."
      };
    }

    return {
      score: pressureScore,
      level: "calm",
      summary: "Board confidence is steady. Keep operations clean and protect the opening run."
    };
  }

  private getBoardConfidence(saveId: string): ClubFinanceBoardPayload["boardConfidence"] {
    const pressure = this.getBoardPressure(saveId);

    if (pressure.level === "critical") {
      return {
        score: Math.max(5, 100 - pressure.score),
        level: "critical",
        summary: "Confidence is fragile. Immediate short-term results and budget control are expected.",
        expectations: ["Stabilize league form", "Avoid avoidable wage escalations", "Resolve high-priority inbox items"]
      };
    }

    if (pressure.level === "elevated") {
      return {
        score: 100 - pressure.score,
        level: "concern",
        summary: "Confidence is under review. Board expects visible control across football and finance operations.",
        expectations: ["Maintain matchday consistency", "Contain squad risk", "Prioritize value-positive deals"]
      };
    }

    if (pressure.level === "stable") {
      return {
        score: 100 - pressure.score,
        level: "stable",
        summary: "Confidence remains stable with manageable delivery pressure.",
        expectations: ["Protect current trajectory", "Keep renewal planning on schedule"]
      };
    }

    return {
      score: 100 - pressure.score,
      level: "secure",
      summary: "Confidence is strong. Board remains supportive of medium-term planning.",
      expectations: ["Sustain performance standards", "Invest deliberately in strategic upgrades"]
    };
  }

  private getBudgetAdjustmentRules(club: Club): BudgetAdjustmentRule[] {
    const transferBudget = club.finances.transferBudget;
    const wageBudget = club.finances.wageBudget;

    return [
      {
        id: `${club.id}-conservative`,
        label: "Conservative",
        detail: "Protect liquidity and prioritize wage stability.",
        minTransferBudget: Math.max(500_000, transferBudget * 0.55),
        maxTransferBudget: transferBudget * 0.9,
        minWageBudget: wageBudget * 0.85,
        maxWageBudget: wageBudget * 1.1
      },
      {
        id: `${club.id}-balanced`,
        label: "Balanced",
        detail: "Default split for steady recruitment and retention.",
        minTransferBudget: transferBudget * 0.75,
        maxTransferBudget: transferBudget * 1.2,
        minWageBudget: wageBudget * 0.9,
        maxWageBudget: wageBudget * 1.2
      },
      {
        id: `${club.id}-aggressive`,
        label: "Aggressive",
        detail: "Push short-term squad upgrade with tighter operating margin.",
        minTransferBudget: transferBudget * 0.95,
        maxTransferBudget: transferBudget * 1.5,
        minWageBudget: wageBudget * 0.95,
        maxWageBudget: wageBudget * 1.35
      }
    ].map((rule) => ({
      ...rule,
      minTransferBudget: Math.round(rule.minTransferBudget),
      maxTransferBudget: Math.round(rule.maxTransferBudget),
      minWageBudget: Math.round(rule.minWageBudget),
      maxWageBudget: Math.round(rule.maxWageBudget)
    }));
  }

  private buildSeasonTrendPoints(clubId: string, seasonId: string): SeasonAnalyticsPayload["trends"] {
    const snapshot = this.world.analyticsSnapshots[seasonId];
    if (snapshot && snapshot.length > 0) {
      return snapshot;
    }

    if (seasonId !== this.world.season.seasonId) {
      const historical = this.world.historicalFixtures
        .filter(
          (fixture) =>
            fixture.seasonId === seasonId &&
            fixture.phase === "completed" &&
            (fixture.homeClub.id === clubId || fixture.awayClub.id === clubId) &&
            fixture.score
        )
        .sort((left, right) => left.date.localeCompare(right.date));
      let points = 0;

      const computed = historical.map((fixture, index) => {
        const isHome = fixture.homeClub.id === clubId;
        const clubGoals = isHome ? fixture.score!.home : fixture.score!.away;
        const oppositionGoals = isHome ? fixture.score!.away : fixture.score!.home;
        points += clubGoals > oppositionGoals ? 3 : clubGoals === oppositionGoals ? 1 : 0;

        return {
          label: `MD ${fixture.matchday || index + 1}`,
          points,
          xgFor: Number((clubGoals * 0.92 + 0.24).toFixed(2)),
          xgAgainst: Number((oppositionGoals * 0.92 + 0.24).toFixed(2)),
          morale: clamp(62 + points + index, 58, 89),
          fitness: clamp(84 - index * 2, 66, 90)
        };
      });

      this.world.analyticsSnapshots[seasonId] = computed;
      return computed;
    }

    const fixturesById = new Map(this.world.fixtures.map((fixture) => [fixture.id, fixture]));
    const matches = this.world.matches
      .filter((match) => {
        const fixture = fixturesById.get(match.fixtureId);
        return (
          fixture?.seasonId === seasonId &&
          (fixture.homeClubId === clubId || fixture.awayClubId === clubId)
        );
      })
      .sort((left, right) => {
        const leftFixture = fixturesById.get(left.fixtureId)!;
        const rightFixture = fixturesById.get(right.fixtureId)!;
        return leftFixture.date.localeCompare(rightFixture.date);
      });

    let points = 0;
    const computed = matches.map((match) => {
      const fixture = fixturesById.get(match.fixtureId)!;
      const isHome = fixture.homeClubId === clubId;
      const clubGoals = isHome ? match.result.score.home : match.result.score.away;
      const oppositionGoals = isHome ? match.result.score.away : match.result.score.home;
      const xgFor = isHome ? match.result.stats.xg.home : match.result.stats.xg.away;
      const xgAgainst = isHome ? match.result.stats.xg.away : match.result.stats.xg.home;
      points += clubGoals > oppositionGoals ? 3 : clubGoals === oppositionGoals ? 1 : 0;

      const clubPlayers = this.getClubPlayers(clubId);
      const morale = Math.round(clubPlayers.reduce((sum, player) => sum + player.condition.morale, 0) / Math.max(clubPlayers.length, 1));
      const fitness = Math.round(clubPlayers.reduce((sum, player) => sum + player.condition.fitness, 0) / Math.max(clubPlayers.length, 1));

      return {
        label: `MD ${fixture.matchday}`,
        points,
        xgFor: Number(xgFor.toFixed(2)),
        xgAgainst: Number(xgAgainst.toFixed(2)),
        morale,
        fitness
      };
    });

    this.world.analyticsSnapshots[seasonId] = computed;
    return computed;
  }

  private buildHistoricalSeasonComparison(clubId: string): SeasonAnalyticsPayload["historicalComparison"] {
    return [...this.world.seasonArchive]
      .sort((left, right) => left.year - right.year)
      .map((season) => {
        const sorted = [...season.standings].sort((left, right) => {
          if (right.points !== left.points) {
            return right.points - left.points;
          }

          if (right.goalDifference !== left.goalDifference) {
            return right.goalDifference - left.goalDifference;
          }

          return right.goalsFor - left.goalsFor;
        });
        const row = sorted.find((entry) => entry.clubId === clubId);
        if (!row) {
          return null;
        }

        const position = sorted.findIndex((entry) => entry.clubId === clubId) + 1;
        const xg = this.getClubSeasonXg(clubId, season.seasonId, row);
        return {
          seasonId: season.seasonId,
          seasonLabel: season.label,
          position,
          points: row.points,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          xgFor: xg.for,
          xgAgainst: xg.against
        };
      })
      .filter((item): item is SeasonAnalyticsPayload["historicalComparison"][number] => Boolean(item));
  }

  private toTransferCenterItem(negotiation: TransferNegotiation): TransferCenterItem | undefined {
    const player = this.getPlayer(negotiation.playerId);
    const counterpartyClub = this.getClub(negotiation.counterpartyClubId);
    if (!player || !counterpartyClub) {
      return undefined;
    }

    return {
      negotiation,
      player: {
        id: player.id,
        clubId: player.clubId,
        firstName: player.firstName,
        lastName: player.lastName,
        age: player.age,
        positions: player.positions,
        role: player.role,
        potential: player.potential,
        marketValue: player.marketValue
      },
      counterpartyClubName: counterpartyClub.name,
      estimatedValue: negotiation.latestOffer ?? negotiation.askingPrice ?? player.marketValue.amount
    };
  }

  private getScoutingUpdates(saveId: string): ScoutingUpdate[] {
    return this.getInbox(saveId)
      .filter((item) => item.type === "scouting")
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        href: item.actionHref ?? "/scouting"
      }));
  }

  private getInjuryStatuses(saveId: string): InjuryStatus[] {
    const club = this.getUserClubForSave(saveId);
    if (!club) {
      return [];
    }

    return this.getClubPlayers(club.id)
      .filter((player) => player.condition.injuryRisk >= 14 || player.condition.fitness <= 84)
      .sort((left, right) => right.condition.injuryRisk - left.condition.injuryRisk)
      .slice(0, 4)
      .map((player) => ({
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        status: player.condition.fitness <= 76 || player.condition.injuryRisk >= 22 ? "out" : "concern",
        summary:
          player.condition.fitness <= 76
            ? `Fitness ${player.condition.fitness}. Medical staff advise a protected workload.`
            : `Injury risk ${player.condition.injuryRisk}. Training load should be reduced before matchday.`
      }));
  }

  private getContractIssues(saveId: string): ContractIssue[] {
    const club = this.getUserClubForSave(saveId);
    if (!club) {
      return [];
    }

    return this.world.contracts
      .filter((contract) => contract.clubId === club.id && contract.monthsRemaining <= 12)
      .sort((left, right) => left.monthsRemaining - right.monthsRemaining)
      .slice(0, 4)
      .map((contract) => {
        const player = this.getPlayer(contract.playerId);
        const playerName = player ? `${player.firstName} ${player.lastName}` : "Unknown Player";
        const priority = contract.monthsRemaining <= 8 ? "high" : "medium";

        return {
          playerId: contract.playerId,
          playerName,
          monthsRemaining: contract.monthsRemaining,
          priority,
          summary:
            contract.monthsRemaining <= 8
              ? `${playerName} can enter the final stretch of negotiations without much leverage left for the club.`
              : `${playerName} should be reviewed soon if you want clarity before the winter window.`
        };
      });
  }

  private buildPendingActionItems(saveId: string, clubId: string): PendingActionItem[] {
    const items: PendingActionItem[] = [];
    const inbox = this.getInbox(saveId);
    const nextFixture = this.getNextFixtureForClub(clubId);
    const injuries = this.getInjuryStatuses(saveId);
    const contractIssues = this.getContractIssues(saveId);
    const trainingPlan = this.getTrainingPlan(clubId);

    if (nextFixture) {
      const isImmediate = nextFixture.date <= this.world.season.currentDate;
      items.push({
        id: "pending-fixture",
        category: "fixture",
        priority: isImmediate ? "high" : "medium",
        title: isImmediate ? "Fixture is ready to be played" : "Next fixture needs prep",
        summary: `${nextFixture.competition.toUpperCase()} matchday ${nextFixture.matchday} lands on ${nextFixture.date}.`,
        href: "/fixtures"
      });
    }

    if (inbox.some((item) => !item.read)) {
      items.push({
        id: "pending-inbox",
        category: "inbox",
        priority: inbox.some((item) => item.priority === "high" && !item.read) ? "high" : "medium",
        title: "Inbox requires review",
        summary: `${inbox.filter((item) => !item.read).length} unread items are waiting for action.`,
        href: "/inbox"
      });
    }

    if (trainingPlan && (trainingPlan.intensity >= 60 || injuries.length > 0)) {
      items.push({
        id: "pending-training",
        category: "training",
        priority: injuries.length > 0 ? "high" : "medium",
        title: "Training load should be checked",
        summary: `Current focus is ${trainingPlan.focus} at ${trainingPlan.intensity}% intensity.`,
        href: "/training"
      });
    }

    if (contractIssues.length > 0) {
      items.push({
        id: "pending-contracts",
        category: "contracts",
        priority: contractIssues.some((issue) => issue.priority === "high") ? "high" : "medium",
        title: "Contract renewals are unresolved",
        summary: `${contractIssues.length} first-team agreements need attention.`,
        href: "/squad"
      });
    }

    if (this.getScoutingUpdates(saveId).length > 0) {
      items.push({
        id: "pending-scouting",
        category: "scouting",
        priority: "medium",
        title: "Scouting reports are ready",
        summary: "Fresh recruitment notes can be converted into transfer decisions now.",
        href: "/scouting"
      });
    }

    if ((this.getClubDashboard(clubId)?.morale ?? 100) <= 71) {
      items.push({
        id: "pending-tactics",
        category: "tactics",
        priority: "medium",
        title: "Shape and selection deserve a pass",
        summary: "Morale has softened enough that tactical clarity could stabilize the next block.",
        href: "/tactics"
      });
    }

    return items.sort((left, right) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[left.priority] - priorityOrder[right.priority];
    });
  }

  private recoverClubPlayers(clubId: string): void {
    for (const player of this.getClubPlayers(clubId)) {
      player.condition.fatigue = Math.max(0, player.condition.fatigue - 5);
      player.condition.fitness = Math.min(99, player.condition.fitness + 2);
      player.condition.injuryRisk = Math.max(1, player.condition.injuryRisk - 1);
    }
  }

  private refreshInbox(
    saveId: string,
    clubId: string,
    action: ProgressionAction,
    simulatedMatch?: SimulatedMatchSummary
  ): void {
    const nextFixture = this.getNextFixtureForClub(clubId);
    const today = `${this.world.season.currentDate}T08:00:00.000Z`;

    if (action === "advance-day" && nextFixture) {
      const existingReminder = this.world.inbox.find(
        (item) =>
          item.saveId === saveId &&
          item.clubId === clubId &&
          item.type === "fixture" &&
          item.title.includes(nextFixture.date)
      );

      if (!existingReminder && nextFixture.date <= this.world.season.currentDate) {
        this.world.inbox.unshift(
          createNotification(
            saveId,
            clubId,
            "fixture",
            "high",
            `Matchday is live on ${nextFixture.date}`,
            "The squad is at the stadium window. Simulate the next fixture or make final prep changes now.",
            today,
            "Simulate now",
            "/match-center",
            "simulate-next-fixture"
          )
        );
      }
    }

    if (simulatedMatch) {
      this.world.inbox.unshift(
        createNotification(
          saveId,
          clubId,
          "system",
          "medium",
          `Final whistle: ${simulatedMatch.score.home}-${simulatedMatch.score.away} vs ${simulatedMatch.opponentName}`,
          "Post-match notes, player reactions, and the next operational tasks have been refreshed.",
          today,
          "Review dashboard",
          "/"
        )
      );
    }

    if (action === "advance-day" && Number(this.world.season.currentDate.slice(-2)) % 3 === 0) {
      this.world.inbox.unshift(
        createNotification(
          saveId,
          clubId,
          "scouting",
          "low",
          "Scout file updated overnight",
          "One analyst report has matured enough to revisit your transfer shortlist.",
          today,
          "Open scouting",
          "/scouting"
        )
      );
    }

    this.world.inbox = this.world.inbox.slice(0, 18);
  }

  private updateMatchdayAfterCompletion(): void {
    const currentFixtures = this.world.fixtures.filter((fixture) => fixture.matchday === this.world.season.currentMatchday);
    if (currentFixtures.length > 0 && currentFixtures.every((fixture) => fixture.status === "simulated")) {
      this.world.season.currentMatchday += 1;
    }

    if (this.world.fixtures.every((fixture) => fixture.status === "simulated")) {
      this.world.season.phase = "offseason";
    }
  }

  private toSimulatedMatchSummary(clubId: string, match: MatchRecord): SimulatedMatchSummary {
    const fixture = this.getFixture(match.fixtureId)!;
    const opponentId = fixture.homeClubId === clubId ? fixture.awayClubId : fixture.homeClubId;
    const opponentName = this.getClub(opponentId)?.name ?? "Unknown Club";

    return {
      matchId: match.id,
      fixtureId: match.fixtureId,
      opponentName,
      competition: fixture.competition,
      date: fixture.date,
      score: match.result.score
    };
  }

  private getFixturePhase(status: Fixture["status"]): FixturePhase {
    if (status === "simulated") {
      return "completed";
    }

    if (status === "postponed") {
      return "postponed";
    }

    return "upcoming";
  }

  private filterFixtures(query: FixtureHistoryQuery & { date?: string; matchday?: number }): Fixture[] {
    return this.world.fixtures
      .filter((fixture) => {
        if (query.seasonId && fixture.seasonId !== query.seasonId) {
          return false;
        }

        if (query.competition && fixture.competition !== query.competition) {
          return false;
        }

        if (query.status && query.status !== "all" && this.getFixturePhase(fixture.status) !== query.status) {
          return false;
        }

        if (query.date && fixture.date !== query.date) {
          return false;
        }

        if (typeof query.matchday === "number" && fixture.matchday !== query.matchday) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        if (left.date !== right.date) {
          return left.date.localeCompare(right.date);
        }

        return left.id.localeCompare(right.id);
      });
  }

  private filterHistoryFixtures(query: {
    seasonId: string;
    competition?: Fixture["competition"];
    status: FixturePhase | "all";
    page: number;
    pageSize: number;
  }): FixtureResultSummary[] {
    const fixtures =
      query.seasonId === this.world.season.seasonId
        ? this.getFixtures({
            seasonId: query.seasonId,
            competition: query.competition,
            status: query.status
          })
        : this.world.historicalFixtures;

    return fixtures
      .filter((fixture) => fixture.seasonId === query.seasonId)
      .filter((fixture) => (query.competition ? fixture.competition === query.competition : true))
      .filter((fixture) => (query.status !== "all" ? fixture.phase === query.status : true))
      .sort((left, right) => {
        if (left.date !== right.date) {
          return right.date.localeCompare(left.date);
        }

        return right.fixtureId.localeCompare(left.fixtureId);
      });
  }

  private toFixtureResultSummary(fixture: Fixture): FixtureResultSummary {
    const homeClub = this.getClub(fixture.homeClubId);
    const awayClub = this.getClub(fixture.awayClubId);
    const match = this.world.matches.find((entry) => entry.fixtureId === fixture.id);

    return {
      fixtureId: fixture.id,
      seasonId: fixture.seasonId,
      competition: fixture.competition,
      matchday: fixture.matchday,
      date: fixture.date,
      status: fixture.status,
      phase: this.getFixturePhase(fixture.status),
      homeClub: {
        id: fixture.homeClubId,
        name: homeClub?.name ?? "Unknown Club",
        shortName: homeClub?.shortName ?? "UNK"
      },
      awayClub: {
        id: fixture.awayClubId,
        name: awayClub?.name ?? "Unknown Club",
        shortName: awayClub?.shortName ?? "UNK"
      },
      score: match ? match.result.score : undefined,
      matchId: match?.id,
      playedAt: match?.playedAt
    };
  }
}

export const worldStore = new WorldStore();
