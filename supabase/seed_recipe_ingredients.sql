-- Link recipes to ingredients with quantities
-- This creates the recipe-ingredient relationships needed for shopping lists

-- First, let's add ingredients for the 8 original recipes we have

-- Tapioca with Cheese and Tomato (breakfast)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT
  r.id,
  i.id,
  CASE
    WHEN i.name = 'Tapioca flour' THEN 100
    WHEN i.name = 'Cheese' THEN 50
    WHEN i.name = 'Tomatoes' THEN 1
  END,
  CASE
    WHEN i.name = 'Tapioca flour' THEN 'g'
    WHEN i.name = 'Cheese' THEN 'g'
    WHEN i.name = 'Tomatoes' THEN 'units'
  END
FROM recipes r
CROSS JOIN ingredients i
WHERE r.name = 'Tapioca with Cheese and Tomato'
  AND i.name IN ('Tapioca flour', 'Cheese', 'Tomatoes');

-- Scrambled Eggs with Toast and Avocado (breakfast)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT
  r.id,
  i.id,
  CASE
    WHEN i.name = 'Eggs' THEN 4
    WHEN i.name = 'Wholemeal bread' THEN 4
    WHEN i.name = 'Avocado' THEN 1
  END,
  CASE
    WHEN i.name = 'Eggs' THEN 'units'
    WHEN i.name = 'Wholemeal bread' THEN 'units'
    WHEN i.name = 'Avocado' THEN 'units'
  END
FROM recipes r
CROSS JOIN ingredients i
WHERE r.name = 'Scrambled Eggs with Toast and Avocado'
  AND i.name IN ('Eggs', 'Wholemeal bread', 'Avocado');

-- Oats Porridge with Banana (breakfast)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT
  r.id,
  i.id,
  CASE
    WHEN i.name = 'Oats' THEN 80
    WHEN i.name = 'Milk' THEN 300
    WHEN i.name = 'Bananas' THEN 2
    WHEN i.name = 'Cinnamon' THEN 1
  END,
  CASE
    WHEN i.name = 'Oats' THEN 'g'
    WHEN i.name = 'Milk' THEN 'ml'
    WHEN i.name = 'Bananas' THEN 'units'
    WHEN i.name = 'Cinnamon' THEN 'tsp'
  END
FROM recipes r
CROSS JOIN ingredients i
WHERE r.name = 'Oats Porridge with Banana'
  AND i.name IN ('Oats', 'Milk', 'Bananas', 'Cinnamon');

-- Grilled Chicken with Quinoa and Salad (lunch)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT
  r.id,
  i.id,
  CASE
    WHEN i.name = 'Chicken breast' THEN 300
    WHEN i.name = 'Quinoa' THEN 150
    WHEN i.name = 'Lettuce' THEN 100
    WHEN i.name = 'Tomatoes' THEN 2
    WHEN i.name = 'Cucumber' THEN 1
    WHEN i.name = 'Olive oil' THEN 2
  END,
  CASE
    WHEN i.name = 'Chicken breast' THEN 'g'
    WHEN i.name = 'Quinoa' THEN 'g'
    WHEN i.name = 'Lettuce' THEN 'g'
    WHEN i.name = 'Tomatoes' THEN 'units'
    WHEN i.name = 'Cucumber' THEN 'units'
    WHEN i.name = 'Olive oil' THEN 'tbsp'
  END
FROM recipes r
CROSS JOIN ingredients i
WHERE r.name = 'Grilled Chicken with Quinoa and Salad'
  AND i.name IN ('Chicken breast', 'Quinoa', 'Lettuce', 'Tomatoes', 'Cucumber', 'Olive oil');

-- Black Bean and Sweet Potato Stew (lunch)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT
  r.id,
  i.id,
  CASE
    WHEN i.name = 'Black beans' THEN 200
    WHEN i.name = 'Sweet potato' THEN 300
    WHEN i.name = 'Onions' THEN 1
    WHEN i.name = 'Garlic' THEN 2
    WHEN i.name = 'Olive oil' THEN 1
  END,
  CASE
    WHEN i.name = 'Black beans' THEN 'g'
    WHEN i.name = 'Sweet potato' THEN 'g'
    WHEN i.name = 'Onions' THEN 'units'
    WHEN i.name = 'Garlic' THEN 'units'
    WHEN i.name = 'Olive oil' THEN 'tbsp'
  END
FROM recipes r
CROSS JOIN ingredients i
WHERE r.name = 'Black Bean and Sweet Potato Stew'
  AND i.name IN ('Black beans', 'Sweet potato', 'Onions', 'Garlic', 'Olive oil');

-- Feijoada (Simplified) (dinner)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT
  r.id,
  i.id,
  CASE
    WHEN i.name = 'Black beans' THEN 400
    WHEN i.name = 'Lean pork' THEN 300
    WHEN i.name = 'Brown rice' THEN 200
    WHEN i.name = 'Collard greens' THEN 200
    WHEN i.name = 'Onions' THEN 1
    WHEN i.name = 'Garlic' THEN 3
    WHEN i.name = 'Oranges' THEN 2
  END,
  CASE
    WHEN i.name = 'Black beans' THEN 'g'
    WHEN i.name = 'Lean pork' THEN 'g'
    WHEN i.name = 'Brown rice' THEN 'g'
    WHEN i.name = 'Collard greens' THEN 'g'
    WHEN i.name = 'Onions' THEN 'units'
    WHEN i.name = 'Garlic' THEN 'units'
    WHEN i.name = 'Oranges' THEN 'units'
  END
FROM recipes r
CROSS JOIN ingredients i
WHERE r.name = 'Feijoada (Simplified)'
  AND i.name IN ('Black beans', 'Lean pork', 'Brown rice', 'Collard greens', 'Onions', 'Garlic', 'Oranges');

-- Strogonoff de Frango (dinner)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT
  r.id,
  i.id,
  CASE
    WHEN i.name = 'Chicken breast' THEN 400
    WHEN i.name = 'Mushrooms' THEN 200
    WHEN i.name = 'Onions' THEN 1
    WHEN i.name = 'Tomato sauce' THEN 200
    WHEN i.name = 'Sour cream' THEN 100
    WHEN i.name = 'Brown rice' THEN 200
  END,
  CASE
    WHEN i.name = 'Chicken breast' THEN 'g'
    WHEN i.name = 'Mushrooms' THEN 'g'
    WHEN i.name = 'Onions' THEN 'units'
    WHEN i.name = 'Tomato sauce' THEN 'ml'
    WHEN i.name = 'Sour cream' THEN 'ml'
    WHEN i.name = 'Brown rice' THEN 'g'
  END
FROM recipes r
CROSS JOIN ingredients i
WHERE r.name = 'Strogonoff de Frango'
  AND i.name IN ('Chicken breast', 'Mushrooms', 'Onions', 'Tomato sauce', 'Sour cream', 'Brown rice');

-- Grilled Fish with Rice and Farofa (dinner)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT
  r.id,
  i.id,
  CASE
    WHEN i.name = 'White fish fillet' THEN 400
    WHEN i.name = 'Brown rice' THEN 200
    WHEN i.name = 'Cassava flour' THEN 100
    WHEN i.name = 'Onions' THEN 1
    WHEN i.name = 'Tomatoes' THEN 2
    WHEN i.name = 'Olive oil' THEN 2
  END,
  CASE
    WHEN i.name = 'White fish fillet' THEN 'g'
    WHEN i.name = 'Brown rice' THEN 'g'
    WHEN i.name = 'Cassava flour' THEN 'g'
    WHEN i.name = 'Onions' THEN 'units'
    WHEN i.name = 'Tomatoes' THEN 'units'
    WHEN i.name = 'Olive oil' THEN 'tbsp'
  END
FROM recipes r
CROSS JOIN ingredients i
WHERE r.name = 'Grilled Fish with Rice and Farofa'
  AND i.name IN ('White fish fillet', 'Brown rice', 'Cassava flour', 'Onions', 'Tomatoes', 'Olive oil');

-- Verify results
SELECT
  r.name as recipe_name,
  COUNT(ri.ingredient_id) as ingredient_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
GROUP BY r.id, r.name
ORDER BY r.name;
