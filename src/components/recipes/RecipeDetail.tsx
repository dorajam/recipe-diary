import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  useRecipe,
  useRecipeImages,
  useDeleteRecipe,
} from '../../hooks/use-recipes'
import { useState } from 'react'
import { categoryLabel } from '../../lib/categories'
import { RecipeStatusToggle } from './RecipeStatusToggle'
import { CookLogSection } from './CookLogSection'
import { CommentThread } from './CommentThread'

export function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: recipe, isLoading } = useRecipe(id)
  const { data: images } = useRecipeImages(id)
  const deleteRecipe = useDeleteRecipe()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeTab, setActiveTab] = useState<'recipe' | 'notes'>('recipe')

  if (isLoading) {
    return (
      <div className="text-center py-20 text-text-muted">Loading...</div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-text-muted text-lg">Recipe not found.</p>
        <Link to="/" className="text-accent hover:underline cursor-pointer">
          Back to recipes
        </Link>
      </div>
    )
  }

  const author = recipe.profiles
  const heroImage = images?.[0]
  const galleryImages = images?.slice(1) || []

  async function handleDelete() {
    if (!id) return
    await deleteRecipe.mutateAsync(id)
    navigate('/')
  }

  return (
    <article className="max-w-2xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        to="/"
        className="text-sm text-text-muted hover:text-text transition-colors no-underline"
      >
        &larr; All recipes
      </Link>

      {/* Hero image */}
      {heroImage && (
        <div className="rounded-2xl overflow-hidden shadow-lg -rotate-[0.5deg]">
          <img
            src={heroImage.image_url}
            alt=""
            className="w-full max-h-[500px] object-cover"
          />
          {heroImage.caption && (
            <p className="text-sm text-text-muted italic px-4 py-2 bg-bg-card">
              {heroImage.caption}
            </p>
          )}
        </div>
      )}

      {/* Title + attribution + status */}
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl tracking-tight leading-[1.1] m-0">
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="text-lg text-text-muted leading-relaxed">
            {recipe.description}
          </p>
        )}

        {recipe.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.categories.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-full text-xs font-medium
                  bg-sunny-soft text-text-muted border border-sunny/20"
              >
                {categoryLabel(cat)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt=""
                  className="w-6 h-6 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: author.accent_colour }}
                >
                  {author.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className="font-medium"
                style={{ color: author.accent_colour }}
              >
                {author.display_name}
              </span>
            </div>
            <span className="text-text-muted/50">&middot;</span>
            <span className="text-text-muted">
              {new Date(recipe.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <RecipeStatusToggle recipeId={recipe.id} />
        </div>
      </header>

      {/* Source URL */}
      {recipe.source_url && (
        <a
          href={recipe.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          View original source &rarr;
        </a>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-accent-soft/50 rounded-full p-1">
        <button
          onClick={() => setActiveTab('recipe')}
          className={`flex-1 px-5 py-2.5 text-sm font-medium rounded-full transition-all
            cursor-pointer border-none
            ${activeTab === 'recipe'
              ? 'bg-bg-card text-text shadow-sm'
              : 'bg-transparent text-text-muted hover:text-text'
            }`}
        >
          Recipe
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 px-5 py-2.5 text-sm font-medium rounded-full transition-all
            cursor-pointer border-none
            ${activeTab === 'notes'
              ? 'bg-bg-card text-text shadow-sm'
              : 'bg-transparent text-text-muted hover:text-text'
            }`}
        >
          Notes & Log
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'recipe' ? (
        <div className="space-y-8">
          {/* Recipe content */}
          <div className="space-y-6">
            {/* Structured content */}
            {recipe.content_type === 'structured' && (
              <>
                {recipe.servings && (
                  <p className="text-sm text-text-muted">
                    Serves {recipe.servings}
                  </p>
                )}

                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <section className="space-y-4">
                    <div className="divider-flourish">
                      <h2 className="text-sm uppercase tracking-widest text-accent m-0 shrink-0 font-sans font-semibold">
                        Ingredients
                      </h2>
                    </div>
                    <ul className="space-y-1.5 list-none p-0 m-0">
                      {recipe.ingredients.map((ing, i) => (
                        <li
                          key={i}
                          className="flex items-baseline gap-3 py-1.5 border-b border-border/40 last:border-0"
                        >
                          {(ing.amount || ing.unit) && (
                            <span className="text-pop font-display font-semibold text-sm shrink-0 min-w-[4rem] text-right">
                              {[ing.amount, ing.unit].filter(Boolean).join(' ')}
                            </span>
                          )}
                          <span>{ing.item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {recipe.steps && recipe.steps.length > 0 && (
                  <section className="space-y-4">
                    <div className="divider-flourish">
                      <h2 className="text-sm uppercase tracking-widest text-accent m-0 shrink-0 font-sans font-semibold">
                        Method
                      </h2>
                    </div>
                    <ol className="space-y-5 list-none p-0 m-0">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="text-accent font-display text-2xl font-bold shrink-0 w-8 leading-snug">
                            {i + 1}
                          </span>
                          <p className="m-0 leading-relaxed pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}
              </>
            )}

            {/* Freeform content */}
            {recipe.content_type === 'freeform' && recipe.freeform_text && (
              <section>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {recipe.freeform_text}
                </div>
              </section>
            )}

            {/* Photo only — the images themselves are the content */}
            {recipe.content_type === 'photo_only' && !heroImage && (
              <p className="text-text-muted italic">
                No photos uploaded yet.
              </p>
            )}
          </div>

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl m-0">More photos</h2>
              <div className="grid grid-cols-2 gap-4">
                {galleryImages.map((img, i) => (
                  <div
                    key={img.id}
                    className="rounded-xl overflow-hidden shadow-sm border border-border"
                    style={{
                      transform: `rotate(${i % 2 === 0 ? '0.5' : '-0.7'}deg)`,
                    }}
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption || ''}
                      className="w-full object-cover"
                    />
                    {img.caption && (
                      <p className="text-xs text-text-muted italic px-3 py-2">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Link
              to={`/recipes/${recipe.id}/edit`}
              className="px-4 py-2 rounded-lg border border-border text-sm text-text
                hover:bg-bg-card transition-colors no-underline"
            >
              Edit
            </Link>

            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Are you sure?</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm
                    cursor-pointer border-none hover:opacity-90"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm
                    cursor-pointer bg-transparent hover:bg-bg-card"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-lg text-sm text-text-muted
                  hover:text-accent transition-colors cursor-pointer
                  bg-transparent border-none"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <CookLogSection recipeId={recipe.id} />
          <div className="border-t border-border pt-8">
            <CommentThread recipeId={recipe.id} />
          </div>
        </div>
      )}
    </article>
  )
}
