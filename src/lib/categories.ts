import type { RecipeCategory } from './types'

export const CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'starter', label: 'Starter' },
  { value: 'main', label: 'Main' },
  { value: 'side', label: 'Side' },
  { value: 'soup_stew', label: 'Soup & Stew' },
  { value: 'salad', label: 'Salad' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'baking', label: 'Baking' },
  { value: 'snack', label: 'Snack' },
  { value: 'drink', label: 'Drink' },
  { value: 'sauce_dip', label: 'Sauce & Dip' },
]

export function categoryLabel(value: RecipeCategory | null): string | null {
  if (!value) return null
  return CATEGORIES.find((c) => c.value === value)?.label ?? null
}
