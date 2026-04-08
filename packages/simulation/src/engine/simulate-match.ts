import type {
  CardEvent,
  InjuryEvent,
  MatchContext,
  MatchEvent,
  MatchSimulationResult,
  MatchStats,
  Player,
  PlayerDelta,
  PlayerRating,
  TeamMatchState
} from "@fm/shared-types";

import { buildCheckpointNotes } from "../ai/reactions";
import { buildTeamStrengthProfile } from "../calculators/team-strength";
import { SeededRng } from "../models/rng";

type Side = "home" | "away";

type TeamFrame = {
  side: Side;
  team: TeamMatchState;
  attackWeight: number;
  controlWeight: number;
  shotQuality: number;
  disciplineRisk: number;
  injuryRisk: number;
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const windows = [
  { start: 1, end: 15 },
  { start: 16, end: 30 },
  { start: 31, end: 45 },
  { start: 46, end: 60 },
  { start: 61, end: 75 },
  { start: 76, end: 90 }
] as const;

const buildFrame = (side: Side, team: TeamMatchState, opposition: TeamMatchState, homeAdvantage: number): TeamFrame => {
  const strength = buildTeamStrengthProfile(team);
  const oppositionStrength = buildTeamStrengthProfile(opposition);
  const baseHomeBoost = side === "home" ? homeAdvantage : 0;

  return {
    side,
    team,
    attackWeight: clamp(strength.attack + strength.buildup * 0.4 - oppositionStrength.defense * 0.3 + baseHomeBoost, 5, 40),
    controlWeight: clamp(strength.buildup + strength.pressing * 0.25 - oppositionStrength.pressing * 0.1 + team.chemistry * 0.2, 10, 80),
    shotQuality: clamp((strength.attack - oppositionStrength.defense * 0.35) / 20, 0.06, 0.42),
    disciplineRisk: clamp(strength.disciplineRisk / 100, 0.03, 0.4),
    injuryRisk: clamp(strength.injuryRisk / 100, 0.01, 0.18)
  };
};

const chooseActor = (rng: SeededRng, players: Player[], key: keyof Player["attributes"]): Player => {
  const sorted = [...players].sort(
    (left, right) => (right.attributes[key] ?? 0) - (left.attributes[key] ?? 0)
  );
  const bias = Math.floor(rng.between(0, Math.min(sorted.length, 4)));
  return sorted[bias] ?? players[0]!;
};

const buildStats = (): MatchStats => ({
  possession: { home: 50, away: 50 },
  shots: { home: 0, away: 0 },
  shotsOnTarget: { home: 0, away: 0 },
  xg: { home: 0, away: 0 },
  corners: { home: 0, away: 0 },
  fouls: { home: 0, away: 0 }
});

const ratingImpact = (rating: number): PlayerRating["impact"] => {
  if (rating >= 8) {
    return "excellent";
  }

  if (rating >= 7) {
    return "good";
  }

  if (rating >= 6) {
    return "average";
  }

  return "poor";
};

export const simulateMatch = (context: MatchContext): MatchSimulationResult => {
  const rng = new SeededRng(context.seed);
  const events: MatchEvent[] = [];
  const cards: CardEvent[] = [];
  const injuries: InjuryEvent[] = [];
  const tacticalNotes = [];
  const score = { home: 0, away: 0 };
  const stats = buildStats();

  const homeFrame = buildFrame("home", context.homeTeam, context.awayTeam, context.environment.homeAdvantage);
  const awayFrame = buildFrame("away", context.awayTeam, context.homeTeam, context.environment.homeAdvantage);

  const totalControl = homeFrame.controlWeight + awayFrame.controlWeight;
  stats.possession.home = Math.round((homeFrame.controlWeight / totalControl) * 100);
  stats.possession.away = 100 - stats.possession.home;

  for (const window of windows) {
    const phases = Math.max(2, Math.round(rng.between(2, 5)));

    for (let phase = 0; phase < phases; phase += 1) {
      const actingSide: Side = rng.next() < homeFrame.attackWeight / (homeFrame.attackWeight + awayFrame.attackWeight) ? "home" : "away";
      const actingFrame = actingSide === "home" ? homeFrame : awayFrame;
      const defendingFrame = actingSide === "home" ? awayFrame : homeFrame;
      const minute = clamp(Math.round(rng.between(window.start, window.end)), window.start, window.end);

      const creator = chooseActor(rng, actingFrame.team.lineup, "vision");
      events.push({
        minute,
        team: actingSide,
        type: "chance-created",
        playerId: creator.id,
        description: `${actingFrame.team.clubName} create space through ${creator.firstName} ${creator.lastName}`
      });

      const xg = clamp(
        actingFrame.shotQuality + rng.between(-0.03, 0.08) - defendingFrame.disciplineRisk * 0.02,
        0.03,
        0.55
      );
      const finisher = chooseActor(rng, actingFrame.team.lineup, "finishing");
      const onTarget = rng.next() < clamp(finisher.attributes.composure / 30 + xg, 0.08, 0.8);

      stats.shots[actingSide] += 1;
      stats.xg[actingSide] = Number((stats.xg[actingSide] + xg).toFixed(2));

      events.push({
        minute,
        team: actingSide,
        type: "shot",
        playerId: finisher.id,
        description: `${finisher.firstName} ${finisher.lastName} gets the shot away`,
        xg
      });

      if (onTarget) {
        stats.shotsOnTarget[actingSide] += 1;
        events.push({
          minute,
          team: actingSide,
          type: "shot-on-target",
          playerId: finisher.id,
          description: `${finisher.firstName} ${finisher.lastName} forces a save`,
          xg
        });
      }

      const goalProbability = clamp(xg + finisher.attributes.finishing / 70 + actingFrame.team.morale / 200, 0.04, 0.7);
      if (onTarget && rng.next() < goalProbability) {
        score[actingSide] += 1;
        events.push({
          minute,
          team: actingSide,
          type: "goal",
          playerId: finisher.id,
          description: `${finisher.firstName} ${finisher.lastName} scores for ${actingFrame.team.clubName}`,
          xg
        });
      } else if (rng.next() < 0.28) {
        stats.corners[actingSide] += 1;
        events.push({
          minute,
          team: actingSide,
          type: "corner",
          playerId: creator.id,
          description: `${actingFrame.team.clubName} win a corner`
        });
      }

      if (rng.next() < actingFrame.disciplineRisk) {
        const defender = chooseActor(rng, defendingFrame.team.lineup, "tackling");
        stats.fouls[defendingFrame.side] += 1;
        events.push({
          minute,
          team: defendingFrame.side,
          type: "foul",
          playerId: defender.id,
          description: `${defender.firstName} ${defender.lastName} commits a foul`
        });

        if (rng.next() < 0.32) {
          const yellow: CardEvent = {
            playerId: defender.id,
            clubId: defender.clubId,
            minute,
            card: "yellow"
          };
          cards.push(yellow);
          events.push({
            minute,
            team: defendingFrame.side,
            type: "yellow-card",
            playerId: defender.id,
            description: `${defender.firstName} ${defender.lastName} is booked`
          });
        }

        if (rng.next() < 0.05) {
          const red: CardEvent = {
            playerId: defender.id,
            clubId: defender.clubId,
            minute,
            card: "red"
          };
          cards.push(red);
          events.push({
            minute,
            team: defendingFrame.side,
            type: "red-card",
            playerId: defender.id,
            description: `${defender.firstName} ${defender.lastName} is sent off`
          });
        }
      }

      if (rng.next() < actingFrame.injuryRisk) {
        const injured = chooseActor(rng, actingFrame.team.lineup, "stamina");
        const daysOut = Math.round(rng.between(4, 28));
        const injury: InjuryEvent = {
          playerId: injured.id,
          clubId: injured.clubId,
          minute,
          severity: daysOut < 8 ? "minor" : daysOut < 18 ? "moderate" : "major",
          daysOut
        };
        injuries.push(injury);
        events.push({
          minute,
          team: actingSide,
          type: "injury",
          playerId: injured.id,
          description: `${injured.firstName} ${injured.lastName} goes down injured`
        });
      }
    }

    if (window.end >= 45) {
      tacticalNotes.push(...buildCheckpointNotes(context, window.end, score));
    }
  }

  const playerRatings: PlayerRating[] = [...context.homeTeam.lineup, ...context.awayTeam.lineup].map((player) => {
    const involvedEvents = events.filter((event) => event.playerId === player.id);
    const goals = involvedEvents.filter((event) => event.type === "goal").length;
    const cardsCount = cards.filter((card) => card.playerId === player.id).length;
    const injuriesCount = injuries.filter((injury) => injury.playerId === player.id).length;
    const raw = 6 + goals * 0.9 + involvedEvents.length * 0.08 - cardsCount * 0.4 - injuriesCount * 0.5 + rng.between(-0.4, 0.5);
    const rating = Number(clamp(raw, 4.8, 9.4).toFixed(1));

    return {
      playerId: player.id,
      clubId: player.clubId,
      rating,
      impact: ratingImpact(rating)
    };
  });

  const playerDeltas: PlayerDelta[] = [...context.homeTeam.lineup, ...context.awayTeam.lineup].map((player) => {
    const scoreDelta =
      player.clubId === context.homeTeam.clubId
        ? score.home - score.away
        : score.away - score.home;

    return {
      playerId: player.id,
      moraleDelta: clamp(scoreDelta * 2 + rng.between(-1, 2), -4, 5),
      fatigueDelta: clamp(rng.between(4, 10), 3, 12),
      fitnessDelta: clamp(rng.between(1, 4), 1, 6)
    };
  });

  return {
    score,
    stats,
    events: events.sort((left, right) => left.minute - right.minute),
    playerRatings,
    injuries,
    cards,
    tacticalNotes,
    postMatchEffects: {
      playerDeltas,
      clubDeltas: [
        {
          clubId: context.homeTeam.clubId,
          moraleDelta: clamp(score.home - score.away, -2, 3)
        },
        {
          clubId: context.awayTeam.clubId,
          moraleDelta: clamp(score.away - score.home, -2, 3)
        }
      ]
    }
  };
};

