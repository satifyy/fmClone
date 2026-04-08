import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const playersRoutes: FastifyPluginAsync = async (app) => {
  app.get("/players/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const player = worldStore.getPlayer(params.id);
    if (!player) {
      reply.code(404);
      return { message: "Player not found" };
    }

    return player;
  });

  app.get("/players/:id/development", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const player = worldStore.getPlayer(params.id);
    if (!player) {
      reply.code(404);
      return { message: "Player not found" };
    }

    return {
      playerId: player.id,
      trend: "steady",
      recentGrowth: Number(((player.potential - player.age) * 0.08).toFixed(1))
    };
  });

  app.get("/players/:id/form", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const player = worldStore.getPlayer(params.id);
    if (!player) {
      reply.code(404);
      return { message: "Player not found" };
    }

    return {
      playerId: player.id,
      morale: player.condition.morale,
      fatigue: player.condition.fatigue,
      fitness: player.condition.fitness
    };
  });
};

