import { Router } from "express";
import { z } from "zod";
import { practicePlansRepo } from "../repositories/practicePlans.repo.js";
import { generatePracticePlan } from "../services/planGenerator.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";

export const practicePlansRouter = Router();
export const practicePlanDrillsRouter = Router();

const generateSchema = z.object({
  session_type: z.enum(["range", "course", "putting_green"]).nullable().optional(),
});

practicePlansRouter.get("/", async (req, res) => {
  res.json(await practicePlansRepo.list(req.userId!));
});

practicePlansRouter.post("/generate", validateBody(generateSchema), async (req, res) => {
  const plan = await generatePracticePlan(req.userId!, req.body.session_type ?? null);
  res.status(201).json({
    ...plan,
    drills: await practicePlansRepo.drillsFor(plan.id),
    targets: await practicePlansRepo.targetsFor(plan.id),
  });
});

practicePlansRouter.get("/:id", async (req, res) => {
  const plan = await practicePlansRepo.get(req.userId!, Number(req.params.id));
  if (!plan) throw new HttpError(404, "Practice plan not found");
  res.json({
    ...plan,
    drills: await practicePlansRepo.drillsFor(plan.id),
    targets: await practicePlansRepo.targetsFor(plan.id),
  });
});

practicePlansRouter.delete("/:id", async (req, res) => {
  const deleted = await practicePlansRepo.delete(req.userId!, Number(req.params.id));
  if (!deleted) throw new HttpError(404, "Practice plan not found");
  res.status(204).end();
});

const updateDrillSchema = z.object({ completed: z.boolean() });

practicePlanDrillsRouter.patch("/:id", validateBody(updateDrillSchema), async (req, res) => {
  const updated = await practicePlansRepo.setDrillCompleted(req.userId!, Number(req.params.id), req.body.completed);
  if (!updated) throw new HttpError(404, "Practice plan drill not found");
  res.json({ id: Number(req.params.id), completed: req.body.completed });
});
