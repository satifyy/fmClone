import cors from "@fastify/cors";
import Fastify from "fastify";

import { analyticsRoutes } from "./modules/analytics/routes";
import { clubsRoutes } from "./modules/clubs/routes";
import { devtoolsRoutes } from "./modules/devtools/routes";
import { fixturesRoutes } from "./modules/fixtures/routes";
import { leagueRoutes } from "./modules/league/routes";
import { matchesRoutes } from "./modules/matches/routes";
import { playersRoutes } from "./modules/players/routes";
import { savesRoutes } from "./modules/saves/routes";
import { scoutingRoutes } from "./modules/scouting/routes";
import { seasonsRoutes } from "./modules/seasons/routes";
import { tacticsRoutes } from "./modules/tactics/routes";
import { trainingRoutes } from "./modules/training/routes";
import { transfersRoutes } from "./modules/transfers/routes";

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });
  app.get("/health", async () => ({ status: "ok" }));

  app.register(savesRoutes);
  app.register(clubsRoutes);
  app.register(playersRoutes);
  app.register(scoutingRoutes);
  app.register(tacticsRoutes);
  app.register(trainingRoutes);
  app.register(fixturesRoutes);
  app.register(matchesRoutes);
  app.register(leagueRoutes);
  app.register(seasonsRoutes);
  app.register(transfersRoutes);
  app.register(analyticsRoutes);
  app.register(devtoolsRoutes);

  return app;
};
