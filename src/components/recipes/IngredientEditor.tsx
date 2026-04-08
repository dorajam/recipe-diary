import type { Ingredient } from '../../lib/types'

interface IngredientEditorProps {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

const emptyIngredient: Ingredient = { amount: '', unit: '', item: '' }

export function IngredientEditor({
  ingredients,
  onChange,
}: IngredientEditorProps) {
  function updateAt(index: number, field: keyof Ingredient, value: string) {
    const updated = ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing,
    )
    onChange(updated)
  }

  function addRow() {
    onChange([...ingredients, { ...emptyIngredient }])
  }

  function removeRow(index: number) {
    onChange(ingredients.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text">
        Ingredients
      </label>

      {ingredients.map((ing, i) => (
        <div key={i} className="flex gap-2 items-start">
          <input
            type="text"
            placeholder="Amt"
            value={ing.amount}
            onChange={(e) => updateAt(i, 'amount', e.target.value)}
            className="w-16 px-2 py-2 rounded-lg border border-border bg-bg-card
              text-sm focus:outline-none focus:border-accent"
          />
          <input
            type="text"
            placeholder="Unit"
            value={ing.unit}
            onChange={(e) => updateAt(i, 'unit', e.target.value)}
            className="w-20 px-2 py-2 rounded-lg border border-border bg-bg-card
              text-sm focus:outline-none focus:border-accent"
          />
          <input
            type="text"
            placeholder="Ingredient"
            value={ing.item}
            onChange={(e) => updateAt(i, 'item', e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-card
              text-sm focus:outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="px-2 py-2 text-text-muted hover:text-accent transition-colors
              cursor-pointer bg-transparent border-none text-sm"
          >
            x
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="text-sm text-accent hover:text-accent/80 transition-colors
          cursor-pointer bg-transparent border-none font-medium"
      >
        + Add ingredient
      </button>
    </div>
  )
}
