import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSessionToken, readSession, SESSION_COOKIE } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";
import { usersRepo } from "../repositories/users.repo.js";
import { seedClubs } from "../db/seed.js";
import { config } from "../config.js";

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(1).nullable().optional(),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: config.isProd,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function publicUser(user: { id: number; email: string; display_name: string | null }) {
  return { id: user.id, email: user.email, display_name: user.display_name };
}

authRouter.post("/signup", validateBody(signupSchema), async (req, res) => {
  if (await usersRepo.findByEmail(req.body.email)) {
    throw new HttpError(409, "An account with that email already exists");
  }
  const password_hash = await bcrypt.hash(req.body.password, 10);
  const user = await usersRepo.create({
    email: req.body.email,
    password_hash,
    display_name: req.body.display_name ?? null,
  });
  await seedClubs(user.id);
  res.cookie(SESSION_COOKIE, createSessionToken(user.id), cookieOptions);
  res.status(201).json({ authenticated: true, user: publicUser(user) });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const user = await usersRepo.findByEmail(req.body.email);
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    res.status(401).json({ error: "Incorrect email or password" });
    return;
  }
  res.cookie(SESSION_COOKIE, createSessionToken(user.id), cookieOptions);
  res.json({ authenticated: true, user: publicUser(user) });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.json({ authenticated: false });
});

authRouter.get("/status", async (req, res) => {
  const session = readSession(req.cookies?.[SESSION_COOKIE]);
  if (!session) {
    res.json({ authenticated: false });
    return;
  }
  const user = await usersRepo.get(session.sub);
  if (!user) {
    res.json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, user: publicUser(user) });
});
