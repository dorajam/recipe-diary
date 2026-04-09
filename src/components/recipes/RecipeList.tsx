import { useRecipes } from '../../hooks/use-recipes'
import { useRecipeFirstImages } from '../../hooks/use-recipe-first-images'
import { RecipeCard } from './RecipeCard'
import { CookbookDoodle, PotDoodle, Sparkles } from '../illustrations/Doodles'

const CARD_ROTATIONS = ['-0.8deg', '0.6deg', '-0.4deg', '1deg', '-0.6deg', '0.8deg']

export function RecipeList() {
  const { data: recipes, isLoading, error } = useRecipes()
  const firstImages = useRecipeFirstImages(recipes?.map((r) => r.id))

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

  return (
    <div className="space-y-10">
      {/* Hero greeting */}
      <div className="relative text-center py-6">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent-soft rounded-full blur-3xl opacity-50" />
          <div className="absolute -top-5 right-10 w-32 h-32 bg-pop-soft rounded-full blur-3xl opacity-40" />
          <div className="absolute top-10 left-1/3 w-36 h-36 bg-sunny-soft rounded-full blur-3xl opacity-40" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-sunny" />
          <h2 className="text-3xl md:text-4xl m-0 tracking-tight">
            Our recipes
          </h2>
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <p className="text-text-muted text-sm">
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} in your collection
        </p>
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {recipes.map((recipe, i) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            image={firstImages[recipe.id]}
            rotation={CARD_ROTATIONS[i % CARD_ROTATIONS.length]}
          />
        ))}
      </div>
    </div>
  )
}
