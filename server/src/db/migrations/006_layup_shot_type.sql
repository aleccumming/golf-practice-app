ALTER TABLE shots DROP CONSTRAINT shots_shot_type_check;
ALTER TABLE shots ADD CONSTRAINT shots_shot_type_check CHECK (shot_type IN ('tee', 'approach', 'chip', 'punch', 'layup'));
