import { useState, useEffect } from 'react'
import { useProfile } from '@/services/profiles/ProfileContext'
import { getFavouriteMeals, getMealHistory, copyMealToSlot } from '@/services/favourites'
import { getMealPlanForWeek, getWeekStartDate } from '@/services/mealPlans'
import type { MealType } from '@/types'
import './FavouriteMeals.css'

interface FavouriteMeal {
  id: string
  recipe: {
    id: string
    name: string
    meal_type: MealType
    cuisine_tags: string[]
  }
  meal_type: MealType
  day_of_week: number
}

export function FavouriteMeals() {
  const { household } = useProfile()
  const [favourites, setFavourites] = useState<FavouriteMeal[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'favourites' | 'history'>('favourites')
  const [selectedMeal, setSelectedMeal] = useState<{ recipeId: string; mealType: MealType } | null>(null)

  useEffect(() => {
    loadData()
  }, [household])

  const loadData = async () => {
    if (!household) return

    setLoading(true)
    try {
      const [favs, hist] = await Promise.all([
        getFavouriteMeals(household.id),
        getMealHistory(household.id, 8),
      ])

      setFavourites(favs as FavouriteMeal[])
      setHistory(hist)
    } catch (error) {
      console.error('Error loading favourites and history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdd = async (recipeId: string, mealType: MealType) => {
    setSelectedMeal({ recipeId, mealType })
  }

  const handleCopyToDay = async (day: number) => {
    if (!household || !selectedMeal) return

    try {
      const weekStart = getWeekStartDate()
      const { plan } = await getMealPlanForWeek(household.id, weekStart)

      if (!plan) {
        alert('Please create a meal plan first')
        return
      }

      await copyMealToSlot(plan.id, selectedMeal.recipeId, day, selectedMeal.mealType)
      alert('Meal added successfully!')
      setSelectedMeal(null)
    } catch (error) {
      console.error('Error copying meal:', error)
      alert('Failed to add meal')
    }
  }

  if (loading) {
    return (
      <div className="favourites-loading">
        <p>Loading favourites...</p>
      </div>
    )
  }

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="favourites-container">
      <div className="favourites-header">
        <h2>Meal Favourites & History</h2>
        <div className="tab-selector">
          <button
            className={`tab-btn ${activeTab === 'favourites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favourites')}
          >
            Favourites ⭐
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History 📅
          </button>
        </div>
      </div>

      {selectedMeal && (
        <div className="day-selector-overlay">
          <div className="day-selector-modal">
            <h3>Which day?</h3>
            <p>Select a day to add this {selectedMeal.mealType}:</p>
            <div className="day-buttons">
              {dayNames.map((day, index) => (
                <button
                  key={day}
                  className="day-btn"
                  onClick={() => handleCopyToDay(index)}
                >
                  {day}
                </button>
              ))}
            </div>
            <button className="cancel-btn" onClick={() => setSelectedMeal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeTab === 'favourites' && (
        <div className="favourites-section">
          {favourites.length === 0 ? (
            <div className="empty-state">
              <p>No favourite meals yet. Mark meals as favourites from your meal planner!</p>
            </div>
          ) : (
            <div className="meal-grid">
              {favourites.map((fav) => (
                <div key={fav.id} className="meal-card">
                  <div className="meal-card-header">
                    <h4>{fav.recipe.name}</h4>
                    <span className="meal-type-badge">{fav.meal_type}</span>
                  </div>
                  <div className="meal-card-tags">
                    {fav.recipe.cuisine_tags?.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    className="quick-add-btn"
                    onClick={() => handleQuickAdd(fav.recipe.id, fav.meal_type)}
                  >
                    + Add to This Week
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          {history.length === 0 ? (
            <div className="empty-state">
              <p>No meal history yet. Your past meal plans will appear here.</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((plan) => {
                const weekStart = new Date(plan.week_start_date)
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekStart.getDate() + 6)

                return (
                  <div key={plan.id} className="history-week">
                    <h4>
                      Week of {weekStart.toLocaleDateString('en-GB')} -{' '}
                      {weekEnd.toLocaleDateString('en-GB')}
                    </h4>
                    <div className="history-meals">
                      {plan.meal_plan_slots?.slice(0, 7).map((slot: any) => (
                        <div key={slot.id} className="history-meal">
                          <span className="meal-name">{slot.recipe?.name || 'Unknown'}</span>
                          <button
                            className="copy-meal-btn"
                            onClick={() => handleQuickAdd(slot.recipe_id, slot.meal_type)}
                            title="Add to this week"
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
