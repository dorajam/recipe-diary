import { useState, useMemo } from 'react'
import {
  useRecipeTags,
  useAllTags,
  useAddTag,
  useRemoveTag,
} from '../../hooks/use-tags'

/**
 * Custom free-form tags for a recipe (e.g. "summer salad", "high-protein").
 * Type to add; suggestions come from tags you've used before.
 */
export function TagEditor({ recipeId }: { recipeId: string }) {
  const { data: tags } = useRecipeTags(recipeId)
  const { data: allTags } = useAllTags()
  const addTag = useAddTag()
  const removeTag = useRemoveTag()

  const [draft, setDraft] = useState('')

  const currentNames = useMemo(
    () => new Set((tags ?? []).map((t) => t.name)),
    [tags],
  )

  // Suggestions: existing tags matching the draft, not already applied.
  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase()
    if (!q) return []
    return (allTags ?? [])
      .filter((t) => t.name.includes(q) && !currentNames.has(t.name))
      .slice(0, 6)
  }, [draft, allTags, currentNames])

  function add(name: string) {
    const clean = name.trim()
    if (!clean) return
    addTag.mutate({ recipeId, name: clean })
    setDraft('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      add(draft)
    }
  }

  return (
    <div className="space-y-2">
      {/* Current tags */}
      <div className="flex flex-wrap gap-1.5">
        {(tags ?? []).map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1"
            style={{
              borderRadius: 999,
              background: 'var(--color-bg-warm, var(--color-bg-card))',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11.5,
              color: 'var(--color-text)',
            }}
          >
            {t.name}
            <button
              onClick={() => removeTag.mutate({ recipeId, tagId: t.id })}
              aria-label={`Remove ${t.name}`}
              className="cursor-pointer bg-transparent border-none text-text-muted hover:text-oxblood leading-none"
              style={{ fontSize: 14 }}
            >
              ×
            </button>
          </span>
        ))}
        {(tags?.length ?? 0) === 0 && (
          <span className="font-mono text-[11px] text-text-muted/70 italic py-1">
            no tags yet
          </span>
        )}
      </div>

      {/* Add input with suggestions */}
      <div className="relative" style={{ maxWidth: 320 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="add a tag… (e.g. summer salad)"
          className="w-full px-3 py-2 font-mono text-[13px] bg-bg text-text
            border border-border placeholder:text-text-muted/50 placeholder:italic
            focus:outline-none focus:border-tomato transition-colors"
          style={{ borderRadius: 2 }}
        />
        {suggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 z-20 mt-1 bg-bg-card border border-border shadow-lg overflow-hidden"
            style={{ borderRadius: 3 }}
          >
            {suggestions.map((t) => (
              <button
                key={t.id}
                onClick={() => add(t.name)}
                className="block w-full text-left px-3 py-1.5 font-mono text-[12px] text-text hover:bg-bg-warm cursor-pointer bg-transparent border-none"
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
