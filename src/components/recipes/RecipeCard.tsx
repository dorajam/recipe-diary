import { Link } from 'react-router-dom'
import type { RecipeWithProfile, RecipeImage, RecipeStatus } from '../../lib/types'
import { categoryLabel } from '../../lib/categories'
import { stageMeta } from '../../lib/pipeline'
import { personColor, nicknameFor } from '../../lib/person-color'
import { StarButton } from './StarButton'

interface RecipeCardProps {
  recipe: RecipeWithProfile
  image?: RecipeImage
  rotation?: string
  status?: RecipeStatus | null
  cookedCount?: number
}

// Darker cookbook-cover gradients for the empty image slot, alternating by id
function pickGradient(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const variants = [
    // Oxblood
    'radial-gradient(circle at 30% 30%, #C73248, #8E1B2B 60%, #5C1320)',
    // Burnt scotch
    'radial-gradient(circle at 35% 30%, #E0651F, #B5391C 60%, #74270F)',
    // Olive
    'radial-gradient(circle at 35% 35%, #8B9742, #5E6826 60%, #38421C)',
    // Mustard amber
    'radial-gradient(circle at 30% 30%, #D6A030, #A57210 60%, #6F4C0A)',
    // Aubergine wine
    'radial-gradient(circle at 35% 35%, #963C58, #5A1A36 60%, #38142A)',
  ]
  return variants[Math.abs(h) % variants.length]
}

export function RecipeCard({ recipe, image, status, cookedCount = 0 }: RecipeCardProps) {
  const profile = recipe.profiles
  const gradient = pickGradient(recipe.id)
  const primaryCategory = recipe.categories?.[0]
    ? categoryLabel(recipe.categories[0])
    : null

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="group block no-underline cursor-pointer"
    >
      <article
        className="relative bg-bg-card overflow-hidden border border-border
          transition-all duration-200 hover:-translate-y-1"
        style={{
          borderRadius: 4,
          boxShadow: '0 2px 0 var(--color-border), 0 14px 24px -16px rgba(36,21,16,0.4)',
        }}
      >
        {/* Star toggle, top-right */}
        <div
          className="absolute top-1.5 right-1.5 z-10 rounded-full"
          style={{ background: 'rgba(255,250,238,0.82)', backdropFilter: 'blur(2px)' }}
        >
          <StarButton
            recipeId={recipe.id}
            starred={recipe.starred}
            size={18}
            stopPropagation
          />
        </div>

        {/* Image area with overlay title */}
        <div
          className={`aspect-[4/3] relative overflow-hidden${image ? ' recipe-card-photo' : ''}`}
          style={image ? undefined : { background: gradient }}
        >
          {image ? (
            <img
              src={image.image_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,250,238,0.06) 3px 4px)',
              }}
            />
          )}

          {/* Category tag — lemon */}
          {primaryCategory && (
            <div
              className="absolute top-3 left-3 px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase"
              style={{
                background: 'var(--color-lemon)',
                color: 'var(--color-text)',
                letterSpacing: '0.2em',
                zIndex: 2,
              }}
            >
              {primaryCategory}
            </div>
          )}
        </div>

        {/* Card body — title under the image (fixed 2-line height so all
            cards are identical regardless of title length) */}
        <div className="px-4 py-3 space-y-1.5">
          <h3
            className="m-0 font-display italic font-medium tracking-tight text-text line-clamp-2 overflow-hidden"
            style={{ fontSize: '1.05rem', lineHeight: 1.15, height: '2.3em' }}
          >
            {recipe.title}
          </h3>

          <div className="flex items-center justify-between gap-3">
            <span
              className="font-display italic text-[13px] leading-none"
              style={{ color: personColor(profile) }}
            >
              by {nicknameFor(profile)}
            </span>

            {cookedCount > 0 ? (
              <span className="stamp shrink-0">
                cooked
                {cookedCount > 1 && (
                  <span style={{ marginLeft: 2, opacity: 0.85 }}>
                    ×{cookedCount}
                  </span>
                )}
              </span>
            ) : stageMeta(status) ? (
              <span
                className="shrink-0 inline-flex items-center px-2.5 py-1 font-mono font-bold uppercase border-[1.5px]"
                style={{
                  color: stageMeta(status)!.color,
                  borderColor: stageMeta(status)!.color,
                  fontSize: 9.5,
                  letterSpacing: '0.18em',
                  borderRadius: 2,
                }}
              >
                {stageMeta(status)!.short}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  )
}
