-- Weight log table
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL CHECK (weight_kg > 0),
  UNIQUE(user_id, date)
);

-- Workout log table
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_workout_id UUID REFERENCES scheduled_workouts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completed_exercises JSONB NOT NULL,
  notes TEXT,
  perceived_difficulty INTEGER CHECK (perceived_difficulty >= 1 AND perceived_difficulty <= 10),
  pain_reported BOOLEAN DEFAULT FALSE,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cycling log table
CREATE TABLE cycling_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  distance_km DECIMAL(6,2) NOT NULL CHECK (distance_km > 0),
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  avg_speed_kph DECIMAL(5,2) CHECK (avg_speed_kph > 0),
  elevation_m INTEGER CHECK (elevation_m >= 0),
  notes TEXT,
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX idx_weight_logs_user ON weight_logs(user_id);
CREATE INDEX idx_weight_logs_date ON weight_logs(date);
CREATE INDEX idx_workout_logs_user ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_scheduled ON workout_logs(scheduled_workout_id);
CREATE INDEX idx_cycling_logs_user ON cycling_logs(user_id);
CREATE INDEX idx_cycling_logs_date ON cycling_logs(date);
