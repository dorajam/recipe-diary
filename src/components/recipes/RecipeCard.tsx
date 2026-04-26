import { Link } from 'react-router-dom'
import type { RecipeWithProfile, RecipeImage, RecipeStatus } from '../../lib/types'
import { categoryLabel } from '../../lib/categories'
import { personColor, nicknameFor } from '../../lib/person-color'

const ONE_DAY = 24 * 60 * 60 * 1000

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
  const isNew = Date.now() - new Date(recipe.created_at).getTime() < ONE_DAY
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

          {/* Image scrim — slight darkening at the bottom so titles read */}
          {image && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(31,18,8,0.55) 0%, rgba(31,18,8,0.0) 45%)',
                zIndex: 2,
              }}
            />
          )}

          {/* Title over image */}
          <h3
            className="absolute left-3.5 right-3.5 bottom-3 m-0 font-display italic font-medium leading-[1.0] tracking-tight text-cream"
            style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              color: '#FFFAEE',
              textShadow: '0 2px 14px rgba(0,0,0,0.45)',
              zIndex: 2,
            }}
          >
            {recipe.title}
          </h3>

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

          {/* Fresh badge */}
          {isNew && (
            <div
              className="absolute top-3 right-3 font-display italic px-3 py-0.5 rounded-full"
              style={{
                background: 'var(--color-tomato)',
                color: '#FFFAEE',
                fontSize: 13,
                transform: 'rotate(6deg)',
                zIndex: 2,
              }}
            >
              fresh!
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="px-4 py-3.5 space-y-2.5">
          {recipe.description && (
            <p className="font-mono text-[12px] text-text-muted leading-[1.5] m-0 line-clamp-2">
              {recipe.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <span
              className="font-display italic text-[13px] leading-none"
              style={{ color: personColor(profile) }}
            >
              by {nicknameFor(profile)}
            </span>

            {status === 'made_it' || cookedCount > 0 ? (
              <span className="stamp shrink-0">
                cooked
                {cookedCount > 1 && (
                  <span style={{ marginLeft: 2, opacity: 0.85 }}>
                    ×{cookedCount}
                  </span>
                )}
              </span>
            ) : status === 'want_to_try' ? (
              <span
                className="shrink-0 inline-flex items-center px-2.5 py-1 font-mono font-bold uppercase border-[1.5px]"
                style={{
                  color: 'var(--color-basil)',
                  borderColor: 'var(--color-basil)',
                  fontSize: 9.5,
                  letterSpacing: '0.18em',
                  borderRadius: 2,
                }}
              >
                want to try
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  )
}
