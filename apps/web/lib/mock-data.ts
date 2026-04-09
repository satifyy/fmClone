import type {
  ClubDashboard,
  Fixture,
  FixtureResultSummary,
  InboxNotification,
  MatchDetail,
  MatchEvent,
  PendingActionSummary,
  Player,
  SaveDashboardPayload,
  StandingRow,
  TacticalProfile
} from "@fm/shared-types";
import type { TrainingPlan } from "@fm/shared-types";

export const clubId = "club-harbor";

const clubs = {
  "club-harbor": { id: "club-harbor", name: "Harbor Athletic", shortName: "HAA" },
  "club-summit": { id: "club-summit", name: "Summit City", shortName: "SUM" },
  "club-riverside": { id: "club-riverside", name: "Riverside FC", shortName: "RIV" },
  "club-ironvale": { id: "club-ironvale", name: "Ironvale United", shortName: "IRN" }
} as const;

type ClubKey = keyof typeof clubs;

const buildScoreboardFixture = ({
  fixtureId,
  seasonId = "season-2026",
  competition,
  matchday,
  date,
  status,
  homeClubId,
  awayClubId,
  score,
  matchId,
  playedAt
}: {
  fixtureId: string;
  seasonId?: string;
  competition: Fixture["competition"];
  matchday: number;
  date: string;
  status: Fixture["status"];
  homeClubId: ClubKey;
  awayClubId: ClubKey;
  score?: { home: number; away: number };
  matchId?: string;
  playedAt?: string;
}): FixtureResultSummary => ({
  fixtureId,
  seasonId,
  competition,
  matchday,
  date,
  status,
  phase: status === "simulated" ? "completed" : status === "postponed" ? "postponed" : "upcoming",
  homeClub: clubs[homeClubId],
  awayClub: clubs[awayClubId],
  score,
  matchId,
  playedAt
});

const harborResultEvents: MatchEvent[] = [
  {
    minute: 8,
    team: "home",
    type: "chance-created",
    playerId: "winger-left-1-10",
    description: "Harbor break the first line and Stone cannot keep his volley under the bar.",
    xg: 0.18
  },
  {
    minute: 33,
    team: "home",
    type: "goal",
    playerId: "striker-1",
    secondaryPlayerId: "holding-mid-1",
    description: "Stone finishes from eight yards after Cross wins the second ball.",
    xg: 0.29
  },
  {
    minute: 54,
    team: "away",
    type: "shot-on-target",
    description: "Riverside test Vale low to his right after a fast switch.",
    xg: 0.11
  },
  {
    minute: 61,
    team: "home",
    type: "tactical-shift",
    description: "Harbor drop the tempo and protect the central lane with a flatter midfield line."
  },
  {
    minute: 78,
    team: "away",
    type: "corner",
    description: "Riverside pin Harbor back for two corners in the same phase."
  }
];

const buildPlayerMeta = ({
  squadStatus,
  value,
  formScore,
  formSummary,
  contractStatus,
  role,
  averageRating,
  goals,
  assists,
  cleanSheets
}: {
  squadStatus: Player["squadStatus"];
  value: number;
  formScore: number;
  formSummary: string;
  contractStatus: Player["contract"]["squadStatus"];
  role: string;
  averageRating: number;
  goals: number;
  assists: number;
  cleanSheets: number;
}) => ({
  squadStatus,
  marketValue: {
    amount: value,
    currency: "USD" as const,
    trend: "rising" as const,
    confidence: 82
  },
  recentForm: {
    score: formScore,
    trend: "up" as const,
    summary: formSummary,
    recentRatings: [7.1, 7.4, averageRating],
    minutes: 270,
    goalContributions: goals + assists,
    cleanSheets
  },
  contract: {
    expiresOn: "2028-06-30",
    yearsRemaining: 2,
    weeklyWage: 18000,
    squadStatus: contractStatus
  },
  roleFit: {
    score: 84,
    tacticalRole: role,
    summary: `${role} fits the current game model cleanly.`
  },
  development: {
    trajectory: "steady" as const,
    trend: "up" as const,
    recentGrowth: 2,
    ceiling: 84,
    summary: "Progress is stable with regular first-team minutes."
  },
  seasonStats: {
    appearances: 1,
    starts: 1,
    minutes: 90,
    goals,
    assists,
    cleanSheets,
    averageRating
  },
  history: [
    {
      season: "2025/26",
      clubName: clubs["club-harbor"].name,
      competition: "League",
      appearances: 28,
      goals,
      assists,
      averageRating,
      minutes: 2260
    }
  ],
  injuries: [],
  scouting: {
    scope: "full" as const,
    confidence: 96,
    lastUpdated: "2026-08-08",
    summary: "Fully known first-team player.",
    knownStrengths: ["Reliability", "Tactical fit"],
    unknowns: []
  }
});

export const dashboard: ClubDashboard = {
  club: {
    id: clubId,
    saveId: "save-alpha",
    name: clubs["club-harbor"].name,
    shortName: clubs["club-harbor"].shortName,
    reputation: 66,
    finances: {
      balance: 12500000,
      wageBudget: 230000,
      transferBudget: 4500000
    },
    facilities: 68,
    coaching: 70,
    academy: 64,
    boardExpectation: "Reach playoffs",
    styleIdentity: "pressing",
    userControlled: true
  },
  nextFixture: {
    fixtureId: "fx-3",
    opponentName: clubs["club-summit"].name,
    home: true,
    competition: "league",
    date: "2026-08-10"
  },
  form: ["W", "D", "L", "W", "W"],
  morale: 72,
  fitness: 88,
  injuryCount: 1,
  transferBudget: 4500000,
  wageBudget: 230000
};

export const inbox: InboxNotification[] = [
  {
    id: "inbox-board-opening-points",
    saveId: "save-alpha",
    clubId,
    type: "board",
    priority: "high",
    title: "Board want early points on the board",
    summary: "Harbor are expected to stay in the top two through the opening month. Dropping points to Summit will raise pressure quickly.",
    createdAt: "2026-08-08T08:00:00.000Z",
    read: false,
    actionLabel: "View season context",
    actionHref: "/season-summary"
  },
  {
    id: "inbox-scout-winger",
    saveId: "save-alpha",
    clubId,
    type: "scouting",
    priority: "medium",
    title: "Scouting pass completed on a right-sided winger",
    summary: "Analysts rate Luka Mercer as a realistic upgrade if you want more direct pace before the next window decision.",
    createdAt: "2026-08-08T09:15:00.000Z",
    read: false,
    actionLabel: "Open transfers",
    actionHref: "/transfers"
  },
  {
    id: "inbox-medical-workload",
    saveId: "save-alpha",
    clubId,
    type: "medical",
    priority: "medium",
    title: "Left side workload flagged by sports science",
    summary: "The current training load is leaving the fullback unit exposed. A recovery block before matchday would cut injury risk.",
    createdAt: "2026-08-08T10:00:00.000Z",
    read: false,
    actionLabel: "Open training",
    actionHref: "/training"
  },
  {
    id: "inbox-contract-cross",
    saveId: "save-alpha",
    clubId,
    type: "contract",
    priority: "high",
    title: "Mateo Cross has entered the final year of his deal",
    summary: "The holding midfielder can be approached freely in January unless you open talks soon.",
    createdAt: "2026-08-08T11:20:00.000Z",
    read: false,
    actionLabel: "Review squad",
    actionHref: "/squad"
  }
];

export const trainingPlan: TrainingPlan = {
  clubId,
  focus: "balanced",
  intensity: 55
};

export const squad: Player[] = [
  {
    id: "keeper-one-1",
    saveId: "save-alpha",
    clubId,
    firstName: "Noah",
    lastName: "Vale",
    age: 26,
    nationality: "Fictionland",
    preferredFoot: "right",
    positions: ["GK"],
    role: "Goalkeeper",
    potential: 74,
    traits: ["Command Area"],
    condition: {
      morale: 73,
      chemistry: 67,
      fatigue: 8,
      fitness: 91,
      injuryRisk: 7,
      suspensionRisk: 2
    },
    ...buildPlayerMeta({
      squadStatus: "starters",
      value: 2200000,
      formScore: 7.6,
      formSummary: "Controlled the box and saved Harbor late.",
      contractStatus: "regular starter",
      role: "Goalkeeper",
      averageRating: 7.7,
      goals: 0,
      assists: 0,
      cleanSheets: 1
    }),
    attributes: {
      pace: 8,
      acceleration: 9,
      stamina: 11,
      strength: 12,
      finishing: 4,
      passing: 11,
      dribbling: 7,
      firstTouch: 10,
      vision: 10,
      tackling: 6,
      marking: 8,
      positioning: 13,
      composure: 12,
      decisions: 12,
      workRate: 11,
      reflexes: 14,
      handling: 13,
      aerialReach: 13,
      oneOnOnes: 14,
      kicking: 12
    }
  },
  {
    id: "holding-mid-1",
    saveId: "save-alpha",
    clubId,
    firstName: "Mateo",
    lastName: "Cross",
    age: 23,
    nationality: "Fictionland",
    preferredFoot: "left",
    positions: ["DM", "CM"],
    role: "Anchor",
    potential: 78,
    traits: ["Workhorse"],
    condition: {
      morale: 70,
      chemistry: 69,
      fatigue: 14,
      fitness: 87,
      injuryRisk: 9,
      suspensionRisk: 6
    },
    ...buildPlayerMeta({
      squadStatus: "starters",
      value: 3400000,
      formScore: 7.3,
      formSummary: "Set the press and screened transitions well.",
      contractStatus: "regular starter",
      role: "Anchor",
      averageRating: 7.5,
      goals: 0,
      assists: 1,
      cleanSheets: 1
    }),
    attributes: {
      pace: 11,
      acceleration: 11,
      stamina: 14,
      strength: 13,
      finishing: 8,
      passing: 13,
      dribbling: 10,
      firstTouch: 12,
      vision: 13,
      tackling: 14,
      marking: 13,
      positioning: 13,
      composure: 12,
      decisions: 13,
      workRate: 15
    }
  },
  {
    id: "striker-1",
    saveId: "save-alpha",
    clubId,
    firstName: "Ilias",
    lastName: "Stone",
    age: 22,
    nationality: "Fictionland",
    preferredFoot: "right",
    positions: ["ST"],
    role: "Advanced Forward",
    potential: 82,
    traits: ["Big Matches"],
    condition: {
      morale: 76,
      chemistry: 66,
      fatigue: 11,
      fitness: 89,
      injuryRisk: 8,
      suspensionRisk: 4
    },
    ...buildPlayerMeta({
      squadStatus: "starters",
      value: 5100000,
      formScore: 8,
      formSummary: "Provided the match-winning run and finish.",
      contractStatus: "regular starter",
      role: "Advanced Forward",
      averageRating: 8.2,
      goals: 1,
      assists: 0,
      cleanSheets: 0
    }),
    attributes: {
      pace: 14,
      acceleration: 14,
      stamina: 12,
      strength: 12,
      finishing: 15,
      passing: 10,
      dribbling: 13,
      firstTouch: 14,
      vision: 11,
      tackling: 6,
      marking: 5,
      positioning: 14,
      composure: 14,
      decisions: 13,
      workRate: 11
    }
  }
];

export const standings: StandingRow[] = [
  {
    clubId: "club-ironvale",
    clubName: clubs["club-ironvale"].name,
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 2,
    goalsAgainst: 0,
    goalDifference: 2,
    points: 3
  },
  {
    clubId,
    clubName: clubs["club-harbor"].name,
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 1,
    goalsAgainst: 0,
    goalDifference: 1,
    points: 3
  },
  {
    clubId: "club-summit",
    clubName: clubs["club-summit"].name,
    played: 1,
    won: 0,
    drawn: 0,
    lost: 1,
    goalsFor: 0,
    goalsAgainst: 1,
    goalDifference: -1,
    points: 0
  },
  {
    clubId: "club-riverside",
    clubName: clubs["club-riverside"].name,
    played: 1,
    won: 0,
    drawn: 0,
    lost: 1,
    goalsFor: 0,
    goalsAgainst: 2,
    goalDifference: -2,
    points: 0
  }
];

const pendingActions: PendingActionSummary = {
  clubId,
  total: 5,
  highPriority: 3,
  items: [
    {
      id: "pending-fixture",
      category: "fixture",
      priority: "medium",
      title: "Next fixture needs prep",
      summary: "LEAGUE matchday 1 lands on 2026-08-10.",
      href: "/fixtures"
    },
    {
      id: "pending-inbox",
      category: "inbox",
      priority: "high",
      title: "Inbox requires review",
      summary: "4 unread items are waiting for action.",
      href: "/inbox"
    },
    {
      id: "pending-training",
      category: "training",
      priority: "medium",
      title: "Training load should be checked",
      summary: "Current focus is balanced at 55% intensity.",
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
      summary: "Fresh recruitment notes can be converted into transfer decisions now.",
      href: "/transfers"
    }
  ]
};

export function getFallbackSaveDashboard(saveId = "save-alpha"): SaveDashboardPayload {
  return {
    save: {
      id: saveId,
      name: "Founders Save",
      createdAt: "2026-04-08T12:00:00.000Z",
      active: true,
      clubId
    },
    season: {
      saveId,
      seasonId: "season-2026",
      year: 2026,
      label: "2026/27",
      currentDate: "2026-08-08",
      phase: "league",
      currentMatchday: 1
    },
    dashboard,
    standings,
    inbox: inbox.slice(0, 6),
    pendingActions,
    boardPressure: {
      score: 64,
      level: "stable",
      summary: "Opening results and contract handling will define the next board review."
    },
    scoutingUpdates: [
      {
        id: "scouting-winger-shortlist",
        title: "Wide attacker shortlist updated",
        summary: "A direct right winger has been identified as a realistic next-window target.",
        href: "/transfers"
      }
    ],
    injuries: [
      {
        playerId: "fullback-left-1",
        playerName: "Adrian Frost",
        status: "concern",
        summary: "Heavy recent load. Reduce intensity before the Summit match."
      }
    ],
    contractIssues: [
      {
        playerId: "holding-mid-1",
        playerName: "Mateo Cross",
        monthsRemaining: 8,
        priority: "high",
        summary: "Extension talks should begin before outside approaches become realistic."
      },
      {
        playerId: "center-back-2",
        playerName: "Felix Doyle",
        monthsRemaining: 11,
        priority: "medium",
        summary: "Review squad role and wage demands before the winter window."
      }
    ],
    unresolvedTasks: pendingActions.items.slice(0, 6),
    latestRoundResults: []
  };
}

export const fixtures: Fixture[] = [
  {
    id: "fx-3",
    saveId: "save-alpha",
    seasonId: "season-2026",
    competition: "league",
    matchday: 2,
    date: "2026-08-10",
    homeClubId: clubId,
    awayClubId: "club-summit",
    status: "scheduled"
  },
  {
    id: "fx-4",
    saveId: "save-alpha",
    seasonId: "season-2026",
    competition: "league",
    matchday: 2,
    date: "2026-08-10",
    homeClubId: "club-ironvale",
    awayClubId: "club-riverside",
    status: "scheduled"
  }
];

export const leagueScoreboard = [
  {
    title: "Matchday 2",
    subtitle: "Current league slate",
    fixtures: [
      buildScoreboardFixture({
        fixtureId: "fx-3",
        competition: "league",
        matchday: 2,
        date: "2026-08-10",
        status: "scheduled",
        homeClubId: "club-harbor",
        awayClubId: "club-summit"
      }),
      buildScoreboardFixture({
        fixtureId: "fx-4",
        competition: "league",
        matchday: 2,
        date: "2026-08-10",
        status: "scheduled",
        homeClubId: "club-ironvale",
        awayClubId: "club-riverside"
      })
    ]
  },
  {
    title: "Matchday 1",
    subtitle: "Completed round",
    fixtures: [
      buildScoreboardFixture({
        fixtureId: "fx-1",
        competition: "league",
        matchday: 1,
        date: "2026-08-03",
        status: "simulated",
        homeClubId: "club-harbor",
        awayClubId: "club-riverside",
        score: { home: 1, away: 0 },
        matchId: "match-harbor-riverside",
        playedAt: "2026-08-03"
      }),
      buildScoreboardFixture({
        fixtureId: "fx-2",
        competition: "league",
        matchday: 1,
        date: "2026-08-03",
        status: "simulated",
        homeClubId: "club-ironvale",
        awayClubId: "club-summit",
        score: { home: 2, away: 0 },
        matchId: "match-ironvale-summit",
        playedAt: "2026-08-03"
      })
    ]
  }
];

export const liveMatchCenter = {
  matchday: 2,
  date: "2026-08-10",
  headline: {
    fixtureId: "fx-3",
    matchId: "live-harbor-summit",
    state: "live" as const,
    minute: 67,
    homeClub: clubs["club-harbor"],
    awayClub: clubs["club-summit"],
    score: { home: 2, away: 1 },
    note: "Harbor have tilted the second half back their way after Summit equalized before the break."
  },
  slate: [
    {
      fixtureId: "fx-3",
      matchId: "live-harbor-summit",
      state: "live" as const,
      minute: 67,
      homeClub: clubs["club-harbor"],
      awayClub: clubs["club-summit"],
      score: { home: 2, away: 1 }
    },
    {
      fixtureId: "fx-4",
      matchId: "live-ironvale-riverside",
      state: "final" as const,
      minute: 90,
      homeClub: clubs["club-ironvale"],
      awayClub: clubs["club-riverside"],
      score: { home: 1, away: 1 }
    }
  ],
  keyMoments: [
    { minute: 12, label: "Chance", text: "Stone drifts off the center back and bends a shot wide." },
    { minute: 28, label: "Goal", text: "Harbor score first from a second-phase cutback after a corner." },
    { minute: 44, label: "Equalizer", text: "Summit slip a runner through the inside-right channel to make it 1-1." },
    { minute: 58, label: "Goal", text: "Stone restores the lead with a first-time finish at the back post." },
    { minute: 64, label: "Pressure", text: "Summit begin crossing earlier, forcing Harbor into a lower block." }
  ],
  watchPanels: [
    {
      title: "Your match",
      value: "Harbor 2-1 Summit",
      detail: "Lead protected through a more cautious midfield screen."
    },
    {
      title: "Other result",
      value: "Ironvale 1-1 Riverside",
      detail: "Riverside steal a point late and keep the table compressed."
    },
    {
      title: "Table swing",
      value: "Harbor live 1st",
      detail: "A win here would move Harbor level on points and ahead on goals scored."
    }
  ]
};

export const latestResult: MatchDetail = {
  id: "match-harbor-riverside",
  fixtureId: "fx-1",
  playedAt: "2026-08-03",
  result: {
    score: { home: 1, away: 0 },
    stats: {
      possession: { home: 54, away: 46 },
      shots: { home: 13, away: 8 },
      shotsOnTarget: { home: 5, away: 3 },
      xg: { home: 1.42, away: 0.71 },
      corners: { home: 6, away: 4 },
      fouls: { home: 11, away: 13 }
    },
    events: harborResultEvents,
    playerRatings: [
      { playerId: "striker-1", clubId, rating: 8.2, impact: "excellent" },
      { playerId: "holding-mid-1", clubId, rating: 7.5, impact: "good" },
      { playerId: "keeper-one-1", clubId, rating: 7.7, impact: "good" }
    ],
    injuries: [],
    cards: [{ playerId: "holding-mid-1", clubId, minute: 71, card: "yellow" }],
    tacticalNotes: [
      { team: "home", minute: 61, note: "Harbor lowered tempo and protected rest defense after taking the lead." }
    ],
    postMatchEffects: {
      playerDeltas: [
        { playerId: "striker-1", moraleDelta: 4, fatigueDelta: 8, fitnessDelta: 3 },
        { playerId: "holding-mid-1", moraleDelta: 2, fatigueDelta: 9, fitnessDelta: 4 }
      ],
      clubDeltas: [{ clubId, moraleDelta: 3 }]
    }
  },
  eventFeed: {
    mode: "post-match",
    isLive: false,
    availableModes: ["post-match", "stepwise", "live"],
    events: harborResultEvents
  }
};

export const resultView = {
  match: latestResult,
  competition: "League",
  matchday: 1,
  date: "2026-08-03",
  homeClub: clubs["club-harbor"],
  awayClub: clubs["club-riverside"],
  summary: "Harbor controlled territory for most of the second half and closed out the opener without chasing extra risk.",
  standoutLines: [
    "Stone scored the only goal from 0.29 xG at 33'.",
    "Vale prevented the equalizer with two saves from central shots.",
    "Cross set the pressing line and then helped flatten the block after the break."
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
    { slot: "gk", playerId: "keeper-one-1", position: "GK", role: "Goalkeeper" },
    { slot: "dm", playerId: "holding-mid-1", position: "DM", role: "Anchor" },
    { slot: "st", playerId: "striker-1", position: "ST", role: "Advanced Forward" }
  ]
};

export const matchTimeline = [
  { minute: 12, label: "Chance", text: "Stone bends the back line and drags a shot wide." },
  { minute: 33, label: "Goal", text: "Harbor break pressure. Stone finishes from eight yards." },
  { minute: 61, label: "Shift", text: "Tempo comes down. The midfield line starts screening second balls." },
  { minute: 78, label: "Save", text: "Vale tips a low drive around the post." }
];
