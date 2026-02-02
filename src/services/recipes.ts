import { supabase } from './supabase'
import type { Recipe, RecipeWithIngredients, MealType, RecipeIngredient } from '@/types'

/**
 * Fetch all recipes, optionally filtered by meal type
 */
export async function getRecipes(mealType?: MealType): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .order('name')

  if (mealType) {
    query = query.eq('meal_type', mealType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching recipes:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch a single recipe with its ingredients
 */
export async function getRecipeWithIngredients(recipeId: string): Promise<RecipeWithIngredients | null> {
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single()

  if (recipeError) {
    console.error('Error fetching recipe:', recipeError)
    throw recipeError
  }

  const { data: ingredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select(`
      *,
      ingredient:ingredients(*)
    `)
    .eq('recipe_id', recipeId)

  if (ingredientsError) {
    console.error('Error fetching recipe ingredients:', ingredientsError)
    throw ingredientsError
  }

  return {
    ...recipe,
    ingredients: ingredients || []
  }
}

/**
 * Get recipe swap alternatives
 * Returns recipes matching the same meal type and kid-friendly constraint
 */
export async function getRecipeAlternatives(
  currentRecipeId: string,
  mealType: MealType,
  mustBeKidFriendly: boolean = false,
  limit: number = 5
): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('meal_type', mealType)
    .neq('id', currentRecipeId)
    .limit(limit)

  if (mustBeKidFriendly) {
    query = query.contains('cuisine_tags', ['kid-friendly'])
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching recipe alternatives:', error)
    throw error
  }

  return data || []
}

/**
 * Search recipes by name or tags
 */
export async function searchRecipes(searchTerm: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,cuisine_tags.cs.{${searchTerm}}`)
    .order('name')

  if (error) {
    console.error('Error searching recipes:', error)
    throw error
  }

  return data || []
}

/**
 * Check if a recipe is kid-friendly
 */
export function isKidFriendly(recipe: Recipe): boolean {
  return recipe.cuisine_tags.includes('kid-friendly')
}

/**
 * Get total time for a recipe (prep + cook)
 */
export function getTotalTime(recipe: Recipe): number {
  return (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)
}
