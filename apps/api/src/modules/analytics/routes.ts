import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/analytics/club/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const dashboard = worldStore.getClubDashboard(params.id);
    const detail = worldStore.getClubDetail(params.id);
    if (!dashboard) {
      reply.code(404);
      return { message: "Club not found" };
    }

    return {
      dashboard,
      standingsPosition: worldStore.getStandings().findIndex((row) => row.clubId === params.id) + 1,
      recentResults: detail?.recentResults ?? [],
      boardExpectation: detail?.club.boardExpectation,
      financialStatus: detail?.financialStatus,
      squadOverview: detail?.squadOverview
    };
  });

  app.get("/analytics/player/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const player = worldStore.getPlayer(params.id);
    if (!player) {
      reply.code(404);
      return { message: "Player not found" };
    }

    return {
      playerId: player.id,
      expectedGrowth: Number((player.potential * 0.08).toFixed(1)),
      riskScore: player.condition.injuryRisk + player.condition.fatigue * 0.2,
      seasonStats: player.seasonStats,
      recentForm: player.recentForm,
      contract: player.contract,
      scouting: player.scouting
    };
  });

  app.get("/analytics/tactics/:clubId", async (request, reply) => {
    const params = z.object({ clubId: z.string() }).parse(request.params);
    const tactics = worldStore.getTactics(params.clubId);
    if (!tactics) {
      reply.code(404);
      return { message: "Tactics not found" };
    }

    return {
      clubId: params.clubId,
      tacticalFit: Number(
        ((tactics.instructions.pressingIntensity + tactics.instructions.tempo + tactics.instructions.width) / 3).toFixed(1)
      ),
      shape: tactics.formation,
      instructions: tactics.instructions,
      summary: worldStore.getTacticsBoard(params.clubId)?.summary
    };
  });

  app.get("/analytics/season/summary", async (request, reply) => {
    const query = z.object({ saveId: z.string().optional(), seasonId: z.string().optional() }).parse(request.query);
    const saveId = query.saveId ?? worldStore.getActiveSave()?.id;
    if (!saveId) {
      reply.code(404);
      return { message: "Active save not found" };
    }

    const payload = worldStore.getSeasonAnalytics(saveId, query.seasonId);
    if (!payload) {
      reply.code(404);
      return { message: "Season analytics not found" };
    }

    return payload;
  });
};

