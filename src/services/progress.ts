import { supabase } from './supabase'

export interface WeightLog {
  id: string
  user_id: string
  date: string
  weight_kg: number
}

export interface WorkoutLog {
  id: string
  scheduled_workout_id: string
  user_id: string
  completed_exercises: any
  notes?: string
  perceived_difficulty?: number
  pain_reported: boolean
  pain_location?: string
  logged_at: string
}

export interface CyclingLog {
  id: string
  user_id: string
  date: string
  distance_km: number
  duration_min: number
  avg_speed_kph?: number
  elevation_m?: number
  notes?: string
}

export async function getWeightLogs(userId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data as WeightLog[]
}

export async function addWeightLog(userId: string, date: string, weight_kg: number) {
  const { data, error } = await supabase
    .from('weight_logs')
    .upsert({
      user_id: userId,
      date,
      weight_kg,
    })
    .select()
    .single()

  if (error) throw error
  return data as WeightLog
}

export async function deleteWeightLog(id: string) {
  const { error } = await supabase
    .from('weight_logs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getWorkoutLogs(userId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('workout_logs')
    .select('*, scheduled_workouts(*)')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data as WorkoutLog[]
}

export async function addWorkoutLog(log: Omit<WorkoutLog, 'id' | 'logged_at'>) {
  const { data, error } = await supabase
    .from('workout_logs')
    .insert(log)
    .select()
    .single()

  if (error) throw error
  return data as WorkoutLog
}

export async function getCyclingLogs(userId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('cycling_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data as CyclingLog[]
}

export async function addCyclingLog(log: Omit<CyclingLog, 'id'>) {
  const { data, error } = await supabase
    .from('cycling_logs')
    .upsert(log)
    .select()
    .single()

  if (error) throw error
  return data as CyclingLog
}

export async function deleteCyclingLog(id: string) {
  const { error } = await supabase
    .from('cycling_logs')
    .delete()
    .eq('id', id)

  if (error) throw error
}
