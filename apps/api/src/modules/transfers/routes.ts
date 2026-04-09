import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const transfersRoutes: FastifyPluginAsync = async (app) => {
  app.get("/transfers/center", async (request, reply) => {
    const query = z.object({ clubId: z.string().default("club-harbor") }).parse(request.query);
    const center = worldStore.getTransferCenter(query.clubId);
    if (!center) {
      reply.code(404);
      return { message: "Transfer center not found" };
    }

    return center;
  });

  app.get("/transfers/targets", async (request) => {
    const query = z.object({ clubId: z.string().default("club-harbor") }).parse(request.query);
    return worldStore.getTransferTargets(query.clubId);
  });

  app.post("/transfers/offers", async (request, reply) => {
    const body = z.object({
      fromClubId: z.string(),
      toClubId: z.string(),
      playerId: z.string(),
      amount: z.number().positive()
    }).parse(request.body);

    const offer = worldStore.createTransferOffer(body.fromClubId, body.toClubId, body.playerId, body.amount);
    reply.code(201);
    return offer;
  });

  app.post("/transfers/offers/:id/respond", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ accept: z.boolean() }).parse(request.body);
    const offer = worldStore.respondToTransferOffer(params.id, body.accept);
    if (!offer) {
      reply.code(404);
      return { message: "Offer not found" };
    }

    return offer;
  });

  app.get("/transfers/history", async () => worldStore.listTransferHistory());
};
