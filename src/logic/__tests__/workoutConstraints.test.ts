/**
 * SAFETY-CRITICAL TESTS
 * These tests MUST PASS before any other workout code is written
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  normalizeConstraints,
  filterExercisesByConstraints,
  assertExerciseSafe,
  assertExercisesSafe,
  validateDuration,
  validateExercisesMultiLayer,
  brandAsSafe,
} from '../workoutConstraints'
import type { Exercise, User } from '@/types'

describe('workoutConstraints - SAFETY CRITICAL', () => {
  // Mock user profiles
  const wifeProfile: User = {
    id: 'wife-id',
    name: 'Wife',
    email: 'wife@example.com',
    age: 35,
    height_cm: 165,
    weight_kg: 60,
    goals: ['fitness', 'health'],
    health_constraints: ['diastasis-recti', 'knee-chondromalacia'],
    activity_preferences: ['yoga', 'walking'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const fernandoProfile: User = {
    id: 'fernando-id',
    name: 'Fernando',
    email: 'fernando@example.com',
    age: 40,
    height_cm: 180,
    weight_kg: 80,
    goals: ['cycling', 'endurance'],
    health_constraints: [],
    activity_preferences: ['cycling', 'strength'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  // Mock exercises
  const safeExercise: Exercise = {
    id: 'safe-1',
    name: 'Walking',
    category: 'cardio',
    subcategory: null,
    duration_min: 30,
    intensity: 'low',
    equipment: [],
    contraindications: [],
    modifications: null,
    safety_notes: 'Safe for all fitness levels',
    youtube_url: 'https://youtube.com/watch?v=safe1',
  }

  const diastasisRiskExercise: Exercise = {
    id: 'dangerous-1',
    name: 'Sit-ups',
    category: 'strength',
    subcategory: 'core',
    duration_min: 15,
    intensity: 'moderate',
    equipment: [],
    contraindications: ['diastasis-risk'],
    modifications: null,
    safety_notes: 'Not safe for diastasis recti',
    youtube_url: 'https://youtube.com/watch?v=dangerous1',
  }

  const kneeStressExercise: Exercise = {
    id: 'dangerous-2',
    name: 'Deep Squats',
    category: 'strength',
    subcategory: 'lower',
    duration_min: 20,
    intensity: 'high',
    equipment: [],
    contraindications: ['knee-stress'],
    modifications: null,
    safety_notes: 'Not safe for knee issues',
    youtube_url: 'https://youtube.com/watch?v=dangerous2',
  }

  const bothConstraintsExercise: Exercise = {
    id: 'dangerous-3',
    name: 'Jump Squats',
    category: 'cardio',
    subcategory: null,
    duration_min: 15,
    intensity: 'high',
    equipment: [],
    contraindications: ['diastasis-risk', 'knee-stress'],
    modifications: null,
    safety_notes: 'High impact exercise',
    youtube_url: 'https://youtube.com/watch?v=dangerous3',
  }

  describe('normalizeConstraints', () => {
    it('should handle empty constraints', () => {
      const result = normalizeConstraints([])
      expect(result).toEqual([])
    })

    it('should normalize diastasis aliases', () => {
      const result = normalizeConstraints(['diastasis'])
      expect(result).toContain('diastasis')
      expect(result).toContain('diastasis-risk')
      expect(result).toContain('diastasis-recti')
      expect(result).toContain('core-pressure')
      expect(result).toContain('abdominal-separation')
    })

    it('should normalize knee aliases', () => {
      const result = normalizeConstraints(['knee'])
      expect(result).toContain('knee')
      expect(result).toContain('knee-stress')
      expect(result).toContain('knee-impact')
      expect(result).toContain('high-impact')
      expect(result).toContain('knee-pain')
      expect(result).toContain('chondromalacia')
    })

    it('should handle canonical constraint names', () => {
      const result = normalizeConstraints(['diastasis-risk'])
      expect(result).toContain('diastasis-risk')
      expect(result).toContain('diastasis')
      expect(result).toContain('diastasis-recti')
    })

    it('should handle multiple constraints', () => {
      const result = normalizeConstraints(['diastasis', 'knee'])
      expect(result).toContain('diastasis-risk')
      expect(result).toContain('knee-stress')
    })

    it('should handle mixed canonical and alias names', () => {
      const result = normalizeConstraints(['diastasis-recti', 'knee-chondromalacia'])
      expect(result).toContain('diastasis-risk')
      expect(result).toContain('knee-stress')
    })

    it('should be case-insensitive', () => {
      const result = normalizeConstraints(['DIASTASIS', 'Knee'])
      expect(result).toContain('diastasis-risk')
      expect(result).toContain('knee-stress')
    })

    it('should trim whitespace', () => {
      const result = normalizeConstraints(['  diastasis  ', ' knee '])
      expect(result).toContain('diastasis-risk')
      expect(result).toContain('knee-stress')
    })
  })

  describe('filterExercisesByConstraints - CRITICAL SAFETY', () => {
    const allExercises = [
      safeExercise,
      diastasisRiskExercise,
      kneeStressExercise,
      bothConstraintsExercise,
    ]

    it('should return all exercises for user with no constraints', () => {
      const result = filterExercisesByConstraints(allExercises, [])
      expect(result).toHaveLength(4)
      expect(result).toContain(safeExercise)
      expect(result).toContain(diastasisRiskExercise)
      expect(result).toContain(kneeStressExercise)
      expect(result).toContain(bothConstraintsExercise)
    })

    it('should filter diastasis-risk exercises for diastasis constraint', () => {
      const result = filterExercisesByConstraints(allExercises, ['diastasis-recti'])
      expect(result).toHaveLength(2) // safe + knee-stress only
      expect(result).toContain(safeExercise)
      expect(result).toContain(kneeStressExercise)
      expect(result).not.toContain(diastasisRiskExercise)
      expect(result).not.toContain(bothConstraintsExercise)
    })

    it('should filter knee-stress exercises for knee constraint', () => {
      const result = filterExercisesByConstraints(allExercises, ['knee-chondromalacia'])
      expect(result).toHaveLength(2) // safe + diastasis-risk only
      expect(result).toContain(safeExercise)
      expect(result).toContain(diastasisRiskExercise)
      expect(result).not.toContain(kneeStressExercise)
      expect(result).not.toContain(bothConstraintsExercise)
    })

    it('CRITICAL: Wife profile should only see safe exercise', () => {
      const result = filterExercisesByConstraints(
        allExercises,
        wifeProfile.health_constraints
      )
      expect(result).toHaveLength(1)
      expect(result).toContain(safeExercise)
      expect(result).not.toContain(diastasisRiskExercise)
      expect(result).not.toContain(kneeStressExercise)
      expect(result).not.toContain(bothConstraintsExercise)
    })

    it('CRITICAL: Should filter exercises with any overlapping constraint', () => {
      const result = filterExercisesByConstraints(allExercises, ['diastasis-recti'])
      result.forEach(exercise => {
        const hasConflict = exercise.contraindications.some(c =>
          normalizeConstraints(['diastasis-recti']).includes(c)
        )
        expect(hasConflict).toBe(false)
      })
    })

    it('should handle alias matching (diastasis vs diastasis-risk)', () => {
      const exerciseWithAlias: Exercise = {
        ...diastasisRiskExercise,
        contraindications: ['diastasis'], // Alias instead of canonical
      }
      const result = filterExercisesByConstraints([exerciseWithAlias], ['diastasis-recti'])
      expect(result).toHaveLength(0)
    })

    it('should handle exercises with no contraindications as safe', () => {
      const result = filterExercisesByConstraints([safeExercise], ['diastasis-recti', 'knee'])
      expect(result).toHaveLength(1)
      expect(result).toContain(safeExercise)
    })
  })

  describe('assertExerciseSafe', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      // Mock console.error to avoid noise in test output
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('should not throw for safe exercise', () => {
      expect(() => {
        assertExerciseSafe(safeExercise, wifeProfile, 'test context')
      }).not.toThrow()
    })

    it('should throw for contraindicated exercise in DEV mode', () => {
      // In test environment (which is DEV), this will throw
      expect(() => {
        assertExerciseSafe(diastasisRiskExercise, wifeProfile, 'test context')
      }).toThrow(/SAFETY VIOLATION/)
    })

    it('should log audit trail for all assignments to users with constraints', () => {
      const consoleLogSpy = vi.spyOn(console, 'log')

      assertExerciseSafe(safeExercise, wifeProfile, 'test context')

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[EXERCISE_AUDIT]',
        expect.stringContaining('"decision":"APPROVED"')
      )
    })

    it('should not log audit trail for users without constraints', () => {
      const consoleLogSpy = vi.spyOn(console, 'log')

      assertExerciseSafe(safeExercise, fernandoProfile, 'test context')

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        '[EXERCISE_AUDIT]',
        expect.any(String)
      )
    })
  })

  describe('assertExercisesSafe', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('should validate all exercises in list', () => {
      const safeList = [safeExercise]
      expect(() => {
        assertExercisesSafe(safeList, wifeProfile, 'test context')
      }).not.toThrow()
    })

    it('should throw if any exercise is contraindicated in DEV mode', () => {
      const mixedList = [safeExercise, diastasisRiskExercise]

      expect(() => {
        assertExercisesSafe(mixedList, wifeProfile, 'test context')
      }).toThrow(/SAFETY VIOLATION/)
    })
  })

  describe('validateDuration', () => {
    const longCyclingRide: Exercise = {
      ...safeExercise,
      category: 'sport',
      subcategory: 'Cycling',
      duration_min: 90,
    }

    const longWorkout: Exercise = {
      ...safeExercise,
      duration_min: 45,
    }

    it('should allow ≤30 minute workouts on weekdays', () => {
      const mondayWorkout = { ...safeExercise, duration_min: 30 }
      expect(validateDuration(mondayWorkout, 1)).toBe(true)
    })

    it('should reject >30 minute non-cycling workouts on weekdays', () => {
      expect(validateDuration(longWorkout, 1)).toBe(false)
      expect(validateDuration(longWorkout, 2)).toBe(false)
      expect(validateDuration(longWorkout, 3)).toBe(false)
      expect(validateDuration(longWorkout, 4)).toBe(false)
      expect(validateDuration(longWorkout, 5)).toBe(false)
    })

    it('should allow up to 120 minute cycling rides on weekends', () => {
      const saturdayRide = { ...safeExercise, category: 'sport' as const, subcategory: 'Cycling', duration_min: 120 }
      expect(validateDuration(saturdayRide, 6)).toBe(true)
      expect(validateDuration(saturdayRide, 0)).toBe(true)
    })

    it('should allow up to 60 minute non-cycling workouts on weekends', () => {
      const weekendWorkout = { ...safeExercise, duration_min: 60 }
      expect(validateDuration(weekendWorkout, 6)).toBe(true)
      expect(validateDuration(weekendWorkout, 0)).toBe(true)
    })

    it('should reject >60 minute non-cycling workouts on weekends', () => {
      const veryLongWorkout = { ...safeExercise, duration_min: 90 }
      expect(validateDuration(veryLongWorkout, 6)).toBe(false)
      expect(validateDuration(veryLongWorkout, 0)).toBe(false)
    })

    it('should reject >120 minute cycling rides even on weekends', () => {
      const veryLongRide = { ...safeExercise, category: 'sport' as const, subcategory: 'Cycling', duration_min: 150 }
      expect(validateDuration(veryLongRide, 6)).toBe(false)
      expect(validateDuration(veryLongRide, 0)).toBe(false)
    })
  })

  describe('brandAsSafe', () => {
    it('should create SafeExercise with type brand', () => {
      const safe = brandAsSafe(safeExercise, 'user-123')
      expect(safe._safetyValidated).toBe(true)
      expect(safe.validatedForUser).toBe('user-123')
      expect(safe.id).toBe(safeExercise.id)
      expect(safe.name).toBe(safeExercise.name)
    })
  })

  describe('validateExercisesMultiLayer - Integration', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    const allExercises = [
      safeExercise,
      diastasisRiskExercise,
      kneeStressExercise,
      bothConstraintsExercise,
    ]

    it('CRITICAL: Should apply all layers of filtering for Wife', () => {
      const result = validateExercisesMultiLayer(
        allExercises,
        wifeProfile,
        undefined,
        'multi-layer test'
      )
      expect(result).toHaveLength(1)
      expect(result).toContain(safeExercise)
    })

    it('should filter by duration if day specified', () => {
      const longExercise: Exercise = {
        ...safeExercise,
        id: 'long-1',
        duration_min: 45,
      }
      const exercises = [safeExercise, longExercise]

      const mondayResult = validateExercisesMultiLayer(
        exercises,
        fernandoProfile,
        1, // Monday
        'duration test'
      )
      expect(mondayResult).toHaveLength(1)
      expect(mondayResult).toContain(safeExercise)
      expect(mondayResult).not.toContain(longExercise)
    })

    it('should return all safe exercises for user without constraints', () => {
      const result = validateExercisesMultiLayer(
        allExercises,
        fernandoProfile,
        undefined,
        'no constraints test'
      )
      expect(result).toHaveLength(4)
    })
  })

  describe('Property-Based Tests - CRITICAL SAFETY', () => {
    it('PROPERTY: Filtered exercises NEVER contain user constraints', () => {
      // Generate various constraint combinations
      const constraintCombinations = [
        ['diastasis-recti'],
        ['knee-chondromalacia'],
        ['diastasis-recti', 'knee-chondromalacia'],
        ['diastasis', 'knee'],
        ['core-pressure', 'high-impact'],
      ]

      const allExercises = [
        safeExercise,
        diastasisRiskExercise,
        kneeStressExercise,
        bothConstraintsExercise,
      ]

      constraintCombinations.forEach(constraints => {
        const result = filterExercisesByConstraints(allExercises, constraints)
        const normalizedConstraints = normalizeConstraints(constraints)

        result.forEach(exercise => {
          const normalizedExerciseConstraints = normalizeConstraints(
            exercise.contraindications
          )
          const hasOverlap = normalizedExerciseConstraints.some(c =>
            normalizedConstraints.includes(c)
          )
          expect(hasOverlap).toBe(false)
        })
      })
    })

    it('PROPERTY: Constraint normalization is symmetric', () => {
      const testCases = [
        ['diastasis', 'diastasis-risk'],
        ['diastasis-recti', 'diastasis'],
        ['knee', 'knee-stress'],
        ['chondromalacia', 'knee'],
      ]

      testCases.forEach(([a, b]) => {
        const normalizedA = normalizeConstraints([a])
        const normalizedB = normalizeConstraints([b])

        // If one normalizes to the other's canonical form, they should share elements
        const hasOverlap = normalizedA.some(c => normalizedB.includes(c))
        expect(hasOverlap).toBe(true)
      })
    })
  })
})
