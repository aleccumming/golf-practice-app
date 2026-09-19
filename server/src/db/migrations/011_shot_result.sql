ALTER TABLE shots ADD COLUMN shot_result TEXT CHECK (shot_result IN ('good', 'pull', 'push', 'hook', 'slice'));

UPDATE shots SET shot_result = CASE
  WHEN miss_shape = 'hook' THEN 'hook'
  WHEN miss_shape = 'slice' THEN 'slice'
  WHEN miss_start = 'left' THEN 'pull'
  WHEN miss_start = 'right' THEN 'push'
  ELSE 'good'
END
WHERE shot_result IS NULL;

ALTER TABLE shots ALTER COLUMN shot_result SET NOT NULL;

ALTER TABLE shots DROP COLUMN miss_start;
ALTER TABLE shots DROP COLUMN miss_shape;
