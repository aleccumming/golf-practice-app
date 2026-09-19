import { pool } from "../db/connection.js";
import type { Shot } from "../types/models.js";

type CreateShot = Omit<Shot, "id" | "created_at" | "user_id">;
type UpdateShot = Partial<CreateShot>;

export const shotsRepo = {
  async list(userId: number, filters: { club_id?: number; session_id?: number; limit?: number }): Promise<Shot[]> {
    const clauses: string[] = ["user_id = $1"];
    const params: unknown[] = [userId];

    if (filters.club_id !== undefined) {
      params.push(filters.club_id);
      clauses.push(`club_id = $${params.length}`);
    }
    if (filters.session_id !== undefined) {
      params.push(filters.session_id);
      clauses.push(`session_id = $${params.length}`);
    }
    params.push(filters.limit ?? 100);

    const { rows } = await pool.query<Shot>(
      `SELECT * FROM shots WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC LIMIT $${params.length}`,
      params
    );
    return rows;
  },

  async get(userId: number, id: number): Promise<Shot | undefined> {
    const { rows } = await pool.query<Shot>("SELECT * FROM shots WHERE id = $1 AND user_id = $2", [id, userId]);
    return rows[0];
  },

  async create(userId: number, input: CreateShot): Promise<Shot> {
    const { rows } = await pool.query<Shot>(
      `INSERT INTO shots
        (user_id, session_id, club_id, shot_type, target_line, shot_result, miss_distance_yds,
         contact, lie, distance_to_target_yds, confidence_pre_shot, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        userId,
        input.session_id,
        input.club_id,
        input.shot_type,
        input.target_line,
        input.shot_result,
        input.miss_distance_yds,
        input.contact,
        input.lie,
        input.distance_to_target_yds,
        input.confidence_pre_shot,
        input.notes,
      ]
    );
    return rows[0];
  },

  async update(userId: number, id: number, input: UpdateShot): Promise<Shot | undefined> {
    const existing = await this.get(userId, id);
    if (!existing) return undefined;
    const merged = { ...existing, ...input };
    const { rows } = await pool.query<Shot>(
      `UPDATE shots SET session_id=$1, club_id=$2, shot_type=$3, target_line=$4, shot_result=$5,
        miss_distance_yds=$6, contact=$7, lie=$8, distance_to_target_yds=$9, confidence_pre_shot=$10, notes=$11
       WHERE id=$12 AND user_id=$13
       RETURNING *`,
      [
        merged.session_id,
        merged.club_id,
        merged.shot_type,
        merged.target_line,
        merged.shot_result,
        merged.miss_distance_yds,
        merged.contact,
        merged.lie,
        merged.distance_to_target_yds,
        merged.confidence_pre_shot,
        merged.notes,
        id,
        userId,
      ]
    );
    return rows[0];
  },

  async delete(userId: number, id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM shots WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  },
};
