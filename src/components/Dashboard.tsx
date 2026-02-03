import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '@/services/profiles/ProfileContext'
import { getMealPlanForWeek, getWeekStartDate, formatWeekRange } from '@/services/mealPlans'
import { getWorkoutScheduleForWeek } from '@/services/workouts'
import type { MealPlanSlot, ScheduledWorkout } from '@/types'
import './Dashboard.css'

export function Dashboard() {
  const { activeProfile, household } = useProfile()
  const [weekStartDate] = useState(getWeekStartDate())
  const [mealSlots, setMealSlots] = useState<MealPlanSlot[]>([])
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWeekOverview()
  }, [household, activeProfile])

  const loadWeekOverview = async () => {
    if (!household || !activeProfile) return

    setLoading(true)
    try {
      // Load meals
      const { slots } = await getMealPlanForWeek(household.id, weekStartDate)
      setMealSlots(slots)

      // Load workouts
      const { workouts: fetchedWorkouts } = await getWorkoutScheduleForWeek(
        activeProfile.id,
        weekStartDate
      )
      setWorkouts(fetchedWorkouts)
    } catch (error) {
      console.error('Error loading week overview:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalMeals = 21 // 7 days × 3 meals
  const plannedMeals = mealSlots.length
  const completionPercentage = Math.round((plannedMeals / totalMeals) * 100)

  // Workout stats
  const totalWorkouts = workouts.filter(w => w.custom_exercises && !w.custom_exercises.rest_day).length
  const completedWorkouts = workouts.filter(w => w.status === 'completed').length
  const workoutCompletion = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0

  if (loading) {
    return (
      <div className="dashboard">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome back, {activeProfile?.name}!</h2>
        <p className="dashboard-subtitle">Week of {formatWeekRange(weekStartDate)}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <div className="stat-value">{plannedMeals}/21</div>
            <div className="stat-label">Meals Planned</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <div className="stat-value">{completedWorkouts}/{totalWorkouts}</div>
            <div className="stat-label">Workouts Done</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{workoutCompletion}%</div>
            <div className="stat-label">Workout Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <div className="stat-value">{plannedMeals > 0 ? 'Ready' : 'Not Ready'}</div>
            <div className="stat-label">Shopping List</div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="quick-links">
          {plannedMeals < totalMeals ? (
            <Link to="/meals" className="quick-link-card primary">
              <div className="card-icon">📝</div>
              <h4>Plan Your Meals</h4>
              <p>You have {totalMeals - plannedMeals} meals left to plan this week</p>
            </Link>
          ) : (
            <Link to="/shopping" className="quick-link-card success">
              <div className="card-icon">✅</div>
              <h4>Week Fully Planned!</h4>
              <p>Generate your shopping list</p>
            </Link>
          )}

          <Link to="/meals" className="quick-link-card">
            <div className="card-icon">🍽️</div>
            <h4>Meal Planner</h4>
            <p>View and edit your weekly meal plan</p>
          </Link>

          <Link to="/shopping" className="quick-link-card">
            <div className="card-icon">🛒</div>
            <h4>Shopping List</h4>
            <p>View your grocery list for the week</p>
          </Link>

          {totalWorkouts === 0 ? (
            <Link to="/workouts" className="quick-link-card primary">
              <div className="card-icon">💪</div>
              <h4>Plan Your Workouts</h4>
              <p>Generate a personalised workout schedule</p>
            </Link>
          ) : completedWorkouts < totalWorkouts ? (
            <Link to="/workouts" className="quick-link-card">
              <div className="card-icon">💪</div>
              <h4>Workout Schedule</h4>
              <p>
                {totalWorkouts - completedWorkouts} workout{totalWorkouts - completedWorkouts !== 1 ? 's' : ''} remaining this week
              </p>
            </Link>
          ) : (
            <Link to="/workouts" className="quick-link-card success">
              <div className="card-icon">✅</div>
              <h4>All Workouts Done!</h4>
              <p>Great job this week!</p>
            </Link>
          )}

          <Link to="/exercises" className="quick-link-card">
            <div className="card-icon">📚</div>
            <h4>Exercise Library</h4>
            <p>Browse safe exercises for your profile</p>
          </Link>
        </div>
      </div>

      {plannedMeals > 0 && (
        <div className="dashboard-tip">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <strong>Tip:</strong> Your meal plan is shared with your household.
            Any changes you make will be visible to everyone in real-time!
          </div>
        </div>
      )}
    </div>
  )
}
