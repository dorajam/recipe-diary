import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  useRecipe,
  useRecipeImages,
  useDeleteRecipe,
} from '../../hooks/use-recipes'
import { useState } from 'react'
import { categoryLabel } from '../../lib/categories'
import { RecipeStatusToggle } from './RecipeStatusToggle'
import { CookbookButton } from './CookbookButton'
import { StarButton } from './StarButton'
import { InstagramEmbed } from './InstagramEmbed'
import { isInstagramUrl, instagramPostId } from '../../lib/instagram'
import { CookLogSection } from './CookLogSection'
import { CommentThread } from './CommentThread'
import { Tomato, PastaNest } from '../illustrations/Produce'
import { personColor } from '../../lib/person-color'

export function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: recipe, isLoading } = useRecipe(id)
  const { data: images } = useRecipeImages(id)
  const deleteRecipe = useDeleteRecipe()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeTab, setActiveTab] = useState<'recipe' | 'notes'>('recipe')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (isLoading) {
    return (
      <div className="text-center py-24 text-text-muted">
        <PastaNest size={64} className="mx-auto mb-4 opacity-50 animate-pulse" />
        <p className="font-mono text-sm">loading…</p>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-24 space-y-5">
        <Tomato size={96} className="mx-auto" />
        <p className="font-display italic text-3xl text-text m-0">Not found.</p>
        <p className="font-mono text-sm text-text-muted m-0">Recipe not found.</p>
        <Link
          to="/"
          className="inline-block font-mono text-xs uppercase font-bold text-tomato hover:underline mt-2"
          style={{ letterSpacing: '0.2em' }}
        >
          ← all recipes
        </Link>
      </div>
    )
  }

  const author = recipe.profiles
  const allImages = images || []
  const activeImage = allImages[activeImageIndex]
  const isSourcePhoto = activeImage?.image_type === 'source_photo'

  async function handleDelete() {
    if (!id) return
    await deleteRecipe.mutateAsync(id)
    navigate('/')
  }

  return (
    <article className="max-w-3xl mx-auto space-y-7">
      {/* Back link */}
      <Link
        to="/"
        className="inline-block font-mono text-[11px] uppercase font-bold text-text-muted hover:text-tomato no-underline transition-colors"
        style={{ letterSpacing: '0.25em' }}
      >
        ← all recipes
      </Link>

      {/* Hero image carousel */}
      {activeImage ? (
        <div className="space-y-2">
          <div
            className="relative overflow-hidden border border-border"
            style={{
              borderRadius: 4,
              boxShadow:
                '0 2px 0 var(--color-border), 0 18px 32px -18px rgba(36,21,16,0.45)',
            }}
          >
            <img
              src={activeImage.image_url}
              alt=""
              className={`w-full ${
                isSourcePhoto ? 'object-contain' : 'max-h-[520px] object-cover'
              }`}
            />
            {activeImage.caption && (
              <p className="font-display italic text-sm text-text-muted px-4 py-2 bg-bg-card border-t border-border m-0">
                {activeImage.caption}
              </p>
            )}

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex(
                      (i) => (i - 1 + allImages.length) % allImages.length,
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                    bg-text/40 hover:bg-text/60 text-cream flex items-center justify-center
                    cursor-pointer border-none transition-colors backdrop-blur-sm text-lg leading-none"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((i) => (i + 1) % allImages.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                    bg-text/40 hover:bg-text/60 text-cream flex items-center justify-center
                    cursor-pointer border-none transition-colors backdrop-blur-sm text-lg leading-none"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className="border-none cursor-pointer transition-all"
                    style={{
                      width: i === activeImageIndex ? 18 : 6,
                      height: 6,
                      borderRadius: 999,
                      background:
                        i === activeImageIndex
                          ? 'var(--color-cream)'
                          : 'rgba(255,250,238,0.5)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Title + meta */}
      <div className="space-y-4">
        {recipe.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.categories.map((cat, i) => (
              <span
                key={cat}
                className="px-2.5 py-1 font-mono text-[10px] font-bold uppercase border-[1.5px]"
                style={{
                  letterSpacing: '0.18em',
                  background:
                    i === 0 ? 'var(--color-lemon)' : 'transparent',
                  color: 'var(--color-text)',
                  borderColor:
                    i === 0 ? 'var(--color-lemon)' : 'var(--color-border)',
                  borderRadius: 2,
                }}
              >
                {categoryLabel(cat)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-start gap-3">
          <h1
            className="font-display italic font-medium leading-[0.96] tracking-tight text-text m-0 flex-1"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)' }}
          >
            {recipe.title}
          </h1>
          <div className="pt-1 shrink-0">
            <StarButton recipeId={recipe.id} starred={recipe.starred} size={28} />
          </div>
        </div>

        {recipe.description && (
          <p
            className="font-display italic text-text-muted leading-[1.45] m-0"
            style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)' }}
          >
            {recipe.description}
          </p>
        )}
      </div>

      {/* Author strip — bordered top/bottom */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 py-3"
        style={{
          borderTop: '1.5px solid var(--color-text)',
          borderBottom: '1.5px solid var(--color-text)',
        }}
      >
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span
            className="font-display italic text-[16px]"
            style={{ color: personColor(author) }}
          >
            {author.display_name}
          </span>
          <span className="text-border">·</span>
          <span
            className="font-mono text-[11px] font-semibold text-text-muted uppercase"
            style={{ letterSpacing: '0.15em' }}
          >
            {new Date(recipe.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <RecipeStatusToggle recipeId={recipe.id} />
          <CookbookButton recipeId={recipe.id} />
        </div>
      </div>

      {/* Source URL */}
      {recipe.source_url && (
        <a
          href={recipe.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase font-bold text-tomato hover:underline"
          style={{ letterSpacing: '0.18em' }}
        >
          view original source →
        </a>
      )}

      {/* Instagram reel embed — so you can watch what the recipe looks like */}
      {recipe.source_url &&
        isInstagramUrl(recipe.source_url) &&
        instagramPostId(recipe.source_url) && (
          <InstagramEmbed postId={instagramPostId(recipe.source_url)!} />
        )}

      {/* Tabs */}
      <div
        className="flex gap-0"
        style={{ borderBottom: '1.5px solid var(--color-border)' }}
      >
        {(
          [
            { value: 'recipe', label: 'Recipe', sub: 'THE DISH' },
            { value: 'notes', label: 'Notes & Log', sub: 'COOK DIARY' },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="text-left py-2.5 px-5 cursor-pointer transition-colors hover:bg-bg-card/50 bg-transparent"
              style={{
                borderBottom: active
                  ? '2.5px solid var(--color-tomato)'
                  : '2.5px solid transparent',
                marginBottom: -1.5,
              }}
            >
              <div
                className="font-display italic leading-none"
                style={{
                  fontSize: 17,
                  color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontWeight: active ? 600 : 500,
                }}
              >
                {tab.label}
              </div>
              <div
                className="font-mono mt-1 font-bold"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  color: active ? 'var(--color-tomato)' : 'var(--color-text-muted)',
                  opacity: 0.85,
                }}
              >
                {tab.sub}
              </div>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'recipe' ? (
        <div className="space-y-8">
          {recipe.content_type === 'structured' && (
            <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-8 md:gap-10">
              {/* Ingredients */}
              <section>
                <div
                  className="font-mono font-bold mb-1.5"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.25em',
                    color: 'var(--color-tomato)',
                  }}
                >
                  INGREDIENTI
                </div>
                {recipe.servings && (
                  <div className="font-display italic text-sm text-text-muted mb-4">
                    serves {recipe.servings}
                  </div>
                )}

                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <ul className="list-none m-0 p-0">
                    {recipe.ingredients.map((ing, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 py-2 leading-snug"
                        style={{ borderBottom: '1px dashed var(--color-border)' }}
                      >
                        {ing.amount || ing.unit ? (
                          <span
                            className="font-display italic font-semibold shrink-0 text-right"
                            style={{
                              color: 'var(--color-tomato)',
                              minWidth: 64,
                              fontSize: 15,
                            }}
                          >
                            {[ing.amount, ing.unit].filter(Boolean).join(' ')}
                          </span>
                        ) : (
                          <span style={{ minWidth: 64 }} />
                        )}
                        <span className="font-mono text-[14px]">{ing.item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-mono text-sm text-text-muted italic">
                    No ingredients listed.
                  </p>
                )}
              </section>

              {/* Method */}
              <section>
                <div
                  className="font-mono font-bold mb-5"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.25em',
                    color: 'var(--color-tomato)',
                  }}
                >
                  IL METODO
                </div>

                {recipe.steps && recipe.steps.length > 0 ? (
                  <ol className="list-none m-0 p-0 flex flex-col gap-5">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-4">
                        <span
                          className="font-display italic font-medium shrink-0 leading-[0.9]"
                          style={{
                            color: 'var(--color-tomato)',
                            fontSize: 36,
                            minWidth: 40,
                          }}
                        >
                          {i + 1}.
                        </span>
                        <p className="m-0 font-mono text-[14.5px] leading-[1.55] pt-1.5">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="font-mono text-sm text-text-muted italic">
                    No method written.
                  </p>
                )}
              </section>
            </div>
          )}

          {/* Freeform content */}
          {recipe.content_type === 'freeform' && recipe.freeform_text && (
            <section
              className="bg-bg-card border border-border p-5 sm:p-7 font-mono text-[14px] leading-[1.65] whitespace-pre-wrap"
              style={{ borderRadius: 2 }}
            >
              {recipe.freeform_text}
            </section>
          )}

          {/* Photo only */}
          {recipe.content_type === 'photo_only' && allImages.length === 0 && (
            <p className="font-display italic text-text-muted text-center py-8">
              No photos uploaded yet.
            </p>
          )}

          {/* Action row */}
          <div
            className="flex items-center gap-3 pt-5"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <Link to={`/recipes/${recipe.id}/edit`} className="btn-trat btn-trat-ghost">
              edit
            </Link>

            {confirmDelete ? (
              <div className="flex items-center gap-2 ml-auto">
                <span className="font-mono text-xs text-text-muted">
                  Are you sure?
                </span>
                <button
                  onClick={handleDelete}
                  className="btn-trat"
                  style={{ background: 'var(--color-oxblood)' }}
                >
                  delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="font-mono text-xs uppercase font-bold text-text-muted hover:text-text cursor-pointer bg-transparent border-none px-2"
                  style={{ letterSpacing: '0.18em' }}
                >
                  cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="ml-auto font-mono text-[11px] uppercase font-bold text-text-muted hover:text-oxblood cursor-pointer bg-transparent border-none"
                style={{ letterSpacing: '0.2em' }}
              >
                delete
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <CookLogSection recipeId={recipe.id} />
          <div style={{ borderTop: '1px solid var(--color-border)' }} className="pt-8">
            <CommentThread recipeId={recipe.id} />
          </div>
        </div>
      )}
    </article>
  )
}
