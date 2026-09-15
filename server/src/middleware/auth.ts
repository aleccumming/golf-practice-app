import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export const SESSION_COOKIE = "golf_session";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface SessionPayload {
  sub: number;
  exp: number;
}

function sign(payload: string): string {
  return createHmac("sha256", config.sessionSecret).update(payload).digest("base64url");
}

export function createSessionToken(userId: number): string {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + THIRTY_DAYS_MS })).toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}

export function readSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (typeof parsed.sub !== "number" || typeof parsed.exp !== "number") return null;
    if (parsed.exp <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req.cookies?.[SESSION_COOKIE]);
  if (session) {
    req.userId = session.sub;
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}
