import { pool } from "../db/connection.js";
import type { Drill, PlanTargetPattern, PracticePlan } from "../types/models.js";

export interface PlanDrillEntry {
  drill_id: number;
  order_index: number;
}

export interface PlanTargetInput {
  pattern_type: PlanTargetPattern["pattern_type"];
  club_id: number | null;
  tag: string;
  baseline_count: number;
  baseline_total: number;
  baseline_pct: number;
}

export interface PracticePlanDrillRow {
  id: number;
  drill_id: number;
  order_index: number;
  completed: boolean;
  drill: Drill;
}

export const practicePlansRepo = {
  async list(userId: number): Promise<PracticePlan[]> {
    const { rows } = await pool.query<PracticePlan>(
      "SELECT * FROM practice_plans WHERE user_id = $1 ORDER BY generated_at DESC",
      [userId]
    );
    return rows;
  },

  async get(userId: number, id: number): Promise<PracticePlan | undefined> {
    const { rows } = await pool.query<PracticePlan>(
      "SELECT * FROM practice_plans WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return rows[0];
  },

  async drillsFor(planId: number): Promise<PracticePlanDrillRow[]> {
    const { rows } = await pool.query<Drill & { id: number; drill_id: number; order_index: number; completed: boolean }>(
      `SELECT ppd.id, ppd.drill_id, ppd.order_index, ppd.completed, d.*
       FROM practice_plan_drills ppd
       JOIN drills d ON d.id = ppd.drill_id
       WHERE ppd.practice_plan_id = $1
       ORDER BY ppd.order_index`,
      [planId]
    );

    return rows.map((row) => ({
      id: row.id,
      drill_id: row.drill_id,
      order_index: row.order_index,
      completed: row.completed,
      drill: {
        id: row.drill_id,
        name: row.name,
        category: row.category,
        targets_miss_pattern: row.targets_miss_pattern,
        club_focus_id: row.club_focus_id,
        description: row.description,
        est_duration_min: row.est_duration_min,
        difficulty: row.difficulty,
      },
    }));
  },

  async targetsFor(planId: number): Promise<PlanTargetPattern[]> {
    const { rows } = await pool.query<PlanTargetPattern>(
      "SELECT * FROM plan_target_patterns WHERE practice_plan_id = $1",
      [planId]
    );
    return rows;
  },

  async create(
    userId: number,
    basedOnPattern: string | null,
    entries: PlanDrillEntry[],
    targets: PlanTargetInput[]
  ): Promise<PracticePlan> {
    const totalDurationRes = await pool.query<{ total: string }>(
      `SELECT COALESCE(SUM(est_duration_min), 0) AS total FROM drills WHERE id = ANY($1::int[])`,
      [entries.map((e) => e.drill_id)]
    );
    const totalDuration = Number(totalDurationRes.rows[0].total);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: [plan] } = await client.query<PracticePlan>(
        "INSERT INTO practice_plans (user_id, based_on_pattern, total_duration_min) VALUES ($1, $2, $3) RETURNING *",
        [userId, basedOnPattern, totalDuration]
      );

      for (const entry of entries) {
        await client.query(
          "INSERT INTO practice_plan_drills (practice_plan_id, drill_id, order_index) VALUES ($1, $2, $3)",
          [plan.id, entry.drill_id, entry.order_index]
        );
      }

      for (const target of targets) {
        await client.query(
          `INSERT INTO plan_target_patterns
            (practice_plan_id, pattern_type, club_id, tag, baseline_count, baseline_total, baseline_pct)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [plan.id, target.pattern_type, target.club_id, target.tag, target.baseline_count, target.baseline_total, target.baseline_pct]
        );
      }

      await client.query("COMMIT");
      return plan;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async setDrillCompleted(userId: number, planDrillId: number, completed: boolean): Promise<boolean> {
    const result = await pool.query(
      `UPDATE practice_plan_drills ppd SET completed = $1
       FROM practice_plans pp
       WHERE ppd.id = $2 AND ppd.practice_plan_id = pp.id AND pp.user_id = $3`,
      [completed, planDrillId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  },

  async delete(userId: number, id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM practice_plans WHERE id = $1 AND user_id = $2", [id, userId]);
    return (result.rowCount ?? 0) > 0;
  },
};
