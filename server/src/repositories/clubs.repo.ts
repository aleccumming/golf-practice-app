import { pool } from "../db/connection.js";
import type { Club } from "../types/models.js";

export const clubsRepo = {
  async list(userId: number): Promise<Club[]> {
    const { rows } = await pool.query<Club>("SELECT * FROM clubs WHERE user_id = $1 ORDER BY id", [userId]);
    return rows;
  },

  async get(userId: number, id: number): Promise<Club | undefined> {
    const { rows } = await pool.query<Club>("SELECT * FROM clubs WHERE id = $1 AND user_id = $2", [id, userId]);
    return rows[0];
  },

  async create(userId: number, input: Pick<Club, "name" | "type" | "avg_carry_yds">): Promise<Club> {
    const { rows } = await pool.query<Club>(
      "INSERT INTO clubs (user_id, name, type, avg_carry_yds) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, input.name, input.type, input.avg_carry_yds ?? null]
    );
    return rows[0];
  },

  async update(
    userId: number,
    id: number,
    input: Partial<Pick<Club, "name" | "type" | "avg_carry_yds">>
  ): Promise<Club | undefined> {
    const existing = await this.get(userId, id);
    if (!existing) return undefined;
    const merged = { ...existing, ...input };
    const { rows } = await pool.query<Club>(
      "UPDATE clubs SET name = $1, type = $2, avg_carry_yds = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
      [merged.name, merged.type, merged.avg_carry_yds, id, userId]
    );
    return rows[0];
  },

  async delete(userId: number, id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM clubs WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  },
};
