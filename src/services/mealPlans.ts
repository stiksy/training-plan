import { supabase } from './supabase'
import type { MealPlan, MealPlanSlot, MealType } from '@/types'

/**
 * Get meal plan for a specific week and household
 */
export async function getMealPlanForWeek(
  householdId: string,
  weekStartDate: string
): Promise<{ plan: MealPlan | null; slots: MealPlanSlot[] }> {
  // Fetch meal plan
  const { data: plan, error: planError } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('household_id', householdId)
    .eq('week_start_date', weekStartDate)
    .single()

  if (planError && planError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching meal plan:', planError)
    throw planError
  }

  if (!plan) {
    return { plan: null, slots: [] }
  }

  // Fetch meal plan slots with recipes
  const { data: slots, error: slotsError } = await supabase
    .from('meal_plan_slots')
    .select(`
      *,
      recipe:recipes(*)
    `)
    .eq('meal_plan_id', plan.id)
    .order('day_of_week')
    .order('meal_type')

  if (slotsError) {
    console.error('Error fetching meal plan slots:', slotsError)
    throw slotsError
  }

  return { plan, slots: slots || [] }
}

/**
 * Create a new meal plan for a week
 */
export async function createMealPlan(
  householdId: string,
  weekStartDate: string
): Promise<MealPlan> {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      household_id: householdId,
      week_start_date: weekStartDate,
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating meal plan:', error)
    throw error
  }

  return data
}

/**
 * Update a meal plan slot with a new recipe
 */
export async function updateMealPlanSlot(
  mealPlanId: string,
  dayOfWeek: number,
  mealType: MealType,
  recipeId: string
): Promise<MealPlanSlot> {
  // Try to update existing slot first
  const { data: existing } = await supabase
    .from('meal_plan_slots')
    .select('id')
    .eq('meal_plan_id', mealPlanId)
    .eq('day_of_week', dayOfWeek)
    .eq('meal_type', mealType)
    .single()

  if (existing) {
    // Update existing slot
    const { data, error } = await supabase
      .from('meal_plan_slots')
      .update({ recipe_id: recipeId })
      .eq('id', existing.id)
      .select(`
        *,
        recipe:recipes(*)
      `)
      .single()

    if (error) {
      console.error('Error updating meal plan slot:', error)
      throw error
    }

    return data
  } else {
    // Insert new slot
    const { data, error } = await supabase
      .from('meal_plan_slots')
      .insert({
        meal_plan_id: mealPlanId,
        day_of_week: dayOfWeek,
        meal_type: mealType,
        recipe_id: recipeId
      })
      .select(`
        *,
        recipe:recipes(*)
      `)
      .single()

    if (error) {
      console.error('Error creating meal plan slot:', error)
      throw error
    }

    return data
  }
}

/**
 * Activate a meal plan (set status to 'active')
 */
export async function activateMealPlan(mealPlanId: string): Promise<MealPlan> {
  const { data, error } = await supabase
    .from('meal_plans')
    .update({ status: 'active' })
    .eq('id', mealPlanId)
    .select()
    .single()

  if (error) {
    console.error('Error activating meal plan:', error)
    throw error
  }

  return data
}

/**
 * Get the Monday of the current week
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const monday = new Date(date.setDate(diff))
  return monday.toISOString().split('T')[0]
}

/**
 * Format date for display
 */
export function formatWeekRange(weekStartDate: string): string {
  const start = new Date(weekStartDate)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString('en-GB', options)} - ${end.toLocaleDateString('en-GB', options)}`
}

/**
 * Get day name from day of week number (0 = Monday)
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[dayOfWeek] || ''
}
