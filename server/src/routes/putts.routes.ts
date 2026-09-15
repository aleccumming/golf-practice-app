import { Router } from "express";
import { z } from "zod";
import { puttsRepo } from "../repositories/putts.repo.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";

export const puttsRouter = Router();

const createSchema = z.object({
  session_id: z.number().int().positive().nullable().optional(),
  distance_ft: z.number().positive(),
  break: z.enum(["straight", "left_to_right", "right_to_left"]),
  slope: z.enum(["uphill", "downhill", "flat"]),
  result: z.enum(["made", "missed_left", "missed_right", "missed_short", "missed_long"]),
});
const updateSchema = createSchema.partial();

puttsRouter.get("/", async (req, res) => {
  const session_id = req.query.session_id ? Number(req.query.session_id) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  res.json(await puttsRepo.list(req.userId!, { session_id, limit }));
});

puttsRouter.post("/", validateBody(createSchema), async (req, res) => {
  res.status(201).json(await puttsRepo.create(req.userId!, { session_id: null, ...req.body }));
});

puttsRouter.get("/:id", async (req, res) => {
  const putt = await puttsRepo.get(req.userId!, Number(req.params.id));
  if (!putt) throw new HttpError(404, "Putt not found");
  res.json(putt);
});

puttsRouter.patch("/:id", validateBody(updateSchema), async (req, res) => {
  const putt = await puttsRepo.update(req.userId!, Number(req.params.id), req.body);
  if (!putt) throw new HttpError(404, "Putt not found");
  res.json(putt);
});

puttsRouter.delete("/:id", async (req, res) => {
  const deleted = await puttsRepo.delete(req.userId!, Number(req.params.id));
  if (!deleted) throw new HttpError(404, "Putt not found");
  res.status(204).end();
});
