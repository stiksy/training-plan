/**
 * Multi-Layer Constraint Filtering for Exercise Safety
 *
 * CRITICAL: This module implements three-layer defensive architecture to ensure
 * users with health constraints NEVER see contraindicated exercises.
 *
 * Layer 1 (Database): PostgreSQL array overlap filter
 * Layer 2 (Logic): TypeScript re-filtering (THIS FILE)
 * Layer 3 (UI): Defensive rendering checks
 */

import type { Exercise, User, SafeExercise } from '@/types'

/**
 * Contraindication aliases mapping
 * Handles variations in constraint naming (e.g., 'diastasis' vs 'diastasis-risk')
 */
const CONTRAINDICATION_ALIASES: Record<string, string[]> = {
  'diastasis-risk': ['diastasis', 'diastasis-recti', 'core-pressure', 'abdominal-separation'],
  'knee-stress': ['knee', 'knee-impact', 'high-impact', 'knee-pain', 'chondromalacia', 'knee-chondromalacia'],
  'back-strain': ['back', 'lower-back', 'spine-compression'],
  'high-impact': ['impact', 'jumping', 'plyometric'],
}

/**
 * Normalizes constraint strings to canonical form with all aliases
 * @param constraints - Raw constraint strings from user profile
 * @returns Expanded set including all known aliases
 */
export function normalizeConstraints(constraints: string[]): string[] {
  const normalized = new Set<string>()

  for (const constraint of constraints) {
    const trimmed = constraint.toLowerCase().trim()

    // Add the original constraint
    normalized.add(trimmed)

    // Check if this constraint has aliases (check both canonical and alias lists)
    const canonicalMatch = Object.entries(CONTRAINDICATION_ALIASES).find(
      ([canonical, aliases]) =>
        canonical.toLowerCase() === trimmed ||
        aliases.some(alias => alias.toLowerCase() === trimmed)
    )

    if (canonicalMatch) {
      const [canonical, aliases] = canonicalMatch
      normalized.add(canonical.toLowerCase())
      aliases.forEach(alias => normalized.add(alias.toLowerCase()))
    }
  }

  return Array.from(normalized)
}

/**
 * LAYER 2 FILTERING: TypeScript safety net
 * Filters exercises based on user health constraints
 * This is the second line of defence after database-level filtering
 *
 * @param exercises - Exercise list (should already be filtered by database)
 * @param userConstraints - User's health constraints from profile
 * @returns Exercises safe for the user
 */
export function filterExercisesByConstraints(
  exercises: Exercise[],
  userConstraints: string[]
): Exercise[] {
  if (!userConstraints || userConstraints.length === 0) {
    return exercises
  }

  // Normalise user constraints to catch all aliases
  const normalizedConstraints = normalizeConstraints(userConstraints)

  return exercises.filter(exercise => {
    // No contraindications means exercise is safe
    if (!exercise.contraindications || exercise.contraindications.length === 0) {
      return true
    }

    // Normalise exercise contraindications
    const normalizedExerciseConstraints = normalizeConstraints(exercise.contraindications)

    // Check for any overlap between user constraints and exercise contraindications
    const hasContraindication = normalizedExerciseConstraints.some(
      contraindication => normalizedConstraints.includes(contraindication)
    )

    return !hasContraindication
  })
}

/**
 * Validates that an exercise is safe for a user at runtime
 * Used as assertion in development and logging in production
 *
 * @param exercise - Exercise to validate
 * @param user - User with health constraints
 * @param context - Context string for error reporting (e.g., "workout schedule generation")
 * @throws Error in development if exercise is contraindicated
 */
export function assertExerciseSafe(
  exercise: Exercise,
  user: User,
  context: string
): void {
  const normalizedConstraints = normalizeConstraints(user.health_constraints)
  const normalizedExerciseConstraints = normalizeConstraints(exercise.contraindications)

  const conflictingConstraints = normalizedExerciseConstraints.filter(
    contraindication => normalizedConstraints.includes(contraindication)
  )

  if (conflictingConstraints.length > 0) {
    const errorMessage = `SAFETY VIOLATION: Exercise "${exercise.name}" (ID: ${exercise.id}) has contraindications [${conflictingConstraints.join(', ')}] that conflict with user "${user.name}" (ID: ${user.id}) constraints [${user.health_constraints.join(', ')}]. Context: ${context}`

    // In development, crash immediately
    if (import.meta.env.DEV) {
      throw new Error(errorMessage)
    }

    // In production, log error (would integrate with monitoring service)
    console.error(errorMessage)

    // Log to audit trail
    logExerciseAssignment(user, exercise, 'REJECTED', conflictingConstraints)
  } else {
    // Log successful assignment for audit trail
    logExerciseAssignment(user, exercise, 'APPROVED', [])
  }
}

/**
 * Validates that a list of exercises are all safe for a user
 * Convenience wrapper around assertExerciseSafe for batch validation
 *
 * @param exercises - Exercises to validate
 * @param user - User with health constraints
 * @param context - Context string for error reporting
 */
export function assertExercisesSafe(
  exercises: Exercise[],
  user: User,
  context: string
): void {
  exercises.forEach(exercise => {
    assertExerciseSafe(exercise, user, context)
  })
}

/**
 * Validates duration constraint (weekday workouts must be ≤30 minutes)
 * Weekend cycling/sport rides can be up to 120 minutes
 *
 * @param exercise - Exercise to validate
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, 6 = Saturday)
 * @returns true if duration is acceptable for the day
 */
export function validateDuration(exercise: Exercise, dayOfWeek: number): boolean {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const isCycling = exercise.category === 'sport' && exercise.subcategory?.toLowerCase().includes('cycling')

  // Weekend cycling rides can be up to 120 minutes
  if (isWeekend && isCycling) {
    return exercise.duration_min <= 120
  }

  // Weekdays: all workouts must be ≤30 minutes
  if (!isWeekend) {
    return exercise.duration_min <= 30
  }

  // Weekend non-cycling can be longer but still capped
  // According to plan, weekend workouts can be up to 60 minutes for non-cycling
  return exercise.duration_min <= 60
}

/**
 * Audit logging for exercise assignments
 * Logs all exercise assignments for users with health constraints
 *
 * @param user - User being assigned exercise
 * @param exercise - Exercise being assigned
 * @param decision - 'APPROVED' or 'REJECTED'
 * @param conflicts - List of conflicting constraints (if rejected)
 */
function logExerciseAssignment(
  user: User,
  exercise: Exercise,
  decision: 'APPROVED' | 'REJECTED',
  conflicts: string[]
): void {
  // Only log for users with health constraints
  if (!user.health_constraints || user.health_constraints.length === 0) {
    return
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    user_id: user.id,
    user_name: user.name,
    user_constraints: user.health_constraints,
    exercise_id: exercise.id,
    exercise_name: exercise.name,
    exercise_contraindications: exercise.contraindications,
    decision,
    conflicts,
  }

  // In production, this would send to monitoring service (e.g., Sentry, DataDog)
  // For now, log to console with clear prefix for easy filtering
  console.log('[EXERCISE_AUDIT]', JSON.stringify(logEntry))
}

/**
 * Brands an exercise as safety-validated for compile-time type safety
 * Creates a SafeExercise with phantom type brand
 *
 * @param exercise - Exercise that has been validated
 * @param userId - User ID the exercise was validated for
 * @returns SafeExercise with type brand
 */
export function brandAsSafe(exercise: Exercise, userId: string): SafeExercise {
  return {
    ...exercise,
    _safetyValidated: true as const,
    validatedForUser: userId,
  }
}

/**
 * Multi-layer validation combining all safety checks
 * Use this as the primary entry point for exercise validation
 *
 * @param exercises - Exercises to validate
 * @param user - User with health constraints
 * @param dayOfWeek - Day of week for duration validation (optional)
 * @param context - Context string for error reporting
 * @returns Filtered and validated exercises
 */
export function validateExercisesMultiLayer(
  exercises: Exercise[],
  user: User,
  dayOfWeek?: number,
  context: string = 'exercise validation'
): Exercise[] {
  // Layer 2: Filter by constraints
  let safeExercises = filterExercisesByConstraints(exercises, user.health_constraints)

  // Assert all exercises are safe (will crash in dev if not)
  assertExercisesSafe(safeExercises, user, context)

  // Filter by duration if day specified
  if (dayOfWeek !== undefined) {
    safeExercises = safeExercises.filter(exercise => validateDuration(exercise, dayOfWeek))
  }

  return safeExercises
}
