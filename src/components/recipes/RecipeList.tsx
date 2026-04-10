import { useState, useMemo } from 'react'
import { useRecipes } from '../../hooks/use-recipes'
import { useRecipeFirstImages } from '../../hooks/use-recipe-first-images'
import { useAllRecipeStatuses } from '../../hooks/use-recipe-status'
import { useAuth } from '../../hooks/use-auth'
import { RecipeCard } from './RecipeCard'
import { CookbookDoodle, PotDoodle, Sparkles } from '../illustrations/Doodles'
import { CATEGORIES } from '../../lib/categories'
import type { RecipeCategory, RecipeStatus, RecipeWithProfile } from '../../lib/types'

const CARD_ROTATIONS = ['-0.8deg', '0.6deg', '-0.4deg', '1deg', '-0.6deg', '0.8deg']

type StatusFilter = 'all' | RecipeStatus

const STATUS_FILTERS: { value: RecipeStatus; label: string }[] = [
  { value: 'want_to_try', label: 'Want to try' },
  { value: 'made_it', label: 'Made it' },
]

function matchesSearch(recipe: RecipeWithProfile, query: string): boolean {
  const q = query.toLowerCase()
  if (recipe.title.toLowerCase().includes(q)) return true
  if (recipe.description?.toLowerCase().includes(q)) return true
  if (recipe.ingredients?.some((ing) => ing.item.toLowerCase().includes(q))) return true
  if (recipe.freeform_text?.toLowerCase().includes(q)) return true
  return false
}

export function RecipeList() {
  const { user } = useAuth()
  const { data: recipes, isLoading, error } = useRecipes()
  const firstImages = useRecipeFirstImages(recipes?.map((r) => r.id))
  const { data: statuses } = useAllRecipeStatuses(user?.id)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<RecipeCategory | 'all'>('all')

  const filtered = useMemo(() => {
    if (!recipes) return []
    let result = recipes

    if (search.trim()) {
      result = result.filter((r) => matchesSearch(r, search.trim()))
    }

    if (statusFilter !== 'all' && statuses) {
      result = result.filter((r) => statuses[r.id] === statusFilter)
    }

    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.categories?.includes(categoryFilter))
    }

    return result
  }, [recipes, search, statusFilter, categoryFilter, statuses])

  if (isLoading) {
    return (
      <div className="text-center py-20 text-text-muted">
        <PotDoodle className="w-16 h-auto mx-auto text-text-muted/20 mb-4 animate-pulse" />
        Loading recipes...
      </div>
    )
  }

  if (error) {
    console.error('Recipe list error:', error)
    return (
      <div className="text-center py-20 text-accent">
        Something went wrong loading recipes.
      </div>
    )
  }

  if (!recipes?.length) {
    return (
      <div className="text-center py-20 space-y-4">
        <CookbookDoodle className="w-28 h-auto mx-auto text-text-muted/40" />
        <p className="text-text-muted text-lg font-display">No recipes yet!</p>
        <p className="text-text-muted text-sm">
          Add your first recipe to get started.
        </p>
      </div>
    )
  }

  const hasActiveFilters = search.trim() || statusFilter !== 'all' || categoryFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Search & filter bar */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sunny" />
            <h2 className="text-2xl m-0 tracking-tight">Our recipes</h2>
          </div>
          <span className="text-text-muted text-xs">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
        </div>
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl
              bg-bg-card border border-border/60
              text-sm text-text placeholder:text-text-muted/40
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40
              transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-text-muted/50 hover:text-text-muted transition-colors
                text-lg leading-none cursor-pointer"
            >
              &times;
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(statusFilter === f.value ? 'all' : f.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                ${
                  statusFilter === f.value
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-bg-card text-text-muted border border-border/60 hover:border-accent/30 hover:text-text'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
              ${
                categoryFilter === 'all'
                  ? 'bg-sunny text-white shadow-sm'
                  : 'bg-bg-card text-text-muted border border-border/60 hover:border-sunny/30 hover:text-text'
              }`}
          >
            All categories
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(categoryFilter === c.value ? 'all' : c.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                ${
                  categoryFilter === c.value
                    ? 'bg-sunny text-white shadow-sm'
                    : 'bg-bg-card text-text-muted border border-border/60 hover:border-sunny/30 hover:text-text'
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((recipe, i) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              image={firstImages[recipe.id]}
              rotation={CARD_ROTATIONS[i % CARD_ROTATIONS.length]}
              status={statuses?.[recipe.id]}
            />
          ))}
        </div>
      ) : hasActiveFilters ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-text-muted text-lg font-display">No matches</p>
          <p className="text-text-muted/60 text-sm">
            Try a different search or filter.
          </p>
          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('all')
              setCategoryFilter('all')
            }}
            className="text-accent text-sm font-medium hover:underline mt-2 cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  )
}
