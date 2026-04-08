import type { FastifyPluginAsync } from "fastify";

import { worldStore } from "../../lib/world-store";

export const seasonsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/season/current", async () => worldStore.getSeason());
  app.post("/season/advance-day", async () => worldStore.advanceDay());
  app.post("/season/simulate-week", async () => worldStore.simulateWeek());
  app.post("/season/simulate-season", async () => worldStore.simulateSeason());
};

