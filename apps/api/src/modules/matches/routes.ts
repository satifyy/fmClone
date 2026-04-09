import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const matchesRoutes: FastifyPluginAsync = async (app) => {
  app.get("/matches/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const match = worldStore.getMatch(params.id);
    if (!match) {
      reply.code(404);
      return { message: "Match not found" };
    }

    return match;
  });
};
