import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../../hooks/use-recipes'
import { useRecipeFirstImages } from '../../hooks/use-recipe-first-images'
import { useAllRecipeStatuses } from '../../hooks/use-recipe-status'
import { useAllCookCounts } from '../../hooks/use-cook-log'
import { useAuth } from '../../hooks/use-auth'
import { RecipeCard } from './RecipeCard'
import { Lemon } from '../illustrations/Produce'

/** Starred — your favorites, independent of pipeline stage. */
export function Starred() {
  const { user } = useAuth()
  const { data: recipes, isLoading } = useRecipes()
  const { data: statuses } = useAllRecipeStatuses(user?.id)
  const firstImages = useRecipeFirstImages(recipes?.map((r) => r.id))
  const { data: cookCounts } = useAllCookCounts()

  const starred = useMemo(
    () => (recipes ?? []).filter((r) => r.starred),
    [recipes],
  )

  if (isLoading) {
    return (
      <div className="text-center py-24 text-text-muted">
        <Lemon size={64} className="mx-auto mb-4 opacity-50 animate-pulse" />
        <p className="font-mono text-sm">loading…</p>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <div
          className="font-mono font-bold"
          style={{
            fontSize: 10,
            letterSpacing: '0.32em',
            color: 'var(--color-tomato)',
            textTransform: 'uppercase',
          }}
        >
          Favorites · i preferiti
        </div>
        <h1
          className="m-0 font-display italic font-medium leading-[0.95] tracking-tight text-text"
          style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)' }}
        >
          Starred <span style={{ color: 'var(--color-tomato)' }}>recipes</span>.
        </h1>
        <p className="font-display italic text-text-muted text-lg m-0 mt-1">
          {starred.length > 0
            ? `${starred.length} ${starred.length === 1 ? 'favorite' : 'favorites'}.`
            : 'The recipes you love, all in one place.'}
        </p>
      </div>

      {starred.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 items-start">
          {starred.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              image={firstImages[recipe.id]}
              status={statuses?.[recipe.id]}
              cookedCount={cookCounts?.[recipe.id] ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-5 border border-dashed border-border" style={{ borderRadius: 4 }}>
          <Lemon size={72} className="mx-auto" />
          <div className="space-y-2">
            <p className="font-display italic text-2xl text-text m-0">
              No favorites yet.
            </p>
            <p className="font-mono text-sm text-text-muted m-0 max-w-md mx-auto leading-relaxed">
              Tap the{' '}
              <span style={{ color: 'var(--color-tomato)' }}>★</span> on any
              recipe to keep it here.
            </p>
          </div>
          <Link to="/" className="btn-trat btn-trat-ghost inline-flex mx-auto">
            Browse recipes
          </Link>
        </div>
      )}
    </div>
  )
}
