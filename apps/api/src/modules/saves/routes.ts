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

  app.get("/saves/:id/dashboard", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const dashboard = worldStore.getSaveDashboard(params.id);
    if (!dashboard) {
      reply.code(404);
      return { message: "Save not found" };
    }

    return dashboard;
  });

  app.get("/saves/:id/inbox", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const save = worldStore.getSave(params.id);
    if (!save) {
      reply.code(404);
      return { message: "Save not found" };
    }

    return worldStore.getInbox(params.id);
  });

  app.patch("/saves/:id/inbox/:notificationId/read", async (request, reply) => {
    const params = z.object({ id: z.string(), notificationId: z.string() }).parse(request.params);
    const updated = worldStore.markInboxNotificationRead(params.id, params.notificationId);
    if (!updated) {
      reply.code(404);
      return { message: "Notification not found" };
    }

    return updated;
  });

  app.post("/saves/:id/inbox/:notificationId/action", async (request, reply) => {
    const params = z.object({ id: z.string(), notificationId: z.string() }).parse(request.params);
    const result = worldStore.runInboxNotificationAction(params.id, params.notificationId);
    if (!result) {
      reply.code(404);
      return { message: "Notification not found" };
    }

    return result;
  });

  app.get("/saves/:id/pending-actions", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const summary = worldStore.getPendingActionSummary(params.id);
    if (!summary) {
      reply.code(404);
      return { message: "Save not found" };
    }

    return summary;
  });

  app.get("/saves/:id/mentions", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const save = worldStore.getSave(params.id);
    if (!save) {
      reply.code(404);
      return { message: "Save not found" };
    }

    return worldStore.listMentionTargets(params.id);
  });

  app.post("/saves/:id/progression", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        action: z.enum(["advance-day", "simulate-next-fixture"])
      })
      .parse(request.body);

    if (body.action === "advance-day") {
      const blockReason = worldStore.getAdvanceDayBlockReason(params.id);
      if (blockReason) {
        reply.code(409);
        return { message: blockReason };
      }
    }

    const result = worldStore.progressSave(params.id, body.action);
    if (!result) {
      reply.code(404);
      return { message: "Save not found or no next fixture is available" };
    }

    return result;
  });
};
