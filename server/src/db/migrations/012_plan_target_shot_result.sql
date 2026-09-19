ALTER TABLE plan_target_patterns DROP CONSTRAINT plan_target_patterns_pattern_type_check;
ALTER TABLE plan_target_patterns ADD CONSTRAINT plan_target_patterns_pattern_type_check
  CHECK (pattern_type IN ('shot_miss_direction', 'shot_miss_start', 'shot_miss_shape', 'shot_result', 'shot_contact', 'putt_break_bias', 'putt_short_miss'));
