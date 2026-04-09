import { useAuth } from '../../hooks/use-auth'
import { useRecipeStatus, useSetRecipeStatus } from '../../hooks/use-recipe-status'
import type { RecipeStatus } from '../../lib/types'

interface RecipeStatusToggleProps {
  recipeId: string
}

const statuses: { value: RecipeStatus; label: string; icon: string }[] = [
  { value: 'want_to_try', label: 'Want to try', icon: '🔖' },
  { value: 'made_it', label: 'Made it', icon: '✓' },
]

export function RecipeStatusToggle({ recipeId }: RecipeStatusToggleProps) {
  const { profile } = useAuth()
  const { data: currentStatus } = useRecipeStatus(recipeId, profile?.id)
  const setStatus = useSetRecipeStatus()

  function handleToggle(status: RecipeStatus) {
    if (!profile) return

    setStatus.mutate({
      recipeId,
      userId: profile.id,
      status: currentStatus === status ? null : status,
    })
  }

  return (
    <div className="flex gap-2">
      {statuses.map((s) => {
        const isActive = currentStatus === s.value
        return (
          <button
            key={s.value}
            onClick={() => handleToggle(s.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm transition-all cursor-pointer border ${
              isActive
                ? s.value === 'want_to_try'
                  ? 'bg-sunny text-white border-sunny shadow-sm'
                  : 'bg-pop text-white border-pop shadow-sm'
                : 'bg-transparent text-text-muted border-border hover:border-pop/30 hover:bg-pop-soft'
            }`}
          >
            <span className="mr-1">{s.icon}</span>
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
