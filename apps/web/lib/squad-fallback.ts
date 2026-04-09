import type { ClubSquad, Player, PlayerSquadStatus } from "@fm/shared-types";

import { clubId, squad } from "./test-data";

const groupMeta: Record<PlayerSquadStatus, { label: string; description: string }> = {
  starters: {
    label: "Starters",
    description: "Current first-choice selection from the fallback dataset."
  },
  bench: {
    label: "Bench",
    description: "Immediate rotation and matchday cover."
  },
  reserves: {
    label: "Reserves",
    description: "Depth options outside the current matchday group."
  },
  injured: {
    label: "Injured",
    description: "Unavailable through fitness concerns."
  },
  suspended: {
    label: "Suspended",
    description: "Unavailable through disciplinary status."
  }
};

export function getFallbackClubSquad(): ClubSquad {
  const players = squad as Player[];
  const groups = (Object.keys(groupMeta) as PlayerSquadStatus[]).map((status) => ({
    status,
    label: groupMeta[status].label,
    description: groupMeta[status].description,
    players: players.filter((player) => player.squadStatus === status)
  }));

  return {
    clubId,
    formation: "4-3-3",
    players,
    groups
  };
}

export function getFallbackPlayerProfile(playerId: string): Player | null {
  return getFallbackClubSquad().players.find((player) => player.id === playerId) ?? null;
}
