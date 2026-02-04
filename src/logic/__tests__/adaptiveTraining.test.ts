import { describe, it, expect } from 'vitest'
import { getContraindicationsFromPain, getRecoveryModeMessage } from '../adaptiveTraining'
import type { PainHistory } from '../adaptiveTraining'

describe('Adaptive Training Logic', () => {
  describe('getContraindicationsFromPain', () => {
    it('should return empty array for no pain', () => {
      const contraindications = getContraindicationsFromPain([])
      expect(contraindications).toEqual([])
    })

    it('should map lower back pain to correct contraindications', () => {
      const painReports: PainHistory[] = [
        {
          id: '1',
          user_id: 'user1',
          body_part: 'Lower back',
          reported_date: '2026-02-04',
          created_at: '2026-02-04T10:00:00Z',
        },
      ]

      const contraindications = getContraindicationsFromPain(painReports)
      expect(contraindications).toContain('back-stress')
      expect(contraindications).toContain('core-intensive')
    })

    it('should map knee pain to correct contraindications', () => {
      const painReports: PainHistory[] = [
        {
          id: '1',
          user_id: 'user1',
          body_part: 'Knee',
          reported_date: '2026-02-04',
          created_at: '2026-02-04T10:00:00Z',
        },
      ]

      const contraindications = getContraindicationsFromPain(painReports)
      expect(contraindications).toContain('knee-stress')
      expect(contraindications).toContain('high-impact')
    })

    it('should handle multiple pain areas', () => {
      const painReports: PainHistory[] = [
        {
          id: '1',
          user_id: 'user1',
          body_part: 'Lower back',
          reported_date: '2026-02-04',
          created_at: '2026-02-04T10:00:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          body_part: 'Shoulder',
          reported_date: '2026-02-04',
          created_at: '2026-02-04T10:00:00Z',
        },
      ]

      const contraindications = getContraindicationsFromPain(painReports)
      expect(contraindications.length).toBeGreaterThan(0)
      expect(contraindications).toContain('back-stress')
      expect(contraindications).toContain('shoulder-stress')
    })

    it('should deduplicate contraindications', () => {
      const painReports: PainHistory[] = [
        {
          id: '1',
          user_id: 'user1',
          body_part: 'Knee',
          reported_date: '2026-02-04',
          created_at: '2026-02-04T10:00:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          body_part: 'Ankle',
          reported_date: '2026-02-04',
          created_at: '2026-02-04T10:00:00Z',
        },
      ]

      const contraindications = getContraindicationsFromPain(painReports)
      // Both knee and ankle map to 'high-impact', should only appear once
      const highImpactCount = contraindications.filter((c) => c === 'high-impact').length
      expect(highImpactCount).toBe(1)
    })
  })

  describe('getRecoveryModeMessage', () => {
    it('should return empty string for no pain', () => {
      const message = getRecoveryModeMessage([])
      expect(message).toBe('')
    })

    it('should create message for single pain area', () => {
      const painReports: PainHistory[] = [
        {
          id: '1',
          user_id: 'user1',
          body_part: 'Lower back',
          reported_date: '2026-02-04',
          created_at: '2026-02-04T10:00:00Z',
        },
      ]

      const message = getRecoveryModeMessage(painReports)
      expect(message).toContain('Recovery mode')
      expect(message).toContain('Lower back')
    })

    it('should create message for multiple pain areas', () => {
      const painReports: PainHistory[] = [
        {
          id: '1',
          user_id: 'user1',
          body_part: 'Lower back',
          reported_date: '2026-02-04',
          created_at: '2026-02-04T10:00:00Z',
        },
        {
          id: '2',
          user_id: 'user1',
          body_part: 'Knee',
          reported_date: '2026-02-04',
          created_at: '2026-02-04T10:00:00Z',
        },
      ]

      const message = getRecoveryModeMessage(painReports)
      expect(message).toContain('Lower back')
      expect(message).toContain('Knee')
    })
  })
})
