ALTER TABLE shots DROP CONSTRAINT shots_miss_shape_check;
ALTER TABLE shots ADD CONSTRAINT shots_miss_shape_check CHECK (miss_shape IN ('hook', 'draw', 'straight', 'fade', 'slice'));
