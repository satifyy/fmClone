import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const devtoolsRoutes: FastifyPluginAsync = async (app) => {
  app.post("/dev/seed", async () => worldStore.seedWorld());

  app.post("/dev/run-season", async (request) => {
    const body = z.object({ samples: z.number().int().min(1).max(50).default(1) }).parse(request.body ?? {});
    return worldStore.runBulkSeason(body.samples);
  });

  app.get("/dev/balance-report", async () => worldStore.getBalanceReport());
};

