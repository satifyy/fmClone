import type {
  ClubFinanceBoardPayload,
  Club,
  ClubDashboard,
  Fixture,
  FixtureHistoryResponse,
  FixtureResultSummary,
  InboxNotification,
  LeagueMarkerTone,
  LeagueMetadata,
  LeagueRowMovement,
  LeagueStandingsPayload,
  LeagueZoneType,
  MatchDetail,
  MatchEvent,
  PendingActionSummary,
  Player,
  PlayerPosition,
  SaveDashboardPayload,
  SeasonAnalyticsPayload,
  SeasonArchiveSummary,
  StandingRow,
  TacticalProfile,
  TransferCenterItem,
  TransferCenterPayload,
  TrainingPlan
} from "@fm/shared-types";

export const clubId = "club-harbor";
const saveId = "save-alpha";
const currentSeasonId = "season-2026";
const currentSeasonLabel = "2026/27";

type ClubSeed = {
  id: string;
  name: string;
  shortName: string;
  styleIdentity: Club["styleIdentity"];
  boardExpectation: string;
  userControlled: boolean;
  reputation: number;
  finances: Club["finances"];
  facilities: number;
  coaching: number;
  academy: number;
};

const clubsSeed: ClubSeed[] = [
  {
    id: clubId,
    name: "Harbor Athletic",
    shortName: "HAA",
    styleIdentity: "pressing",
    boardExpectation: "Reach playoffs",
    userControlled: true,
    reputation: 66,
    finances: { balance: 12_500_000, wageBudget: 230_000, transferBudget: 4_500_000 },
    facilities: 68,
    coaching: 70,
    academy: 64
  },
  {
    id: "club-summit",
    name: "Summit City",
    shortName: "SUM",
    styleIdentity: "balanced",
    boardExpectation: "Top half",
    userControlled: false,
    reputation: 64,
    finances: { balance: 10_400_000, wageBudget: 215_000, transferBudget: 3_400_000 },
    facilities: 63,
    coaching: 65,
    academy: 60
  },
  {
    id: "club-riverside",
    name: "Riverside FC",
    shortName: "RIV",
    styleIdentity: "counter",
    boardExpectation: "Avoid bottom two",
    userControlled: false,
    reputation: 61,
    finances: { balance: 8_000_000, wageBudget: 184_000, transferBudget: 2_100_000 },
    facilities: 58,
    coaching: 61,
    academy: 62
  },
  {
    id: "club-ironvale",
    name: "Ironvale United",
    shortName: "IRN",
    styleIdentity: "possession",
    boardExpectation: "Challenge for title",
    userControlled: false,
    reputation: 69,
    finances: { balance: 14_300_000, wageBudget: 260_000, transferBudget: 5_800_000 },
    facilities: 71,
    coaching: 72,
    academy: 67
  }
];

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
] as const;

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
] as const;

const traitPool = [
  "Workhorse",
  "Big Matches",
  "Press Resistant",
  "Quick Release",
  "Aerial Threat",
  "Recovery Pace",
  "Composed",
  "Line Breaker",
  "Ball Winner",
  "Set Piece Threat"
] as const;

const playerTemplates: Array<{
  key: string;
  role: string;
  positions: PlayerPosition[];
  squadStatus: Player["squadStatus"];
  baseAbility: number;
}> = [
  { key: "keeper-one", role: "Goalkeeper", positions: ["GK"], squadStatus: "starters", baseAbility: 64 },
  { key: "right-back", role: "Fullback", positions: ["RB"], squadStatus: "starters", baseAbility: 61 },
  { key: "center-back-a", role: "Defender", positions: ["CB"], squadStatus: "starters", baseAbility: 63 },
  { key: "center-back-b", role: "Defender", positions: ["CB"], squadStatus: "starters", baseAbility: 62 },
  { key: "left-back", role: "Fullback", positions: ["LB"], squadStatus: "starters", baseAbility: 61 },
  { key: "holding-mid", role: "Anchor", positions: ["DM", "CM"], squadStatus: "starters", baseAbility: 66 },
  { key: "midfield-a", role: "Playmaker", positions: ["CM"], squadStatus: "starters", baseAbility: 65 },
  { key: "midfield-b", role: "Mezzala", positions: ["CM", "AM"], squadStatus: "starters", baseAbility: 63 },
  { key: "winger-right", role: "Winger", positions: ["RW"], squadStatus: "starters", baseAbility: 66 },
  { key: "winger-left", role: "Inside Forward", positions: ["LW"], squadStatus: "starters", baseAbility: 66 },
  { key: "striker", role: "Advanced Forward", positions: ["ST"], squadStatus: "starters", baseAbility: 69 },
  { key: "bench-keeper", role: "Goalkeeper", positions: ["GK"], squadStatus: "bench", baseAbility: 57 },
  { key: "bench-def", role: "Defender", positions: ["CB"], squadStatus: "bench", baseAbility: 56 },
  { key: "bench-fullback", role: "Wingback", positions: ["LB", "RB"], squadStatus: "bench", baseAbility: 56 },
  { key: "bench-mid", role: "Midfielder", positions: ["CM"], squadStatus: "bench", baseAbility: 58 },
  { key: "bench-anchor", role: "Ball Winner", positions: ["DM", "CM"], squadStatus: "bench", baseAbility: 58 },
  { key: "bench-wing", role: "Winger", positions: ["LW"], squadStatus: "bench", baseAbility: 59 },
  { key: "bench-right-wing", role: "Winger", positions: ["RW"], squadStatus: "bench", baseAbility: 58 },
  { key: "bench-forward", role: "Pressing Forward", positions: ["ST"], squadStatus: "bench", baseAbility: 60 },
  { key: "reserve-center-back", role: "Stopper", positions: ["CB"], squadStatus: "reserves", baseAbility: 54 },
  { key: "reserve-left-back", role: "Fullback", positions: ["LB"], squadStatus: "reserves", baseAbility: 53 },
  { key: "reserve-midfielder", role: "Deep Playmaker", positions: ["CM", "DM"], squadStatus: "reserves", baseAbility: 55 },
  { key: "reserve-attacker", role: "Shadow Striker", positions: ["AM", "ST"], squadStatus: "reserves", baseAbility: 57 },
  { key: "reserve-utility", role: "Utility Midfielder", positions: ["CM", "RB"], squadStatus: "reserves", baseAbility: 52 }
];

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRandom(seedText: string): () => number {
  let state = hashSeed(seedText) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function buildForm(values: Array<"W" | "D" | "L">): Array<"W" | "D" | "L"> {
  return values;
}

function buildMovement(value: LeagueRowMovement): LeagueRowMovement {
  return value;
}

function buildZone(value: LeagueZoneType): LeagueZoneType {
  return value;
}

function buildMarker(label: string, tone: LeagueMarkerTone) {
  return { label, tone };
}

function buildClub(seed: ClubSeed): Club {
  return {
    id: seed.id,
    saveId,
    name: seed.name,
    shortName: seed.shortName,
    reputation: seed.reputation,
    finances: seed.finances,
    facilities: seed.facilities,
    coaching: seed.coaching,
    academy: seed.academy,
    boardExpectation: seed.boardExpectation,
    styleIdentity: seed.styleIdentity,
    userControlled: seed.userControlled
  };
}

function buildAttributes(positions: PlayerPosition[], ability: number, random: () => number): Player["attributes"] {
  const isGoalkeeper = positions.includes("GK");
  const isDefender = positions.some((position) => ["CB", "LB", "RB", "DM"].includes(position));
  const isAttacker = positions.some((position) => ["RW", "LW", "AM", "ST"].includes(position));
  const base = clamp(Math.round(ability / 6), 8, 16);

  return {
    pace: clamp(base + (isAttacker ? 2 : 0) + randomInt(random, -1, 2), 6, 18),
    acceleration: clamp(base + (isAttacker ? 2 : 0) + randomInt(random, -1, 2), 6, 18),
    stamina: clamp(base + randomInt(random, -1, 2), 7, 18),
    strength: clamp(base + (isDefender ? 2 : 0) + randomInt(random, -1, 2), 7, 18),
    finishing: clamp(base + (isAttacker ? 3 : -2) + randomInt(random, -1, 2), 4, 18),
    passing: clamp(base + (positions.includes("CM") || positions.includes("DM") ? 2 : 0) + randomInt(random, -1, 2), 6, 18),
    dribbling: clamp(base + (isAttacker ? 2 : 0) + randomInt(random, -1, 2), 5, 18),
    firstTouch: clamp(base + randomInt(random, -1, 2), 6, 18),
    vision: clamp(base + (positions.includes("CM") || positions.includes("AM") ? 2 : 0) + randomInt(random, -1, 2), 6, 18),
    tackling: clamp(base + (isDefender ? 3 : -2) + randomInt(random, -1, 2), 4, 18),
    marking: clamp(base + (isDefender ? 3 : -2) + randomInt(random, -1, 2), 4, 18),
    positioning: clamp(base + randomInt(random, -1, 2), 6, 18),
    composure: clamp(base + randomInt(random, -1, 2), 6, 18),
    decisions: clamp(base + randomInt(random, -1, 2), 6, 18),
    workRate: clamp(base + randomInt(random, -1, 2), 7, 18),
    reflexes: isGoalkeeper ? clamp(base + 3 + randomInt(random, -1, 2), 10, 18) : undefined,
    handling: isGoalkeeper ? clamp(base + 2 + randomInt(random, -1, 2), 9, 18) : undefined,
    aerialReach: isGoalkeeper ? clamp(base + 2 + randomInt(random, -1, 2), 9, 18) : undefined,
    oneOnOnes: isGoalkeeper ? clamp(base + 3 + randomInt(random, -1, 2), 10, 18) : undefined,
    kicking: isGoalkeeper ? clamp(base + randomInt(random, -1, 2), 8, 18) : undefined
  };
}

function buildPlayer(club: Club, template: (typeof playerTemplates)[number], templateIndex: number): Player {
  const random = createRandom(`${club.id}:${template.key}`);
  const ability = template.baseAbility + Math.round((club.reputation - 60) / 2) + randomInt(random, -2, 3);
  const age = randomInt(random, 19, 31);
  const firstName = firstNames[(templateIndex * 3 + randomInt(random, 0, firstNames.length - 1)) % firstNames.length]!;
  const lastName = lastNames[(templateIndex * 5 + randomInt(random, 0, lastNames.length - 1)) % lastNames.length]!;
  const marketValue = Math.max(325_000, Math.round((ability * ability * 1450 + club.reputation * 9000) / 25_000) * 25_000);
  const appearances = template.squadStatus === "starters" ? randomInt(random, 28, 34) : template.squadStatus === "bench" ? randomInt(random, 12, 24) : randomInt(random, 4, 14);
  const starts = template.squadStatus === "starters" ? Math.max(24, appearances - randomInt(random, 0, 4)) : Math.min(appearances, randomInt(random, 1, 9));
  const isAttacker = template.positions.some((position) => ["RW", "LW", "AM", "ST"].includes(position));
  const isCreator = template.positions.some((position) => ["CM", "AM", "RW", "LW"].includes(position));
  const isDefender = template.positions.some((position) => ["GK", "CB", "LB", "RB", "DM"].includes(position));
  const goals = isAttacker ? randomInt(random, 4, 17) : randomInt(random, 0, 4);
  const assists = isCreator ? randomInt(random, 3, 12) : randomInt(random, 0, 4);
  const cleanSheets = isDefender ? randomInt(random, 5, 16) : randomInt(random, 0, 3);
  const averageRating = Number((6.5 + ability / 50 + random() * 0.7).toFixed(2));
  const formRatings = Array.from({ length: 5 }, () => Number((averageRating + random() * 0.4 - 0.2).toFixed(1)));
  const morale = clamp(58 + Math.round(ability / 3) + randomInt(random, -8, 8), 52, 88);
  const fitness = clamp(70 + randomInt(random, 4, 22), 68, 95);
  const fatigue = clamp(8 + randomInt(random, 0, 16), 6, 26);
  const injuryRisk = clamp(5 + randomInt(random, 0, 14), 5, 26);
  const suspensionRisk = clamp(1 + randomInt(random, 0, 10), 1, 18);
  const yearsRemaining = Number((1.5 + random() * 3).toFixed(1));
  const roleFitScore = clamp(62 + Math.round(ability / 2.2) + randomInt(random, -5, 5), 58, 92);

  return {
    id: `${club.id}-${template.key}`,
    saveId,
    clubId: club.id,
    firstName,
    lastName,
    age,
    nationality: "Fictionland",
    preferredFoot: random() > 0.24 ? "right" : "left",
    positions: template.positions,
    role: template.role,
    attributes: buildAttributes(template.positions, ability, random),
    condition: {
      morale,
      chemistry: clamp(60 + randomInt(random, 0, 22), 56, 90),
      fatigue,
      fitness,
      injuryRisk,
      suspensionRisk
    },
    traits: [traitPool[randomInt(random, 0, traitPool.length - 1)]!],
    potential: clamp(ability + randomInt(random, 3, 10), 60, 86),
    squadStatus: template.squadStatus,
    marketValue: {
      amount: marketValue,
      currency: "USD",
      trend: random() > 0.6 ? "rising" : random() < 0.25 ? "falling" : "steady",
      confidence: clamp(66 + appearances, 68, 92)
    },
    recentForm: {
      score: clamp(Math.round(averageRating * 10), 60, 86),
      trend: formRatings[4]! > formRatings[0]! + 0.15 ? "up" : formRatings[4]! < formRatings[0]! - 0.15 ? "down" : "steady",
      summary:
        template.squadStatus === "starters"
          ? "Trusted in the current first-choice group."
          : template.squadStatus === "bench"
            ? "Used regularly as matchday rotation cover."
            : "Development minutes are coming in shorter bursts.",
      recentRatings: formRatings,
      sampleSize: formRatings.length,
      appearances,
      starts,
      minutes: starts * 82 + Math.max(0, appearances - starts) * 24,
      goals,
      assists,
      averageRating,
      goalContributions: goals + assists,
      cleanSheets
    },
    contract: {
      expiresOn: `${2026 + Math.ceil(yearsRemaining)}-06-30`,
      yearsRemaining,
      weeklyWage: Math.round((8_000 + ability * 260 + club.reputation * 80) / 100) * 100,
      squadStatus:
        template.squadStatus === "starters"
          ? "regular starter"
          : template.squadStatus === "bench"
            ? "rotation"
            : "prospect",
      releaseClause: random() > 0.45 ? Math.round((marketValue * 1.65) / 50_000) * 50_000 : undefined
    },
    roleFit: {
      score: roleFitScore,
      tacticalRole: template.role,
      summary: `${template.role} maps cleanly to ${club.shortName}'s current structure.`
    },
    development: {
      trajectory: age <= 23 ? "accelerating" : age <= 28 ? "steady" : "plateauing",
      trend: age <= 24 ? "up" : age >= 30 ? "steady" : random() > 0.35 ? "up" : "steady",
      recentGrowth: age <= 23 ? randomInt(random, 2, 5) : randomInt(random, 0, 2),
      ceiling: clamp(ability + randomInt(random, 4, 10), 66, 89),
      summary: age <= 23 ? "Still climbing with meaningful first-team upside." : "Development is stable and close to the current level."
    },
    seasonStats: {
      appearances,
      starts,
      minutes: starts * 82 + Math.max(0, appearances - starts) * 24,
      goals,
      assists,
      cleanSheets,
      averageRating
    },
    history: [
      {
        season: "2025/26",
        clubName: club.name,
        competition: "League",
        appearances: Math.max(6, appearances - 5),
        goals: Math.max(0, goals - 2),
        assists: Math.max(0, assists - 1),
        averageRating: Number((averageRating - 0.14).toFixed(2)),
        minutes: Math.max(540, starts * 72)
      },
      {
        season: "2024/25",
        clubName: club.name,
        competition: "League",
        appearances: Math.max(4, appearances - 11),
        goals: Math.max(0, goals - 4),
        assists: Math.max(0, assists - 2),
        averageRating: Number((averageRating - 0.27).toFixed(2)),
        minutes: Math.max(360, starts * 58)
      }
    ],
    injuries:
      template.squadStatus === "injured"
        ? [
            {
              type: "Hamstring strain",
              status: "rehab",
              occurredOn: "2026-08-05",
              expectedReturn: "2026-08-19",
              daysOut: 14,
              gamesMissed: 2
            }
          ]
        : [],
    scouting: {
      scope: club.userControlled ? "full" : "partial",
      confidence: club.userControlled ? 96 : clamp(68 + randomInt(random, 0, 18), 68, 89),
      lastUpdated: "2026-08-08",
      summary: club.userControlled ? "Fully known squad player." : "League rival with strong internal scouting coverage.",
      knownStrengths: template.positions.includes("ST") ? ["Finishing", "Movement"] : ["Reliability", "Tactical fit"],
      unknowns: club.userControlled ? [] : ["Long-term wage demands"]
    }
  };
}

export const allClubs = clubsSeed.map(buildClub);

const generatedPlayers = allClubs.flatMap((club) => playerTemplates.map((template, index) => buildPlayer(club, template, index)));

const userSquadBase = generatedPlayers.filter((player) => player.clubId === clubId);
if (userSquadBase[20]) {
  userSquadBase[20].squadStatus = "injured";
  userSquadBase[20].condition.fitness = 62;
  userSquadBase[20].condition.injuryRisk = 25;
  userSquadBase[20].injuries = [
    {
      type: "Calf strain",
      status: "rehab",
      occurredOn: "2026-08-06",
      expectedReturn: "2026-08-18",
      daysOut: 12,
      gamesMissed: 2
    }
  ];
}
if (userSquadBase[15]) {
  userSquadBase[15].squadStatus = "suspended";
  userSquadBase[15].condition.suspensionRisk = 24;
}

export const allPlayers = generatedPlayers;
export const squad = userSquadBase;

const clubsById = Object.fromEntries(allClubs.map((club) => [club.id, club])) as Record<string, Club>;
const harborClub = clubsById[clubId]!;
const summitClub = clubsById["club-summit"]!;
const riversideClub = clubsById["club-riverside"]!;
const ironvaleClub = clubsById["club-ironvale"]!;

type SimulatedFixture = FixtureResultSummary & { matchId?: string };

const completedRound: SimulatedFixture[] = [
  {
    fixtureId: "fx-1",
    seasonId: currentSeasonId,
    competition: "league",
    matchday: 1,
    date: "2026-08-03",
    status: "simulated",
    phase: "completed",
    homeClub: { id: clubId, name: harborClub.name, shortName: harborClub.shortName },
    awayClub: { id: "club-riverside", name: riversideClub.name, shortName: riversideClub.shortName },
    score: { home: 2, away: 1 },
    matchId: "match-harbor-riverside",
    playedAt: "2026-08-03"
  },
  {
    fixtureId: "fx-2",
    seasonId: currentSeasonId,
    competition: "league",
    matchday: 1,
    date: "2026-08-03",
    status: "simulated",
    phase: "completed",
    homeClub: { id: "club-summit", name: summitClub.name, shortName: summitClub.shortName },
    awayClub: { id: "club-ironvale", name: ironvaleClub.name, shortName: ironvaleClub.shortName },
    score: { home: 0, away: 3 },
    matchId: "match-summit-ironvale",
    playedAt: "2026-08-03"
  }
];

const upcomingRound: SimulatedFixture[] = [
  {
    fixtureId: "fx-3",
    seasonId: currentSeasonId,
    competition: "league",
    matchday: 2,
    date: "2026-08-10",
    status: "scheduled",
    phase: "upcoming",
    homeClub: { id: clubId, name: harborClub.name, shortName: harborClub.shortName },
    awayClub: { id: "club-summit", name: summitClub.name, shortName: summitClub.shortName }
  },
  {
    fixtureId: "fx-4",
    seasonId: currentSeasonId,
    competition: "league",
    matchday: 2,
    date: "2026-08-10",
    status: "scheduled",
    phase: "upcoming",
    homeClub: { id: "club-riverside", name: riversideClub.name, shortName: riversideClub.shortName },
    awayClub: { id: "club-ironvale", name: ironvaleClub.name, shortName: ironvaleClub.shortName }
  }
];

export const fixtures: Fixture[] = [...completedRound, ...upcomingRound].map((fixture) => ({
  id: fixture.fixtureId,
  saveId,
  seasonId: fixture.seasonId,
  competition: fixture.competition,
  matchday: fixture.matchday,
  date: fixture.date,
  homeClubId: fixture.homeClub.id,
  awayClubId: fixture.awayClub.id,
  status: fixture.status
}));

export const standings: StandingRow[] = allClubs
  .map((club) => {
    const clubFixtures = completedRound.filter((fixture) => fixture.homeClub.id === club.id || fixture.awayClub.id === club.id);
    const goalsFor = clubFixtures.reduce((sum, fixture) => {
      if (!fixture.score) {
        return sum;
      }
      return sum + (fixture.homeClub.id === club.id ? fixture.score.home : fixture.score.away);
    }, 0);
    const goalsAgainst = clubFixtures.reduce((sum, fixture) => {
      if (!fixture.score) {
        return sum;
      }
      return sum + (fixture.homeClub.id === club.id ? fixture.score.away : fixture.score.home);
    }, 0);
    const won = clubFixtures.filter((fixture) => fixture.score && (fixture.homeClub.id === club.id ? fixture.score.home > fixture.score.away : fixture.score.away > fixture.score.home)).length;
    const drawn = clubFixtures.filter((fixture) => fixture.score && fixture.score.home === fixture.score.away).length;
    const lost = clubFixtures.length - won - drawn;
    return {
      clubId: club.id,
      clubName: club.name,
      position: 0,
      played: clubFixtures.length,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points: won * 3 + drawn,
      xgFor: Number((goalsFor + 0.45).toFixed(2)),
      xgAgainst: Number((goalsAgainst + 0.35).toFixed(2)),
      xgDifference: Number((goalsFor - goalsAgainst + 0.1).toFixed(2)),
      form:
        club.id === ironvaleClub.id
          ? buildForm(["W", "W", "D"])
          : club.id === clubId
            ? buildForm(["W", "D", "W"])
            : club.id === summitClub.id
              ? buildForm(["L", "D", "L"])
              : buildForm(["L", "W", "D"]),
      movement: club.id === riversideClub.id ? buildMovement("down") : club.id === summitClub.id ? buildMovement("down") : buildMovement("up"),
      zone:
        club.id === riversideClub.id
          ? buildZone("relegation")
          : club.id === ironvaleClub.id || club.id === clubId
            ? buildZone("promotion-playoff")
            : buildZone("midtable"),
      contextualMarkers:
        club.id === ironvaleClub.id
          ? [buildMarker("Title pace", "positive")]
          : club.id === clubId
            ? [buildMarker("Playoff race", "positive")]
            : club.id === riversideClub.id
              ? [buildMarker("Pressure", "danger")]
              : [buildMarker("Unsettled", "warning")]
    };
  })
  .sort((left, right) => right.points - left.points || right.goalDifference - left.goalDifference || right.goalsFor - left.goalsFor || left.clubName.localeCompare(right.clubName))
  .map((row, index) => ({ ...row, position: index + 1 }));

export const leagueScoreboard = [
  {
    title: "Matchday 2",
    subtitle: "Current league slate",
    fixtures: upcomingRound
  },
  {
    title: "Matchday 1",
    subtitle: "Completed round",
    fixtures: completedRound
  }
];

export const seasonArchive: SeasonArchiveSummary[] = [
  {
    saveId,
    seasonId: currentSeasonId,
    year: 2026,
    label: currentSeasonLabel,
    current: true,
    completed: false,
    competitions: ["league"],
    totalFixtures: fixtures.length,
    completedFixtures: completedRound.length
  },
  {
    saveId,
    seasonId: "season-2025",
    year: 2025,
    label: "2025/26",
    current: false,
    completed: true,
    competitions: ["league"],
    totalFixtures: 12,
    completedFixtures: 12
  }
];

export const fixtureHistoryResponse: FixtureHistoryResponse = {
  seasonId: currentSeasonId,
  seasonLabel: currentSeasonLabel,
  availableCompetitions: ["league"],
  appliedFilters: {
    seasonId: currentSeasonId,
    status: "all",
    page: 1,
    pageSize: 20
  },
  page: 1,
  pageSize: 20,
  total: completedRound.length + upcomingRound.length,
  totalPages: 1,
  buckets: [
    { phase: "upcoming", total: upcomingRound.length, fixtures: upcomingRound },
    { phase: "completed", total: completedRound.length, fixtures: completedRound },
    { phase: "postponed", total: 0, fixtures: [] }
  ],
  fixtures: [...upcomingRound, ...completedRound]
};

const leagueMetadata: LeagueMetadata = {
  id: "league-coastal-premier",
  name: "Coastal Premier",
  country: "Fictionland",
  season: currentSeasonLabel,
  tier: 1,
  clubCount: allClubs.length,
  rules: [
    { title: "Points", detail: "Three for a win, one for a draw." },
    { title: "Tiebreakers", detail: "Goal difference, then goals scored." }
  ],
  zones: [
    { type: "promotion-playoff", label: "Promotion playoff", start: 1, end: 2, description: "Top two clubs qualify for the title playoff." },
    { type: "midtable", label: "Midtable", start: 3, end: 3, description: "Stable central-table position." },
    { type: "relegation", label: "Relegation", start: 4, end: 4, description: "Bottom place enters the drop zone." }
  ]
};

export const leagueStandingsPayload: LeagueStandingsPayload = {
  league: leagueMetadata,
  availableLeagues: [
    {
      id: "league-coastal-premier",
      name: "Coastal Premier",
      country: "Fictionland",
      tier: 1
    },
    {
      id: "league-frontier-union",
      name: "Frontier Union League",
      country: "Fictionland",
      tier: 2
    }
  ],
  availableSeasons: seasonArchive.map((season) => season.seasonId),
  selectedSeason: currentSeasonId,
  isHistorical: false,
  summary: {
    matchesPlayed: completedRound.length,
    goals: completedRound.reduce((sum, fixture) => sum + (fixture.score?.home ?? 0) + (fixture.score?.away ?? 0), 0),
    xg: 5.64,
    xgPerMatch: 2.82
  },
  table: standings
};

const latestMatchEvents: MatchEvent[] = [
  {
    minute: 11,
    team: "home",
    type: "chance-created",
    playerId: `${clubId}-winger-left`,
    description: "Harbor find the left half-space early and cut a low cross through the six-yard box.",
    xg: 0.16
  },
  {
    minute: 27,
    team: "away",
    type: "goal",
    playerId: "club-riverside-striker",
    description: "Riverside counter quickly and finish across the keeper from the inside-right channel.",
    xg: 0.22
  },
  {
    minute: 39,
    team: "home",
    type: "goal",
    playerId: `${clubId}-striker`,
    secondaryPlayerId: `${clubId}-midfield-a`,
    description: "Harbor respond through a clipped pass into the box and a composed near-post finish.",
    xg: 0.24
  },
  {
    minute: 71,
    team: "home",
    type: "goal",
    playerId: `${clubId}-winger-right`,
    description: "A second-ball phase drops kindly and Harbor punch in the winner from 12 yards.",
    xg: 0.18
  }
];

export const latestResult: MatchDetail = {
  id: "match-harbor-riverside",
  fixtureId: "fx-1",
  playedAt: "2026-08-03",
  result: {
    score: { home: 2, away: 1 },
    stats: {
      possession: { home: 56, away: 44 },
      shots: { home: 14, away: 8 },
      shotsOnTarget: { home: 6, away: 3 },
      xg: { home: 1.68, away: 0.93 },
      corners: { home: 7, away: 4 },
      fouls: { home: 10, away: 12 }
    },
    events: latestMatchEvents,
    playerRatings: [
      { playerId: `${clubId}-striker`, clubId, rating: 8.3, impact: "excellent" },
      { playerId: `${clubId}-holding-mid`, clubId, rating: 7.6, impact: "good" },
      { playerId: `${clubId}-keeper-one`, clubId, rating: 7.4, impact: "good" }
    ],
    injuries: [],
    cards: [{ playerId: `${clubId}-holding-mid`, clubId, minute: 64, card: "yellow" }],
    tacticalNotes: [
      { team: "home", minute: 58, note: "Harbor narrowed the rest defense and released the right winger later in transitions." }
    ],
    postMatchEffects: {
      playerDeltas: [
        { playerId: `${clubId}-striker`, moraleDelta: 4, fatigueDelta: 8, fitnessDelta: 3 },
        { playerId: `${clubId}-holding-mid`, moraleDelta: 2, fatigueDelta: 9, fitnessDelta: 4 }
      ],
      clubDeltas: [{ clubId, moraleDelta: 3 }]
    }
  },
  eventFeed: {
    mode: "post-match",
    isLive: false,
    availableModes: ["post-match", "stepwise", "live"],
    events: latestMatchEvents
  }
};

export const resultView = {
  match: latestResult,
  competition: "League",
  matchday: 1,
  date: "2026-08-03",
  homeClub: completedRound[0]!.homeClub,
  awayClub: completedRound[0]!.awayClub,
  summary: "Harbor created the better central looks and controlled the match after equalizing before halftime.",
  standoutLines: [
    "Harbor generated 1.68 xG from repeat entries into the box.",
    "The winning goal arrived from a recycled attacking phase at 71'.",
    "Riverside threatened in transition but could not sustain pressure."
  ]
};

export const liveMatchCenter = {
  matchday: 2,
  date: "2026-08-10",
  headline: {
    fixtureId: "fx-3",
    matchId: "live-harbor-summit",
    state: "live" as const,
    minute: 67,
    homeClub: upcomingRound[0]!.homeClub,
    awayClub: upcomingRound[0]!.awayClub,
    score: { home: 2, away: 1 },
    note: "Harbor are winning the second-ball battle and have taken control of the right side after halftime."
  },
  slate: [
    {
      fixtureId: "fx-3",
      matchId: "live-harbor-summit",
      state: "live" as const,
      minute: 67,
      homeClub: upcomingRound[0]!.homeClub,
      awayClub: upcomingRound[0]!.awayClub,
      score: { home: 2, away: 1 }
    },
    {
      fixtureId: "fx-4",
      matchId: "live-riverside-ironvale",
      state: "final" as const,
      minute: 90,
      homeClub: upcomingRound[1]!.homeClub,
      awayClub: upcomingRound[1]!.awayClub,
      score: { home: 1, away: 1 }
    }
  ],
  keyMoments: [
    { minute: 9, label: "Press", text: "Harbor trap Summit on the flank and force two rushed clearances." },
    { minute: 22, label: "Goal", text: "The home side score after an underlap opens the cutback lane." },
    { minute: 41, label: "Equalizer", text: "Summit level from a fast break after bypassing midfield pressure." },
    { minute: 58, label: "Goal", text: "Harbor retake the lead through a near-post striker run." },
    { minute: 64, label: "Adjustment", text: "The midfield line flattens and protects the center more aggressively." }
  ],
  watchPanels: [
    {
      title: "Your match",
      value: "Harbor 2-1 Summit",
      detail: "The lead is being protected through stronger rest defense and faster wing access."
    },
    {
      title: "Other result",
      value: "Riverside 1-1 Ironvale",
      detail: "Ironvale are dropping points after controlling most of the ball."
    },
    {
      title: "Table swing",
      value: "Harbor live 1st",
      detail: "A win would move Harbor level on points and ahead on goals scored."
    }
  ]
};

export const tactics: TacticalProfile = {
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
  roles: [
    { slot: "gk", playerId: `${clubId}-keeper-one`, position: "GK", role: "Goalkeeper" },
    { slot: "rb", playerId: `${clubId}-right-back`, position: "RB", role: "Fullback" },
    { slot: "rcb", playerId: `${clubId}-center-back-a`, position: "CB", role: "Defender" },
    { slot: "lcb", playerId: `${clubId}-center-back-b`, position: "CB", role: "Defender" },
    { slot: "lb", playerId: `${clubId}-left-back`, position: "LB", role: "Fullback" },
    { slot: "dm", playerId: `${clubId}-holding-mid`, position: "DM", role: "Anchor" },
    { slot: "rcm", playerId: `${clubId}-midfield-a`, position: "CM", role: "Playmaker" },
    { slot: "lcm", playerId: `${clubId}-midfield-b`, position: "CM", role: "Mezzala" },
    { slot: "rw", playerId: `${clubId}-winger-right`, position: "RW", role: "Winger" },
    { slot: "lw", playerId: `${clubId}-winger-left`, position: "LW", role: "Inside Forward" },
    { slot: "st", playerId: `${clubId}-striker`, position: "ST", role: "Advanced Forward" }
  ]
};

export const trainingPlan: TrainingPlan = {
  clubId,
  focus: "balanced",
  intensity: 58
};

const unreadInbox = 4;

export const inbox: InboxNotification[] = [
  {
    id: "note-board-1",
    saveId,
    clubId,
    type: "board",
    priority: "high",
    title: "Board expect a strong opening block",
    summary: "Harbor are expected to stay in the top two through the first month and maintain playoff form immediately.",
    createdAt: "2026-08-08T08:00:00.000Z",
    read: false,
    actionLabel: "View season context",
    actionHref: "/season-summary"
  },
  {
    id: "note-scout-1",
    saveId,
    clubId,
    type: "scouting",
    priority: "medium",
    title: "Rival winger shortlist updated",
    summary: "Cross-league tracking has identified two high-pace wide players who fit the current transition profile.",
    createdAt: "2026-08-08T09:15:00.000Z",
    read: false,
    actionLabel: "Open transfers",
    actionHref: "/transfers"
  },
  {
    id: "note-medical-1",
    saveId,
    clubId,
    type: "medical",
    priority: "medium",
    title: "Left-side load needs a recovery block",
    summary: "The sports science report flags the fullback channel as the current fatigue hotspot before Summit.",
    createdAt: "2026-08-08T10:00:00.000Z",
    read: false,
    actionLabel: "Open training",
    actionHref: "/training"
  },
  {
    id: "note-contract-1",
    saveId,
    clubId,
    type: "contract",
    priority: "high",
    title: "Mateo Cross is entering a sensitive contract window",
    summary: "A renewal decision should be made before outside clubs can shape the negotiation environment.",
    createdAt: "2026-08-08T11:20:00.000Z",
    read: false,
    actionLabel: "Review squad",
    actionHref: "/squad"
  }
];

const pendingActions: PendingActionSummary = {
  clubId,
  total: 5,
  highPriority: 2,
  items: [
    {
      id: "pending-fixture",
      category: "fixture",
      priority: "medium",
      title: "Next fixture needs prep",
      summary: "League matchday 2 arrives on 2026-08-10 against Summit City.",
      href: "/fixtures"
    },
    {
      id: "pending-inbox",
      category: "inbox",
      priority: "high",
      title: "Inbox requires review",
      summary: `${unreadInbox} unread items are waiting for action.`,
      href: "/inbox"
    },
    {
      id: "pending-training",
      category: "training",
      priority: "medium",
      title: "Training load should be checked",
      summary: `Current focus is ${trainingPlan.focus} at ${trainingPlan.intensity}% intensity.`,
      href: "/training"
    },
    {
      id: "pending-contracts",
      category: "contracts",
      priority: "high",
      title: "Contract renewals are unresolved",
      summary: "2 first-team agreements need attention.",
      href: "/squad"
    },
    {
      id: "pending-scouting",
      category: "scouting",
      priority: "medium",
      title: "Scouting reports are ready",
      summary: "The current league crawl has produced real transfer targets across every rival squad.",
      href: "/transfers"
    }
  ]
};

export const dashboard: ClubDashboard = {
  club: harborClub,
  nextFixture: {
    fixtureId: "fx-3",
    opponentName: summitClub.name,
    home: true,
    competition: "league",
    date: "2026-08-10"
  },
  form: ["W", "W", "D", "L", "W"],
  morale: 74,
  fitness: 86,
  injuryCount: squad.filter((player) => player.squadStatus === "injured").length,
  transferBudget: harborClub.finances.transferBudget,
  wageBudget: harborClub.finances.wageBudget
};

function buildTransferItem(player: Player, index: number, direction: "incoming" | "outgoing"): TransferCenterItem {
  const counterpartyClubName = direction === "incoming" ? clubsById[player.clubId]!.name : summitClub.name;

  return {
    negotiation: {
      id: `negotiation-${direction}-${index}`,
      saveId,
      clubId,
      playerId: player.id,
      counterpartyClubId: direction === "incoming" ? player.clubId : summitClub.id,
      direction,
      status: "open",
      stage: index % 3 === 0 ? "countered" : index % 2 === 0 ? "bid-submitted" : "initial-contact",
      priority: index < 2 ? "priority" : index < 5 ? "active" : "monitor",
      askingPrice: Math.round(player.marketValue.amount * 1.12),
      latestOffer: Math.round(player.marketValue.amount * 0.94),
      wageDemand: player.contract.weeklyWage,
      probability: clamp(46 + index * 4, 40, 82),
      scoutConfidence: player.scouting.confidence,
      lastUpdated: `2026-08-0${Math.min(index + 2, 8)}`,
      summary:
        direction === "incoming"
          ? `${counterpartyClubName} would negotiate, but price discipline and squad role still matter.`
          : `${counterpartyClubName} have tested Harbor's resolve with an early approach.`,
      events: [
        {
          id: `transfer-event-${direction}-${index}`,
          date: "2026-08-07",
          type: "contact",
          title: direction === "incoming" ? "Initial contact made" : "External interest logged",
          summary: "The valuation range is now clearer after first contact.",
          amount: Math.round(player.marketValue.amount * 0.94)
        }
      ]
    },
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
    counterpartyClubName,
    estimatedValue: player.marketValue.amount
  };
}

const transferTargets = allPlayers
  .filter((player) => player.clubId !== clubId)
  .sort((left, right) => right.potential - left.potential || right.marketValue.amount - left.marketValue.amount)
  .slice(0, 8);

export const transferCenterPayload: TransferCenterPayload = {
  clubId,
  activeNegotiations: transferTargets.slice(0, 3).map((player, index) => buildTransferItem(player, index, "incoming")),
  incomingTargets: transferTargets.map((player, index) => buildTransferItem(player, index, "incoming")),
  outgoingOffers: squad.slice(0, 2).map((player, index) => buildTransferItem(player, index, "outgoing")),
  completedHistory: transferTargets.slice(3, 5).map((player, index) => {
    const item = buildTransferItem(player, index + 10, "incoming");
    return {
      ...item,
      negotiation: {
        ...item.negotiation,
        status: "closed",
        stage: "completed"
      }
    };
  })
};

export const matchTimeline = latestResult.result.events.map((event) => ({
  minute: event.minute,
  label: event.type === "goal" ? "Goal" : event.type === "chance-created" ? "Chance" : "Moment",
  text: event.description
}));

export function getFallbackSaveDashboard(currentSaveId = saveId): SaveDashboardPayload {
  return {
    save: {
      id: currentSaveId,
      name: "Founders Save",
      createdAt: "2026-04-08T12:00:00.000Z",
      active: true,
      clubId
    },
    season: {
      saveId: currentSaveId,
      seasonId: currentSeasonId,
      year: 2026,
      label: currentSeasonLabel,
      currentDate: "2026-08-08",
      phase: "league",
      currentMatchday: 2
    },
    dashboard,
    standings,
    inbox: inbox.slice(0, 6),
    pendingActions,
    boardPressure: {
      score: 63,
      level: "stable",
      summary: "A steady opening month keeps pressure manageable, but contract and workload decisions still matter."
    },
    scoutingUpdates: [
      {
        id: "scouting-update-wing",
        title: "Wide profile scan completed",
        summary: "League-wide test data now covers every rival squad, making recruitment comparisons more realistic.",
        href: "/transfers"
      }
    ],
    injuries: squad
      .filter((player) => player.squadStatus === "injured")
      .map((player) => ({
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        status: "concern" as const,
        summary: "Medical staff recommend reduced loading before the next match."
      })),
    contractIssues: [
      {
        playerId: `${clubId}-holding-mid`,
        playerName: `${squad.find((player) => player.id === `${clubId}-holding-mid`)?.firstName ?? "Mateo"} ${squad.find((player) => player.id === `${clubId}-holding-mid`)?.lastName ?? "Cross"}`,
        monthsRemaining: 8,
        priority: "high",
        summary: "A core midfield deal should be resolved before external interest escalates."
      },
      {
        playerId: `${clubId}-center-back-b`,
        playerName: `${squad.find((player) => player.id === `${clubId}-center-back-b`)?.firstName ?? "Felix"} ${squad.find((player) => player.id === `${clubId}-center-back-b`)?.lastName ?? "Doyle"}`,
        monthsRemaining: 11,
        priority: "medium",
        summary: "Depth planning and wage structure should be reviewed before winter."
      }
    ],
    unresolvedTasks: pendingActions.items.slice(0, 6)
  };
}

export const seasonAnalyticsPayload: SeasonAnalyticsPayload = {
  seasonId: currentSeasonId,
  seasonLabel: currentSeasonLabel,
  isHistorical: false,
  club: {
    clubId,
    clubName: allClubs.find((club) => club.id === clubId)?.name ?? "Harbor Athletic",
    position: standings.findIndex((row) => row.clubId === clubId) + 1,
    points: standings.find((row) => row.clubId === clubId)?.points ?? 0,
    wins: standings.find((row) => row.clubId === clubId)?.won ?? 0,
    draws: standings.find((row) => row.clubId === clubId)?.drawn ?? 0,
    losses: standings.find((row) => row.clubId === clubId)?.lost ?? 0,
    goalsFor: standings.find((row) => row.clubId === clubId)?.goalsFor ?? 0,
    goalsAgainst: standings.find((row) => row.clubId === clubId)?.goalsAgainst ?? 0,
    xgFor: standings.find((row) => row.clubId === clubId)?.xgFor ?? 0,
    xgAgainst: standings.find((row) => row.clubId === clubId)?.xgAgainst ?? 0,
    xgDifference: standings.find((row) => row.clubId === clubId)?.xgDifference ?? 0
  },
  playerLeaders: {
    topScorer: {
      playerId: `${clubId}-striker`,
      name: `${squad.find((player) => player.id === `${clubId}-striker`)?.firstName ?? "Luca"} ${squad.find((player) => player.id === `${clubId}-striker`)?.lastName ?? "Stone"}`,
      value: squad.find((player) => player.id === `${clubId}-striker`)?.seasonStats.goals ?? 0
    },
    topCreator: {
      playerId: `${clubId}-midfield-a`,
      name: `${squad.find((player) => player.id === `${clubId}-midfield-a`)?.firstName ?? "Noah"} ${squad.find((player) => player.id === `${clubId}-midfield-a`)?.lastName ?? "Vale"}`,
      value: squad.find((player) => player.id === `${clubId}-midfield-a`)?.seasonStats.assists ?? 0
    },
    topAverageRating: {
      playerId: `${clubId}-winger-left`,
      name: `${squad.find((player) => player.id === `${clubId}-winger-left`)?.firstName ?? "Rafa"} ${squad.find((player) => player.id === `${clubId}-winger-left`)?.lastName ?? "Silva"}`,
      value: squad.find((player) => player.id === `${clubId}-winger-left`)?.seasonStats.averageRating ?? 7.1
    }
  },
  league: {
    summary: leagueStandingsPayload.summary,
    topThree: standings.slice(0, 3)
  },
  tactics: {
    formation: tactics.formation,
    familiarity: 71,
    intensity: 63,
    projectedFitnessCost: 11,
    tacticalStyle: "Positive 4-3-3"
  },
  board: {
    score: 74,
    level: "stable",
    summary: "Board confidence is stable with clear expectations around playoff qualification and budget control.",
    expectations: ["Stay in playoff places", "Control wage growth", "Deliver visible squad progression"]
  },
  trends: [
    { label: "MD 1", points: 3, xgFor: 1.68, xgAgainst: 0.93, morale: 74, fitness: 84 },
    { label: "MD 2", points: 4, xgFor: 1.35, xgAgainst: 1.02, morale: 75, fitness: 82 },
    { label: "MD 3", points: 7, xgFor: 1.92, xgAgainst: 1.07, morale: 77, fitness: 80 }
  ],
  historicalComparison: [
    { seasonId: "season-2024", seasonLabel: "2024/25", position: 2, points: 10, goalsFor: 8, goalsAgainst: 7, xgFor: 8.2, xgAgainst: 7.4 },
    { seasonId: "season-2025", seasonLabel: "2025/26", position: 1, points: 13, goalsFor: 12, goalsAgainst: 7, xgFor: 11.6, xgAgainst: 7.9 },
    { seasonId: currentSeasonId, seasonLabel: currentSeasonLabel, position: 1, points: standings[0]?.points ?? 3, goalsFor: standings[0]?.goalsFor ?? 2, goalsAgainst: standings[0]?.goalsAgainst ?? 1, xgFor: standings[0]?.xgFor ?? 1.68, xgAgainst: standings[0]?.xgAgainst ?? 0.93 }
  ]
};

export const clubFinanceBoardPayload: ClubFinanceBoardPayload = {
  clubId,
  finances: {
    balance: 12_500_000,
    transferBudget: 4_500_000,
    wageBudget: 230_000
  },
  boardConfidence: {
    score: 74,
    level: "stable",
    summary: "Confidence is stable as long as league objectives and budget discipline hold.",
    expectations: ["Maintain playoff pace", "Protect budget flexibility", "Resolve key contracts"]
  },
  ownership: {
    model: "consortium",
    owners: ["Harbor Sports Group", "North Dock Partners"],
    investmentHorizon: "medium",
    summary: "Ownership supports targeted squad investment while requiring medium-term financial stability."
  },
  adjustmentRules: [
    {
      id: "fallback-conservative",
      label: "Conservative",
      detail: "Preserve liquidity and protect downside scenarios.",
      minTransferBudget: 2_000_000,
      maxTransferBudget: 4_000_000,
      minWageBudget: 190_000,
      maxWageBudget: 245_000
    },
    {
      id: "fallback-balanced",
      label: "Balanced",
      detail: "Default operating profile for this phase of the save.",
      minTransferBudget: 3_000_000,
      maxTransferBudget: 5_400_000,
      minWageBudget: 205_000,
      maxWageBudget: 275_000
    },
    {
      id: "fallback-aggressive",
      label: "Aggressive",
      detail: "Push short-term squad gains at higher risk.",
      minTransferBudget: 4_000_000,
      maxTransferBudget: 6_500_000,
      minWageBudget: 220_000,
      maxWageBudget: 310_000
    }
  ],
  investorEvents: [
    {
      id: "fallback-invest-1",
      occurredOn: "2026-07-14",
      title: "Infrastructure grant approved",
      summary: "Ownership approved targeted infrastructure investment for medical and analytics tooling.",
      impact: "positive",
      cashDelta: 450_000
    }
  ],
  longTermPlan: {
    horizonYears: 3,
    objectives: [
      "Keep wage growth aligned with projected revenue.",
      "Maintain positive transfer value over rolling windows.",
      "Preserve cash buffer for contract renewals."
    ],
    risks: [
      "Promotion miss lowers projected income.",
      "Multiple major renewals in one window can reduce flexibility."
    ]
  }
};
