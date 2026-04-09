import type { FastifyPluginAsync } from "fastify";
import type { TacticsUpdateRequest } from "@fm/shared-types";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";
import { tacticalProfileSchema } from "../../lib/zod";

export const tacticsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/clubs/:id/tactics", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const tactics = worldStore.getTacticsBoard(params.id);
    if (!tactics) {
      reply.code(404);
      return { message: "Tactics not found" };
    }

    return tactics;
  });

  app.put("/clubs/:id/tactics", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = tacticalProfileSchema.parse(request.body) as TacticsUpdateRequest;
    return worldStore.updateTactics(params.id, body);
  });

  app.post("/clubs/:id/tactics/preview", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = tacticalProfileSchema.parse(request.body) as TacticsUpdateRequest;
    const tactics = worldStore.previewTactics(params.id, body);
    if (!tactics) {
      reply.code(404);
      return { message: "Tactics not found" };
    }

    return tactics;
  });

  app.post("/clubs/:id/lineup", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ playerIds: z.array(z.string()).length(11), benchPlayerIds: z.array(z.string()).optional() }).parse(request.body);
    const tactics = worldStore.getTacticsBoard(params.id);
    if (!tactics) {
      reply.code(404);
      return { message: "Tactics not found" };
    }

    const updated = {
      formation: tactics.formation,
      instructions: tactics.instructions,
      roles: tactics.starters.map((role, index) => ({
        slot: role.id,
        playerId: body.playerIds[index] ?? role.player?.id ?? "",
        position: role.position,
        role: role.role
      })),
      benchPlayerIds: body.benchPlayerIds ?? tactics.bench.map((player) => player.id)
    };

    return worldStore.updateTactics(params.id, updated);
  });
};
