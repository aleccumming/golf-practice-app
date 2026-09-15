import { pool } from "../db/connection.js";
import type { Drill, DrillCategory } from "../types/models.js";

export const drillsRepo = {
  async list(filters: { category?: DrillCategory; tag?: string }): Promise<Drill[]> {
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (filters.category) {
      params.push(filters.category);
      clauses.push(`category = $${params.length}`);
    }
    if (filters.tag) {
      params.push(`%,${filters.tag},%`);
      clauses.push(`(',' || targets_miss_pattern || ',') LIKE $${params.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await pool.query<Drill>(`SELECT * FROM drills ${where} ORDER BY id`, params);
    return rows;
  },

  async get(id: number): Promise<Drill | undefined> {
    const { rows } = await pool.query<Drill>("SELECT * FROM drills WHERE id = $1", [id]);
    return rows[0];
  },

  async byTags(tags: string[]): Promise<Drill[]> {
    if (tags.length === 0) return [];
    const clauses = tags.map((_, i) => `(',' || targets_miss_pattern || ',') LIKE $${i + 1}`).join(" OR ");
    const params = tags.map((t) => `%,${t},%`);
    const { rows } = await pool.query<Drill>(`SELECT * FROM drills WHERE ${clauses}`, params);
    return rows;
  },

  async all(): Promise<Drill[]> {
    const { rows } = await pool.query<Drill>("SELECT * FROM drills ORDER BY id");
    return rows;
  },

  async create(input: Omit<Drill, "id">): Promise<Drill> {
    const { rows } = await pool.query<Drill>(
      `INSERT INTO drills (name, category, targets_miss_pattern, club_focus_id, description, est_duration_min, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.name,
        input.category,
        input.targets_miss_pattern,
        input.club_focus_id,
        input.description,
        input.est_duration_min,
        input.difficulty,
      ]
    );
    return rows[0];
  },

  async update(id: number, input: Partial<Omit<Drill, "id">>): Promise<Drill | undefined> {
    const existing = await this.get(id);
    if (!existing) return undefined;
    const merged = { ...existing, ...input };
    const { rows } = await pool.query<Drill>(
      `UPDATE drills SET name = $1, category = $2, targets_miss_pattern = $3,
        club_focus_id = $4, description = $5, est_duration_min = $6, difficulty = $7
       WHERE id = $8
       RETURNING *`,
      [
        merged.name,
        merged.category,
        merged.targets_miss_pattern,
        merged.club_focus_id,
        merged.description,
        merged.est_duration_min,
        merged.difficulty,
        id,
      ]
    );
    return rows[0];
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM drills WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
