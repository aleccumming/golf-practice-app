import { http } from "./http";
import type { Drill, PracticePlan, SessionType } from "../types";

export interface PracticePlanDrill {
  id: number;
  drill_id: number;
  order_index: number;
  completed: boolean;
  drill: Drill;
}

export interface PlanTarget {
  id: number;
  practice_plan_id: number;
  pattern_type: string;
  club_id: number | null;
  tag: string;
  baseline_count: number;
  baseline_total: number;
  baseline_pct: number;
}

export interface PracticePlanDetail extends PracticePlan {
  drills: PracticePlanDrill[];
  targets: PlanTarget[];
}

export interface ProgressEntry {
  tag: string;
  club_id: number | null;
  baseline_pct: number;
  current_pct: number | null;
  delta: number | null;
  sample_size: number;
  insufficient_data: boolean;
}

export const practicePlansApi = {
  list: () => http.get<PracticePlan[]>("/practice-plans"),
  get: (id: number) => http.get<PracticePlanDetail>(`/practice-plans/${id}`),
  generate: (sessionType: SessionType | null = null) =>
    http.post<PracticePlanDetail>("/practice-plans/generate", { session_type: sessionType }),
  setDrillCompleted: (planDrillId: number, completed: boolean) =>
    http.patch<{ id: number; completed: boolean }>(`/practice-plan-drills/${planDrillId}`, { completed }),
  progress: (planId: number) => http.get<ProgressEntry[]>(`/patterns/progress?plan_id=${planId}`),
};
