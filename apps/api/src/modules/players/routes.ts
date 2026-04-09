import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const playersRoutes: FastifyPluginAsync = async (app) => {
  app.get("/players/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const player = worldStore.getPlayerProfile(params.id);
    if (!player) {
      reply.code(404);
      return { message: "Player not found" };
    }

    return player;
  });

  app.get("/players/:id/development", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const player = worldStore.getPlayerProfile(params.id);
    if (!player) {
      reply.code(404);
      return { message: "Player not found" };
    }

    return {
      playerId: player.id,
      ...player.development
    };
  });

  app.get("/players/:id/form", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const recentForm = worldStore.getPlayerRecentForm(params.id);
    if (!recentForm) {
      reply.code(404);
      return { message: "Player not found" };
    }

    const player = worldStore.getPlayerProfile(params.id);
    if (!player) {
      reply.code(404);
      return { message: "Player not found" };
    }

    return {
      playerId: player.id,
      morale: player.condition.morale,
      fatigue: player.condition.fatigue,
      fitness: player.condition.fitness,
      ...recentForm
    };
  });
};
