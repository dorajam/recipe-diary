import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../../hooks/use-recipes'
import { useRecipeFirstImages } from '../../hooks/use-recipe-first-images'
import { useAllRecipeStatuses } from '../../hooks/use-recipe-status'
import { useAllCookCounts } from '../../hooks/use-cook-log'
import { useAuth } from '../../hooks/use-auth'
import { RecipeCard } from './RecipeCard'
import { RollingPin, Basil } from '../illustrations/Produce'

/**
 * "This Week" — the action-driver. Shows the recipes you've committed to
 * cooking (status = 'planned'). Planning == putting a recipe here.
 */
export function ThisWeek() {
  const { user } = useAuth()
  const { data: recipes, isLoading } = useRecipes()
  const { data: statuses } = useAllRecipeStatuses(user?.id)
  const firstImages = useRecipeFirstImages(recipes?.map((r) => r.id))
  const { data: cookCounts } = useAllCookCounts()

  const planned = useMemo(() => {
    if (!recipes || !statuses) return []
    return recipes.filter((r) => statuses[r.id] === 'planned')
  }, [recipes, statuses])

  if (isLoading) {
    return (
      <div className="text-center py-24 text-text-muted">
        <RollingPin size={64} className="mx-auto mb-4 opacity-50 animate-pulse" />
        <p className="font-mono text-sm">loading…</p>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* ── Header ── */}
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
          The plan · in cucina
        </div>
        <h1
          className="m-0 font-display italic font-medium leading-[0.95] tracking-tight text-text"
          style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)' }}
        >
          This <span style={{ color: 'var(--color-tomato)' }}>week</span>.
        </h1>
        <p className="font-display italic text-text-muted text-lg m-0 mt-1">
          {planned.length > 0
            ? `${planned.length} ${planned.length === 1 ? 'recipe' : 'recipes'} to cook — then mark each one made.`
            : 'What are you cooking this week?'}
        </p>
      </div>

      {/* ── Planned recipes, or empty state ── */}
      {planned.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-start">
          {planned.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              image={firstImages[recipe.id]}
              status="planned"
              cookedCount={cookCounts?.[recipe.id] ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-5 border border-dashed border-border" style={{ borderRadius: 4 }}>
          <Basil size={72} className="mx-auto" />
          <div className="space-y-2">
            <p className="font-display italic text-2xl text-text m-0">
              Nothing planned yet.
            </p>
            <p className="font-mono text-sm text-text-muted m-0 max-w-md mx-auto leading-relaxed">
              Browse your collection and mark a few recipes{' '}
              <span style={{ color: 'var(--color-ackee)' }}>Planned</span> to
              build this week's cook list.
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
