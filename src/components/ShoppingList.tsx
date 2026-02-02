import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProfile } from '@/services/profiles/ProfileContext'
import { getMealPlanForWeek, getWeekStartDate, formatWeekRange } from '@/services/mealPlans'
import { generateShoppingList, formatShoppingListAsText, copyToClipboard } from '@/logic/shoppingListGenerator'
import './ShoppingList.css'

export function ShoppingList() {
  const { household } = useProfile()
  const [searchParams] = useSearchParams()
  const weekDate = searchParams.get('week') || getWeekStartDate()
  const [shoppingList, setShoppingList] = useState<Map<string, any[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (household) {
      loadShoppingList()
    }
  }, [household, weekDate])

  const loadShoppingList = async () => {
    if (!household) return

    setLoading(true)
    try {
      // Get meal plan for the week
      const { plan } = await getMealPlanForWeek(household.id, weekDate)

      if (!plan) {
        setShoppingList(new Map())
        return
      }

      // Generate shopping list
      const list = await generateShoppingList(plan.id)
      setShoppingList(list)
    } catch (error) {
      console.error('Error loading shopping list:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    const text = formatShoppingListAsText(shoppingList)
    const success = await copyToClipboard(text)

    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      alert('Failed to copy to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="shopping-list-loading">
        <p>Generating shopping list...</p>
      </div>
    )
  }

  if (shoppingList.size === 0) {
    return (
      <div className="shopping-list-empty">
        <h2>No Shopping List Yet</h2>
        <p>Plan your meals for the week first, then generate your shopping list.</p>
        <a href="/training-plan/meals" className="btn-primary">
          Go to Meal Planner
        </a>
      </div>
    )
  }

  const categoryOrder = ['protein', 'produce', 'dairy', 'grain', 'pantry', 'spice']
  const categoryNames: Record<string, string> = {
    protein: 'Protein',
    produce: 'Fresh Produce',
    dairy: 'Dairy',
    grain: 'Grains',
    pantry: 'Pantry',
    spice: 'Spices & Seasoning'
  }

  const sortedCategories = Array.from(shoppingList.keys()).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return (
    <div className="shopping-list">
      <div className="shopping-list-header">
        <h1>Shopping List</h1>
        <p className="week-label">Week of {formatWeekRange(weekDate)}</p>
      </div>

      <div className="shopping-list-actions">
        <button
          onClick={handleCopyToClipboard}
          className={`copy-btn ${copied ? 'copied' : ''}`}
        >
          {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
        </button>
      </div>

      <div className="shopping-list-content">
        {sortedCategories.map(category => {
          const items = shoppingList.get(category) || []
          return (
            <div key={category} className="shopping-category">
              <h3 className="category-title">{categoryNames[category] || category}</h3>
              <ul className="category-items">
                {items.map((item, index) => (
                  <li key={index} className="shopping-item">
                    <span className="item-quantity">{item.quantity}{item.unit}</span>
                    <span className="item-name">{item.ingredient.name}</span>
                    {item.isPantryStaple && (
                      <span className="pantry-note">(check pantry)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="shopping-list-footer">
        <p className="footer-note">
          Optimised for Alexa shopping list. Click "Copy to Clipboard" and paste into your shopping app.
        </p>
      </div>
    </div>
  )
}
