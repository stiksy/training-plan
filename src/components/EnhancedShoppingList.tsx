import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProfile } from '@/services/profiles/ProfileContext'
import { getMealPlanForWeek, getWeekStartDate, formatWeekRange } from '@/services/mealPlans'
import { generateShoppingList, formatShoppingListAsText, copyToClipboard } from '@/logic/shoppingListGenerator'
import {
  getOrCreateShoppingList,
  saveShoppingListItems,
  toggleItemChecked,
  addManualItem,
  deleteShoppingListItem,
  clearCheckedItems,
  type ShoppingListItem,
  type ShoppingList as ShoppingListType,
} from '@/services/shoppingLists'
import './ShoppingList.css'

export function EnhancedShoppingList() {
  const { household } = useProfile()
  const [searchParams] = useSearchParams()
  const weekDate = searchParams.get('week') || getWeekStartDate()
  const [shoppingList, setShoppingList] = useState<ShoppingListType | null>(null)
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)

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
      const { plan, slots } = await getMealPlanForWeek(household.id, weekDate)

      if (!plan || slots.length === 0) {
        setShoppingList(null)
        setItems([])
        setLoading(false)
        return
      }

      // Get or create shopping list
      const { list, items: existingItems } = await getOrCreateShoppingList(
        household.id,
        plan.id,
        weekDate
      )

      setShoppingList(list)

      // If list is new or empty, generate items
      if (existingItems.length === 0) {
        await regenerateItems(plan.id, list.id)
      } else {
        setItems(existingItems)
      }
    } catch (error) {
      console.error('Error loading shopping list:', error)
    } finally {
      setLoading(false)
    }
  }

  const regenerateItems = async (mealPlanId: string, listId: string) => {
    // Generate shopping list from meal plan
    const generatedMap = await generateShoppingList(mealPlanId)

    // Convert Map to array format
    const itemsArray: Array<{
      ingredient_id?: string
      ingredient_name: string
      quantity: number
      unit: string
      category: string
    }> = []

    generatedMap.forEach((categoryItems, category) => {
      categoryItems.forEach((item: any) => {
        itemsArray.push({
          ingredient_id: item.ingredient.id,
          ingredient_name: item.ingredient.name,
          quantity: item.quantity,
          unit: item.unit,
          category,
        })
      })
    })

    // Save to database
    await saveShoppingListItems(listId, itemsArray)

    // Reload items
    const { items: updatedItems } = await getOrCreateShoppingList(
      household!.id,
      mealPlanId,
      weekDate
    )
    setItems(updatedItems)
  }

  const handleToggleItem = async (itemId: string, currentChecked: boolean) => {
    try {
      await toggleItemChecked(itemId, !currentChecked)
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, checked: !currentChecked } : item
        )
      )
    } catch (error) {
      console.error('Error toggling item:', error)
      alert('Failed to update item')
    }
  }

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!shoppingList) return

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const quantity = parseFloat(formData.get('quantity') as string)
    const unit = formData.get('unit') as string
    const category = formData.get('category') as string

    try {
      const newItem = await addManualItem(shoppingList.id, name, quantity, unit, category)
      setItems((prev) => [...prev, newItem])
      setShowAddItem(false)
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return

    try {
      await deleteShoppingListItem(itemId)
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  const handleClearChecked = async () => {
    if (!shoppingList) return
    if (!confirm('Remove all checked items?')) return

    try {
      await clearCheckedItems(shoppingList.id)
      setItems((prev) => prev.filter((item) => !item.checked))
    } catch (error) {
      console.error('Error clearing items:', error)
      alert('Failed to clear items')
    }
  }

  const handleCopyToClipboard = async () => {
    // Group items by category for text format
    const grouped = new Map<string, any[]>()
    items.forEach((item) => {
      if (item.checked) return // Skip checked items
      if (!grouped.has(item.category)) {
        grouped.set(item.category, [])
      }
      grouped.get(item.category)!.push({
        quantity: item.quantity,
        unit: item.unit,
        ingredient: { name: item.ingredient_name },
      })
    })

    const text = formatShoppingListAsText(grouped)
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
        <p>Loading shopping list...</p>
      </div>
    )
  }

  if (!shoppingList || items.length === 0) {
    return (
      <div className="shopping-list-empty">
        <h2>No Shopping List Yet</h2>
        <p>Add meals to your meal plan for the week, then your shopping list will be generated automatically.</p>
        <p className="week-note">Week of {formatWeekRange(weekDate)}</p>
        <a href="/training-plan/meals" className="btn-primary">
          Go to Meal Planner
        </a>
      </div>
    )
  }

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ShoppingListItem[]>)

  const categoryOrder = ['protein', 'produce', 'dairy', 'grain', 'pantry', 'spice']
  const categoryNames: Record<string, string> = {
    protein: 'Protein',
    produce: 'Fresh Produce',
    dairy: 'Dairy',
    grain: 'Grains',
    pantry: 'Pantry',
    spice: 'Spices & Seasoning',
  }

  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length

  return (
    <div className="shopping-list">
      <div className="shopping-list-header">
        <div>
          <h1>Shopping List</h1>
          <p className="week-label">Week of {formatWeekRange(weekDate)}</p>
        </div>
        <div className="progress-indicator">
          {checkedCount} / {totalCount} items
        </div>
      </div>

      <div className="shopping-list-actions">
        <button onClick={handleCopyToClipboard} className={`copy-btn ${copied ? 'copied' : ''}`}>
          {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
        </button>
        <button onClick={() => setShowAddItem(true)} className="add-item-btn">
          + Add Item
        </button>
        {checkedCount > 0 && (
          <button onClick={handleClearChecked} className="clear-btn">
            Clear Checked
          </button>
        )}
      </div>

      {showAddItem && (
        <div className="add-item-modal-overlay">
          <form className="add-item-form" onSubmit={handleAddItem}>
            <h3>Add Manual Item</h3>
            <div className="form-group">
              <label htmlFor="item-name">Item Name</label>
              <input type="text" id="item-name" name="name" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="item-quantity">Quantity</label>
                <input
                  type="number"
                  id="item-quantity"
                  name="quantity"
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="item-unit">Unit</label>
                <input type="text" id="item-unit" name="unit" defaultValue="units" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="item-category">Category</label>
              <select id="item-category" name="category" required>
                <option value="protein">Protein</option>
                <option value="produce">Fresh Produce</option>
                <option value="dairy">Dairy</option>
                <option value="grain">Grains</option>
                <option value="pantry">Pantry</option>
                <option value="spice">Spices & Seasoning</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowAddItem(false)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="shopping-list-content">
        {sortedCategories.map((category) => {
          const categoryItems = itemsByCategory[category] || []
          const uncheckedItems = categoryItems.filter((i) => !i.checked)
          const checkedItems = categoryItems.filter((i) => i.checked)

          if (categoryItems.length === 0) return null

          return (
            <div key={category} className="shopping-category">
              <h3 className="category-title">{categoryNames[category] || category}</h3>
              <ul className="category-items">
                {uncheckedItems.map((item) => (
                  <li key={item.id} className="shopping-item">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleItem(item.id, item.checked)}
                      id={`item-${item.id}`}
                    />
                    <label htmlFor={`item-${item.id}`} className="item-content">
                      <span className="item-quantity">
                        {item.quantity}
                        {item.unit}
                      </span>
                      <span className="item-name">{item.ingredient_name}</span>
                      {item.manually_added && <span className="manual-badge">manual</span>}
                    </label>
                    {item.manually_added && (
                      <button
                        className="delete-item-btn"
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label="Delete item"
                      >
                        🗑️
                      </button>
                    )}
                  </li>
                ))}
                {checkedItems.map((item) => (
                  <li key={item.id} className="shopping-item checked">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleItem(item.id, item.checked)}
                      id={`item-${item.id}`}
                    />
                    <label htmlFor={`item-${item.id}`} className="item-content">
                      <span className="item-quantity">
                        {item.quantity}
                        {item.unit}
                      </span>
                      <span className="item-name">{item.ingredient_name}</span>
                      {item.manually_added && <span className="manual-badge">manual</span>}
                    </label>
                    {item.manually_added && (
                      <button
                        className="delete-item-btn"
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label="Delete item"
                      >
                        🗑️
                      </button>
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
          Check off items as you shop. Click "Copy to Clipboard" to paste unchecked items into your
          shopping app.
        </p>
      </div>
    </div>
  )
}
