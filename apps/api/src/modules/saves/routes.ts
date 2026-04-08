import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const savesRoutes: FastifyPluginAsync = async (app) => {
  app.get("/saves", async () => worldStore.listSaves());

  app.post("/saves", async (request, reply) => {
    const body = z.object({ name: z.string().min(2) }).parse(request.body);
    const save = worldStore.createSave(body.name);
    reply.code(201);
    return save;
  });

  app.get("/saves/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const save = worldStore.listSaves().find((item) => item.id === params.id);
    if (!save) {
      reply.code(404);
      return { message: "Save not found" };
    }

    return save;
  });

  app.post("/saves/:id/load", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const save = worldStore.activateSave(params.id);
    if (!save) {
      reply.code(404);
      return { message: "Save not found" };
    }

    return save;
  });
};

