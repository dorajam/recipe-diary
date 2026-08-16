import { useAuth } from '../../hooks/use-auth'
import { useRecipeStatus, useSetRecipeStatus } from '../../hooks/use-recipe-status'

/**
 * The deliberate "this one's good enough for the book" action.
 * Promotes a recipe to the 'candidate' stage — the cookbook-in-progress.
 */
export function CookbookButton({ recipeId }: { recipeId: string }) {
  const { profile } = useAuth()
  const { data: status } = useRecipeStatus(recipeId, profile?.id)
  const setStatus = useSetRecipeStatus()

  const isCandidate = status === 'candidate'

  function handleClick() {
    if (!profile) return
    // Toggle: add to book, or remove back to 'cooked'.
    setStatus.mutate({
      recipeId,
      userId: profile.id,
      status: isCandidate ? 'cooked' : 'candidate',
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={setStatus.isPending}
      className="inline-flex items-center gap-2 px-3.5 py-2 border-[1.5px] cursor-pointer transition-colors disabled:opacity-50"
      style={{
        borderRadius: 3,
        background: isCandidate ? 'var(--color-tomato)' : 'transparent',
        borderColor: 'var(--color-tomato)',
        color: isCandidate ? 'var(--color-cream)' : 'var(--color-tomato)',
      }}
      title={
        isCandidate
          ? 'In your cookbook — click to remove'
          : 'Add this recipe to your cookbook'
      }
    >
      <span style={{ fontSize: 14, lineHeight: 0 }}>{isCandidate ? '★' : '☆'}</span>
      <span className="font-display italic" style={{ fontSize: 14 }}>
        {isCandidate ? 'In your cookbook' : 'Add to cookbook'}
      </span>
    </button>
  )
}
