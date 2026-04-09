import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const leagueRoutes: FastifyPluginAsync = async (app) => {
  app.get("/standings", async () => worldStore.getStandings());

  app.get("/league/metadata", async (request) => {
    const query = z.object({ seasonId: z.string().optional(), leagueId: z.string().optional() }).parse(request.query);
    return worldStore.getLeagueMetadata(query.seasonId, query.leagueId);
  });

  app.get("/league/standings", async (request) => {
    const query = z.object({ seasonId: z.string().optional(), leagueId: z.string().optional() }).parse(request.query);
    return worldStore.getLeagueStandings(query.seasonId, query.leagueId);
  });

  app.get("/awards", async () => {
    const topPlayer = [...worldStore.listClubs()]
      .flatMap((club) => worldStore.getClubPlayers(club.id))
      .sort((left, right) => right.potential - left.potential)[0];

    return {
      goldenBoot: topPlayer
        ? {
            playerId: topPlayer.id,
            name: `${topPlayer.firstName} ${topPlayer.lastName}`
          }
        : null,
      teamOfTheSeason: worldStore.getStandings().slice(0, 3).map((row) => row.clubName)
    };
  });
};
