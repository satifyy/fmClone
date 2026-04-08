import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const fixturesRoutes: FastifyPluginAsync = async (app) => {
  app.get("/fixtures/upcoming", async () => worldStore.getUpcomingFixtures());

  app.post("/fixtures/:fixtureId/simulate", async (request, reply) => {
    const params = z.object({ fixtureId: z.string() }).parse(request.params);
    const match = worldStore.simulateFixture(params.fixtureId);
    if (!match) {
      reply.code(404);
      return { message: "Fixture not found or already simulated" };
    }

    return match;
  });

  app.post("/fixtures/:fixtureId/quick-sim", async (request, reply) => {
    const params = z.object({ fixtureId: z.string() }).parse(request.params);
    const match = worldStore.simulateFixture(params.fixtureId);
    if (!match) {
      reply.code(404);
      return { message: "Fixture not found or already simulated" };
    }

    return {
      matchId: match.id,
      score: match.result.score
    };
  });
};

