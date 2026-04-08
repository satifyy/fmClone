import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const trainingRoutes: FastifyPluginAsync = async (app) => {
  app.get("/clubs/:id/training", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const plan = worldStore.getTrainingPlan(params.id);
    if (!plan) {
      reply.code(404);
      return { message: "Training plan not found" };
    }

    return plan;
  });

  app.put("/clubs/:id/training", async (request) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({
      focus: z.enum(["balanced", "fitness", "attacking", "defending", "youth"]),
      intensity: z.number().int().min(0).max(100)
    }).parse(request.body);

    return worldStore.updateTrainingPlan(params.id, body.focus, body.intensity);
  });
};

