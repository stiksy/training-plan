/**
 * Unit conversion utilities for ingredients
 * All weights normalized to grams, volumes to millilitres
 */

export type BaseUnit = 'g' | 'ml'
export type DisplayUnit = 'g' | 'ml' | 'units' | 'tbsp' | 'tsp' | 'cup' | 'kg' | 'l'

// Conversion rates to base units
const CONVERSION_TO_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
  cup: 240,
  tbsp: 15,
  tsp: 5
}

const CONVERSION_TO_G: Record<string, number> = {
  g: 1,
  kg: 1000
}

/**
 * Convert any unit to base unit (g or ml)
 */
export function toBaseUnit(quantity: number, unit: string): { value: number; baseUnit: BaseUnit } {
  const lowerUnit = unit.toLowerCase()

  // Check if it's a volume unit
  if (lowerUnit in CONVERSION_TO_ML) {
    return {
      value: quantity * CONVERSION_TO_ML[lowerUnit],
      baseUnit: 'ml'
    }
  }

  // Check if it's a weight unit
  if (lowerUnit in CONVERSION_TO_G) {
    return {
      value: quantity * CONVERSION_TO_G[lowerUnit],
      baseUnit: 'g'
    }
  }

  // If it's 'units' or unknown, keep as is
  return {
    value: quantity,
    baseUnit: 'g' // Default to grams for unknowns
  }
}

/**
 * Convert base unit to user-friendly display unit
 * Chooses the most appropriate unit to avoid decimals
 */
export function toDisplayUnit(value: number, baseUnit: BaseUnit): { value: number; unit: DisplayUnit } {
  if (baseUnit === 'ml') {
    // Volume conversions
    if (value >= 1000) {
      return { value: Math.round(value / 1000 * 10) / 10, unit: 'l' }
    }
    if (value >= 100) {
      return { value: Math.round(value), unit: 'ml' }
    }
    if (value >= 30) {
      return { value: Math.round(value / 15), unit: 'tbsp' }
    }
    if (value >= 10) {
      return { value: Math.round(value / 5), unit: 'tsp' }
    }
    return { value: Math.round(value), unit: 'ml' }
  } else {
    // Weight conversions
    if (value >= 1000) {
      return { value: Math.round(value / 1000 * 10) / 10, unit: 'kg' }
    }
    return { value: Math.round(value), unit: 'g' }
  }
}

/**
 * Round quantity to practical shopping amounts
 */
export function roundToShoppingQuantity(value: number, unit: DisplayUnit): number {
  if (unit === 'units') {
    return Math.ceil(value) // Always round up for countable items
  }

  if (unit === 'g') {
    // Round to nearest 50g for produce, 100g for proteins
    if (value < 100) {
      return Math.ceil(value / 25) * 25
    }
    return Math.ceil(value / 50) * 50
  }

  if (unit === 'kg') {
    return Math.ceil(value * 2) / 2 // Round to nearest 0.5 kg
  }

  if (unit === 'ml' || unit === 'l') {
    // Round to nearest 50ml or 0.1l
    if (unit === 'ml') {
      return Math.ceil(value / 50) * 50
    }
    return Math.ceil(value * 10) / 10
  }

  // For tbsp and tsp, round to nearest whole number
  return Math.ceil(value)
}

/**
 * Aggregate quantities for the same ingredient
 * Normalizes to base units, sums, then converts back to display units
 */
export function aggregateIngredients(
  items: Array<{ quantity: number; unit: string }>
): { value: number; unit: DisplayUnit } {
  if (items.length === 0) {
    return { value: 0, unit: 'g' }
  }

  // Check if all items are 'units' (countable items)
  const allUnits = items.every(item => item.unit.toLowerCase() === 'units')
  if (allUnits) {
    const total = items.reduce((sum, item) => sum + item.quantity, 0)
    return { value: Math.ceil(total), unit: 'units' }
  }

  // Convert all to base units
  const baseItems = items.map(item => toBaseUnit(item.quantity, item.unit))

  // Check if all items use the same base unit
  const firstBaseUnit = baseItems[0].baseUnit
  const sameBaseUnit = baseItems.every(item => item.baseUnit === firstBaseUnit)

  if (!sameBaseUnit) {
    console.warn('Mixed base units detected, defaulting to first unit type')
  }

  // Sum all values
  const totalValue = baseItems.reduce((sum, item) => sum + item.value, 0)

  // Convert back to display unit
  return toDisplayUnit(totalValue, firstBaseUnit)
}

/**
 * Format quantity and unit for display
 */
export function formatQuantity(value: number, unit: DisplayUnit): string {
  if (unit === 'units') {
    return `${Math.ceil(value)} ${value === 1 ? 'unit' : 'units'}`
  }

  // Round display value
  const displayValue = unit === 'kg' || unit === 'l'
    ? Math.round(value * 10) / 10
    : Math.round(value)

  return `${displayValue}${unit}`
}

/**
 * Check if quantity is too small (pantry staple check)
 */
export function isPantryStaple(value: number, unit: DisplayUnit): boolean {
  if (unit === 'g' && value < 50) return true
  if (unit === 'ml' && value < 50) return true
  if (unit === 'tsp' && value < 2) return true
  return false
}
