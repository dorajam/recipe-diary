import { Link } from 'react-router-dom'
import type { RecipeWithProfile, RecipeImage, RecipeStatus } from '../../lib/types'
import { categoryLabel } from '../../lib/categories'
import { Tomato, Basil, Lemon, Pepper } from '../illustrations/Produce'

const ONE_DAY = 24 * 60 * 60 * 1000

interface RecipeCardProps {
  recipe: RecipeWithProfile
  image?: RecipeImage
  rotation?: string
  status?: RecipeStatus | null
}

// Pick a doodle to fill the empty image slot, deterministically by id
const FALLBACK_DOODLES = [Tomato, Basil, Lemon, Pepper]
function pickDoodle(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return FALLBACK_DOODLES[Math.abs(h) % FALLBACK_DOODLES.length]
}

// Two warm gradient backgrounds for the image area, alternating by id
function pickGradient(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const variants = [
    'radial-gradient(circle at 30% 35%, #FF3500, #FF2D1A 60%, #5A1A36)',
    'radial-gradient(circle at 35% 30%, #FFD21A, #7DAD2E 65%, #2F4A18)',
    'radial-gradient(circle at 35% 35%, #FFB800, #FF3500 65%, #5A1A36)',
  ]
  return variants[Math.abs(h) % variants.length]
}

export function RecipeCard({ recipe, image, status }: RecipeCardProps) {
  const profile = recipe.profiles
  const isNew = Date.now() - new Date(recipe.created_at).getTime() < ONE_DAY
  const Doodle = pickDoodle(recipe.id)
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
          className="aspect-[4/3] relative overflow-hidden"
          style={image ? undefined : { background: gradient }}
        >
          {image ? (
            <img
              src={image.image_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <>
              {/* Subtle horizontal scan lines for the gradient fallback */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,250,238,0.05) 3px 4px)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-90">
                <Doodle size={120} color="#FFFAEE" />
              </div>
            </>
          )}

          {/* Image scrim — slight darkening at the bottom so titles read */}
          {image && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(31,18,8,0.55) 0%, rgba(31,18,8,0.0) 45%)',
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
              }}
            >
              fresh!
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="px-4 py-3.5 space-y-3">
          {recipe.description && (
            <p className="font-mono text-[12px] text-text-muted leading-[1.55] m-0 line-clamp-2">
              {recipe.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-[22px] h-[22px] rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-cream font-display italic font-semibold text-[13px]"
                style={{ backgroundColor: profile.accent_colour }}
              >
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-display italic text-[14px] text-text">
              by {profile.display_name}
            </span>

            <span className="ml-auto">
              {status === 'made_it' ? (
                <span className="stamp" style={{ fontSize: '0.7rem', padding: '3px 9px' }}>
                  cooked
                </span>
              ) : status === 'want_to_try' ? (
                <span
                  className="font-mono uppercase font-bold text-[9.5px] px-2 py-1 border-[1.5px]"
                  style={{
                    color: 'var(--color-basil)',
                    borderColor: 'var(--color-basil)',
                    letterSpacing: '0.18em',
                  }}
                >
                  Want to try
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
