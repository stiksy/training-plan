import { useState, useEffect } from 'react'
import { useProfile } from '@/services/profiles/ProfileContext'
import { getMealPlanForWeek, createMealPlan, getWeekStartDate, formatWeekRange, getDayName } from '@/services/mealPlans'
import { getRecipes } from '@/services/recipes'
import { subscribeToTable, unsubscribeFromChannel } from '@/services/realtime'
import type { MealPlan, MealPlanSlot, Recipe, MealType } from '@/types'
import './MealPlanner.css'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']
const DAYS = [0, 1, 2, 3, 4, 5, 6] // Monday to Sunday

export function MealPlanner() {
  const { household } = useProfile()
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate())
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [slots, setSlots] = useState<MealPlanSlot[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; mealType: MealType } | null>(null)

  // Load meal plan for current week
  useEffect(() => {
    loadMealPlan()
  }, [weekStartDate, household])

  // Load all recipes
  useEffect(() => {
    loadRecipes()
  }, [])

  // Set up real-time sync for meal plan changes
  useEffect(() => {
    if (!mealPlan) return

    console.log('🔔 Setting up real-time sync for meal plan:', mealPlan.id)

    const channel = subscribeToTable('meal_plan_slots', (payload) => {
      console.log('⚡ Real-time update received:', payload)

      // Only reload if the change is for our current meal plan
      if (payload.new?.meal_plan_id === mealPlan.id || payload.old?.meal_plan_id === mealPlan.id) {
        console.log('🔄 Reloading meal plan due to real-time update')
        loadMealPlan()
      }
    })

    // Cleanup on unmount
    return () => {
      console.log('🔕 Cleaning up real-time subscription')
      unsubscribeFromChannel(channel)
    }
  }, [mealPlan?.id])

  const loadMealPlan = async () => {
    if (!household) return

    setLoading(true)
    try {
      const { plan, slots: planSlots } = await getMealPlanForWeek(household.id, weekStartDate)

      if (!plan) {
        // Create a new meal plan if one doesn't exist
        const newPlan = await createMealPlan(household.id, weekStartDate)
        setMealPlan(newPlan)
        setSlots([])
      } else {
        setMealPlan(plan)
        setSlots(planSlots)
      }
    } catch (error) {
      console.error('Error loading meal plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecipes = async () => {
    try {
      const allRecipes = await getRecipes()
      setRecipes(allRecipes)
    } catch (error) {
      console.error('Error loading recipes:', error)
    }
  }

  const getSlotRecipe = (day: number, mealType: MealType): Recipe | undefined => {
    const slot = slots.find(s => s.day_of_week === day && s.meal_type === mealType)
    return slot?.recipe
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(weekStartDate)
    const days = direction === 'next' ? 7 : -7
    current.setDate(current.getDate() + days)
    setWeekStartDate(getWeekStartDate(current))
  }

  const handleSlotClick = (day: number, mealType: MealType) => {
    setSelectedSlot({ day, mealType })
  }

  const handleRecipeSelect = async (recipeId: string) => {
    if (!selectedSlot || !mealPlan || saving) return

    console.log('🍽️ Saving recipe:', {
      mealPlanId: mealPlan.id,
      day: selectedSlot.day,
      mealType: selectedSlot.mealType,
      recipeId
    })

    setSaving(true)
    try {
      const { updateMealPlanSlot } = await import('@/services/mealPlans')
      const result = await updateMealPlanSlot(
        mealPlan.id,
        selectedSlot.day,
        selectedSlot.mealType,
        recipeId
      )

      console.log('✅ Recipe saved successfully:', result)

      // Reload meal plan to show updated recipe
      await loadMealPlan()
      setSelectedSlot(null)
    } catch (error) {
      console.error('❌ Error updating meal plan slot:', error)
      alert('Failed to update meal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateShoppingList = () => {
    // Navigate to shopping list page with current week
    window.location.href = `/training-plan/shopping?week=${weekStartDate}`
  }

  if (loading) {
    return (
      <div className="meal-planner-loading">
        <p>Loading meal plan...</p>
      </div>
    )
  }

  return (
    <div className="meal-planner">
      <div className="meal-planner-header">
        <div className="header-nav">
          <button onClick={() => navigateWeek('prev')} className="week-nav-btn">
            ← Previous Week
          </button>
          <h1>Meal Plan: {formatWeekRange(weekStartDate)}</h1>
          <button onClick={() => navigateWeek('next')} className="week-nav-btn">
            Next Week →
          </button>
        </div>
        {mealPlan && slots.length > 0 && (
          <button onClick={handleGenerateShoppingList} className="generate-list-btn">
            📋 Generate Shopping List
          </button>
        )}
      </div>

      {mealPlan?.status === 'draft' && (
        <div className="plan-status-banner">
          <p>This is a draft plan. Make your selections and activate when ready.</p>
        </div>
      )}

      <div className="meal-grid">
        <div className="meal-grid-header">
          <div className="day-header"></div>
          {MEAL_TYPES.map(mealType => (
            <div key={mealType} className="meal-type-header">
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </div>
          ))}
        </div>

        {DAYS.map(day => (
          <div key={day} className="meal-grid-row">
            <div className="day-label">
              <div className="day-name">{getDayName(day)}</div>
            </div>
            {MEAL_TYPES.map(mealType => {
              const recipe = getSlotRecipe(day, mealType)
              return (
                <button
                  key={`${day}-${mealType}`}
                  className={`meal-card ${recipe ? 'has-recipe' : 'empty'}`}
                  onClick={() => handleSlotClick(day, mealType)}
                >
                  {recipe ? (
                    <>
                      <div className="meal-card-name">{recipe.name}</div>
                      <div className="meal-card-meta">
                        <span>{(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)} min</span>
                        {recipe.cuisine_tags.includes('kid-friendly') && (
                          <span className="kid-friendly-badge">Kid-friendly</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="meal-card-empty">
                      <span>+ Add meal</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {selectedSlot && (
        <div className="meal-swap-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="meal-swap-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Select {selectedSlot.mealType} for {getDayName(selectedSlot.day)}</h2>
            <p className="modal-subtitle">Choose from available recipes</p>
            <div className="recipe-options">
              {saving && <div className="saving-indicator">Saving...</div>}
              {recipes
                .filter(r => r.meal_type === selectedSlot.mealType)
                .map(recipe => (
                  <button
                    key={recipe.id}
                    className="recipe-option"
                    onClick={() => handleRecipeSelect(recipe.id)}
                    disabled={saving}
                  >
                    <div className="recipe-option-name">{recipe.name}</div>
                    <div className="recipe-option-meta">
                      <span>{(recipe.prep_time_min || 0) + (recipe.cook_time_min || 0)} min</span>
                      {recipe.cuisine_tags.includes('kid-friendly') && (
                        <span className="kid-friendly-badge">Kid-friendly</span>
                      )}
                    </div>
                  </button>
                ))}
            </div>
            <button className="modal-close-btn" onClick={() => setSelectedSlot(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
