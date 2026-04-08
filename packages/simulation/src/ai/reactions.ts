import type { MatchContext, TacticalNote } from "@fm/shared-types";

type ScoreState = {
  home: number;
  away: number;
};

export const buildCheckpointNotes = (
  context: MatchContext,
  minute: number,
  score: ScoreState
): TacticalNote[] => {
  const notes: TacticalNote[] = [];

  if (minute < 45) {
    return notes;
  }

  if (score.home < score.away) {
    notes.push({
      team: "home",
      minute,
      note: `${context.homeTeam.clubName} increase risk and attacking intent`
    });
  }

  if (score.away < score.home) {
    notes.push({
      team: "away",
      minute,
      note: `${context.awayTeam.clubName} push higher and chase the match`
    });
  }

  if (score.home > score.away) {
    notes.push({
      team: "home",
      minute,
      note: `${context.homeTeam.clubName} protect the lead with lower risk`
    });
  }

  if (score.away > score.home) {
    notes.push({
      team: "away",
      minute,
      note: `${context.awayTeam.clubName} protect the lead with lower risk`
    });
  }

  return notes;
};

