import { supabase } from './supabase'
import type { MealType } from '@/types'

export async function toggleMealFavourite(slotId: string, currentFavourite: boolean): Promise<void> {
  const { error } = await supabase
    .from('meal_plan_slots')
    .update({ is_favourite: !currentFavourite })
    .eq('id', slotId)

  if (error) throw error
}

export async function getFavouriteMeals(householdId: string) {
  const { data, error } = await supabase
    .from('meal_plan_slots')
    .select('*, recipe:recipes(*), meal_plan:meal_plans!inner(*)')
    .eq('is_favourite', true)
    .eq('meal_plan.household_id', householdId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getMealHistory(householdId: string, limit: number = 12) {
  // Get past meal plans (not including current week)
  const today = new Date()
  const currentMonday = new Date(today)
  currentMonday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))
  const currentWeekStart = currentMonday.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('meal_plans')
    .select('*, meal_plan_slots(*, recipe:recipes(*))')
    .eq('household_id', householdId)
    .lt('week_start_date', currentWeekStart)
    .order('week_start_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function copyMealToSlot(
  mealPlanId: string,
  recipeId: string,
  dayOfWeek: number,
  mealType: MealType
): Promise<void> {
  // Check if slot exists
  const { data: existing } = await supabase
    .from('meal_plan_slots')
    .select('id')
    .eq('meal_plan_id', mealPlanId)
    .eq('day_of_week', dayOfWeek)
    .eq('meal_type', mealType)
    .single()

  if (existing) {
    // Update existing slot
    const { error } = await supabase
      .from('meal_plan_slots')
      .update({ recipe_id: recipeId })
      .eq('id', existing.id)

    if (error) throw error
  } else {
    // Insert new slot
    const { error } = await supabase
      .from('meal_plan_slots')
      .insert({
        meal_plan_id: mealPlanId,
        day_of_week: dayOfWeek,
        meal_type: mealType,
        recipe_id: recipeId,
      })

    if (error) throw error
  }
}
