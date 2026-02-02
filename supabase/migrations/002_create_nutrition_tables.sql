-- Ingredients table
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('produce', 'protein', 'dairy', 'grain', 'pantry', 'spice', 'other')),
  default_unit TEXT NOT NULL CHECK (default_unit IN ('g', 'ml', 'units', 'tbsp', 'tsp', 'cup'))
);

-- Recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  cuisine_tags TEXT[] DEFAULT '{}',
  servings INTEGER NOT NULL CHECK (servings > 0),
  prep_time_min INTEGER CHECK (prep_time_min >= 0),
  cook_time_min INTEGER CHECK (cook_time_min >= 0),
  instructions TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe ingredients (junction table)
CREATE TABLE recipe_ingredients (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  PRIMARY KEY (recipe_id, ingredient_id)
);

-- Meal plans table
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, week_start_date)
);

-- Meal plan slots table
CREATE TABLE meal_plan_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  recipe_id UUID REFERENCES recipes(id) ON DELETE RESTRICT,
  UNIQUE(meal_plan_id, day_of_week, meal_type)
);

-- Shopping lists table
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  week_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping list items table
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  checked BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_meal_plans_household ON meal_plans(household_id);
CREATE INDEX idx_meal_plans_week_start ON meal_plans(week_start_date);
CREATE INDEX idx_meal_plan_slots_plan ON meal_plan_slots(meal_plan_id);
CREATE INDEX idx_shopping_lists_household ON shopping_lists(household_id);
CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(shopping_list_id);

-- Apply updated_at trigger
CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
