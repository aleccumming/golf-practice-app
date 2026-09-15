CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clubs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('wood','iron','wedge','putter','hybrid')),
  avg_carry_yds INTEGER,
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('range','course','putting_green')),
  duration_min INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shots (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  club_id INTEGER NOT NULL REFERENCES clubs(id),
  shot_type TEXT NOT NULL CHECK (shot_type IN ('tee','approach','chip','punch')),
  target_line TEXT NOT NULL CHECK (target_line IN ('straight','draw','fade')),
  miss_direction TEXT NOT NULL CHECK (miss_direction IN ('straight','left','right','pull','push','hook','slice')),
  miss_distance_yds REAL,
  contact TEXT CHECK (contact IN ('flush','thin','fat','toe','heel')),
  lie TEXT NOT NULL CHECK (lie IN ('tee','fairway','rough','sand','range_mat')),
  distance_to_target_yds REAL,
  confidence_pre_shot INTEGER CHECK (confidence_pre_shot BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shots_club_created ON shots(club_id, created_at);
CREATE INDEX IF NOT EXISTS idx_shots_session ON shots(session_id);
CREATE INDEX IF NOT EXISTS idx_shots_user ON shots(user_id);

CREATE TABLE IF NOT EXISTS putts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  distance_ft REAL NOT NULL,
  break TEXT NOT NULL CHECK (break IN ('straight','left_to_right','right_to_left')),
  slope TEXT NOT NULL CHECK (slope IN ('uphill','downhill','flat')),
  result TEXT NOT NULL CHECK (result IN ('made','missed_left','missed_right','missed_short','missed_long')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_putts_created ON putts(created_at);
CREATE INDEX IF NOT EXISTS idx_putts_session ON putts(session_id);
CREATE INDEX IF NOT EXISTS idx_putts_user ON putts(user_id);

CREATE TABLE IF NOT EXISTS drills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('full_swing','short_game','putting')),
  targets_miss_pattern TEXT NOT NULL,
  club_focus_id INTEGER REFERENCES clubs(id),
  description TEXT NOT NULL,
  est_duration_min INTEGER NOT NULL,
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 3)
);

CREATE TABLE IF NOT EXISTS practice_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  based_on_pattern TEXT,
  total_duration_min INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_practice_plans_user ON practice_plans(user_id);

CREATE TABLE IF NOT EXISTS practice_plan_drills (
  id SERIAL PRIMARY KEY,
  practice_plan_id INTEGER NOT NULL REFERENCES practice_plans(id) ON DELETE CASCADE,
  drill_id INTEGER NOT NULL REFERENCES drills(id),
  order_index INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_ppd_plan ON practice_plan_drills(practice_plan_id);
