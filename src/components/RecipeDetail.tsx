import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import type { Recipe } from '@/types'
import './RecipeDetail.css'

interface RecipeWithIngredients extends Recipe {
  recipe_ingredients: Array<{
    ingredient: {
      name: string
      category: string
    }
    quantity: number
    unit: string
  }>
}

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadRecipe(id)
    }
  }, [id])

  const loadRecipe = async (recipeId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(
          `
          *,
          recipe_ingredients (
            quantity,
            unit,
            ingredient:ingredients (
              name,
              category
            )
          )
        `
        )
        .eq('id', recipeId)
        .single()

      if (error) throw error
      setRecipe(data as RecipeWithIngredients)
    } catch (error) {
      console.error('Error loading recipe:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="recipe-detail-loading">
        <p>Loading recipe...</p>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="recipe-detail-error">
        <h2>Recipe Not Found</h2>
        <Link to="/training-plan/meals" className="back-link">
          ← Back to Meal Planner
        </Link>
      </div>
    )
  }

  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <Link to="/training-plan/meals" className="back-link">
          ← Back to Meal Planner
        </Link>
        <h1>{recipe.name}</h1>
        <div className="recipe-meta">
          <span className="meta-item">
            <strong>Type:</strong> {recipe.meal_type}
          </span>
          <span className="meta-item">
            <strong>Servings:</strong> {recipe.servings}
          </span>
          {recipe.prep_time_min && (
            <span className="meta-item">
              <strong>Prep:</strong> {recipe.prep_time_min} min
            </span>
          )}
          {recipe.cook_time_min && (
            <span className="meta-item">
              <strong>Cook:</strong> {recipe.cook_time_min} min
            </span>
          )}
        </div>
        {recipe.cuisine_tags && recipe.cuisine_tags.length > 0 && (
          <div className="recipe-tags">
            {recipe.cuisine_tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="recipe-content">
        <div className="recipe-section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.recipe_ingredients?.map((item, index) => (
              <li key={index}>
                {item.quantity} {item.unit} {item.ingredient.name}
              </li>
            ))}
          </ul>
        </div>

        {recipe.instructions && (
          <div className="recipe-section">
            <h2>Instructions</h2>
            <div className="instructions">
              {recipe.instructions.split('\n').map((step, index) => (
                <p key={index}>{step}</p>
              ))}
            </div>
          </div>
        )}

        {!recipe.instructions && (
          <div className="recipe-section">
            <p className="no-instructions">
              Detailed instructions coming soon! This is a traditional recipe that you likely
              already know how to prepare.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
