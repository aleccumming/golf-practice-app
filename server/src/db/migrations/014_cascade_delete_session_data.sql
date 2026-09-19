ALTER TABLE shots DROP CONSTRAINT shots_session_id_fkey;
ALTER TABLE shots ADD CONSTRAINT shots_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE putts DROP CONSTRAINT putts_session_id_fkey;
ALTER TABLE putts ADD CONSTRAINT putts_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;
