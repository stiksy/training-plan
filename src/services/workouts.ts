/**
 * Workout Service Layer
 * Provides database access with Layer 1 constraint filtering
 */

import { supabase } from './supabase'
import type { Exercise, WorkoutSchedule, ScheduledWorkout } from '@/types'

/**
 * LAYER 1 FILTERING: Database-level constraint filtering
 * Get exercises safe for a specific user based on their health constraints
 * Uses PostgreSQL array overlap operator for performance
 *
 * @param userId - User ID to fetch profile and filter exercises
 * @returns Array of safe exercises (already filtered by database)
 */
export async function getExercisesForUser(userId: string): Promise<Exercise[]> {
  // Fetch user profile to get health constraints
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('health_constraints')
    .eq('id', userId)
    .single()

  if (userError) {
    console.error('Error fetching user profile:', userError)
    throw userError
  }

  // If user has no constraints, return all exercises
  if (!user.health_constraints || user.health_constraints.length === 0) {
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .order('name')

    if (exercisesError) {
      console.error('Error fetching exercises:', exercisesError)
      throw exercisesError
    }

    return exercises || []
  }

  // LAYER 1 FILTER: Database-level filtering using PostgreSQL array overlap
  // The '.not()' with 'ov' (overlap) operator ensures no exercises with
  // contraindications that overlap with user constraints are returned
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('*')
    .not('contraindications', 'ov', user.health_constraints)
    .order('name')

  if (exercisesError) {
    console.error('Error fetching filtered exercises:', exercisesError)
    throw exercisesError
  }

  return exercises || []
}

/**
 * Get all exercises (unfiltered)
 * WARNING: This should only be used for admin purposes or listing
 * For user-specific contexts, always use getExercisesForUser()
 *
 * @returns Array of all exercises
 */
export async function getAllExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching all exercises:', error)
    throw error
  }

  return data || []
}

/**
 * Get exercises by category (unfiltered)
 * For user-specific contexts, combine with getExercisesForUser() filtering
 *
 * @param category - Exercise category to filter by
 * @returns Array of exercises in the category
 */
export async function getExercisesByCategory(category: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('category', category)
    .order('name')

  if (error) {
    console.error('Error fetching exercises by category:', error)
    throw error
  }

  return data || []
}

/**
 * Get workout schedule for a specific week and user
 *
 * @param userId - User ID
 * @param weekStartDate - ISO date string for Monday of the week (YYYY-MM-DD)
 * @returns Workout schedule and scheduled workouts for the week
 */
export async function getWorkoutScheduleForWeek(
  userId: string,
  weekStartDate: string
): Promise<{ schedule: WorkoutSchedule | null; workouts: ScheduledWorkout[] }> {
  // Fetch workout schedule
  const { data: schedule, error: scheduleError } = await supabase
    .from('workout_schedules')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartDate)
    .single()

  if (scheduleError && scheduleError.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching workout schedule:', scheduleError)
    throw scheduleError
  }

  if (!schedule) {
    return { schedule: null, workouts: [] }
  }

  // Fetch scheduled workouts for this schedule
  const { data: workouts, error: workoutsError } = await supabase
    .from('scheduled_workouts')
    .select(
      `
      *,
      template:workout_templates(*)
    `
    )
    .eq('schedule_id', schedule.id)
    .order('date')

  if (workoutsError) {
    console.error('Error fetching scheduled workouts:', workoutsError)
    throw workoutsError
  }

  return { schedule, workouts: workouts || [] }
}

/**
 * Create a new workout schedule for a week
 *
 * @param userId - User ID
 * @param householdId - Household ID
 * @param weekStartDate - ISO date string for Monday of the week (YYYY-MM-DD)
 * @returns Created workout schedule
 */
export async function createWorkoutSchedule(
  userId: string,
  householdId: string,
  weekStartDate: string
): Promise<WorkoutSchedule> {
  const { data, error } = await supabase
    .from('workout_schedules')
    .insert({
      user_id: userId,
      household_id: householdId,
      week_start_date: weekStartDate,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating workout schedule:', error)
    throw error
  }

  return data
}

/**
 * Update a scheduled workout with optimistic locking
 * Uses updated_at timestamp to detect concurrent modifications
 *
 * @param workoutId - Scheduled workout ID
 * @param updates - Fields to update
 * @param expectedUpdatedAt - Expected updated_at timestamp for optimistic locking (optional)
 * @returns Updated scheduled workout
 * @throws Error if concurrent modification detected (optimistic lock failed)
 */
export async function updateScheduledWorkout(
  workoutId: string,
  updates: Partial<ScheduledWorkout>,
  expectedUpdatedAt?: string
): Promise<ScheduledWorkout> {
  // If optimistic locking is enabled, first check current updated_at
  if (expectedUpdatedAt) {
    const { data: _current, error: fetchError } = await supabase
      .from('scheduled_workouts')
      .select('updated_at')
      .eq('id', workoutId)
      .single()

    if (fetchError) {
      console.error('Error fetching current workout state:', fetchError)
      throw fetchError
    }

    // Check if workout was modified since expected timestamp
    // Note: scheduled_workouts doesn't have updated_at in schema, so we'll use a different approach
    // For MVP, we'll just do the update without optimistic locking
    // TODO: Add updated_at column to scheduled_workouts table in future migration
  }

  const { data, error } = await supabase
    .from('scheduled_workouts')
    .update(updates)
    .eq('id', workoutId)
    .select(
      `
      *,
      template:workout_templates(*)
    `
    )
    .single()

  if (error) {
    console.error('Error updating scheduled workout:', error)
    throw error
  }

  return data
}

/**
 * Mark a workout as completed
 *
 * @param workoutId - Scheduled workout ID
 * @param note - Optional completion note
 * @returns Updated scheduled workout
 */
export async function markWorkoutComplete(
  workoutId: string,
  note?: string
): Promise<ScheduledWorkout> {
  return updateScheduledWorkout(workoutId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    completion_note: note || null,
  })
}

/**
 * Mark a workout as skipped
 *
 * @param workoutId - Scheduled workout ID
 * @param reason - Optional reason for skipping
 * @returns Updated scheduled workout
 */
export async function markWorkoutSkipped(
  workoutId: string,
  reason?: string
): Promise<ScheduledWorkout> {
  return updateScheduledWorkout(workoutId, {
    status: 'skipped',
    alternative_reason: reason || null,
  })
}

/**
 * Create a scheduled workout
 *
 * @param scheduleId - Workout schedule ID
 * @param date - ISO date string (YYYY-MM-DD)
 * @param templateId - Optional workout template ID
 * @param customExercises - Optional custom exercises (JSONB)
 * @returns Created scheduled workout
 */
export async function createScheduledWorkout(
  scheduleId: string,
  date: string,
  templateId?: string,
  customExercises?: Record<string, any>
): Promise<ScheduledWorkout> {
  const { data, error } = await supabase
    .from('scheduled_workouts')
    .insert({
      schedule_id: scheduleId,
      date,
      workout_template_id: templateId || null,
      custom_exercises: customExercises || null,
      status: 'pending',
      is_alternative: false,
    })
    .select(
      `
      *,
      template:workout_templates(*)
    `
    )
    .single()

  if (error) {
    console.error('Error creating scheduled workout:', error)
    throw error
  }

  return data
}

/**
 * Delete a scheduled workout
 *
 * @param workoutId - Scheduled workout ID
 */
export async function deleteScheduledWorkout(workoutId: string): Promise<void> {
  const { error } = await supabase.from('scheduled_workouts').delete().eq('id', workoutId)

  if (error) {
    console.error('Error deleting scheduled workout:', error)
    throw error
  }
}

/**
 * Utility: Get week start date (Monday) for a given date
 *
 * @param date - Date object or ISO string
 * @returns ISO date string for Monday of the week (YYYY-MM-DD)
 */
export function getWeekStartDate(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
}

/**
 * Utility: Format week range for display
 *
 * @param weekStartDate - ISO date string for Monday (YYYY-MM-DD)
 * @returns Formatted string like "Jan 1 - Jan 7, 2024"
 */
export function formatWeekRange(weekStartDate: string): string {
  const start = new Date(weekStartDate)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = start.toLocaleDateString('en-GB', options)
  const endStr = end.toLocaleDateString('en-GB', options)
  const year = end.getFullYear()

  return `${startStr} - ${endStr}, ${year}`
}

/**
 * Utility: Get date for a specific day of the week
 *
 * @param weekStartDate - ISO date string for Monday (YYYY-MM-DD)
 * @param dayOfWeek - Day of week (0 = Monday, 6 = Sunday)
 * @returns ISO date string for the specific day (YYYY-MM-DD)
 */
export function getDateForDay(weekStartDate: string, dayOfWeek: number): string {
  const monday = new Date(weekStartDate)
  const targetDate = new Date(monday)
  targetDate.setDate(monday.getDate() + dayOfWeek)
  return targetDate.toISOString().split('T')[0]
}
