import { supabase } from '@/services/supabase'

export interface PainHistory {
  id: string
  user_id: string
  body_part: string
  reported_date: string
  resolved_date?: string
  notes?: string
  created_at: string
}

/**
 * Maps body parts to exercise contraindications that should be avoided
 */
const BODY_PART_TO_CONTRAINDICATIONS: Record<string, string[]> = {
  'Lower back': ['back-stress', 'core-intensive'],
  'Knee': ['knee-stress', 'high-impact'],
  'Shoulder': ['shoulder-stress', 'upper-body-intensive'],
  'Neck': ['neck-strain'],
  'Hip': ['hip-stress', 'high-impact'],
  'Ankle': ['high-impact', 'ankle-stress'],
  'Wrist': ['wrist-stress', 'upper-body-intensive'],
  'Elbow': ['elbow-stress', 'upper-body-intensive'],
  'Abdomen': ['diastasis-risk', 'core-intensive'],
}

/**
 * Record pain report for a user
 */
export async function recordPainHistory(
  userId: string,
  bodyPart: string,
  notes?: string
): Promise<PainHistory> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('pain_history')
    .insert({
      user_id: userId,
      body_part: bodyPart,
      reported_date: today,
      notes,
    })
    .select()
    .single()

  if (error) throw error
  return data as PainHistory
}

/**
 * Get active pain reports for a user (within last 3 days, not resolved)
 */
export async function getActivePainReports(userId: string): Promise<PainHistory[]> {
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const thresholdDate = threeDaysAgo.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('pain_history')
    .select('*')
    .eq('user_id', userId)
    .gte('reported_date', thresholdDate)
    .is('resolved_date', null)
    .order('reported_date', { ascending: false })

  if (error) throw error
  return data as PainHistory[]
}

/**
 * Resolve a pain report
 */
export async function resolvePainReport(painId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('pain_history')
    .update({ resolved_date: today })
    .eq('id', painId)

  if (error) throw error
}

/**
 * Get contraindications to avoid based on active pain reports
 */
export function getContraindicationsFromPain(activePain: PainHistory[]): string[] {
  const contraindications = new Set<string>()

  for (const pain of activePain) {
    const relatedContraindications = BODY_PART_TO_CONTRAINDICATIONS[pain.body_part] || []
    relatedContraindications.forEach((c) => contraindications.add(c))
  }

  return Array.from(contraindications)
}

/**
 * Check if user has reported pain multiple times recently (emergency stop)
 */
export async function shouldShowEmergencyStop(userId: string): Promise<boolean> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const thresholdDate = sevenDaysAgo.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('pain_history')
    .select('id')
    .eq('user_id', userId)
    .gte('reported_date', thresholdDate)

  if (error) {
    console.error('Error checking pain history:', error)
    return false
  }

  // Show emergency stop if 3+ pain reports in last 7 days
  return (data?.length || 0) >= 3
}

/**
 * Get recovery mode message for active pain areas
 */
export function getRecoveryModeMessage(activePain: PainHistory[]): string {
  if (activePain.length === 0) return ''

  const bodyParts = activePain.map((p) => p.body_part).join(', ')
  return `Recovery mode: ${bodyParts}. Exercises stressing these areas are temporarily excluded.`
}
