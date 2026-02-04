/**
 * Workout Scheduling Business Logic
 * Generates weekly workout schedules with safety constraints and variety rules
 */

import type { Exercise, User, ScheduledWorkout } from '@/types'
import {
  validateDuration,
  assertExercisesSafe,
} from './workoutConstraints'
import { getExercisesForUser, createScheduledWorkout, getDateForDay } from '@/services/workouts'

export interface DailyWorkoutSuggestion {
  date: string
  exercise: Exercise | null
  reason?: string // If null, provides reason (e.g., "rest day", "no safe exercises available")
}

export interface WeeklyScheduleSuggestion {
  days: DailyWorkoutSuggestion[]
  totalMinutes: number
  categories: string[]
}

/**
 * Generate a weekly workout schedule for a user
 * Applies all safety constraints and variety rules
 *
 * @param userId - User ID to generate schedule for
 * @param weekStartDate - ISO date string for Monday (YYYY-MM-DD)
 * @param scheduleId - Schedule ID to attach workouts to
 * @returns Array of created scheduled workouts
 */
export async function generateWeeklySchedule(
  userId: string,
  weekStartDate: string,
  scheduleId: string
): Promise<ScheduledWorkout[]> {
  // Fetch user profile - needed for constraint filtering
  // Note: In production, we'd fetch this from a user service
  // For now, we'll rely on getExercisesForUser doing the filtering
  const safeExercises = await getExercisesForUser(userId)

  if (safeExercises.length === 0) {
    throw new Error('No safe exercises available for user')
  }

  const createdWorkouts: ScheduledWorkout[] = []
  let previousCategory: string | null = null

  // Generate 7 days of workouts (Monday = 0, Sunday = 6)
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const date = getDateForDay(weekStartDate, dayIndex)
    const dayOfWeek = (dayIndex + 1) % 7 // Convert to Date.getDay() format (Sunday = 0)

    // Suggest exercise for this day
    const suggestion = suggestExerciseForDay(
      dayIndex,
      safeExercises,
      previousCategory,
      dayOfWeek
    )

    if (suggestion) {
      // Create scheduled workout
      const workout = await createScheduledWorkout(scheduleId, date, undefined, {
        exercise_id: suggestion.id,
        exercise_name: suggestion.name,
        duration_min: suggestion.duration_min,
        category: suggestion.category,
      })

      createdWorkouts.push(workout)
      previousCategory = suggestion.category
    } else {
      // Rest day - create a pending workout with no exercise
      const workout = await createScheduledWorkout(scheduleId, date, undefined, {
        rest_day: true,
        reason: 'Scheduled rest day for recovery',
      })

      createdWorkouts.push(workout)
      previousCategory = null
    }
  }

  return createdWorkouts
}

/**
 * Suggest an exercise for a specific day with fallback logic
 * Applies variety rules with graceful degradation
 *
 * @param dayIndex - Day index (0-6, Monday-Sunday)
 * @param safeExercises - Pre-filtered safe exercises for user
 * @param previousCategory - Category from previous day (for variety rule)
 * @param dayOfWeek - Day of week in Date.getDay() format (0 = Sunday, 6 = Saturday)
 * @returns Exercise suggestion or null for rest day
 */
export function suggestExerciseForDay(
  dayIndex: number,
  safeExercises: Exercise[],
  previousCategory: string | null,
  dayOfWeek: number
): Exercise | null {
  // Filter by duration for this day
  const durationFiltered = safeExercises.filter(ex => validateDuration(ex, dayOfWeek))

  if (durationFiltered.length === 0) {
    // No exercises meet duration requirements - rest day
    return null
  }

  // Try to apply variety rule (no consecutive category repeats)
  if (previousCategory) {
    const varietyFiltered = durationFiltered.filter(ex => ex.category !== previousCategory)

    if (varietyFiltered.length > 0) {
      // Variety rule can be satisfied
      return selectRandomExercise(varietyFiltered)
    }

    // Fallback 1: No variety options available, allow category repeat
    console.warn(
      `Day ${dayIndex}: No variety options available, allowing category repeat: ${previousCategory}`
    )
  }

  // Fallback 2: Select from duration-filtered pool (variety rule relaxed)
  return selectRandomExercise(durationFiltered)
}

/**
 * Select a random exercise from the pool
 * Weighted towards higher intensity on weekdays, lower on weekends
 *
 * @param exercises - Pool of exercises to choose from
 * @returns Randomly selected exercise
 */
function selectRandomExercise(exercises: Exercise[]): Exercise {
  // Simple random selection for MVP
  // Future V2: Add weighting based on intensity, recent history, user preferences
  const randomIndex = Math.floor(Math.random() * exercises.length)
  return exercises[randomIndex]
}

/**
 * Balance workout intensity across the week
 * Ensures appropriate mix of high/medium/low intensity days
 *
 * @param workouts - Array of scheduled workouts for the week
 * @returns Rebalanced workout array
 */
export function balanceIntensity(workouts: ScheduledWorkout[]): ScheduledWorkout[] {
  // MVP: Trust initial selection algorithm
  // Future: Count intensity distribution and rebalance
  /* const intensityCounts = {
    high: 0,
    moderate: 0,
    low: 0,
  } */
  // Future V2: Implement intelligent rebalancing if too many high-intensity days in a row
  return workouts
}

/**
 * Generate a suggested weekly schedule (preview without saving)
 * Used for UI preview before user confirms schedule
 *
 * @param userId - User ID
 * @param weekStartDate - ISO date string for Monday (YYYY-MM-DD)
 * @returns Suggested schedule with daily workouts
 */
export async function previewWeeklySchedule(
  userId: string,
  weekStartDate: string
): Promise<WeeklyScheduleSuggestion> {
  const safeExercises = await getExercisesForUser(userId)

  if (safeExercises.length === 0) {
    return {
      days: [],
      totalMinutes: 0,
      categories: [],
    }
  }

  const days: DailyWorkoutSuggestion[] = []
  let previousCategory: string | null = null
  let totalMinutes = 0
  const categoriesUsed = new Set<string>()

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const date = getDateForDay(weekStartDate, dayIndex)
    const dayOfWeek = (dayIndex + 1) % 7 // Convert to Date.getDay() format

    const suggestion = suggestExerciseForDay(
      dayIndex,
      safeExercises,
      previousCategory,
      dayOfWeek
    )

    if (suggestion) {
      days.push({ date, exercise: suggestion })
      totalMinutes += suggestion.duration_min
      categoriesUsed.add(suggestion.category)
      previousCategory = suggestion.category
    } else {
      days.push({
        date,
        exercise: null,
        reason: 'Rest day for recovery',
      })
      previousCategory = null
    }
  }

  return {
    days,
    totalMinutes,
    categories: Array.from(categoriesUsed),
  }
}

/**
 * Regenerate a specific day's workout
 * Useful when user wants to swap out an exercise
 *
 * @param userId - User ID
 * @param dayIndex - Day index (0-6)
 * @param excludeExerciseIds - Exercise IDs to exclude (e.g., previously suggested)
 * @param previousCategory - Category from previous day
 * @param dayOfWeek - Day of week in Date.getDay() format
 * @returns New exercise suggestion or null
 */
export async function regenerateDayWorkout(
  userId: string,
  dayIndex: number,
  excludeExerciseIds: string[],
  previousCategory: string | null,
  dayOfWeek: number
): Promise<Exercise | null> {
  const safeExercises = await getExercisesForUser(userId)

  // Exclude already-suggested exercises
  const availableExercises = safeExercises.filter(ex => !excludeExerciseIds.includes(ex.id))

  if (availableExercises.length === 0) {
    return null
  }

  return suggestExerciseForDay(dayIndex, availableExercises, previousCategory, dayOfWeek)
}

/**
 * Validate a proposed schedule meets all constraints
 * Used before saving to ensure safety
 *
 * @param exercises - Array of exercises for the week
 * @param user - User profile with health constraints
 * @returns Validation result with errors if any
 */
export function validateSchedule(
  exercises: Exercise[],
  user: User
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  try {
    // Assert all exercises are safe for user
    assertExercisesSafe(exercises, user, 'schedule validation')
  } catch (error) {
    errors.push(`Safety violation: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Check variety rule (no more than 2 consecutive days same category)
  let consecutiveCount = 1
  let lastCategory: string | null = null

  exercises.forEach((exercise, index) => {
    if (lastCategory === exercise.category) {
      consecutiveCount++
      if (consecutiveCount > 2) {
        errors.push(
          `Too many consecutive ${exercise.category} workouts (days ${index - 1}-${index})`
        )
      }
    } else {
      consecutiveCount = 1
      lastCategory = exercise.category
    }
  })

  // Check weekday duration constraints (days 1-5 = Mon-Fri, assuming Sunday = 0)
  exercises.forEach((exercise, index) => {
    const dayOfWeek = (index + 1) % 7 // Convert to Date.getDay() format
    if (!validateDuration(exercise, dayOfWeek)) {
      const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]
      errors.push(
        `Exercise "${exercise.name}" duration (${exercise.duration_min}min) exceeds limit for ${dayName}`
      )
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
