import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const fixturesRoutes: FastifyPluginAsync = async (app) => {
  const fixturesQuerySchema = z.object({
    seasonId: z.string().optional(),
    competition: z.enum(["league", "cup", "friendly", "playoff"]).optional(),
    status: z.enum(["upcoming", "completed", "postponed", "all"]).optional(),
    date: z.string().optional(),
    matchday: z.coerce.number().int().positive().optional()
  });

  app.get("/fixtures/upcoming", async () => worldStore.getUpcomingFixtures());

  app.get("/fixtures", async (request) => {
    const query = fixturesQuerySchema.parse(request.query);

    return worldStore.getFixtures(query);
  });

  app.get("/fixtures/history", async (request) => {
    const query = z
      .object({
        seasonId: z.string().optional(),
        competition: z.enum(["league", "cup", "friendly", "playoff"]).optional(),
        status: z.enum(["upcoming", "completed", "postponed", "all"]).optional(),
        page: z.coerce.number().int().positive().optional(),
        pageSize: z.coerce.number().int().positive().max(50).optional()
      })
      .parse(request.query);

    return worldStore.getFixtureHistory(query);
  });

  app.get("/fixtures/scoreboard", async (request) => {
    const query = fixturesQuerySchema.parse(request.query);

    return worldStore.getMatchdayScoreboard(query);
  });

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
