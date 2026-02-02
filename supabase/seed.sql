-- Seed file for initial household, users, recipes, and exercises
-- This creates test data for the two-person household

-- Create household
INSERT INTO households (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Marquardt Household');

-- Create users (Note: Actual auth users need to be created through Supabase Auth)
-- These are placeholder records. You'll need to update with real user IDs after signup
INSERT INTO users (id, name, email, age, height_cm, weight_kg, goals, health_constraints, activity_preferences) VALUES
  (
    '00000000-0000-0000-0000-000000000101',
    'Fernando',
    'fernando@example.com',
    41,
    175.0,
    85.0,
    ARRAY['Complete Hampshire Hilly Hundred (68 miles)', 'Maintain calorie deficit', 'Improve overall fitness'],
    ARRAY[]::TEXT[],
    ARRAY['cycling', 'gym workouts', 'yoga']
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'Wife',
    'wife@example.com',
    34,
    165.0,
    70.0,
    ARRAY['Improve strength', 'Maintain calorie deficit', 'Enjoy movement'],
    ARRAY['diastasis-risk', 'knee-stress'],
    ARRAY['dancing', 'yoga', 'low-impact cardio']
  );

-- Create household memberships
INSERT INTO household_members (household_id, user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'admin'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'admin');

-- Seed ingredients (sample set)
INSERT INTO ingredients (name, category, default_unit) VALUES
  -- Proteins
  ('Chicken breast', 'protein', 'g'),
  ('Lean beef mince', 'protein', 'g'),
  ('White fish fillet', 'protein', 'g'),
  ('Salmon', 'protein', 'g'),
  ('Eggs', 'protein', 'units'),
  ('Black beans', 'protein', 'g'),
  ('Lentils', 'protein', 'g'),

  -- Fresh produce
  ('Tomatoes', 'produce', 'units'),
  ('Onions', 'produce', 'units'),
  ('Bell peppers', 'produce', 'units'),
  ('Spinach', 'produce', 'g'),
  ('Collard greens', 'produce', 'g'),
  ('Bananas', 'produce', 'units'),
  ('Papaya', 'produce', 'g'),
  ('Mixed berries', 'produce', 'g'),
  ('Broccoli', 'produce', 'g'),
  ('Sweet potato', 'produce', 'g'),

  -- Dairy
  ('Cheese', 'dairy', 'g'),
  ('Greek yoghurt', 'dairy', 'g'),
  ('Milk', 'dairy', 'ml'),
  ('Requeijão', 'dairy', 'g'),

  -- Grains
  ('Brown rice', 'grain', 'g'),
  ('Quinoa', 'grain', 'g'),
  ('Wholemeal bread', 'grain', 'units'),
  ('Pasta', 'grain', 'g'),
  ('Oats', 'grain', 'g'),
  ('Tapioca flour', 'grain', 'g'),

  -- Pantry
  ('Olive oil', 'pantry', 'tbsp'),
  ('Coconut milk', 'pantry', 'ml'),
  ('Tomato sauce', 'pantry', 'ml'),

  -- Spices
  ('Salt', 'spice', 'tsp'),
  ('Black pepper', 'spice', 'tsp'),
  ('Garlic', 'spice', 'units'),
  ('Cinnamon', 'spice', 'tsp');

-- Seed sample recipes (Brazilian-inspired)
INSERT INTO recipes (name, meal_type, cuisine_tags, servings, prep_time_min, cook_time_min, instructions) VALUES
  (
    'Tapioca with Cheese and Tomato',
    'breakfast',
    ARRAY['brazilian', 'kid-friendly'],
    2,
    5,
    10,
    'Heat a non-stick pan. Add tapioca flour and spread evenly. Add cheese and diced tomatoes. Fold and cook until golden.'
  ),
  (
    'Scrambled Eggs with Toast and Avocado',
    'breakfast',
    ARRAY['kid-friendly'],
    2,
    5,
    10,
    'Scramble eggs with a splash of milk. Toast bread. Serve with sliced avocado.'
  ),
  (
    'Oats Porridge with Banana',
    'breakfast',
    ARRAY['kid-friendly'],
    2,
    5,
    10,
    'Cook oats with milk or water. Top with sliced banana and cinnamon.'
  ),
  (
    'Grilled Chicken with Quinoa and Salad',
    'lunch',
    ARRAY['healthy'],
    2,
    10,
    20,
    'Grill seasoned chicken breast. Cook quinoa. Serve with mixed green salad.'
  ),
  (
    'Black Bean and Sweet Potato Stew',
    'lunch',
    ARRAY['brazilian', 'vegetarian'],
    2,
    10,
    25,
    'Sauté onions and garlic. Add cubed sweet potato and black beans. Simmer until tender.'
  ),
  (
    'Feijoada (Simplified)',
    'dinner',
    ARRAY['brazilian', 'kid-friendly'],
    4,
    15,
    60,
    'Cook black beans with lean pork, onions, and garlic. Serve with rice, collard greens, and orange slices.'
  ),
  (
    'Strogonoff de Frango',
    'dinner',
    ARRAY['brazilian', 'kid-friendly'],
    4,
    10,
    25,
    'Cook chicken strips with onions and mushrooms. Add tomato sauce and cream. Serve with rice.'
  ),
  (
    'Grilled Fish with Rice and Farofa',
    'dinner',
    ARRAY['brazilian', 'kid-friendly'],
    4,
    10,
    20,
    'Grill white fish with lemon. Serve with rice and farofa (toasted cassava flour).'
  );

-- Seed sample exercises
INSERT INTO exercises (name, category, subcategory, duration_min, intensity, equipment, contraindications, modifications, youtube_url, safety_notes) VALUES
  -- Cycling exercises
  (
    'Endurance Cycling Ride',
    'cardio',
    'cycling',
    60,
    'moderate',
    ARRAY['bicycle'],
    ARRAY[]::TEXT[],
    'Start with 30 minutes and gradually increase duration',
    'https://youtube.com/watch?v=example',
    'Maintain conversational pace. Stay hydrated.'
  ),
  (
    'Cycling Tempo Intervals',
    'cardio',
    'cycling',
    30,
    'high',
    ARRAY['bicycle'],
    ARRAY[]::TEXT[],
    'Reduce interval duration if needed',
    'https://youtube.com/watch?v=example',
    '5-minute warm-up required. Cool down for 5 minutes.'
  ),

  -- Upper body strength (safe for both users)
  (
    'Upper Body Gym Workout',
    'strength',
    'upper-body',
    30,
    'moderate',
    ARRAY['dumbbells', 'resistance bands'],
    ARRAY[]::TEXT[],
    'Adjust weight as needed',
    'https://youtube.com/watch?v=example',
    'Focus on proper form over weight'
  ),

  -- Core work (diastasis-safe)
  (
    'Diastasis-Safe Core Work',
    'strength',
    'core',
    20,
    'moderate',
    ARRAY['mat'],
    ARRAY[]::TEXT[],
    'Focus on pelvic floor engagement',
    'https://youtube.com/watch?v=example',
    'Bird dogs, dead bugs, side planks (modified). Avoid crunches and full planks.'
  ),

  -- Low-impact cardio (knee-safe)
  (
    'Low-Impact Dance Cardio',
    'cardio',
    'dance',
    25,
    'moderate',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'Reduce impact by stepping instead of jumping',
    'https://youtube.com/watch?v=example',
    'Avoid high-impact movements and deep knee bends'
  ),

  -- Yoga
  (
    'Yoga Flow (Modified)',
    'flexibility',
    'yoga',
    30,
    'low',
    ARRAY['mat'],
    ARRAY['knee-stress'],
    'Use blocks for support, avoid deep lunges',
    'https://youtube.com/watch?v=example',
    'Listen to your body. Modify poses as needed.'
  ),

  -- Walking
  (
    'Walking Intervals',
    'cardio',
    'walking',
    30,
    'low',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    'Start at comfortable pace',
    NULL,
    'Safe for all fitness levels'
  ),

  -- Glutes and lower body (knee-safe)
  (
    'Glutes and Upper Body Gym',
    'strength',
    'lower-body',
    25,
    'moderate',
    ARRAY['dumbbells'],
    ARRAY['knee-stress'],
    'Focus on glute bridges, clamshells, and step-ups (low height)',
    'https://youtube.com/watch?v=example',
    'Avoid deep squats and heavy lunges. Use low step height.'
  );

-- Note: After creating auth users through Supabase, run:
-- UPDATE users SET id = '<actual-auth-uid>' WHERE email = '<user-email>';
-- UPDATE household_members SET user_id = '<actual-auth-uid>' WHERE user_id = '<placeholder-id>';
