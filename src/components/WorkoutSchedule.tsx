/**
 * SAFETY-CRITICAL COMPONENT
 * Implements Layer 3 defensive rendering to prevent contraindicated exercises from appearing
 */

import { useState, useEffect } from 'react'
import { useProfile } from '@/services/profiles/ProfileContext'
import {
  getWorkoutScheduleForWeek,
  createWorkoutSchedule,
  getWeekStartDate,
  formatWeekRange,
  getDateForDay,
  markWorkoutComplete,
  markWorkoutSkipped,
} from '@/services/workouts'
import { generateWeeklySchedule } from '@/logic/workoutScheduler'
import { normalizeConstraints } from '@/logic/workoutConstraints'
import { subscribeToTable, unsubscribeFromChannel } from '@/services/realtime'
import type { WorkoutSchedule as WorkoutScheduleType, ScheduledWorkout } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import './WorkoutSchedule.css'

interface WorkoutDay {
  date: string
  dayName: string
  workout: ScheduledWorkout | null
}

export function WorkoutSchedule() {
  const { activeProfile, household } = useProfile()
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate())
  const [schedule, setSchedule] = useState<WorkoutScheduleType | null>(null)
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<ScheduledWorkout | null>(null)
  const [, setRealtimeChannel] = useState<RealtimeChannel | null>(null)

  // CRITICAL: Clear state on profile change to prevent stale data
  useEffect(() => {
    console.log('[SAFETY] Profile changed, clearing workout state')
    setSchedule(null)
    setWorkouts([])
    setSelectedWorkout(null)
    loadWorkoutSchedule()
  }, [activeProfile?.id, weekStartDate])

  // Set up real-time sync
  useEffect(() => {
    if (!schedule) return

    console.log('[REALTIME] Setting up real-time sync for schedule:', schedule.id)

    const channel = subscribeToTable('scheduled_workouts', payload => {
      console.log('[REALTIME] Workout update received:', payload)

      // Close modal if workout was completed by another user
      if (
        selectedWorkout &&
        payload.new?.id === selectedWorkout.id &&
        payload.new?.status === 'completed'
      ) {
        setSelectedWorkout(null)
        console.log('[REALTIME] Workout completed by another user, closing modal')
      }

      // Reload schedule
      loadWorkoutSchedule()
    })

    setRealtimeChannel(channel)

    return () => {
      console.log('[REALTIME] Cleaning up real-time subscription')
      unsubscribeFromChannel(channel)
    }
  }, [schedule?.id])

  const loadWorkoutSchedule = async () => {
    if (!activeProfile || !household) return

    setLoading(true)
    try {
      const { schedule: fetchedSchedule, workouts: fetchedWorkouts } =
        await getWorkoutScheduleForWeek(activeProfile.id, weekStartDate)

      setSchedule(fetchedSchedule)
      setWorkouts(fetchedWorkouts)

      console.log(
        `[SCHEDULE] Loaded ${fetchedWorkouts.length} workouts for ${activeProfile.name}`
      )
    } catch (error) {
      console.error('Error loading workout schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSchedule = async () => {
    if (!activeProfile || !household) return

    setGenerating(true)
    try {
      // Create schedule if doesn't exist
      let scheduleId = schedule?.id
      if (!scheduleId) {
        const newSchedule = await createWorkoutSchedule(
          activeProfile.id,
          household.id,
          weekStartDate
        )
        scheduleId = newSchedule.id
        setSchedule(newSchedule)
      }

      // Generate weekly workouts
      const generatedWorkouts = await generateWeeklySchedule(
        activeProfile.id,
        weekStartDate,
        scheduleId
      )

      setWorkouts(generatedWorkouts)

      console.log(
        `[SCHEDULE] Generated ${generatedWorkouts.length} workouts for ${activeProfile.name}`
      )
    } catch (error) {
      console.error('Error generating schedule:', error)
      alert('Error generating schedule. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleMarkComplete = async (workout: ScheduledWorkout) => {
    try {
      await markWorkoutComplete(workout.id, 'Completed via workout schedule')
      await loadWorkoutSchedule()
      setSelectedWorkout(null)
    } catch (error) {
      console.error('Error marking workout complete:', error)
      alert('Error marking workout complete. Please try again.')
    }
  }

  const handleMarkSkipped = async (workout: ScheduledWorkout, reason: string) => {
    try {
      await markWorkoutSkipped(workout.id, reason)
      await loadWorkoutSchedule()
      setSelectedWorkout(null)
    } catch (error) {
      console.error('Error marking workout skipped:', error)
      alert('Error marking workout skipped. Please try again.')
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentDate = new Date(weekStartDate)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setWeekStartDate(newDate.toISOString().split('T')[0])
  }

  const buildWeekDays = (): WorkoutDay[] => {
    const days: WorkoutDay[] = []
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    for (let i = 0; i < 7; i++) {
      const date = getDateForDay(weekStartDate, i)
      const workout = workouts.find(w => w.date === date) || null
      days.push({ date, dayName: dayNames[i], workout })
    }

    return days
  }

  /**
   * LAYER 3 SAFETY CHECK: Defensive rendering
   * Ensures contraindicated exercises are NEVER displayed, even if they bypass earlier filters
   */
  const isExerciseSafeForUser = (exerciseData: any): boolean => {
    if (!activeProfile || !activeProfile.health_constraints) {
      return true
    }

    if (!exerciseData) {
      return true
    }

    // Extract contraindications from exercise data
    const exerciseConstraints =
      exerciseData.contraindications || exerciseData.exercise_contraindications || []

    if (exerciseConstraints.length === 0) {
      return true
    }

    // Normalize both user and exercise constraints
    const normalizedUserConstraints = normalizeConstraints(activeProfile.health_constraints)
    const normalizedExerciseConstraints = normalizeConstraints(exerciseConstraints)

    // Check for overlap
    const hasConflict = normalizedExerciseConstraints.some(constraint =>
      normalizedUserConstraints.includes(constraint)
    )

    if (hasConflict) {
      console.error(
        '[LAYER 3 SAFETY VIOLATION] Contraindicated exercise detected in UI:',
        exerciseData,
        'User constraints:',
        activeProfile.health_constraints
      )
      return false
    }

    return true
  }

  if (loading) {
    return (
      <div className="workout-schedule">
        <p>Loading workout schedule...</p>
      </div>
    )
  }

  const weekDays = buildWeekDays()
  const completedCount = workouts.filter(w => w.status === 'completed').length
  const totalCount = workouts.filter(w => w.custom_exercises && !w.custom_exercises.rest_day).length

  return (
    <div className="workout-schedule">
      <div className="schedule-header">
        <h2>Workout Schedule</h2>
        <p className="schedule-subtitle">
          {activeProfile?.name} • {formatWeekRange(weekStartDate)}
        </p>
        {activeProfile?.health_constraints && activeProfile.health_constraints.length > 0 && (
          <div className="constraints-info">
            <span className="constraints-label">Filtered for safety:</span>
            {activeProfile.health_constraints.map(constraint => (
              <span key={constraint} className="constraint-badge">
                {constraint}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="schedule-controls">
        <button onClick={() => navigateWeek('prev')} className="nav-button">
          ← Previous Week
        </button>
        <button onClick={() => navigateWeek('next')} className="nav-button">
          Next Week →
        </button>
      </div>

      {schedule && workouts.length > 0 && (
        <div className="schedule-stats">
          <div className="stat">
            <span className="stat-value">{completedCount}/{totalCount}</span>
            <span className="stat-label">Workouts Complete</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </span>
            <span className="stat-label">Progress</span>
          </div>
        </div>
      )}

      {!schedule || workouts.length === 0 ? (
        <div className="empty-schedule">
          <p>No workout schedule for this week yet.</p>
          <button
            onClick={handleGenerateSchedule}
            disabled={generating}
            className="generate-button"
          >
            {generating ? 'Generating Schedule...' : 'Generate Workout Schedule'}
          </button>
        </div>
      ) : (
        <div className="workout-week-grid">
          {weekDays.map(day => {
            const workout = day.workout
            const exerciseData = workout?.custom_exercises

            // LAYER 3 SAFETY: Don't render if exercise is contraindicated
            if (exerciseData && !exerciseData.rest_day && !isExerciseSafeForUser(exerciseData)) {
              return (
                <div key={day.date} className="workout-day-card">
                  <div className="day-header">
                    <h3>{day.dayName}</h3>
                    <span className="day-date">{day.date}</span>
                  </div>
                  <div className="workout-content error">
                    <p className="error-message">⚠️ Safety Error</p>
                    <p className="error-details">
                      This workout contains exercises that are not safe for your profile. Please
                      contact support.
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={day.date}
                className={`workout-day-card ${workout?.status || 'empty'}`}
                onClick={() => workout && setSelectedWorkout(workout)}
              >
                <div className="day-header">
                  <h3>{day.dayName}</h3>
                  <span className="day-date">{day.date}</span>
                </div>

                {!workout || !exerciseData ? (
                  <div className="workout-content empty">
                    <p>Rest day</p>
                  </div>
                ) : exerciseData.rest_day ? (
                  <div className="workout-content rest">
                    <p className="rest-icon">😴</p>
                    <p className="rest-label">Rest & Recovery</p>
                    {exerciseData.reason && (
                      <p className="rest-reason">{exerciseData.reason}</p>
                    )}
                  </div>
                ) : (
                  <div className="workout-content">
                    <h4 className="exercise-name">{exerciseData.exercise_name}</h4>
                    <div className="workout-meta">
                      <span className="workout-duration">⏱️ {exerciseData.duration_min} min</span>
                      <span className="workout-category">
                        {exerciseData.category || 'Unknown'}
                      </span>
                    </div>

                    {workout.status === 'completed' && (
                      <div className="status-badge completed">✓ Completed</div>
                    )}
                    {workout.status === 'skipped' && (
                      <div className="status-badge skipped">⊘ Skipped</div>
                    )}
                    {workout.status === 'pending' && (
                      <div className="status-badge pending">Scheduled</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Workout Detail Modal */}
      {selectedWorkout && selectedWorkout.custom_exercises && (
        <div className="modal-overlay" onClick={() => setSelectedWorkout(null)}>
          <div className="modal-content workout-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedWorkout.custom_exercises.rest_day
                  ? 'Rest Day'
                  : selectedWorkout.custom_exercises.exercise_name}
              </h2>
              <button className="modal-close" onClick={() => setSelectedWorkout(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {selectedWorkout.custom_exercises.rest_day ? (
                <div className="rest-day-detail">
                  <p className="rest-icon-large">😴</p>
                  <p className="rest-message">
                    Recovery is an essential part of training. Use this day to rest, stretch, or do
                    light activity.
                  </p>
                  {selectedWorkout.custom_exercises.reason && (
                    <p className="rest-reason">{selectedWorkout.custom_exercises.reason}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span>{selectedWorkout.custom_exercises.duration_min} minutes</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span>{selectedWorkout.custom_exercises.category}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedWorkout.status}`}>
                      {selectedWorkout.status}
                    </span>
                  </div>

                  {selectedWorkout.completed_at && (
                    <div className="detail-row">
                      <span className="detail-label">Completed:</span>
                      <span>{new Date(selectedWorkout.completed_at).toLocaleString()}</span>
                    </div>
                  )}

                  {selectedWorkout.completion_note && (
                    <div className="detail-section">
                      <h4>Note:</h4>
                      <p>{selectedWorkout.completion_note}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedWorkout.status === 'pending' && !selectedWorkout.custom_exercises.rest_day && (
              <div className="modal-footer">
                <button
                  className="modal-button success"
                  onClick={() => handleMarkComplete(selectedWorkout)}
                >
                  Mark Complete
                </button>
                <button
                  className="modal-button warning"
                  onClick={() => {
                    const reason = prompt('Reason for skipping (optional):')
                    if (reason !== null) {
                      handleMarkSkipped(selectedWorkout, reason)
                    }
                  }}
                >
                  Skip Workout
                </button>
                <button className="modal-button secondary" onClick={() => setSelectedWorkout(null)}>
                  Close
                </button>
              </div>
            )}

            {(selectedWorkout.status !== 'pending' || selectedWorkout.custom_exercises.rest_day) && (
              <div className="modal-footer">
                <button className="modal-button secondary" onClick={() => setSelectedWorkout(null)}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
