export type ClubType = "wood" | "iron" | "wedge" | "putter" | "hybrid";
export type SessionType = "range" | "course" | "putting_green";
export type ShotType = "tee" | "approach" | "chip" | "punch" | "layup";
export type TargetLine = "straight" | "draw" | "fade";
export type ShotResult = "good" | "pull" | "push" | "hook" | "slice";
export type Contact = "flush" | "thin" | "fat" | "toe" | "heel";
export type Lie = "tee" | "fairway" | "rough" | "sand" | "range_mat";
export type PuttBreak = "straight" | "left_to_right" | "right_to_left";
export type PuttSlope = "uphill" | "downhill" | "flat";
export type PuttResult = "made" | "missed_left" | "missed_right" | "missed_short" | "missed_long";
export type DrillCategory = "full_swing" | "short_game" | "putting";

export type Handedness = "left" | "right";
export type PrimaryGoal = "lower_scores" | "full_swing" | "short_game" | "putting";

export interface User {
  id: number;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  avatar_url: string | null;
  display_name: string | null;
  handicap: number | null;
  handedness: Handedness | null;
  primary_goal: PrimaryGoal | null;
  skill_driving: number | null;
  skill_irons: number | null;
  skill_short_game: number | null;
  skill_putting: number | null;
  practice_frequency_per_week: number | null;
  practice_session_minutes: number | null;
  onboarding_completed_at: string | null;
  created_at: string;
}

export interface Club {
  id: number;
  user_id: number;
  name: string;
  type: ClubType;
  avg_carry_yds: number | null;
}

export interface Session {
  id: number;
  user_id: number;
  date: string;
  type: SessionType;
  name: string | null;
  duration_min: number | null;
  notes: string | null;
  created_at: string;
}

export interface Shot {
  id: number;
  user_id: number;
  session_id: number | null;
  club_id: number;
  shot_type: ShotType;
  target_line: TargetLine;
  shot_result: ShotResult;
  miss_distance_yds: number | null;
  contact: Contact | null;
  lie: Lie;
  distance_to_target_yds: number | null;
  confidence_pre_shot: number | null;
  notes: string | null;
  created_at: string;
}

export interface Putt {
  id: number;
  user_id: number;
  session_id: number | null;
  distance_ft: number;
  break: PuttBreak;
  slope: PuttSlope;
  result: PuttResult;
  created_at: string;
}

export interface Drill {
  id: number;
  name: string;
  category: DrillCategory;
  targets_miss_pattern: string;
  club_focus_id: number | null;
  description: string;
  est_duration_min: number;
  difficulty: number;
}

export interface PracticePlan {
  id: number;
  user_id: number;
  generated_at: string;
  based_on_pattern: string | null;
  total_duration_min: number;
}

export interface PracticePlanDrill {
  id: number;
  practice_plan_id: number;
  drill_id: number;
  order_index: number;
  completed: boolean;
}

export interface PlanTargetPattern {
  id: number;
  practice_plan_id: number;
  pattern_type:
    | "shot_miss_direction"
    | "shot_miss_start"
    | "shot_miss_shape"
    | "shot_result"
    | "shot_contact"
    | "putt_break_bias"
    | "putt_short_miss";
  club_id: number | null;
  tag: string;
  baseline_count: number;
  baseline_total: number;
  baseline_pct: number;
}
