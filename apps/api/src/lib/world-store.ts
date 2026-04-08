import type {
  Club,
  ClubDashboard,
  Fixture,
  MatchContext,
  MatchSimulationResult,
  Player,
  SaveSummary,
  SeasonState,
  StandingRow,
  TacticalProfile
} from "@fm/shared-types";

import { simulateMatch } from "@fm/simulation";

const createId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

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

type World = {
  saves: SaveSummary[];
  activeSaveId?: string;
  season: SeasonState;
  clubs: Club[];
  players: Player[];
  fixtures: Fixture[];
  standings: StandingRow[];
  tactics: Record<string, TacticalProfile>;
  matches: MatchRecord[];
  trainingPlans: Record<string, TrainingPlan>;
  transferOffers: TransferOffer[];
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

const createPlayer = (
  saveId: string,
  clubId: string,
  id: string,
  role: string,
  positions: Player["positions"],
  boost = 0
): Player => ({
  id,
  saveId,
  clubId,
  firstName: id.split("-")[0] ?? "Alex",
  lastName: id.split("-")[1] ?? "Player",
  age: 21 + (boost % 8),
  nationality: "Fictionland",
  preferredFoot: boost % 2 === 0 ? "right" : "left",
  positions,
  role,
  potential: 70 + boost,
  traits: boost > 2 ? ["Big Matches"] : ["Workhorse"],
  condition: {
    morale: 68 + boost,
    chemistry: 64 + boost,
    fatigue: 8 + boost,
    fitness: 90 - boost,
    injuryRisk: 7 + boost,
    suspensionRisk: 4
  },
  attributes: buildAttributes(boost)
});

const baseTactics = (playerIds: Player[]): TacticalProfile => ({
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
  roles: playerIds.slice(0, 11).map((player, index) => ({
    slot: `slot-${index + 1}`,
    playerId: player.id,
    position: player.positions[0]!,
    role: player.role
  }))
});

const defaultTacticalProfile = (clubId: string, players: Player[]): TacticalProfile => ({
  formation: "4-3-3",
  instructions: {
    mentality: "balanced",
    pressingIntensity: 55,
    tempo: 55,
    width: 50,
    defensiveLine: 50,
    directness: 50,
    timeWasting: 10
  },
  roles: players.slice(0, 11).map((player, index) => ({
    slot: `${clubId}-slot-${index + 1}`,
    playerId: player.id,
    position: player.positions[0]!,
    role: player.role
  }))
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
    ["bench-mid", "Midfielder", ["CM"], 0],
    ["bench-wing", "Winger", ["LW"], 1]
  ];

  const players = clubs.flatMap((club, clubIndex) =>
    squadTemplate.map(([slug, role, positions, boost], playerIndex) =>
      createPlayer(saveId, club.id, `${slug}-${clubIndex + 1}-${playerIndex + 1}`, role, positions, boost + clubIndex)
    )
  );

  const fixtures: Fixture[] = [
    {
      id: "fx-1",
      saveId,
      competition: "league",
      matchday: 1,
      date: "2026-08-10",
      homeClubId: "club-harbor",
      awayClubId: "club-summit",
      status: "scheduled"
    },
    {
      id: "fx-2",
      saveId,
      competition: "league",
      matchday: 1,
      date: "2026-08-10",
      homeClubId: "club-riverside",
      awayClubId: "club-ironvale",
      status: "scheduled"
    }
  ];

  const standings = clubs.map((club) => ({
    clubId: club.id,
    clubName: club.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));

  const tactics = Object.fromEntries(
    clubs.map((club) => [
      club.id,
      baseTactics(players.filter((player) => player.clubId === club.id))
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
      seasonId: "season-2026",
      year: 2026,
      currentDate: "2026-08-08",
      phase: "league",
      currentMatchday: 1
    },
    clubs,
    players,
    fixtures,
    standings,
    tactics,
    matches: [],
    trainingPlans,
    transferOffers: []
  };
};

export class WorldStore {
  private world: World;

  constructor() {
    this.world = createInitialWorld();
  }

  listSaves(): SaveSummary[] {
    return this.world.saves;
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
    return save;
  }

  activateSave(saveId: string): SaveSummary | undefined {
    for (const save of this.world.saves) {
      save.active = save.id === saveId;
    }

    this.world.activeSaveId = saveId;
    return this.world.saves.find((save) => save.id === saveId);
  }

  getSeason(): SeasonState {
    return this.world.season;
  }

  getStandings(): StandingRow[] {
    return [...this.world.standings].sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }

      return right.goalDifference - left.goalDifference;
    });
  }

  getClub(clubId: string): Club | undefined {
    return this.world.clubs.find((club) => club.id === clubId);
  }

  listClubs(): Club[] {
    return this.world.clubs;
  }

  getClubPlayers(clubId: string): Player[] {
    return this.world.players.filter((player) => player.clubId === clubId);
  }

  getPlayer(playerId: string): Player | undefined {
    return this.world.players.find((player) => player.id === playerId);
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
    return this.world.tactics[clubId];
  }

  updateTactics(clubId: string, profile: TacticalProfile): TacticalProfile {
    this.world.tactics[clubId] = profile;
    return profile;
  }

  getTrainingPlan(clubId: string): TrainingPlan | undefined {
    return this.world.trainingPlans[clubId];
  }

  updateTrainingPlan(clubId: string, focus: TrainingPlan["focus"], intensity: number): TrainingPlan {
    const plan = { clubId, focus, intensity };
    this.world.trainingPlans[clubId] = plan;
    return plan;
  }

  getUpcomingFixtures(): Fixture[] {
    return this.world.fixtures.filter((fixture) => fixture.status !== "simulated");
  }

  getMatch(matchId: string): MatchRecord | undefined {
    return this.world.matches.find((match) => match.id === matchId);
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
        tactics: this.world.tactics[homeClub.id] ?? defaultTacticalProfile(homeClub.id, homePlayers)
      },
      awayTeam: {
        clubId: awayClub.id,
        clubName: awayClub.name,
        managerStyle: awayClub.styleIdentity,
        chemistry: Math.round(awayPlayers.reduce((sum, player) => sum + player.condition.chemistry, 0) / 11),
        morale: Math.round(awayPlayers.reduce((sum, player) => sum + player.condition.morale, 0) / 11),
        lineup: awayPlayers.slice(0, 11),
        bench: awayPlayers.slice(11),
        tactics: this.world.tactics[awayClub.id] ?? defaultTacticalProfile(awayClub.id, awayPlayers)
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
    return record;
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

  advanceDay(): SeasonState {
    const date = new Date(this.world.season.currentDate);
    date.setUTCDate(date.getUTCDate() + 1);
    this.world.season.currentDate = date.toISOString().slice(0, 10);
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
    return { results, standings: this.getStandings() };
  }

  getTransferTargets(clubId: string): Player[] {
    return this.world.players
      .filter((player) => player.clubId !== clubId)
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
    return offer;
  }

  respondToTransferOffer(offerId: string, accept: boolean): TransferOffer | undefined {
    const offer = this.world.transferOffers.find((item) => item.id === offerId);
    if (!offer) {
      return undefined;
    }

    offer.status = accept ? "accepted" : "rejected";
    if (accept) {
      const player = this.getPlayer(offer.playerId);
      if (player) {
        player.clubId = offer.toClubId;
      }
    }

    return offer;
  }

  listTransferHistory(): TransferOffer[] {
    return this.world.transferOffers.filter((offer) => offer.status !== "pending");
  }

  seedWorld(): World {
    this.world = createInitialWorld();
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
}

export const worldStore = new WorldStore();
