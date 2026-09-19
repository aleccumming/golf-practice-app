import { Router } from "express";
import { z } from "zod";
import { shotsRepo } from "../repositories/shots.repo.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";

export const shotsRouter = Router();

const createSchema = z.object({
  session_id: z.number().int().positive().nullable().optional(),
  club_id: z.number().int().positive(),
  shot_type: z.enum(["tee", "approach", "chip", "punch", "layup"]),
  target_line: z.enum(["straight", "draw", "fade"]),
  shot_result: z.enum(["good", "pull", "push", "hook", "slice"]),
  miss_distance_yds: z.number().nullable().optional(),
  contact: z.enum(["flush", "thin", "fat", "toe", "heel"]).nullable().optional(),
  lie: z.enum(["tee", "fairway", "rough", "sand", "range_mat"]),
  distance_to_target_yds: z.number().nullable().optional(),
  confidence_pre_shot: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().nullable().optional(),
});
const updateSchema = createSchema.partial();

const defaults = {
  session_id: null,
  miss_distance_yds: null,
  contact: null,
  distance_to_target_yds: null,
  confidence_pre_shot: null,
  notes: null,
};

shotsRouter.get("/", async (req, res) => {
  const club_id = req.query.club_id ? Number(req.query.club_id) : undefined;
  const session_id = req.query.session_id ? Number(req.query.session_id) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  res.json(await shotsRepo.list(req.userId!, { club_id, session_id, limit }));
});

shotsRouter.post("/", validateBody(createSchema), async (req, res) => {
  res.status(201).json(await shotsRepo.create(req.userId!, { ...defaults, ...req.body }));
});

shotsRouter.get("/:id", async (req, res) => {
  const shot = await shotsRepo.get(req.userId!, Number(req.params.id));
  if (!shot) throw new HttpError(404, "Shot not found");
  res.json(shot);
});

shotsRouter.patch("/:id", validateBody(updateSchema), async (req, res) => {
  const shot = await shotsRepo.update(req.userId!, Number(req.params.id), req.body);
  if (!shot) throw new HttpError(404, "Shot not found");
  res.json(shot);
});

shotsRouter.delete("/:id", async (req, res) => {
  const deleted = await shotsRepo.delete(req.userId!, Number(req.params.id));
  if (!deleted) throw new HttpError(404, "Shot not found");
  res.status(204).end();
});
