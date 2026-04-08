interface StepEditorProps {
  steps: string[]
  onChange: (steps: string[]) => void
}

export function StepEditor({ steps, onChange }: StepEditorProps) {
  function updateAt(index: number, value: string) {
    const updated = steps.map((s, i) => (i === index ? value : s))
    onChange(updated)
  }

  function addStep() {
    onChange([...steps, ''])
  }

  function removeStep(index: number) {
    onChange(steps.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text">Steps</label>

      {steps.map((step, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-text-muted text-sm pt-2 w-6 text-right shrink-0">
            {i + 1}.
          </span>
          <textarea
            value={step}
            onChange={(e) => updateAt(i, e.target.value)}
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-card
              text-sm focus:outline-none focus:border-accent resize-y"
          />
          <button
            type="button"
            onClick={() => removeStep(i)}
            className="px-2 py-2 text-text-muted hover:text-accent transition-colors
              cursor-pointer bg-transparent border-none text-sm"
          >
            x
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        className="text-sm text-accent hover:text-accent/80 transition-colors
          cursor-pointer bg-transparent border-none font-medium"
      >
        + Add step
      </button>
    </div>
  )
}
