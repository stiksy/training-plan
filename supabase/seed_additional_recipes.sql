-- Additional recipes to reach 30 total (adding 22 more)
-- Run this after the initial seed.sql

-- First, let's add more ingredients needed for the new recipes
INSERT INTO ingredients (name, category, default_unit) VALUES
  -- More proteins
  ('Turkey mince', 'protein', 'g'),
  ('Tuna (canned)', 'protein', 'g'),
  ('Prawns', 'protein', 'g'),
  ('Lean pork', 'protein', 'g'),

  -- More produce
  ('Avocado', 'produce', 'units'),
  ('Cucumber', 'produce', 'units'),
  ('Carrots', 'produce', 'g'),
  ('Lettuce', 'produce', 'g'),
  ('Mushrooms', 'produce', 'g'),
  ('Courgette', 'produce', 'units'),
  ('Aubergine', 'produce', 'units'),
  ('Mangoes', 'produce', 'units'),
  ('Oranges', 'produce', 'units'),
  ('Apples', 'produce', 'units'),

  -- More grains
  ('Tortillas', 'grain', 'units'),
  ('Pita bread', 'grain', 'units'),
  ('Cassava flour', 'grain', 'g'),

  -- More dairy
  ('Cream cheese', 'dairy', 'g'),
  ('Sour cream', 'dairy', 'g'),
  ('Parmesan', 'dairy', 'g'),

  -- More pantry items
  ('Peanut butter', 'pantry', 'tbsp'),
  ('Honey', 'pantry', 'tbsp'),
  ('Soy sauce', 'pantry', 'tbsp'),
  ('Lime juice', 'pantry', 'tbsp'),
  ('Vinegar', 'pantry', 'tbsp');

-- Additional Breakfast Recipes (to reach 7+ total)
INSERT INTO recipes (name, meal_type, cuisine_tags, servings, prep_time_min, cook_time_min, instructions) VALUES
  (
    'Fruit Smoothie Bowl with Granola',
    'breakfast',
    ARRAY['healthy', 'kid-friendly'],
    2,
    10,
    0,
    'Blend bananas, mixed berries, and yoghurt until smooth. Pour into bowls and top with granola and fresh fruit.'
  ),
  (
    'Pão Francês with Requeijão and Papaya',
    'breakfast',
    ARRAY['brazilian', 'kid-friendly'],
    2,
    5,
    5,
    'Toast pão francês. Spread with requeijão. Serve with sliced papaya on the side.'
  ),
  (
    'Greek Yoghurt with Berries and Honey',
    'breakfast',
    ARRAY['healthy', 'kid-friendly'],
    2,
    5,
    0,
    'Serve Greek yoghurt in bowls. Top with mixed berries and drizzle with honey.'
  ),
  (
    'Omelette with Mushrooms and Spinach',
    'breakfast',
    ARRAY['healthy'],
    2,
    5,
    10,
    'Beat eggs with salt and pepper. Pour into hot pan. Add sautéed mushrooms and spinach. Fold and serve.'
  ),
  (
    'Pão de Queijo with Fresh Fruit',
    'breakfast',
    ARRAY['brazilian', 'kid-friendly'],
    2,
    10,
    25,
    'Bake pão de queijo according to package. Serve warm with sliced mango and orange.'
  );

-- Additional Lunch Recipes (to reach 10+ total)
INSERT INTO recipes (name, meal_type, cuisine_tags, servings, prep_time_min, cook_time_min, instructions) VALUES
  (
    'Tuna Salad with Mixed Greens and Olive Oil',
    'lunch',
    ARRAY['healthy'],
    2,
    10,
    0,
    'Mix canned tuna with lettuce, cucumber, tomatoes, and olives. Dress with olive oil and lime juice.'
  ),
  (
    'Brown Rice with Grilled Fish and Vegetables',
    'lunch',
    ARRAY['healthy'],
    2,
    10,
    25,
    'Cook brown rice. Grill white fish. Roast vegetables (peppers, courgette, aubergine). Serve together.'
  ),
  (
    'Lentil Soup with Wholemeal Bread',
    'lunch',
    ARRAY['healthy', 'vegetarian'],
    2,
    10,
    30,
    'Cook lentils with onions, carrots, celery, and vegetable stock. Season well. Serve with toasted wholemeal bread.'
  ),
  (
    'Turkey Wrap with Hummus and Salad',
    'lunch',
    ARRAY['healthy'],
    2,
    10,
    5,
    'Spread tortilla with hummus. Add sliced turkey, lettuce, cucumber, and tomatoes. Roll and slice in half.'
  ),
  (
    'Pasta with Tomato Sauce and Lean Mince',
    'lunch',
    ARRAY['kid-friendly'],
    2,
    10,
    20,
    'Cook pasta. Brown lean beef mince with onions and garlic. Add tomato sauce and simmer. Combine with pasta.'
  ),
  (
    'Chicken Parmigiana with Salad',
    'lunch',
    ARRAY['kid-friendly'],
    2,
    15,
    25,
    'Coat chicken breast in breadcrumbs. Pan-fry until golden. Top with tomato sauce and cheese. Serve with mixed salad.'
  ),
  (
    'Grilled Salmon with Roasted Vegetables',
    'lunch',
    ARRAY['healthy'],
    2,
    10,
    20,
    'Season salmon with salt, pepper, and lemon. Grill until cooked. Roast vegetables (broccoli, carrots, peppers) with olive oil.'
  ),
  (
    'Chickpea and Vegetable Curry',
    'lunch',
    ARRAY['vegetarian', 'kid-friendly'],
    2,
    10,
    25,
    'Sauté onions, add curry spices. Add chickpeas, sweet potato, and tomatoes. Simmer until tender. Serve with rice.'
  );

-- Additional Dinner Recipes (to reach 10+ total, all kid-friendly)
INSERT INTO recipes (name, meal_type, cuisine_tags, servings, prep_time_min, cook_time_min, instructions) VALUES
  (
    'Moqueca de Peixe (Brazilian Fish Stew)',
    'dinner',
    ARRAY['brazilian', 'kid-friendly'],
    4,
    15,
    30,
    'Layer fish, onions, peppers, and tomatoes in pot. Add coconut milk and lime juice. Simmer gently. Serve with rice and pirão.'
  ),
  (
    'Frango Assado with Roast Potatoes',
    'dinner',
    ARRAY['brazilian', 'kid-friendly'],
    4,
    15,
    60,
    'Season whole chicken with garlic, salt, and herbs. Roast with potatoes. Serve with steamed broccoli.'
  ),
  (
    'Spaghetti Bolognese',
    'dinner',
    ARRAY['kid-friendly'],
    4,
    10,
    30,
    'Brown lean beef mince with onions and garlic. Add tomato sauce and herbs. Simmer 20 min. Serve over cooked spaghetti with side salad.'
  ),
  (
    'Build-Your-Own Tacos',
    'dinner',
    ARRAY['kid-friendly', 'interactive'],
    4,
    15,
    15,
    'Cook seasoned turkey or beef mince. Set up toppings bar: lettuce, tomatoes, cheese, sour cream. Let kids build their own tacos.'
  ),
  (
    'Grilled Chicken with Rice and Black Beans',
    'dinner',
    ARRAY['brazilian', 'kid-friendly'],
    4,
    10,
    25,
    'Grill seasoned chicken breast. Cook rice and black beans separately. Serve with simple tomato salad (vinagrete).'
  ),
  (
    'Shepherd''s Pie',
    'dinner',
    ARRAY['kid-friendly'],
    4,
    20,
    40,
    'Brown lean mince with onions, carrots, and peas. Transfer to baking dish. Top with mashed potato. Bake until golden.'
  ),
  (
    'Peixe Grelhado with Rice and Farofa',
    'dinner',
    ARRAY['brazilian', 'kid-friendly'],
    4,
    10,
    20,
    'Grill white fish with lemon and garlic. Cook rice. Prepare farofa (toast cassava flour with butter and onions). Serve with tomato salad.'
  ),
  (
    'Picanha with Farofa and Vinagrete',
    'dinner',
    ARRAY['brazilian', 'kid-friendly'],
    4,
    10,
    20,
    'Grill picanha (top sirloin cap) with coarse salt. Prepare farofa and vinagrete (tomato-onion salsa). Serve with rice.'
  ),
  (
    'Chicken and Vegetable Stir-Fry',
    'dinner',
    ARRAY['kid-friendly', 'healthy'],
    4,
    15,
    15,
    'Cut chicken into strips. Stir-fry with mixed vegetables (peppers, broccoli, carrots). Season with soy sauce and garlic. Serve over rice.'
  );

-- Summary of recipe counts after this seed:
-- Breakfast: 8 recipes (was 3, added 5)
-- Lunch: 10 recipes (was 2, added 8)
-- Dinner: 9 recipes (was 3, added 6)
-- Total: 27 recipes (need 3 more to reach 30)

-- Let's add 3 more for variety
INSERT INTO recipes (name, meal_type, cuisine_tags, servings, prep_time_min, cook_time_min, instructions) VALUES
  (
    'Açaí Bowl',
    'breakfast',
    ARRAY['brazilian', 'healthy'],
    2,
    10,
    0,
    'Blend frozen açaí pulp with banana. Pour into bowls. Top with granola, sliced banana, and drizzle with honey.'
  ),
  (
    'Bobó de Camarão',
    'lunch',
    ARRAY['brazilian'],
    2,
    20,
    30,
    'Cook prawns with garlic and lime. Blend cassava with coconut milk to make purée. Combine with prawns. Serve with rice.'
  ),
  (
    'Arroz com Feijão and Grilled Protein',
    'dinner',
    ARRAY['brazilian', 'kid-friendly'],
    4,
    10,
    30,
    'Classic Brazilian rice and black beans. Serve with choice of grilled chicken, fish, or beef. Add simple salad on the side.'
  );

-- Final count: 30 recipes total (8 breakfast, 10 lunch, 12 dinner)
