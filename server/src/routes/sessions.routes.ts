import { Router } from "express";
import { z } from "zod";
import { sessionsRepo } from "../repositories/sessions.repo.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";

export const sessionsRouter = Router();

const sessionTypeEnum = z.enum(["range", "course", "putting_green"]);
const createSchema = z.object({
  date: z.string().min(1),
  type: sessionTypeEnum,
  duration_min: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});
const updateSchema = createSchema.partial();

sessionsRouter.get("/", async (req, res) => {
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const before = typeof req.query.before === "string" ? req.query.before : undefined;
  const parsedType = type ? sessionTypeEnum.parse(type) : undefined;
  res.json(await sessionsRepo.list(req.userId!, { type: parsedType, limit, before }));
});

sessionsRouter.post("/", validateBody(createSchema), async (req, res) => {
  res.status(201).json(await sessionsRepo.create(req.userId!, { duration_min: null, notes: null, ...req.body }));
});

sessionsRouter.get("/:id", async (req, res) => {
  const session = await sessionsRepo.get(req.userId!, Number(req.params.id));
  if (!session) throw new HttpError(404, "Session not found");
  res.json({ ...session, counts: await sessionsRepo.countsFor(req.userId!, session.id) });
});

sessionsRouter.patch("/:id", validateBody(updateSchema), async (req, res) => {
  const session = await sessionsRepo.update(req.userId!, Number(req.params.id), req.body);
  if (!session) throw new HttpError(404, "Session not found");
  res.json(session);
});

sessionsRouter.delete("/:id", async (req, res) => {
  const deleted = await sessionsRepo.delete(req.userId!, Number(req.params.id));
  if (!deleted) throw new HttpError(404, "Session not found");
  res.status(204).end();
});
