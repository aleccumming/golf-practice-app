ALTER TABLE shots ADD COLUMN miss_start TEXT CHECK (miss_start IN ('left', 'straight', 'right'));
ALTER TABLE shots ADD COLUMN miss_shape TEXT CHECK (miss_shape IN ('hook', 'straight', 'slice'));

UPDATE shots SET
  miss_start = CASE miss_direction
    WHEN 'pull' THEN 'left'
    WHEN 'left' THEN 'left'
    WHEN 'push' THEN 'right'
    WHEN 'right' THEN 'right'
    ELSE 'straight'
  END,
  miss_shape = CASE miss_direction
    WHEN 'hook' THEN 'hook'
    WHEN 'slice' THEN 'slice'
    ELSE 'straight'
  END
WHERE miss_start IS NULL;

ALTER TABLE shots ALTER COLUMN miss_start SET NOT NULL;
ALTER TABLE shots ALTER COLUMN miss_shape SET NOT NULL;

ALTER TABLE shots DROP COLUMN miss_direction;
