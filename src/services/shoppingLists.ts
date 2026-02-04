import { supabase } from './supabase'

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  ingredient_id?: string
  ingredient_name: string
  quantity: number
  unit: string
  category: string
  checked: boolean
  manually_added: boolean
}

export interface ShoppingList {
  id: string
  household_id: string
  meal_plan_id?: string
  week_date: string
  status: 'pending' | 'completed'
  created_at: string
}

export async function getOrCreateShoppingList(
  householdId: string,
  mealPlanId: string,
  weekDate: string
): Promise<{ list: ShoppingList; items: ShoppingListItem[] }> {
  // Try to find existing shopping list
  const { data: existing, error: fetchError } = await supabase
    .from('shopping_lists')
    .select('*, shopping_list_items(*)')
    .eq('household_id', householdId)
    .eq('meal_plan_id', mealPlanId)
    .single()

  if (!fetchError && existing) {
    return {
      list: existing as ShoppingList,
      items: (existing as any).shopping_list_items || [],
    }
  }

  // Create new shopping list
  const { data: newList, error: createError } = await supabase
    .from('shopping_lists')
    .insert({
      household_id: householdId,
      meal_plan_id: mealPlanId,
      week_date: weekDate,
      status: 'pending',
    })
    .select()
    .single()

  if (createError) throw createError

  return {
    list: newList as ShoppingList,
    items: [],
  }
}

export async function saveShoppingListItems(
  shoppingListId: string,
  items: Array<{
    ingredient_id?: string
    ingredient_name: string
    quantity: number
    unit: string
    category: string
    manually_added?: boolean
  }>
) {
  // Delete existing auto-generated items (keep manual items)
  const { error: deleteError } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('shopping_list_id', shoppingListId)
    .eq('manually_added', false)

  if (deleteError) throw deleteError

  // Insert new items
  const itemsToInsert = items.map((item) => ({
    shopping_list_id: shoppingListId,
    ...item,
    checked: false,
    manually_added: item.manually_added || false,
  }))

  const { error: insertError } = await supabase
    .from('shopping_list_items')
    .insert(itemsToInsert)

  if (insertError) throw insertError
}

export async function toggleItemChecked(itemId: string, checked: boolean) {
  const { error } = await supabase
    .from('shopping_list_items')
    .update({ checked })
    .eq('id', itemId)

  if (error) throw error
}

export async function addManualItem(
  shoppingListId: string,
  name: string,
  quantity: number,
  unit: string,
  category: string
) {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .insert({
      shopping_list_id: shoppingListId,
      ingredient_name: name,
      quantity,
      unit,
      category,
      checked: false,
      manually_added: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as ShoppingListItem
}

export async function deleteShoppingListItem(itemId: string) {
  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}

export async function clearCheckedItems(shoppingListId: string) {
  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('shopping_list_id', shoppingListId)
    .eq('checked', true)

  if (error) throw error
}
