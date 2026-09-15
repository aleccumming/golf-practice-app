import { Router } from "express";
import { z } from "zod";
import {
  getShotMissPatterns,
  getShotContactPatterns,
  getPuttDistanceBuckets,
  getPuttBreakBias,
  getFlaggedPuttPatterns,
  getProgressForPlan,
} from "../services/patternDetection.js";
import type { SessionType } from "../types/models.js";

export const patternsRouter = Router();

const sessionTypeEnum = z.enum(["range", "course", "putting_green"]);

function parseFilters(query: Record<string, unknown>, defaultWindow: number) {
  const window = query.window ? Number(query.window) : defaultWindow;
  const sessionType = typeof query.session_type === "string" ? sessionTypeEnum.parse(query.session_type) : null;
  return { window, sessionType: sessionType as SessionType | null };
}

patternsRouter.get("/shots", async (req, res) => {
  const { window, sessionType } = parseFilters(req.query, 25);
  res.json({
    missDirection: await getShotMissPatterns(req.userId!, window, sessionType),
    contact: await getShotContactPatterns(req.userId!, window, sessionType),
  });
});

patternsRouter.get("/putts", async (req, res) => {
  const { window, sessionType } = parseFilters(req.query, 30);
  res.json({
    distanceBuckets: await getPuttDistanceBuckets(req.userId!, window, sessionType),
    breakBias: await getPuttBreakBias(req.userId!, window, sessionType),
    flagged: await getFlaggedPuttPatterns(req.userId!, window, sessionType),
  });
});

patternsRouter.get("/progress", async (req, res) => {
  const planId = Number(req.query.plan_id);
  res.json(await getProgressForPlan(req.userId!, planId));
});
