import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const seasonsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/season/current", async () => worldStore.getSeason());
  app.get("/season/archive", async () => worldStore.listSeasonArchive());
  app.get("/season/archive/:seasonId", async (request, reply) => {
    const params = z.object({ seasonId: z.string() }).parse(request.params);
    const season = worldStore.getSeasonArchiveDetail(params.seasonId);
    if (!season) {
      reply.code(404);
      return { message: "Season not found" };
    }

    return season;
  });
  app.post("/season/advance-day", async () => worldStore.advanceDay());
  app.post("/season/simulate-week", async () => worldStore.simulateWeek());
  app.post("/season/simulate-season", async () => worldStore.simulateSeason());
};
