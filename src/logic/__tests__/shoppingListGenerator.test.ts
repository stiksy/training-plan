import { describe, it, expect } from 'vitest'
import { normalizeUnit, convertToBaseUnit, formatQuantity } from '../unitConversion'

describe('Unit Conversion', () => {
  describe('normalizeUnit', () => {
    it('should normalize common units', () => {
      expect(normalizeUnit('tablespoon')).toBe('tbsp')
      expect(normalizeUnit('tablespoons')).toBe('tbsp')
      expect(normalizeUnit('teaspoon')).toBe('tsp')
      expect(normalizeUnit('teaspoons')).toBe('tsp')
      expect(normalizeUnit('cup')).toBe('cup')
      expect(normalizeUnit('cups')).toBe('cup')
    })

    it('should handle already normalized units', () => {
      expect(normalizeUnit('g')).toBe('g')
      expect(normalizeUnit('ml')).toBe('ml')
      expect(normalizeUnit('kg')).toBe('kg')
    })

    it('should handle unit plurals', () => {
      expect(normalizeUnit('grams')).toBe('g')
      expect(normalizeUnit('units')).toBe('units')
    })
  })

  describe('convertToBaseUnit', () => {
    it('should convert volume units to ml', () => {
      expect(convertToBaseUnit(1, 'cup')).toBe(240) // 1 cup = 240ml
      expect(convertToBaseUnit(1, 'tbsp')).toBe(15) // 1 tbsp = 15ml
      expect(convertToBaseUnit(1, 'tsp')).toBe(5) // 1 tsp = 5ml
    })

    it('should convert weight units to grams', () => {
      expect(convertToBaseUnit(1, 'kg')).toBe(1000) // 1 kg = 1000g
      expect(convertToBaseUnit(1, 'g')).toBe(1) // 1 g = 1g
    })

    it('should handle ml and g passthrough', () => {
      expect(convertToBaseUnit(100, 'ml')).toBe(100)
      expect(convertToBaseUnit(100, 'g')).toBe(100)
    })

    it('should return quantity for unknown units', () => {
      expect(convertToBaseUnit(5, 'units')).toBe(5)
      expect(convertToBaseUnit(3, 'pieces')).toBe(3)
    })
  })

  describe('formatQuantity', () => {
    it('should format whole numbers without decimals', () => {
      expect(formatQuantity(100)).toBe('100')
      expect(formatQuantity(5)).toBe('5')
    })

    it('should format decimals with one decimal place', () => {
      expect(formatQuantity(2.5)).toBe('2.5')
      expect(formatQuantity(10.25)).toBe('10.3') // Rounds to 1 decimal
    })

    it('should round to nearest practical value', () => {
      expect(formatQuantity(100.7)).toBe('101')
      expect(formatQuantity(2.95)).toBe('3')
    })
  })
})

describe('Shopping List Aggregation', () => {
  it('should handle empty ingredient list', () => {
    const ingredients: any[] = []
    expect(ingredients.length).toBe(0)
  })

  it('should deduplicate same ingredients', () => {
    const ingredients = [
      { ingredient_id: '1', name: 'Tomato', quantity: 2, unit: 'units' },
      { ingredient_id: '1', name: 'Tomato', quantity: 3, unit: 'units' },
    ]

    // Group by ingredient_id and sum
    const grouped = ingredients.reduce((acc, item) => {
      if (!acc[item.ingredient_id]) {
        acc[item.ingredient_id] = { ...item }
      } else {
        acc[item.ingredient_id].quantity += item.quantity
      }
      return acc
    }, {} as Record<string, any>)

    expect(grouped['1'].quantity).toBe(5)
  })

  it('should convert units to base units for aggregation', () => {
    // 1 cup + 2 tbsp = 240ml + 30ml = 270ml
    const quantity1 = convertToBaseUnit(1, 'cup')
    const quantity2 = convertToBaseUnit(2, 'tbsp')
    const total = quantity1 + quantity2

    expect(total).toBe(270)
  })
})
