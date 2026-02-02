import { supabase } from '@/services/supabase'
import type { MealPlanSlot, ShoppingListItem, RecipeIngredient, Ingredient } from '@/types'
import { aggregateIngredients, roundToShoppingQuantity, formatQuantity, isPantryStaple } from './unitConversion'

/**
 * Category order for shopping list (optimized for Alexa reading)
 */
const CATEGORY_ORDER = [
  'protein',
  'produce',
  'dairy',
  'grain',
  'pantry',
  'spice'
]

/**
 * Category display names
 */
const CATEGORY_NAMES: Record<string, string> = {
  protein: 'PROTEIN',
  produce: 'FRESH PRODUCE',
  dairy: 'DAIRY',
  grain: 'GRAINS',
  pantry: 'PANTRY',
  spice: 'SPICES & SEASONING'
}

interface AggregatedIngredient {
  ingredient: Ingredient
  quantity: number
  unit: string
  isPantryStaple: boolean
}

/**
 * Generate shopping list from meal plan slots
 */
export async function generateShoppingList(mealPlanId: string): Promise<Map<string, AggregatedIngredient[]>> {
  // 1. Get all meal plan slots for this plan
  const { data: slots, error: slotsError } = await supabase
    .from('meal_plan_slots')
    .select('recipe_id')
    .eq('meal_plan_id', mealPlanId)

  if (slotsError) {
    console.error('Error fetching meal plan slots:', slotsError)
    throw slotsError
  }

  if (!slots || slots.length === 0) {
    return new Map()
  }

  // 2. Get all recipe ingredients for these recipes
  const recipeIds = slots.map(slot => slot.recipe_id)
  const { data: recipeIngredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select(`
      *,
      ingredient:ingredients(*)
    `)
    .in('recipe_id', recipeIds)

  if (ingredientsError) {
    console.error('Error fetching recipe ingredients:', ingredientsError)
    throw ingredientsError
  }

  if (!recipeIngredients || recipeIngredients.length === 0) {
    return new Map()
  }

  // 3. Group ingredients by ingredient_id
  const ingredientMap = new Map<string, Array<{ quantity: number; unit: string }>>()
  const ingredientDetails = new Map<string, Ingredient>()

  for (const item of recipeIngredients) {
    if (!item.ingredient) continue

    const ingredientId = item.ingredient_id

    if (!ingredientMap.has(ingredientId)) {
      ingredientMap.set(ingredientId, [])
      ingredientDetails.set(ingredientId, item.ingredient)
    }

    ingredientMap.get(ingredientId)!.push({
      quantity: item.quantity,
      unit: item.unit
    })
  }

  // 4. Aggregate quantities for each ingredient
  const aggregated = new Map<string, AggregatedIngredient[]>()

  for (const [ingredientId, quantities] of ingredientMap.entries()) {
    const ingredient = ingredientDetails.get(ingredientId)!
    const { value, unit } = aggregateIngredients(quantities)
    const roundedValue = roundToShoppingQuantity(value, unit)
    const isStaple = isPantryStaple(roundedValue, unit)

    const category = ingredient.category
    if (!aggregated.has(category)) {
      aggregated.set(category, [])
    }

    aggregated.get(category)!.push({
      ingredient,
      quantity: roundedValue,
      unit,
      isPantryStaple: isStaple
    })
  }

  // 5. Sort items within each category by name
  for (const items of aggregated.values()) {
    items.sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name))
  }

  return aggregated
}

/**
 * Format shopping list as plain text (for Alexa/clipboard)
 */
export function formatShoppingListAsText(aggregated: Map<string, AggregatedIngredient[]>): string {
  const lines: string[] = []

  // Sort categories by defined order
  const sortedCategories = Array.from(aggregated.keys()).sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a)
    const indexB = CATEGORY_ORDER.indexOf(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  for (const category of sortedCategories) {
    const items = aggregated.get(category)!
    const categoryName = CATEGORY_NAMES[category] || category.toUpperCase()

    lines.push('')
    lines.push(categoryName)

    for (const item of items) {
      const quantityStr = formatQuantity(item.quantity, item.unit as any)
      const pantryNote = item.isPantryStaple ? ' (check pantry)' : ''
      lines.push(`- ${quantityStr} ${item.ingredient.name}${pantryNote}`)
    }
  }

  return lines.join('\n').trim()
}

/**
 * Save shopping list to database
 */
export async function saveShoppingList(
  householdId: string,
  mealPlanId: string,
  weekDate: string,
  aggregated: Map<string, AggregatedIngredient[]>
): Promise<string> {
  // 1. Create shopping list record
  const { data: shoppingList, error: listError } = await supabase
    .from('shopping_lists')
    .insert({
      household_id: householdId,
      meal_plan_id: mealPlanId,
      week_date: weekDate,
      status: 'pending'
    })
    .select()
    .single()

  if (listError) {
    console.error('Error creating shopping list:', listError)
    throw listError
  }

  // 2. Create shopping list items
  const items: any[] = []

  for (const [category, categoryItems] of aggregated.entries()) {
    for (const item of categoryItems) {
      items.push({
        shopping_list_id: shoppingList.id,
        ingredient_id: item.ingredient.id,
        quantity: item.quantity,
        unit: item.unit,
        category: category,
        checked: false
      })
    }
  }

  const { error: itemsError } = await supabase
    .from('shopping_list_items')
    .insert(items)

  if (itemsError) {
    console.error('Error creating shopping list items:', itemsError)
    throw itemsError
  }

  return shoppingList.id
}

/**
 * Get shopping list from database
 */
export async function getShoppingList(shoppingListId: string): Promise<Map<string, AggregatedIngredient[]>> {
  const { data: items, error } = await supabase
    .from('shopping_list_items')
    .select(`
      *,
      ingredient:ingredients(*)
    `)
    .eq('shopping_list_id', shoppingListId)

  if (error) {
    console.error('Error fetching shopping list:', error)
    throw error
  }

  if (!items || items.length === 0) {
    return new Map()
  }

  // Group by category
  const aggregated = new Map<string, AggregatedIngredient[]>()

  for (const item of items) {
    if (!item.ingredient) continue

    const category = item.category
    if (!aggregated.has(category)) {
      aggregated.set(category, [])
    }

    aggregated.get(category)!.push({
      ingredient: item.ingredient,
      quantity: item.quantity,
      unit: item.unit,
      isPantryStaple: isPantryStaple(item.quantity, item.unit as any)
    })
  }

  // Sort items within each category
  for (const items of aggregated.values()) {
    items.sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name))
  }

  return aggregated
}

/**
 * Copy text to clipboard (browser API)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}
