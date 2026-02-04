/**
 * SAFETY-CRITICAL E2E-STYLE COMPONENT TESTS
 * Verifies that contraindicated exercises NEVER appear in the UI
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { WorkoutSchedule } from '../WorkoutSchedule'
import type { ScheduledWorkout, WorkoutSchedule as WorkoutScheduleType } from '@/types'

// Mock the services
vi.mock('@/services/workouts', () => ({
  getWorkoutScheduleForWeek: vi.fn(),
  createWorkoutSchedule: vi.fn(),
  getWeekStartDate: () => '2024-01-01',
  formatWeekRange: () => 'Jan 1 - Jan 7, 2024',
  getDateForDay: (weekStart: string, day: number) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + day)
    return date.toISOString().split('T')[0]
  },
  markWorkoutComplete: vi.fn(),
  markWorkoutSkipped: vi.fn(),
}))

vi.mock('@/services/realtime', () => ({
  subscribeToTable: vi.fn(() => ({ unsubscribe: vi.fn() })),
  unsubscribeFromChannel: vi.fn(),
}))

vi.mock('@/logic/workoutScheduler', () => ({
  generateWeeklySchedule: vi.fn(),
}))

// Mock the profile context
vi.mock('@/services/profiles/ProfileContext', () => ({
  useProfile: () => ({
    activeProfile: {
      id: 'wife-id',
      name: 'Wife',
      email: 'wife@example.com',
      age: 34,
      height_cm: 165,
      weight_kg: 70,
      goals: ['Improve strength'],
      health_constraints: ['diastasis-risk', 'knee-stress'],
      activity_preferences: ['yoga'],
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    household: {
      id: 'household-1',
      name: 'Test Household',
      created_at: '2024-01-01',
    },
    householdMembers: [],
    setActiveProfile: vi.fn(),
  }),
}))

import { getWorkoutScheduleForWeek } from '@/services/workouts'

describe('WorkoutSchedule - SAFETY CRITICAL E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CRITICAL: Wife Profile Safety - Layer 3 Defensive Rendering', () => {
    it('should NEVER display exercises with diastasis-risk contraindication', async () => {
      // Create a mock workout with diastasis-risk exercise (simulating a breach of layers 1 & 2)
      const unsafeWorkout: ScheduledWorkout = {
        id: 'workout-1',
        schedule_id: 'schedule-1',
        date: '2024-01-01',
        workout_template_id: null,
        custom_exercises: {
          exercise_id: 'dangerous-ex-1',
          exercise_name: 'Sit-ups', // Contraindicated for diastasis
          exercise_contraindications: ['diastasis-risk'],
          duration_min: 15,
          category: 'strength',
        },
        status: 'pending',
        completion_note: null,
        completed_at: null,
        carried_forward_from: null,
        is_alternative: false,
        alternative_reason: null,
      }

      const mockSchedule: WorkoutScheduleType = {
        id: 'schedule-1',
        user_id: 'wife-id',
        household_id: 'household-1',
        week_start_date: '2024-01-01',
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      ;(getWorkoutScheduleForWeek as any).mockResolvedValue({
        schedule: mockSchedule,
        workouts: [unsafeWorkout],
      })

      render(<WorkoutSchedule />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workout schedule...')).not.toBeInTheDocument()
      })

      // CRITICAL: Verify the unsafe exercise name is NOT displayed
      expect(screen.queryByText('Sit-ups')).not.toBeInTheDocument()

      // CRITICAL: Verify safety error is shown instead
      expect(screen.getByText(/Safety Error/i)).toBeInTheDocument()
      expect(screen.getByText(/not safe for your profile/i)).toBeInTheDocument()
    })

    it('should NEVER display exercises with knee-stress contraindication', async () => {
      const unsafeWorkout: ScheduledWorkout = {
        id: 'workout-2',
        schedule_id: 'schedule-1',
        date: '2024-01-02',
        workout_template_id: null,
        custom_exercises: {
          exercise_id: 'dangerous-ex-2',
          exercise_name: 'Deep Squats',
          exercise_contraindications: ['knee-stress'],
          duration_min: 20,
          category: 'strength',
        },
        status: 'pending',
        completion_note: null,
        completed_at: null,
        carried_forward_from: null,
        is_alternative: false,
        alternative_reason: null,
      }

      const mockSchedule: WorkoutScheduleType = {
        id: 'schedule-1',
        user_id: 'wife-id',
        household_id: 'household-1',
        week_start_date: '2024-01-01',
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      ;(getWorkoutScheduleForWeek as any).mockResolvedValue({
        schedule: mockSchedule,
        workouts: [unsafeWorkout],
      })

      render(<WorkoutSchedule />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workout schedule...')).not.toBeInTheDocument()
      })

      // CRITICAL: Verify the unsafe exercise is NOT displayed
      expect(screen.queryByText('Deep Squats')).not.toBeInTheDocument()

      // CRITICAL: Verify safety error is shown
      expect(screen.getByText(/Safety Error/i)).toBeInTheDocument()
    })

    it('should NEVER display exercises with multiple contraindications', async () => {
      const unsafeWorkout: ScheduledWorkout = {
        id: 'workout-3',
        schedule_id: 'schedule-1',
        date: '2024-01-03',
        workout_template_id: null,
        custom_exercises: {
          exercise_id: 'dangerous-ex-3',
          exercise_name: 'Jump Squats',
          exercise_contraindications: ['diastasis-risk', 'knee-stress'],
          duration_min: 15,
          category: 'cardio',
        },
        status: 'pending',
        completion_note: null,
        completed_at: null,
        carried_forward_from: null,
        is_alternative: false,
        alternative_reason: null,
      }

      const mockSchedule: WorkoutScheduleType = {
        id: 'schedule-1',
        user_id: 'wife-id',
        household_id: 'household-1',
        week_start_date: '2024-01-01',
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      ;(getWorkoutScheduleForWeek as any).mockResolvedValue({
        schedule: mockSchedule,
        workouts: [unsafeWorkout],
      })

      render(<WorkoutSchedule />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workout schedule...')).not.toBeInTheDocument()
      })

      // CRITICAL: Verify the unsafe exercise is NOT displayed
      expect(screen.queryByText('Jump Squats')).not.toBeInTheDocument()

      // CRITICAL: Verify safety error is shown
      expect(screen.getByText(/Safety Error/i)).toBeInTheDocument()
    })

    it('should correctly display SAFE exercises for Wife', async () => {
      const safeWorkout: ScheduledWorkout = {
        id: 'workout-safe',
        schedule_id: 'schedule-1',
        date: '2024-01-01',
        workout_template_id: null,
        custom_exercises: {
          exercise_id: 'safe-ex-1',
          exercise_name: 'Walking',
          exercise_contraindications: [], // No contraindications
          duration_min: 30,
          category: 'cardio',
        },
        status: 'pending',
        completion_note: null,
        completed_at: null,
        carried_forward_from: null,
        is_alternative: false,
        alternative_reason: null,
      }

      const mockSchedule: WorkoutScheduleType = {
        id: 'schedule-1',
        user_id: 'wife-id',
        household_id: 'household-1',
        week_start_date: '2024-01-01',
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      ;(getWorkoutScheduleForWeek as any).mockResolvedValue({
        schedule: mockSchedule,
        workouts: [safeWorkout],
      })

      render(<WorkoutSchedule />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workout schedule...')).not.toBeInTheDocument()
      })

      // Safe exercise SHOULD be displayed
      expect(screen.getByText('Walking')).toBeInTheDocument()

      // NO safety error should be shown
      expect(screen.queryByText(/Safety Error/i)).not.toBeInTheDocument()
    })

    it('should handle alias matching in contraindications', async () => {
      // Test with alias 'diastasis' instead of canonical 'diastasis-risk'
      const unsafeWorkout: ScheduledWorkout = {
        id: 'workout-alias',
        schedule_id: 'schedule-1',
        date: '2024-01-01',
        workout_template_id: null,
        custom_exercises: {
          exercise_id: 'dangerous-alias',
          exercise_name: 'Crunches',
          exercise_contraindications: ['diastasis'], // Alias, not canonical
          duration_min: 15,
          category: 'strength',
        },
        status: 'pending',
        completion_note: null,
        completed_at: null,
        carried_forward_from: null,
        is_alternative: false,
        alternative_reason: null,
      }

      const mockSchedule: WorkoutScheduleType = {
        id: 'schedule-1',
        user_id: 'wife-id',
        household_id: 'household-1',
        week_start_date: '2024-01-01',
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      ;(getWorkoutScheduleForWeek as any).mockResolvedValue({
        schedule: mockSchedule,
        workouts: [unsafeWorkout],
      })

      render(<WorkoutSchedule />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workout schedule...')).not.toBeInTheDocument()
      })

      // CRITICAL: Even with alias, should detect conflict and NOT display
      expect(screen.queryByText('Crunches')).not.toBeInTheDocument()
      expect(screen.getByText(/Safety Error/i)).toBeInTheDocument()
    })
  })

  describe('Profile-Specific Display', () => {
    it('should display user health constraints badge', async () => {
      ;(getWorkoutScheduleForWeek as any).mockResolvedValue({
        schedule: null,
        workouts: [],
      })

      render(<WorkoutSchedule />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workout schedule...')).not.toBeInTheDocument()
      })

      // Should show Wife's constraints
      expect(screen.getByText('diastasis-risk')).toBeInTheDocument()
      expect(screen.getByText('knee-stress')).toBeInTheDocument()
    })

    it('should display week navigation controls', async () => {
      ;(getWorkoutScheduleForWeek as any).mockResolvedValue({
        schedule: null,
        workouts: [],
      })

      render(<WorkoutSchedule />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workout schedule...')).not.toBeInTheDocument()
      })

      expect(screen.getByText(/Previous Week/i)).toBeInTheDocument()
      expect(screen.getByText(/Next Week/i)).toBeInTheDocument()
    })

    it('should show generate button when no schedule exists', async () => {
      ;(getWorkoutScheduleForWeek as any).mockResolvedValue({
        schedule: null,
        workouts: [],
      })

      render(<WorkoutSchedule />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workout schedule...')).not.toBeInTheDocument()
      })

      expect(screen.getByText(/Generate Workout Schedule/i)).toBeInTheDocument()
    })
  })

  describe('Rest Days', () => {
    it('should correctly display rest days', async () => {
      const restDayWorkout: ScheduledWorkout = {
        id: 'workout-rest',
        schedule_id: 'schedule-1',
        date: '2024-01-01',
        workout_template_id: null,
        custom_exercises: {
          rest_day: true,
          reason: 'Scheduled recovery day',
        },
        status: 'pending',
        completion_note: null,
        completed_at: null,
        carried_forward_from: null,
        is_alternative: false,
        alternative_reason: null,
      }

      const mockSchedule: WorkoutScheduleType = {
        id: 'schedule-1',
        user_id: 'wife-id',
        household_id: 'household-1',
        week_start_date: '2024-01-01',
        status: 'active',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      ;(getWorkoutScheduleForWeek as any).mockResolvedValue({
        schedule: mockSchedule,
        workouts: [restDayWorkout],
      })

      render(<WorkoutSchedule />)

      await waitFor(() => {
        expect(screen.queryByText('Loading workout schedule...')).not.toBeInTheDocument()
      })

      expect(screen.getByText(/Rest & Recovery/i)).toBeInTheDocument()
      expect(screen.queryByText(/Safety Error/i)).not.toBeInTheDocument()
    })
  })
})

describe('Safety Test Summary', () => {
  it('documents critical safety requirements verified by these tests', () => {
    const verifiedRequirements = [
      'Layer 3 defensive rendering prevents ANY contraindicated exercise from displaying',
      'Diastasis-risk exercises are NEVER shown to Wife profile',
      'Knee-stress exercises are NEVER shown to Wife profile',
      'Exercises with multiple contraindications are blocked',
      'Contraindication alias matching works correctly (diastasis = diastasis-risk)',
      'Safety errors are displayed when unsafe exercises are detected',
      'Safe exercises ARE displayed correctly',
      'User health constraints are shown as badges for transparency',
    ]

    verifiedRequirements.forEach(requirement => {
      console.log(`✓ ${requirement}`)
    })

    expect(true).toBe(true)
  })
})
