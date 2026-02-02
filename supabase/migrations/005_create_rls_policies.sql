-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycling_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's household IDs
CREATE OR REPLACE FUNCTION get_user_household_ids()
RETURNS SETOF UUID AS $$
  SELECT household_id
  FROM household_members
  WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can view household members"
  ON users FOR SELECT
  USING (id IN (
    SELECT user_id FROM household_members
    WHERE household_id IN (SELECT get_user_household_ids())
  ));

-- Households policies
CREATE POLICY "Users can view their households"
  ON households FOR SELECT
  USING (id IN (SELECT get_user_household_ids()));

-- Household members policies
CREATE POLICY "Users can view their household memberships"
  ON household_members FOR SELECT
  USING (household_id IN (SELECT get_user_household_ids()));

-- Ingredients policies (public read for all authenticated users)
CREATE POLICY "Authenticated users can view ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (true);

-- Recipes policies (public read for all authenticated users)
CREATE POLICY "Authenticated users can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view recipe ingredients"
  ON recipe_ingredients FOR SELECT
  TO authenticated
  USING (true);

-- Meal plans policies
CREATE POLICY "Users can view their household's meal plans"
  ON meal_plans FOR ALL
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can insert meal plans for their household"
  ON meal_plans FOR INSERT
  WITH CHECK (household_id IN (SELECT get_user_household_ids()));

-- Meal plan slots policies
CREATE POLICY "Users can manage meal plan slots for their household"
  ON meal_plan_slots FOR ALL
  USING (meal_plan_id IN (
    SELECT id FROM meal_plans
    WHERE household_id IN (SELECT get_user_household_ids())
  ));

-- Shopping lists policies
CREATE POLICY "Users can view their household's shopping lists"
  ON shopping_lists FOR ALL
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can insert shopping lists for their household"
  ON shopping_lists FOR INSERT
  WITH CHECK (household_id IN (SELECT get_user_household_ids()));

-- Shopping list items policies
CREATE POLICY "Users can manage shopping list items for their household"
  ON shopping_list_items FOR ALL
  USING (shopping_list_id IN (
    SELECT id FROM shopping_lists
    WHERE household_id IN (SELECT get_user_household_ids())
  ));

-- Exercises policies (public read for all authenticated users)
CREATE POLICY "Authenticated users can view exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

-- Workout templates policies (public read for all authenticated users)
CREATE POLICY "Authenticated users can view workout templates"
  ON workout_templates FOR SELECT
  TO authenticated
  USING (true);

-- Workout schedules policies
CREATE POLICY "Users can view workout schedules in their household"
  ON workout_schedules FOR SELECT
  USING (household_id IN (SELECT get_user_household_ids()));

CREATE POLICY "Users can manage their own workout schedules"
  ON workout_schedules FOR ALL
  USING (user_id = auth.uid() AND household_id IN (SELECT get_user_household_ids()));

-- Scheduled workouts policies
CREATE POLICY "Users can view scheduled workouts in their household"
  ON scheduled_workouts FOR SELECT
  USING (schedule_id IN (
    SELECT id FROM workout_schedules
    WHERE household_id IN (SELECT get_user_household_ids())
  ));

CREATE POLICY "Users can manage their own scheduled workouts"
  ON scheduled_workouts FOR ALL
  USING (schedule_id IN (
    SELECT id FROM workout_schedules
    WHERE user_id = auth.uid()
  ));

-- Weight logs policies
CREATE POLICY "Users can manage their own weight logs"
  ON weight_logs FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view household members' weight logs"
  ON weight_logs FOR SELECT
  USING (user_id IN (
    SELECT user_id FROM household_members
    WHERE household_id IN (SELECT get_user_household_ids())
  ));

-- Workout logs policies
CREATE POLICY "Users can manage their own workout logs"
  ON workout_logs FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view household members' workout logs"
  ON workout_logs FOR SELECT
  USING (user_id IN (
    SELECT user_id FROM household_members
    WHERE household_id IN (SELECT get_user_household_ids())
  ));

-- Cycling logs policies
CREATE POLICY "Users can manage their own cycling logs"
  ON cycling_logs FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can view household members' cycling logs"
  ON cycling_logs FOR SELECT
  USING (user_id IN (
    SELECT user_id FROM household_members
    WHERE household_id IN (SELECT get_user_household_ids())
  ));
