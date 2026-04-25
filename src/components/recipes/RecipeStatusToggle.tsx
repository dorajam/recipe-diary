import { useAuth } from '../../hooks/use-auth'
import { useRecipeStatus, useSetRecipeStatus } from '../../hooks/use-recipe-status'
import type { RecipeStatus } from '../../lib/types'

interface RecipeStatusToggleProps {
  recipeId: string
}

const statuses: { value: RecipeStatus; it: string; en: string }[] = [
  { value: 'want_to_try', it: 'Da provare', en: 'WANT TO TRY' },
  { value: 'made_it',     it: 'Fatto',      en: 'MADE IT' },
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
        const accent =
          s.value === 'want_to_try' ? 'var(--color-basil)' : 'var(--color-tomato)'
        return (
          <button
            key={s.value}
            onClick={() => handleToggle(s.value)}
            className="cursor-pointer transition-colors px-2.5 py-1 border-[1.5px] flex items-baseline gap-1.5"
            style={{
              borderRadius: 2,
              background: isActive ? accent : 'transparent',
              borderColor: isActive ? accent : 'var(--color-border)',
              color: isActive ? 'var(--color-cream)' : 'var(--color-text)',
            }}
          >
            <span
              className="font-display italic leading-none"
              style={{ fontSize: 14 }}
            >
              {s.it}
            </span>
            <span
              className="font-mono font-bold uppercase"
              style={{
                fontSize: 9,
                letterSpacing: '0.18em',
                opacity: isActive ? 0.9 : 0.6,
              }}
            >
              {s.en}
            </span>
          </button>
        )
      })}
    </div>
  )
}
