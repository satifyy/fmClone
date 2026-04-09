import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const clubsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/clubs/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const club = worldStore.getClubDetail(params.id);
    if (!club) {
      reply.code(404);
      return { message: "Club not found" };
    }

    return club;
  });

  app.get("/clubs/:id/squad", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const squad = worldStore.getClubSquad(params.id);
    if (!squad) {
      reply.code(404);
      return { message: "Club not found" };
    }

    return squad;
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

  app.get("/clubs/:id/finance-board", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const query = z.object({ saveId: z.string().optional() }).parse(request.query);
    const payload = worldStore.getClubFinanceBoard(params.id, query.saveId);
    if (!payload) {
      reply.code(404);
      return { message: "Club not found" };
    }

    return payload;
  });

  app.post("/clubs/:id/finances/adjust", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        transferBudget: z.number().nonnegative(),
        wageBudget: z.number().nonnegative(),
        saveId: z.string().optional()
      })
      .parse(request.body);

    const payload = worldStore.updateClubBudgetAllocation(
      params.id,
      {
        transferBudget: body.transferBudget,
        wageBudget: body.wageBudget
      },
      body.saveId
    );

    if (!payload) {
      reply.code(400);
      return { message: "Budget values are outside allowed adjustment ranges." };
    }

    return payload;
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
