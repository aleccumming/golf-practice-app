import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { createSessionToken, readSession, SESSION_COOKIE } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";
import { usersRepo } from "../repositories/users.repo.js";
import { seedClubs } from "../db/seed.js";
import { config } from "../config.js";
import { publicUser } from "../lib/publicUser.js";

export const authRouter = Router();

const googleClient = new OAuth2Client(config.googleClientId);

const googleAuthSchema = z.object({ credential: z.string().min(1) });

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: config.isProd,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

authRouter.post("/google", validateBody(googleAuthSchema), async (req, res) => {
  const ticket = await googleClient
    .verifyIdToken({ idToken: req.body.credential, audience: config.googleClientId })
    .catch(() => null);
  const payload = ticket?.getPayload();
  if (!payload || !payload.email) {
    throw new HttpError(401, "Invalid Google credential");
  }

  let user = await usersRepo.findByGoogleId(payload.sub);
  if (!user) {
    const existing = await usersRepo.findByEmail(payload.email);
    if (existing) {
      user = await usersRepo.linkGoogleId(existing.id, payload.sub, payload.picture ?? null);
    } else {
      user = await usersRepo.createWithGoogle({
        email: payload.email,
        google_id: payload.sub,
        display_name: payload.name ?? null,
        avatar_url: payload.picture ?? null,
      });
      await seedClubs(user.id);
    }
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
