import { Link } from 'react-router-dom'
import type { RecipeWithProfile, RecipeImage } from '../../lib/types'

interface RecipeCardProps {
  recipe: RecipeWithProfile
  image?: RecipeImage
}

export function RecipeCard({ recipe, image }: RecipeCardProps) {
  const profile = recipe.profiles

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group block no-underline"
    >
      <article
        className="bg-bg-card rounded-2xl border border-border overflow-hidden
          shadow-sm hover:shadow-md transition-all duration-200
          hover:-translate-y-0.5"
      >
        {/* Image */}
        {image && (
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={image.image_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.02]
                transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-2">
          <h3 className="text-lg leading-snug m-0 text-text group-hover:text-accent transition-colors">
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="text-sm text-text-muted line-clamp-2 m-0">
              {recipe.description}
            </p>
          )}

          {/* Attribution */}
          <div className="flex items-center gap-2 pt-1">
            <div
              className="w-1 h-4 rounded-full"
              style={{ backgroundColor: profile.accent_colour }}
            />
            <span className="text-xs text-text-muted">
              {profile.display_name}
            </span>
            <span className="text-xs text-text-muted/50 ml-auto">
              {new Date(recipe.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
