import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";
import { usersRepo } from "../repositories/users.repo.js";
import { publicUser } from "../lib/publicUser.js";

export const usersRouter = Router();

const onboardingSchema = z.object({
  handicap: z.number().min(-10).max(54).nullable(),
  handedness: z.enum(["left", "right"]),
  primary_goal: z.enum(["lower_scores", "full_swing", "short_game", "putting"]).nullable(),
  skill_driving: z.number().int().min(1).max(5).nullable(),
  skill_irons: z.number().int().min(1).max(5).nullable(),
  skill_short_game: z.number().int().min(1).max(5).nullable(),
  skill_putting: z.number().int().min(1).max(5).nullable(),
  practice_frequency_per_week: z.number().int().min(0).max(14).nullable(),
  practice_session_minutes: z.number().int().min(0).max(600).nullable(),
});

usersRouter.post("/onboarding", validateBody(onboardingSchema), async (req, res) => {
  const user = await usersRepo.completeOnboarding(req.userId!, req.body);
  res.json({ user: publicUser(user) });
});
