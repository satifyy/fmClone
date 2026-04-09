import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { worldStore } from "../../lib/world-store";

export const staffRoutes: FastifyPluginAsync = async (app) => {
  app.get("/saves/:id/staff", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const dept = worldStore.getStaffDepartment(params.id);
    if (!dept) {
      reply.code(404);
      return { message: "Save not found" };
    }
    return dept;
  });

  app.post("/saves/:id/staff/:staffId/hire", async (request, reply) => {
    const params = z.object({ id: z.string(), staffId: z.string() }).parse(request.params);
    const result = worldStore.hireStaff(params.id, params.staffId);
    if (!result) {
      reply.code(409);
      return { message: "Staff member not found, already hired, or over budget" };
    }
    return result;
  });

  app.post("/saves/:id/staff/:staffId/sack", async (request, reply) => {
    const params = z.object({ id: z.string(), staffId: z.string() }).parse(request.params);
    const result = worldStore.sackStaff(params.id, params.staffId);
    if (!result) {
      reply.code(404);
      return { message: "Staff member not found or not employed at this club" };
    }
    return result;
  });
};
