import type { Ingredient } from '../../lib/types'

interface IngredientEditorProps {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

const emptyIngredient: Ingredient = { amount: '', unit: '', item: '' }

const inputBase =
  'px-2.5 py-2 font-mono text-[13px] bg-bg-card text-text border border-border ' +
  'placeholder:text-text-muted/50 placeholder:italic focus:outline-none focus:border-tomato transition-colors'

export function IngredientEditor({ ingredients, onChange }: IngredientEditorProps) {
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
    <div className="space-y-2">
      {ingredients.map((ing, i) => (
        <div key={i} className="flex gap-1.5 items-stretch">
          <input
            type="text"
            placeholder="qty"
            value={ing.amount}
            onChange={(e) => updateAt(i, 'amount', e.target.value)}
            className={`w-16 text-right ${inputBase}`}
            style={{ borderRadius: 2 }}
          />
          <input
            type="text"
            placeholder="unit"
            value={ing.unit}
            onChange={(e) => updateAt(i, 'unit', e.target.value)}
            className={`w-20 ${inputBase}`}
            style={{ borderRadius: 2 }}
          />
          <input
            type="text"
            placeholder="ingredient"
            value={ing.item}
            onChange={(e) => updateAt(i, 'item', e.target.value)}
            className={`flex-1 ${inputBase}`}
            style={{ borderRadius: 2 }}
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            aria-label="Remove ingredient"
            className="px-2.5 text-text-muted hover:text-tomato transition-colors cursor-pointer bg-transparent border-none text-base leading-none"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="font-display italic text-sm cursor-pointer bg-transparent border-none px-0 mt-1"
        style={{ color: 'var(--color-basil)' }}
      >
        + add ingredient
      </button>
    </div>
  )
}
