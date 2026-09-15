CREATE TABLE IF NOT EXISTS plan_target_patterns (
  id SERIAL PRIMARY KEY,
  practice_plan_id INTEGER NOT NULL REFERENCES practice_plans(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('shot_miss_direction','shot_contact','putt_break_bias','putt_short_miss')),
  club_id INTEGER REFERENCES clubs(id),
  tag TEXT NOT NULL,
  baseline_count INTEGER NOT NULL,
  baseline_total INTEGER NOT NULL,
  baseline_pct REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ptp_plan ON plan_target_patterns(practice_plan_id);
