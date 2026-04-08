import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const clubsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/clubs/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const club = worldStore.getClub(params.id);
    if (!club) {
      reply.code(404);
      return { message: "Club not found" };
    }

    return club;
  });

  app.get("/clubs/:id/squad", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    return worldStore.getClubPlayers(params.id);
  });

  app.get("/clubs/:id/finances", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const club = worldStore.getClub(params.id);
    if (!club) {
      reply.code(404);
      return { message: "Club not found" };
    }

    return club.finances;
  });

  app.get("/clubs/:id/dashboard", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const dashboard = worldStore.getClubDashboard(params.id);
    if (!dashboard) {
      reply.code(404);
      return { message: "Club not found" };
    }

    return dashboard;
  });
};

