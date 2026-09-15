import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { config } from "../config.js";

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({ connectionString: config.databaseUrl });
