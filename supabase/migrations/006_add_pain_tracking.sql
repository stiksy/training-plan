-- Add pain tracking fields to workout_logs if not already present
ALTER TABLE workout_logs
ADD COLUMN IF NOT EXISTS pain_location TEXT,
ADD COLUMN IF NOT EXISTS pain_notes TEXT;

-- Create pain history table for tracking recovery periods
CREATE TABLE IF NOT EXISTS pain_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  body_part TEXT NOT NULL,
  reported_date DATE NOT NULL,
  resolved_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pain_history_user ON pain_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pain_history_reported_date ON pain_history(reported_date);
CREATE INDEX IF NOT EXISTS idx_pain_history_resolved_date ON pain_history(resolved_date);

-- Add favourites flag to meal_plan_slots
ALTER TABLE meal_plan_slots
ADD COLUMN IF NOT EXISTS is_favourite BOOLEAN DEFAULT FALSE;

-- Add template flag to meal plans
ALTER TABLE meal_plans
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS template_name TEXT;

-- Add shopping list item checked status
ALTER TABLE shopping_list_items
ADD COLUMN IF NOT EXISTS checked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manually_added BOOLEAN DEFAULT FALSE;
