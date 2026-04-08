import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";
import { tacticalProfileSchema } from "../../lib/zod";

export const tacticsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/clubs/:id/tactics", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const tactics = worldStore.getTactics(params.id);
    if (!tactics) {
      reply.code(404);
      return { message: "Tactics not found" };
    }

    return tactics;
  });

  app.put("/clubs/:id/tactics", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = tacticalProfileSchema.parse(request.body);
    return worldStore.updateTactics(params.id, body);
  });

  app.post("/clubs/:id/lineup", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ playerIds: z.array(z.string()).length(11) }).parse(request.body);
    const tactics = worldStore.getTactics(params.id);
    if (!tactics) {
      reply.code(404);
      return { message: "Tactics not found" };
    }

    tactics.roles = tactics.roles.map((role, index) => ({
      ...role,
      playerId: body.playerIds[index] ?? role.playerId
    }));

    return tactics;
  });
};

