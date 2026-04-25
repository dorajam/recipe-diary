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
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3 items-start">
          <span
            className="font-display italic font-medium shrink-0 leading-[0.9] pt-1"
            style={{
              color: 'var(--color-tomato)',
              fontSize: 28,
              minWidth: 32,
            }}
          >
            {i + 1}.
          </span>
          <textarea
            value={step}
            onChange={(e) => updateAt(i, e.target.value)}
            rows={2}
            className="flex-1 px-3 py-2 font-mono text-[13.5px] bg-bg-card text-text border border-border placeholder:text-text-muted/50 placeholder:italic focus:outline-none focus:border-tomato transition-colors resize-y"
            style={{ borderRadius: 2 }}
          />
          <button
            type="button"
            onClick={() => removeStep(i)}
            aria-label="Remove step"
            className="px-2 mt-2 text-text-muted hover:text-tomato transition-colors cursor-pointer bg-transparent border-none text-base leading-none"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addStep}
        className="font-display italic text-sm cursor-pointer bg-transparent border-none px-0 ml-11"
        style={{ color: 'var(--color-basil)' }}
      >
        + add step
      </button>
    </div>
  )
}
