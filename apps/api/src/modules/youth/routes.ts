import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const youthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/saves/:id/youth", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const academy = worldStore.getYouthAcademy(params.id);
    if (!academy) {
      reply.code(404);
      return { message: "Save not found" };
    }
    return academy;
  });

  app.post("/saves/:id/youth/:youthId/promote", async (request, reply) => {
    const params = z.object({ id: z.string(), youthId: z.string() }).parse(request.params);
    const result = worldStore.promoteYouthPlayer(params.id, params.youthId);
    if (!result) {
      reply.code(404);
      return { message: "Youth player not found or already promoted" };
    }
    return result;
  });

  app.post("/saves/:id/youth/:youthId/sell", async (request, reply) => {
    const params = z.object({ id: z.string(), youthId: z.string() }).parse(request.params);
    const result = worldStore.sellYouthPlayer(params.id, params.youthId);
    if (!result) {
      reply.code(404);
      return { message: "Youth player not found or no longer in academy" };
    }
    return result;
  });
};
