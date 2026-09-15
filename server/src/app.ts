import "express-async-errors";
import express from "express";
import cookieParser from "cookie-parser";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { clubsRouter } from "./routes/clubs.routes.js";
import { sessionsRouter } from "./routes/sessions.routes.js";
import { shotsRouter } from "./routes/shots.routes.js";
import { puttsRouter } from "./routes/putts.routes.js";
import { patternsRouter } from "./routes/patterns.routes.js";
import { drillsRouter } from "./routes/drills.routes.js";
import { practicePlansRouter, practicePlanDrillsRouter } from "./routes/practicePlans.routes.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);

  app.use("/api/clubs", requireAuth, clubsRouter);
  app.use("/api/sessions", requireAuth, sessionsRouter);
  app.use("/api/shots", requireAuth, shotsRouter);
  app.use("/api/putts", requireAuth, puttsRouter);
  app.use("/api/patterns", requireAuth, patternsRouter);
  app.use("/api/drills", requireAuth, drillsRouter);
  app.use("/api/practice-plans", requireAuth, practicePlansRouter);
  app.use("/api/practice-plan-drills", requireAuth, practicePlanDrillsRouter);

  const clientDist = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "client", "dist");
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(join(clientDist, "index.html"));
    });
  }

  app.use(errorHandler);

  return app;
}
