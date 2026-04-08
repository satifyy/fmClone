import { describe, expect, it } from "vitest";

import type { MatchContext, Player } from "@fm/shared-types";

import { simulateMatch } from "../engine/simulate-match";

const createPlayer = (id: string, clubId: string, role: string, positions: Player["positions"]): Player => ({
  id,
  saveId: "save-1",
  clubId,
  firstName: "Test",
  lastName: id,
  age: 24,
  nationality: "Fictionland",
  preferredFoot: "right",
  positions,
  role,
  potential: 75,
  traits: [],
  condition: {
    morale: 70,
    chemistry: 65,
    fatigue: 10,
    fitness: 90,
    injuryRisk: 8,
    suspensionRisk: 4
  },
  attributes: {
    pace: 12,
    acceleration: 12,
    stamina: 12,
    strength: 12,
    finishing: 12,
    passing: 12,
    dribbling: 12,
    firstTouch: 12,
    vision: 12,
    tackling: 12,
    marking: 12,
    positioning: 12,
    composure: 12,
    decisions: 12,
    workRate: 12,
    reflexes: positions.includes("GK") ? 13 : undefined,
    handling: positions.includes("GK") ? 13 : undefined,
    aerialReach: positions.includes("GK") ? 13 : undefined,
    oneOnOnes: positions.includes("GK") ? 13 : undefined,
    kicking: positions.includes("GK") ? 13 : undefined
  }
});

const buildContext = (): MatchContext => {
  const homePlayers = [
    createPlayer("h-gk", "home", "Goalkeeper", ["GK"]),
    createPlayer("h-rb", "home", "Fullback", ["RB"]),
    createPlayer("h-cb1", "home", "Defender", ["CB"]),
    createPlayer("h-cb2", "home", "Defender", ["CB"]),
    createPlayer("h-lb", "home", "Fullback", ["LB"]),
    createPlayer("h-dm", "home", "Anchor", ["DM"]),
    createPlayer("h-cm1", "home", "Playmaker", ["CM"]),
    createPlayer("h-cm2", "home", "Mezzala", ["CM"]),
    createPlayer("h-rw", "home", "Winger", ["RW"]),
    createPlayer("h-lw", "home", "Inside Forward", ["LW"]),
    createPlayer("h-st", "home", "Striker", ["ST"])
  ];

  const awayPlayers = homePlayers.map((player) => ({
    ...player,
    id: player.id.replace("h-", "a-"),
    clubId: "away"
  }));

  return {
    fixture: {
      id: "fixture-1",
      competition: "league",
      date: "2026-08-10",
      homeClubId: "home",
      awayClubId: "away"
    },
    homeTeam: {
      clubId: "home",
      clubName: "Harbor Athletic",
      managerStyle: "pressing",
      chemistry: 70,
      morale: 72,
      lineup: homePlayers,
      bench: [],
      tactics: {
        formation: "4-3-3",
        instructions: {
          mentality: "positive",
          pressingIntensity: 70,
          tempo: 64,
          width: 58,
          defensiveLine: 60,
          directness: 48,
          timeWasting: 8
        },
        roles: homePlayers.map((player, index) => ({
          slot: `slot-${index}`,
          playerId: player.id,
          position: player.positions[0]!,
          role: player.role
        }))
      }
    },
    awayTeam: {
      clubId: "away",
      clubName: "Summit City",
      managerStyle: "balanced",
      chemistry: 68,
      morale: 68,
      lineup: awayPlayers,
      bench: [],
      tactics: {
        formation: "4-2-3-1",
        instructions: {
          mentality: "balanced",
          pressingIntensity: 56,
          tempo: 55,
          width: 52,
          defensiveLine: 52,
          directness: 51,
          timeWasting: 12
        },
        roles: awayPlayers.map((player, index) => ({
          slot: `slot-${index}`,
          playerId: player.id,
          position: player.positions[0]!,
          role: player.role
        }))
      }
    },
    environment: {
      homeAdvantage: 6,
      importance: "league"
    },
    seed: 12345
  };
};

describe("simulateMatch", () => {
  it("is deterministic for a fixed seed", () => {
    const context = buildContext();
    const first = simulateMatch(context);
    const second = simulateMatch(context);

    expect(second).toEqual(first);
  });

  it("produces a populated result shape", () => {
    const result = simulateMatch(buildContext());

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.playerRatings).toHaveLength(22);
    expect(result.stats.possession.home + result.stats.possession.away).toBe(100);
  });
});
