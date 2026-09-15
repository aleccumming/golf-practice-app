import { pool } from "../db/connection.js";
import type { Putt } from "../types/models.js";

type CreatePutt = Omit<Putt, "id" | "created_at" | "user_id">;
type UpdatePutt = Partial<CreatePutt>;

export const puttsRepo = {
  async list(userId: number, filters: { session_id?: number; limit?: number }): Promise<Putt[]> {
    const clauses: string[] = ["user_id = $1"];
    const params: unknown[] = [userId];

    if (filters.session_id !== undefined) {
      params.push(filters.session_id);
      clauses.push(`session_id = $${params.length}`);
    }
    params.push(filters.limit ?? 100);

    const { rows } = await pool.query<Putt>(
      `SELECT * FROM putts WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC LIMIT $${params.length}`,
      params
    );
    return rows;
  },

  async get(userId: number, id: number): Promise<Putt | undefined> {
    const { rows } = await pool.query<Putt>("SELECT * FROM putts WHERE id = $1 AND user_id = $2", [id, userId]);
    return rows[0];
  },

  async create(userId: number, input: CreatePutt): Promise<Putt> {
    const { rows } = await pool.query<Putt>(
      `INSERT INTO putts (user_id, session_id, distance_ft, break, slope, result)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, input.session_id, input.distance_ft, input.break, input.slope, input.result]
    );
    return rows[0];
  },

  async update(userId: number, id: number, input: UpdatePutt): Promise<Putt | undefined> {
    const existing = await this.get(userId, id);
    if (!existing) return undefined;
    const merged = { ...existing, ...input };
    const { rows } = await pool.query<Putt>(
      `UPDATE putts SET session_id = $1, distance_ft = $2, break = $3, slope = $4, result = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [merged.session_id, merged.distance_ft, merged.break, merged.slope, merged.result, id, userId]
    );
    return rows[0];
  },

  async delete(userId: number, id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM putts WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  },
};
