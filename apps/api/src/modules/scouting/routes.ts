import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const scoutingRoutes: FastifyPluginAsync = async (app) => {
  app.get("/saves/:id/scouting", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const scouting = worldStore.getScoutingPage(params.id);
    if (!scouting) {
      reply.code(404);
      return { message: "Scouting page not found" };
    }

    return scouting;
  });
};
