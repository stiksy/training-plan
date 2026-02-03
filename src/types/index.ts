// Core entity types based on the data model

export interface User {
  id: string
  name: string
  email: string
  age: number
  height_cm: number
  weight_kg: number
  goals: string[]
  health_constraints: string[]
  activity_preferences: string[]
  created_at: string
  updated_at: string
}

export interface Household {
  id: string
  name: string
  created_at: string
}

export interface HouseholdMember {
  household_id: string
  user_id: string
  role: 'admin' | 'member'
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type WorkoutStatus = 'pending' | 'completed' | 'skipped'
export type MealPlanStatus = 'draft' | 'active' | 'archived'
export type IngredientCategory = 'produce' | 'protein' | 'dairy' | 'grain' | 'pantry' | 'spice' | 'other'
export type IngredientUnit = 'g' | 'ml' | 'units' | 'tbsp' | 'tsp' | 'cup'

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  default_unit: IngredientUnit
}

export interface Recipe {
  id: string
  name: string
  meal_type: MealType
  cuisine_tags: string[]
  servings: number
  prep_time_min: number
  cook_time_min: number
  instructions: string
  image_url: string | null
  created_at: string
}

export interface RecipeIngredient {
  recipe_id: string
  ingredient_id: string
  quantity: number
  unit: string
  ingredient?: Ingredient
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[]
}

export interface MealPlan {
  id: string
  household_id: string
  week_start_date: string
  status: MealPlanStatus
  created_at: string
  updated_at: string
}

export interface MealPlanSlot {
  id: string
  meal_plan_id: string
  day_of_week: number
  meal_type: MealType
  recipe_id: string
  recipe?: Recipe
}

export interface ShoppingList {
  id: string
  household_id: string
  meal_plan_id: string | null
  week_date: string
  status: 'pending' | 'completed'
  created_at: string
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  ingredient_id: string
  quantity: number
  unit: string
  category: string
  checked: boolean
  ingredient?: Ingredient
}

// Workout-related types
export type ExerciseCategory = 'cardio' | 'strength' | 'flexibility' | 'sport'
export type ExerciseIntensity = 'low' | 'moderate' | 'high'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  subcategory: string | null
  duration_min: number
  intensity: ExerciseIntensity
  equipment: string[]
  contraindications: string[]
  modifications: string | null
  youtube_url: string | null
  safety_notes: string | null
}

export interface WorkoutTemplate {
  id: string
  name: string
  target_user_profile: Record<string, any> | null
  exercises: Record<string, any> // JSONB field
  total_duration_min: number
}

export interface WorkoutSchedule {
  id: string
  user_id: string
  household_id: string
  week_start_date: string
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface ScheduledWorkout {
  id: string
  schedule_id: string
  date: string
  workout_template_id: string | null
  custom_exercises: Record<string, any> | null // JSONB field
  status: WorkoutStatus
  completion_note: string | null
  completed_at: string | null
  carried_forward_from: string | null
  is_alternative: boolean
  alternative_reason: string | null
  template?: WorkoutTemplate
}

// Safety-enhanced type with phantom brand for compile-time verification
export interface SafeExercise extends Exercise {
  readonly _safetyValidated: true
  readonly validatedForUser: string
}
