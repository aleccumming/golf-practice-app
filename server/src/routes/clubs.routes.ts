import { Router } from "express";
import { z } from "zod";
import { clubsRepo } from "../repositories/clubs.repo.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";

export const clubsRouter = Router();

const clubTypeEnum = z.enum(["wood", "iron", "wedge", "putter", "hybrid"]);
const createSchema = z.object({
  name: z.string().min(1),
  type: clubTypeEnum,
  avg_carry_yds: z.number().int().positive().nullable().optional(),
});
const updateSchema = createSchema.partial();

clubsRouter.get("/", async (req, res) => {
  res.json(await clubsRepo.list(req.userId!));
});

clubsRouter.post("/", validateBody(createSchema), async (req, res) => {
  res.status(201).json(await clubsRepo.create(req.userId!, { avg_carry_yds: null, ...req.body }));
});

clubsRouter.patch("/:id", validateBody(updateSchema), async (req, res) => {
  const club = await clubsRepo.update(req.userId!, Number(req.params.id), req.body);
  if (!club) throw new HttpError(404, "Club not found");
  res.json(club);
});

clubsRouter.delete("/:id", async (req, res) => {
  const deleted = await clubsRepo.delete(req.userId!, Number(req.params.id));
  if (!deleted) throw new HttpError(404, "Club not found");
  res.status(204).end();
});
