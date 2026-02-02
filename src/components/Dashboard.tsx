import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '@/services/profiles/ProfileContext'
import { getMealPlanForWeek, getWeekStartDate, formatWeekRange } from '@/services/mealPlans'
import type { MealPlanSlot } from '@/types'
import './Dashboard.css'

export function Dashboard() {
  const { activeProfile, household } = useProfile()
  const [weekStartDate] = useState(getWeekStartDate())
  const [mealSlots, setMealSlots] = useState<MealPlanSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWeekOverview()
  }, [household])

  const loadWeekOverview = async () => {
    if (!household) return

    setLoading(true)
    try {
      const { slots } = await getMealPlanForWeek(household.id, weekStartDate)
      setMealSlots(slots)
    } catch (error) {
      console.error('Error loading week overview:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalMeals = 21 // 7 days × 3 meals
  const plannedMeals = mealSlots.length
  const completionPercentage = Math.round((plannedMeals / totalMeals) * 100)

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
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{completionPercentage}%</div>
            <div className="stat-label">Week Complete</div>
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

          <Link to="/workouts" className="quick-link-card">
            <div className="card-icon">💪</div>
            <h4>Workouts</h4>
            <p>Coming soon - Exercise scheduling</p>
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
