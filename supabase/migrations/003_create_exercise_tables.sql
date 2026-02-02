-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cardio', 'strength', 'flexibility', 'sport')),
  subcategory TEXT,
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  intensity TEXT NOT NULL CHECK (intensity IN ('low', 'moderate', 'high')),
  equipment TEXT[] DEFAULT '{}',
  contraindications TEXT[] DEFAULT '{}',
  modifications TEXT,
  youtube_url TEXT,
  safety_notes TEXT
);

-- Workout templates table
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  target_user_profile JSONB,
  exercises JSONB NOT NULL,
  total_duration_min INTEGER NOT NULL CHECK (total_duration_min > 0)
);

-- Workout schedules table
CREATE TABLE workout_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Scheduled workouts table
CREATE TABLE scheduled_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES workout_schedules(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  custom_exercises JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'skipped')),
  completion_note TEXT,
  completed_at TIMESTAMPTZ,
  carried_forward_from UUID REFERENCES scheduled_workouts(id) ON DELETE SET NULL,
  is_alternative BOOLEAN DEFAULT FALSE,
  alternative_reason TEXT
);

-- Create indexes
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_contraindications ON exercises USING GIN(contraindications);
CREATE INDEX idx_workout_schedules_user ON workout_schedules(user_id);
CREATE INDEX idx_workout_schedules_household ON workout_schedules(household_id);
CREATE INDEX idx_workout_schedules_week_start ON workout_schedules(week_start_date);
CREATE INDEX idx_scheduled_workouts_schedule ON scheduled_workouts(schedule_id);
CREATE INDEX idx_scheduled_workouts_date ON scheduled_workouts(date);

-- Apply updated_at trigger
CREATE TRIGGER update_workout_schedules_updated_at
  BEFORE UPDATE ON workout_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
