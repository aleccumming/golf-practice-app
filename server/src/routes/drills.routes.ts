import { Router } from "express";
import { z } from "zod";
import { drillsRepo } from "../repositories/drills.repo.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";

export const drillsRouter = Router();

const categoryEnum = z.enum(["full_swing", "short_game", "putting"]);
const createSchema = z.object({
  name: z.string().min(1),
  category: categoryEnum,
  targets_miss_pattern: z.string().min(1),
  club_focus_id: z.number().int().positive().nullable().optional(),
  description: z.string().min(1),
  est_duration_min: z.number().int().positive(),
  difficulty: z.number().int().min(1).max(3),
});
const updateSchema = createSchema.partial();

drillsRouter.get("/", async (req, res) => {
  const category = typeof req.query.category === "string" ? categoryEnum.parse(req.query.category) : undefined;
  const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;
  res.json(await drillsRepo.list({ category, tag }));
});

drillsRouter.post("/", validateBody(createSchema), async (req, res) => {
  res.status(201).json(await drillsRepo.create({ club_focus_id: null, ...req.body }));
});

drillsRouter.patch("/:id", validateBody(updateSchema), async (req, res) => {
  const drill = await drillsRepo.update(Number(req.params.id), req.body);
  if (!drill) throw new HttpError(404, "Drill not found");
  res.json(drill);
});

drillsRouter.delete("/:id", async (req, res) => {
  const deleted = await drillsRepo.delete(Number(req.params.id));
  if (!deleted) throw new HttpError(404, "Drill not found");
  res.status(204).end();
});
