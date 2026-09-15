import type { IncomingMessage, ServerResponse } from "node:http";
import type { Request, Response } from "express";
import { createApp } from "../server/src/app.js";

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req as unknown as Request, res as unknown as Response);
}
