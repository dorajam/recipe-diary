import { Link } from 'react-router-dom'
import type { RecipeWithProfile, RecipeImage } from '../../lib/types'
import { PlateDoodle } from '../illustrations/Doodles'

interface RecipeCardProps {
  recipe: RecipeWithProfile
  image?: RecipeImage
  rotation?: string
}

export function RecipeCard({ recipe, image, rotation = '0deg' }: RecipeCardProps) {
  const profile = recipe.profiles

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group block no-underline"
      style={{ transform: `rotate(${rotation})` }}
    >
      <article
        className="bg-bg-card rounded-2xl overflow-hidden
          shadow-sm hover:shadow-lg transition-all duration-300
          hover:-translate-y-2 hover:!rotate-0 border border-border/60"
      >
        {/* Image */}
        {image ? (
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={image.image_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.03]
                transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] bg-gradient-to-br from-accent-soft via-sunny-soft to-pop-soft flex items-center justify-center">
            <PlateDoodle className="w-20 h-20 text-text-muted/30" />
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-2">
          <h3 className="text-lg leading-snug m-0 text-text group-hover:text-accent transition-colors font-semibold">
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="text-sm text-text-muted line-clamp-2 m-0 leading-relaxed">
              {recipe.description}
            </p>
          )}

          {/* Attribution */}
          <div className="flex items-center gap-2 pt-2">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-5 h-5 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
                style={{ backgroundColor: profile.accent_colour }}
              >
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="text-xs font-medium"
              style={{ color: profile.accent_colour }}
            >
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
