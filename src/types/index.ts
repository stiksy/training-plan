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
