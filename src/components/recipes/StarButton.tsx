import { useToggleStar } from '../../hooks/use-recipes'

interface StarButtonProps {
  recipeId: string
  starred: boolean
  size?: number
  /** stop the click from triggering a parent link (e.g. on a card) */
  stopPropagation?: boolean
}

export function StarButton({
  recipeId,
  starred,
  size = 20,
  stopPropagation = false,
}: StarButtonProps) {
  const toggle = useToggleStar()

  function handleClick(e: React.MouseEvent) {
    if (stopPropagation) {
      e.preventDefault()
      e.stopPropagation()
    }
    toggle.mutate({ id: recipeId, starred: !starred })
  }

  return (
    <button
      onClick={handleClick}
      title={starred ? 'Starred — click to unstar' : 'Star this recipe'}
      aria-label={starred ? 'Unstar recipe' : 'Star recipe'}
      aria-pressed={starred}
      className="inline-flex items-center justify-center bg-transparent border-none cursor-pointer transition-transform hover:scale-110"
      style={{ padding: 4, lineHeight: 0 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={starred ? 'var(--color-tomato)' : 'none'}
        stroke={starred ? 'var(--color-tomato)' : 'var(--color-text-muted)'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      >
        <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 5.9 21.3l1.2-6.6L2.3 9.5l6.6-.9z" />
      </svg>
    </button>
  )
}
