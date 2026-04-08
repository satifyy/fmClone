import type { ClubDashboard, Fixture, Player, StandingRow, TacticalProfile } from "@fm/shared-types";

export const clubId = "club-harbor";

export const dashboard: ClubDashboard = {
  club: {
    id: clubId,
    saveId: "save-alpha",
    name: "Harbor Athletic",
    shortName: "HAA",
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
    fixtureId: "fx-1",
    opponentName: "Summit City",
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
  { clubId: "club-ironvale", clubName: "Ironvale United", played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 0, goalDifference: 2, points: 3 },
  { clubId, clubName: "Harbor Athletic", played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 1, goalsAgainst: 0, goalDifference: 1, points: 3 },
  { clubId: "club-summit", clubName: "Summit City", played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 1, goalDifference: -1, points: 0 },
  { clubId: "club-riverside", clubName: "Riverside FC", played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 2, goalDifference: -2, points: 0 }
];

export const fixtures: Fixture[] = [
  {
    id: "fx-1",
    saveId: "save-alpha",
    competition: "league",
    matchday: 2,
    date: "2026-08-10",
    homeClubId: clubId,
    awayClubId: "club-summit",
    status: "scheduled"
  },
  {
    id: "fx-2",
    saveId: "save-alpha",
    competition: "league",
    matchday: 2,
    date: "2026-08-17",
    homeClubId: "club-ironvale",
    awayClubId: clubId,
    status: "scheduled"
  }
];

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

