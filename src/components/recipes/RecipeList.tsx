import { useRecipes } from '../../hooks/use-recipes'
import { useRecipeFirstImages } from '../../hooks/use-recipe-first-images'
import { RecipeCard } from './RecipeCard'

export function RecipeList() {
  const { data: recipes, isLoading, error } = useRecipes()
  const firstImages = useRecipeFirstImages(recipes?.map((r) => r.id))

  if (isLoading) {
    return (
      <div className="text-center py-20 text-text-muted">
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
        <p className="text-text-muted text-lg">No recipes yet.</p>
        <p className="text-text-muted">
          Add your first recipe to get started!
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            image={firstImages[recipe.id]}
          />
        ))}
      </div>
    </div>
  )
}
