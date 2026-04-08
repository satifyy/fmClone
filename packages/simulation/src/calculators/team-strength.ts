import type { Player, TeamMatchState } from "@fm/shared-types";

const average = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const outfieldPlayers = (players: Player[]): Player[] =>
  players.filter((player) => !player.positions.includes("GK"));

export type TeamStrengthProfile = {
  attack: number;
  buildup: number;
  defense: number;
  pressing: number;
  setPieces: number;
  disciplineRisk: number;
  injuryRisk: number;
  fatigueBurn: number;
};

export const buildTeamStrengthProfile = (team: TeamMatchState): TeamStrengthProfile => {
  const outfield = outfieldPlayers(team.lineup);
  const keeper = team.lineup.find((player) => player.positions.includes("GK"));
  const instructions = team.tactics.instructions;

  const attack =
    average(outfield.map((player) => player.attributes.finishing + player.attributes.composure)) / 2 +
    instructions.tempo * 0.15 +
    team.morale * 0.1;

  const buildup =
    average(outfield.map((player) => player.attributes.passing + player.attributes.vision + player.attributes.firstTouch)) / 3 +
    instructions.width * 0.1 +
    team.chemistry * 0.2;

  const defense =
    average(outfield.map((player) => player.attributes.tackling + player.attributes.marking + player.attributes.positioning)) / 3 +
    (keeper?.attributes.positioning ?? 10) * 0.8;

  const pressing =
    average(outfield.map((player) => player.attributes.workRate + player.attributes.stamina)) / 2 +
    instructions.pressingIntensity * 0.4;

  const setPieces = average(outfield.map((player) => player.attributes.passing + player.attributes.vision)) / 2;
  const disciplineRisk = Math.max(5, 20 - average(outfield.map((player) => player.attributes.decisions)));
  const injuryRisk = average(team.lineup.map((player) => player.condition.injuryRisk + player.condition.fatigue * 0.2));
  const fatigueBurn = instructions.tempo * 0.15 + instructions.pressingIntensity * 0.25 + instructions.directness * 0.05;

  return {
    attack,
    buildup,
    defense,
    pressing,
    setPieces,
    disciplineRisk,
    injuryRisk,
    fatigueBurn
  };
};

