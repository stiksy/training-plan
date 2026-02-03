/**
 * Cycling Progression Logic
 * Algorithmic 14-week training plan building to 68-mile event (17 May 2025)
 */

export type CyclingPhase = 'base' | 'build' | 'taper'

export interface CyclingWorkout {
  week: number
  phase: CyclingPhase
  distance_miles: number
  duration_min: number
  intensity: 'recovery' | 'endurance' | 'tempo' | 'intervals'
  description: string
}

// Training plan constants
const GOAL_DISTANCE_MILES = 68
const TOTAL_WEEKS = 14
const BASE_PHASE_WEEKS = 5 // Weeks 1-5: Build aerobic base
const BUILD_PHASE_WEEKS = 7 // Weeks 6-12: Increase intensity and distance
const TAPER_PHASE_WEEKS = 2 // Weeks 13-14: Taper for event

/**
 * Determine which phase of training based on week number
 *
 * @param weekNumber - Week number in the plan (1-14)
 * @returns Training phase
 */
export function getCyclingPhase(weekNumber: number): CyclingPhase {
  if (weekNumber < 1 || weekNumber > TOTAL_WEEKS) {
    throw new Error(`Invalid week number: ${weekNumber}. Must be 1-${TOTAL_WEEKS}`)
  }

  if (weekNumber <= BASE_PHASE_WEEKS) {
    return 'base'
  } else if (weekNumber <= BASE_PHASE_WEEKS + BUILD_PHASE_WEEKS) {
    return 'build'
  } else {
    return 'taper'
  }
}

/**
 * Suggest a cycling workout for a specific week
 * Uses algorithmic progression (not data-driven)
 *
 * @param weekNumber - Week number in the plan (1-14)
 * @returns Cycling workout specification
 */
export function suggestCyclingWorkout(weekNumber: number): CyclingWorkout {
  const phase = getCyclingPhase(weekNumber)

  switch (phase) {
    case 'base':
      return generateBasePhaseWorkout(weekNumber)
    case 'build':
      return generateBuildPhaseWorkout(weekNumber)
    case 'taper':
      return generateTaperPhaseWorkout(weekNumber)
  }
}

/**
 * Base phase (Weeks 1-5): Build aerobic base
 * Progressive distance increase with focus on endurance
 */
function generateBasePhaseWorkout(weekNumber: number): CyclingWorkout {
  // Start at 20 miles, increase by 5 miles per week
  const distance_miles = 15 + weekNumber * 5

  // Estimate 12-15 mph average pace (conservative for base building)
  const duration_min = Math.round((distance_miles / 13) * 60)

  return {
    week: weekNumber,
    phase: 'base',
    distance_miles,
    duration_min,
    intensity: weekNumber === 1 ? 'recovery' : 'endurance',
    description:
      weekNumber === 1
        ? 'Easy spin to assess current fitness. Focus on form and comfort.'
        : `Steady endurance ride at conversational pace. Build aerobic base. ${distance_miles} miles.`,
  }
}

/**
 * Build phase (Weeks 6-12): Increase intensity and distance
 * Mix of endurance, tempo, and interval work
 */
function generateBuildPhaseWorkout(weekNumber: number): CyclingWorkout {
  const weekInPhase = weekNumber - BASE_PHASE_WEEKS

  // Progressive distance increase: 45, 50, 55, 58, 60, 62, 65 miles
  const distances = [45, 50, 55, 58, 60, 62, 65]
  const distance_miles = distances[weekInPhase - 1] || 65

  // Vary intensity across weeks
  const intensities: Array<'endurance' | 'tempo' | 'intervals'> = [
    'endurance',
    'tempo',
    'intervals',
    'endurance',
    'tempo',
    'endurance',
    'tempo',
  ]
  const intensity = intensities[weekInPhase - 1] || 'endurance'

  // Estimate pace based on intensity (14-16 mph for tempo/intervals, 13 mph for endurance)
  const avgSpeed = intensity === 'endurance' ? 13 : 15
  const duration_min = Math.round((distance_miles / avgSpeed) * 60)

  const descriptions: Record<typeof intensity, string> = {
    endurance: `Steady endurance ride. Maintain conversational pace. ${distance_miles} miles.`,
    tempo: `Tempo ride with 2-3 x 10min efforts at comfortably hard pace. ${distance_miles} miles.`,
    intervals: `Interval session: 5 x 5min hard efforts with 3min recovery. ${distance_miles} miles.`,
  }

  return {
    week: weekNumber,
    phase: 'build',
    distance_miles,
    duration_min,
    intensity,
    description: descriptions[intensity],
  }
}

/**
 * Taper phase (Weeks 13-14): Reduce volume, maintain intensity
 * Preparation for event day
 */
function generateTaperPhaseWorkout(weekNumber: number): CyclingWorkout {
  const weekInPhase = weekNumber - (BASE_PHASE_WEEKS + BUILD_PHASE_WEEKS)

  if (weekInPhase === 1) {
    // Week 13: Moderate taper with tempo efforts
    return {
      week: weekNumber,
      phase: 'taper',
      distance_miles: 45,
      duration_min: 200, // ~3h20m
      intensity: 'tempo',
      description:
        'Taper week 1: Reduced volume but maintain intensity. 2 x 15min tempo efforts. 45 miles.',
    }
  } else {
    // Week 14: Light taper, mostly recovery
    return {
      week: weekNumber,
      phase: 'taper',
      distance_miles: 30,
      duration_min: 120, // 2h
      intensity: 'recovery',
      description:
        'Final taper week: Easy spin to stay loose. Focus on rest and nutrition. 30 miles.',
    }
  }
}

/**
 * Get the current week number based on event date
 * Event date: 17 May 2025
 *
 * @param currentDate - Current date (defaults to today)
 * @returns Week number (1-14) or null if outside training period
 */
export function getCurrentWeekNumber(currentDate: Date = new Date()): number | null {
  const eventDate = new Date('2025-05-17')

  // Calculate weeks until event
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksUntilEvent = Math.ceil((eventDate.getTime() - currentDate.getTime()) / msPerWeek)

  // Training starts 14 weeks before event
  const weekNumber = TOTAL_WEEKS - weeksUntilEvent + 1

  // Check if we're in the training period
  if (weekNumber < 1 || weekNumber > TOTAL_WEEKS) {
    return null // Outside training period
  }

  return weekNumber
}

/**
 * Get full training plan (all 14 weeks)
 * Useful for displaying the entire schedule
 *
 * @returns Array of all 14 weekly workouts
 */
export function getFullTrainingPlan(): CyclingWorkout[] {
  return Array.from({ length: TOTAL_WEEKS }, (_, i) => suggestCyclingWorkout(i + 1))
}

/**
 * Get next cycling workout based on current date
 *
 * @param currentDate - Current date (defaults to today)
 * @returns Next cycling workout or null if outside training period
 */
export function getNextCyclingWorkout(currentDate: Date = new Date()): CyclingWorkout | null {
  const weekNumber = getCurrentWeekNumber(currentDate)

  if (weekNumber === null) {
    return null
  }

  return suggestCyclingWorkout(weekNumber)
}

/**
 * Calculate event date countdown
 *
 * @param currentDate - Current date (defaults to today)
 * @returns Days until event
 */
export function getDaysUntilEvent(currentDate: Date = new Date()): number {
  const eventDate = new Date('2025-05-17')
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((eventDate.getTime() - currentDate.getTime()) / msPerDay)
}
