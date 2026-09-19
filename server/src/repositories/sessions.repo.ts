import { pool } from "../db/connection.js";
import type { Session, SessionType } from "../types/models.js";

export const sessionsRepo = {
  async list(userId: number, filters: { type?: SessionType; limit?: number; before?: string }): Promise<Session[]> {
    const clauses: string[] = ["user_id = $1"];
    const params: unknown[] = [userId];

    if (filters.type) {
      params.push(filters.type);
      clauses.push(`type = $${params.length}`);
    }
    if (filters.before) {
      params.push(filters.before);
      clauses.push(`created_at < $${params.length}`);
    }
    params.push(filters.limit ?? 50);

    const { rows } = await pool.query<Session>(
      `SELECT * FROM sessions WHERE ${clauses.join(" AND ")} ORDER BY date DESC, created_at DESC LIMIT $${params.length}`,
      params
    );
    return rows;
  },

  async get(userId: number, id: number): Promise<Session | undefined> {
    const { rows } = await pool.query<Session>("SELECT * FROM sessions WHERE id = $1 AND user_id = $2", [id, userId]);
    return rows[0];
  },

  async create(
    userId: number,
    input: Pick<Session, "date" | "type" | "duration_min" | "notes"> & { name?: string | null }
  ): Promise<Session> {
    const { rows } = await pool.query<Session>(
      "INSERT INTO sessions (user_id, date, type, name, duration_min, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, input.date, input.type, input.name ?? null, input.duration_min ?? null, input.notes ?? null]
    );
    return rows[0];
  },

  async update(
    userId: number,
    id: number,
    input: Partial<Pick<Session, "date" | "type" | "name" | "duration_min" | "notes">>
  ): Promise<Session | undefined> {
    const existing = await this.get(userId, id);
    if (!existing) return undefined;
    const merged = { ...existing, ...input };
    const { rows } = await pool.query<Session>(
      "UPDATE sessions SET date = $1, type = $2, name = $3, duration_min = $4, notes = $5 WHERE id = $6 AND user_id = $7 RETURNING *",
      [merged.date, merged.type, merged.name, merged.duration_min, merged.notes, id, userId]
    );
    return rows[0];
  },

  async delete(userId: number, id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM sessions WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  },

  async countsFor(userId: number, id: number): Promise<{ shots: number; putts: number }> {
    const shotsRes = await pool.query<{ c: string }>(
      "SELECT COUNT(*) AS c FROM shots WHERE session_id = $1 AND user_id = $2",
      [id, userId]
    );
    const puttsRes = await pool.query<{ c: string }>(
      "SELECT COUNT(*) AS c FROM putts WHERE session_id = $1 AND user_id = $2",
      [id, userId]
    );
    return { shots: Number(shotsRes.rows[0].c), putts: Number(puttsRes.rows[0].c) };
  },
};
