import { useAuth } from '../../hooks/use-auth'
import { useRecipeStatus, useSetRecipeStatus } from '../../hooks/use-recipe-status'
import { STAGES } from '../../lib/pipeline'
import type { RecipeStatus } from '../../lib/types'

interface RecipeStatusToggleProps {
  recipeId: string
}

export function RecipeStatusToggle({ recipeId }: RecipeStatusToggleProps) {
  const { profile } = useAuth()
  const { data: currentStatus } = useRecipeStatus(recipeId, profile?.id)
  const setStatus = useSetRecipeStatus()

  function handleSet(status: RecipeStatus) {
    if (!profile) return
    // Clicking the active stage falls back to 'saved' (never fully unstaged).
    const next = currentStatus === status ? 'saved' : status
    setStatus.mutate({ recipeId, userId: profile.id, status: next })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STAGES.map((s) => {
        const isActive = currentStatus === s.value
        return (
          <button
            key={s.value}
            onClick={() => handleSet(s.value)}
            title={s.hint}
            className="cursor-pointer transition-colors px-2.5 py-1 border-[1.5px] flex items-baseline gap-1.5"
            style={{
              borderRadius: 2,
              background: isActive ? s.color : 'transparent',
              borderColor: isActive ? s.color : 'var(--color-border)',
              color: isActive ? 'var(--color-cream)' : 'var(--color-text)',
            }}
          >
            <span
              className="font-display italic leading-none"
              style={{ fontSize: 14 }}
            >
              {s.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
