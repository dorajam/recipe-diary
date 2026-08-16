import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import {
  useRecipe,
  useRecipeImages,
  useCreateRecipe,
  useUpdateRecipe,
  useUploadImage,
  useDeleteImage,
  type RecipeInput,
} from '../../hooks/use-recipes'
import type { Ingredient, RecipeCategory } from '../../lib/types'
import { CATEGORIES } from '../../lib/categories'
import { decodeHtmlEntities } from '../../lib/decode-html'
import { ImageUpload } from './ImageUpload'
import { IngredientEditor } from './IngredientEditor'
import { StepEditor } from './StepEditor'
import { InstagramEmbed } from './InstagramEmbed'
import { isInstagramUrl, instagramPostId } from '../../lib/instagram'
import { supabase } from '../../lib/supabase'

interface ScrapedRecipe {
  title: string
  description: string | null
  ingredients: Ingredient[]
  steps: string[]
  servings: string | null
  image_url: string | null
  image_data?: string | null
  image_type?: string | null
}

const CATEGORY_LABEL: Record<RecipeCategory, string> = {
  breakfast: 'Breakfast',
  starter:   'Starter',
  main:      'Main',
  side:      'Side',
  soup_stew: 'Soup',
  salad:     'Salad',
  dessert:   'Dessert',
  baking:    'Baking',
  snack:     'Snack',
  drink:     'Drink',
  sauce_dip: 'Sauce',
}

// Reusable field label. `it` kept in the signature for the existing call
// sites but no longer rendered — labels are English-only now.
function FieldLabel({
  en,
  optional = false,
}: {
  en: string
  it?: string
  optional?: boolean
}) {
  return (
    <div className="flex items-baseline gap-2 mb-1.5">
      <span className="font-display italic font-medium text-text text-[15px] leading-none">
        {en}
        {optional && (
          <span className="font-mono text-[10px] text-text-muted ml-1.5 not-italic font-normal">
            optional
          </span>
        )}
      </span>
    </div>
  )
}

const inputClass =
  'w-full px-3.5 py-2.5 font-mono text-[14px] bg-bg-card text-text ' +
  'border border-border placeholder:text-text-muted/50 placeholder:italic ' +
  'focus:outline-none focus:border-tomato transition-colors'

const inputStyle = { borderRadius: 2 }

export function RecipeForm() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const { profile } = useAuth()

  const { data: existingRecipe } = useRecipe(id)
  const { data: existingImages } = useRecipeImages(id)

  const createRecipe = useCreateRecipe()
  const updateRecipe = useUpdateRecipe()
  const uploadImage = useUploadImage()
  const deleteImage = useDeleteImage()

  const DRAFT_KEY = 'recipe-draft'

  function loadDraft() {
    if (isEditing) return null
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  const draft = useRef(loadDraft())

  const [title, setTitle] = useState(draft.current?.title ?? '')
  const [description, setDescription] = useState(draft.current?.description ?? '')
  const [sourceUrl, setSourceUrl] = useState(draft.current?.sourceUrl ?? '')
  const [ingredients, setIngredients] = useState<Ingredient[]>(draft.current?.ingredients ?? [])
  const [steps, setSteps] = useState<string[]>(draft.current?.steps ?? [])
  const [servings, setServings] = useState(draft.current?.servings ?? '')
  const [categories, setCategories] = useState<RecipeCategory[]>(draft.current?.categories ?? [])
  const [pendingImages, setPendingImages] = useState<Blob[]>([])
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [hasFetched, setHasFetched] = useState(draft.current?.hasFetched ?? false)
  const [addMode, setAddMode] = useState<'url' | 'photo'>(draft.current?.addMode ?? 'url')
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanPhotos, setScanPhotos] = useState<File[]>([])

  const hasPopulated = useRef(false)

  const saveDraft = useCallback(() => {
    if (isEditing) return
    const data = { title, description, sourceUrl, ingredients, steps, servings, categories, hasFetched, addMode }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data))
  }, [title, description, sourceUrl, ingredients, steps, servings, categories, hasFetched, addMode, isEditing])

  useEffect(() => { saveDraft() }, [saveDraft])

  function clearDraft() {
    sessionStorage.removeItem(DRAFT_KEY)
  }

  useEffect(() => {
    if (existingRecipe && !hasPopulated.current) {
      hasPopulated.current = true
      setTitle(existingRecipe.title)
      setDescription(existingRecipe.description || '')
      setSourceUrl(existingRecipe.source_url || '')
      setIngredients(existingRecipe.ingredients || [])
      setSteps(existingRecipe.steps || [])
      setServings(existingRecipe.servings || '')
      setCategories(existingRecipe.categories || [])
      if (existingRecipe.source_url) setHasFetched(true)
    }
  }, [existingRecipe])

  async function handleFetchUrl() {
    if (!sourceUrl.trim()) return

    // Instagram blocks scraping — don't even try. Reveal the form with the
    // reel embedded so you can watch it and fill in the details yourself.
    if (isInstagramUrl(sourceUrl.trim())) {
      setFetchError('')
      setHasFetched(true)
      return
    }

    setFetching(true)
    setFetchError('')

    try {
      const { data, error } = await supabase.functions.invoke('scrape-recipe', {
        body: { url: sourceUrl.trim() },
      })

      if (error) throw error

      const scraped = data as ScrapedRecipe
      if (scraped.title) setTitle(decodeHtmlEntities(scraped.title))
      if (scraped.description) setDescription(decodeHtmlEntities(scraped.description))
      if (scraped.ingredients?.length) {
        setIngredients(
          scraped.ingredients.map((ing) => ({
            amount: decodeHtmlEntities(ing.amount),
            unit: decodeHtmlEntities(ing.unit),
            item: decodeHtmlEntities(ing.item),
          })),
        )
      }
      if (scraped.steps?.length) setSteps(scraped.steps.map(decodeHtmlEntities))
      if (scraped.servings) setServings(decodeHtmlEntities(scraped.servings))

      if (scraped.image_data) {
        try {
          const binary = atob(scraped.image_data)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          const blob = new Blob([bytes], { type: scraped.image_type || 'image/jpeg' })
          const file = new File([blob], 'recipe.jpg', { type: blob.type })
          const { resizeImage } = await import('../../lib/image-resize')
          const resized = await resizeImage(file)
          setPendingImages((prev) => [...prev, resized])
        } catch {
          // Image processing failed, that's okay
        }
      }

      setHasFetched(true)
    } catch (err) {
      console.error('Scrape error:', err)
      setFetchError('Could not fetch recipe from that URL. You can still add it manually.')
    } finally {
      setFetching(false)
    }
  }

  async function handleScanPhotos() {
    if (scanPhotos.length === 0) return
    setScanning(true)
    setScanError('')

    try {
      const { resizeImage } = await import('../../lib/image-resize')

      const images = await Promise.all(
        scanPhotos.map(async (file) => {
          const resized = await resizeImage(file)
          const buffer = await resized.arrayBuffer()
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
          )
          return { blob: resized, data: base64, media_type: resized.type || 'image/jpeg' }
        }),
      )

      const { data, error } = await supabase.functions.invoke('ocr-recipe', {
        body: {
          images: images.map(({ data, media_type }) => ({ data, media_type })),
        },
      })

      if (error) throw error
      if (data.error) throw new Error(data.error)

      const scraped = data as ScrapedRecipe
      if (scraped.title) setTitle(decodeHtmlEntities(scraped.title))
      if (scraped.description) setDescription(decodeHtmlEntities(scraped.description))
      if (scraped.ingredients?.length) {
        setIngredients(
          scraped.ingredients.map((ing) => ({
            amount: decodeHtmlEntities(ing.amount),
            unit: decodeHtmlEntities(ing.unit),
            item: decodeHtmlEntities(ing.item),
          })),
        )
      }
      if (scraped.steps?.length) setSteps(scraped.steps.map(decodeHtmlEntities))
      if (scraped.servings) setServings(decodeHtmlEntities(scraped.servings))

      setPendingImages((prev) => [...prev, ...images.map((i) => i.blob)])
      setHasFetched(true)
    } catch (err) {
      console.error('OCR error:', err)
      setScanError(
        err instanceof Error
          ? err.message
          : 'Could not read the recipe from those photos. You can still add it manually.',
      )
    } finally {
      setScanning(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !title.trim()) return

    setSaving(true)

    const hasPhotos = pendingImages.length > 0 || (existingImages?.length ?? 0) > 0
    const hasStructured = ingredients.length > 0 || steps.length > 0

    const recipeInput: RecipeInput = {
      title: title.trim(),
      description: description.trim() || null,
      source_url: sourceUrl.trim() || null,
      source_type: sourceUrl.trim() ? 'url' : addMode === 'photo' ? 'photo' : hasPhotos ? 'photo' : 'manual',
      content_type: hasStructured ? 'structured' : hasPhotos ? 'photo_only' : 'freeform',
      ingredients: ingredients.length > 0 ? ingredients.filter((i) => i.item.trim()) : null,
      steps: steps.length > 0 ? steps.filter((s) => s.trim()) : null,
      servings: servings.trim() || null,
      categories,
    }

    try {
      let recipeId: string

      if (isEditing && id) {
        const updated = await updateRecipe.mutateAsync({
          id,
          recipe: recipeInput,
        })
        recipeId = updated.id
      } else {
        const created = await createRecipe.mutateAsync({
          recipe: recipeInput,
          userId: profile.id,
        })
        recipeId = created.id
      }

      for (const blob of pendingImages) {
        await uploadImage.mutateAsync({
          recipeId,
          file: blob,
          imageType: sourceUrl.trim() ? 'dish_photo' : 'source_photo',
          uploadedBy: profile.id,
        })
      }

      clearDraft()
      navigate(`/recipes/${recipeId}`)
    } catch (err) {
      console.error('Failed to save recipe:', err)
    } finally {
      setSaving(false)
    }
  }

  const showFullForm = hasFetched || isEditing || (addMode === 'url' && !sourceUrl.trim())

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
      {/* Masthead-style header */}
      <header className="space-y-2">
        <div
          className="font-mono font-bold"
          style={{
            fontSize: 10,
            letterSpacing: '0.32em',
            color: 'var(--color-tomato)',
          }}
        >
          {isEditing ? 'EDITING' : 'NEW RECIPE'}
        </div>
        <h2
          className="m-0 font-display italic font-medium leading-[0.95] tracking-tight"
          style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)' }}
        >
          {isEditing ? (
            <>
              The <span style={{ color: 'var(--color-tomato)' }}>composition</span>.
            </>
          ) : (
            <>
              Add a <span style={{ color: 'var(--color-tomato)' }}>recipe</span>.
            </>
          )}
        </h2>
      </header>

      {/* Add method intake (only for new recipes, before fetching) */}
      {!isEditing && (
        <section
          className="border border-border bg-bg-card p-5 sm:p-6 space-y-4"
          style={{ borderRadius: 2 }}
        >
          <FieldLabel en="How are we adding this?" it="Come" />

          {/* Mode toggle as tabs */}
          <div className="flex" style={{ borderBottom: '1.5px solid var(--color-border)' }}>
            {([
              { v: 'url',   label: 'From a link',  sub: 'URL' },
              { v: 'photo', label: 'From a photo', sub: 'PHOTO' },
            ] as const).map((m) => {
              const active = addMode === m.v
              return (
                <button
                  key={m.v}
                  type="button"
                  onClick={() => setAddMode(m.v)}
                  className="text-left py-2 px-4 cursor-pointer transition-colors hover:bg-bg-warm/40 bg-transparent"
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
                      fontSize: 16,
                      color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {m.label}
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
                    {m.sub}
                  </div>
                </button>
              )
            })}
          </div>

          {addMode === 'url' ? (
            <div className="space-y-2 pt-2">
              <FieldLabel en="Recipe URL" it="il link" />
              <div className="flex gap-2">
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => {
                    setSourceUrl(e.target.value)
                    setHasFetched(false)
                    setFetchError('')
                  }}
                  placeholder="https://..."
                  className={`flex-1 ${inputClass}`}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={handleFetchUrl}
                  disabled={fetching || !sourceUrl.trim()}
                  className="btn-trat shrink-0 disabled:opacity-50"
                >
                  {fetching
                    ? 'fetching...'
                    : isInstagramUrl(sourceUrl)
                      ? 'preview'
                      : 'fetch'}
                </button>
              </div>
              {fetchError && (
                <p className="font-mono text-xs text-tomato m-0">{fetchError}</p>
              )}

              {isInstagramUrl(sourceUrl) && (
                <p className="font-mono text-[12px] text-text-muted m-0 leading-[1.5]">
                  Instagram can’t be auto-read — we’ll embed the reel so you can
                  watch it, then just add a title and tags below.
                </p>
              )}

              {/* Live Instagram preview */}
              {isInstagramUrl(sourceUrl) && instagramPostId(sourceUrl) && (
                <div className="pt-2">
                  <InstagramEmbed postId={instagramPostId(sourceUrl)!} />
                </div>
              )}

              {!hasFetched && !sourceUrl.trim() && (
                <p className="font-display italic text-sm text-text-muted m-0">
                  ...or just fill in the details below.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <FieldLabel en="Snap recipe photos" it="le foto" />
              <p className="font-mono text-[12px] text-text-muted m-0 leading-[1.5]">
                Take one or more photos of a recipe from a book, magazine, or
                handwritten note.
              </p>

              {scanning ? (
                <div className="flex items-center gap-3 py-8 justify-center font-mono text-sm text-text-muted">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  reading {scanPhotos.length > 1 ? `${scanPhotos.length} photos` : 'recipe'}...
                </div>
              ) : !hasFetched ? (
                <>
                  {scanPhotos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {scanPhotos.map((file, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-20 overflow-hidden border border-border"
                          style={{ borderRadius: 2 }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setScanPhotos((prev) => prev.filter((_, j) => j !== i))
                            }
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-text/60
                              text-cream text-xs flex items-center justify-center cursor-pointer
                              border-none hover:bg-text"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label
                    className="flex flex-col items-center justify-center gap-2 py-8 px-6 cursor-pointer
                      border-[2px] border-dashed border-border hover:border-tomato bg-bg-warm/30 transition-colors"
                    style={{ borderRadius: 2 }}
                  >
                    <svg className="w-8 h-8 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                    </svg>
                    <span className="font-display italic text-sm text-text-muted">
                      {scanPhotos.length === 0 ? 'Tap to add a photo' : 'Add another page'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setScanPhotos((prev) => [...prev, file])
                          setScanError('')
                        }
                        e.target.value = ''
                      }}
                    />
                  </label>

                  {scanPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleScanPhotos}
                      className="btn-trat w-full justify-center"
                    >
                      scan {scanPhotos.length === 1 ? 'photo' : `${scanPhotos.length} photos`}
                    </button>
                  )}
                </>
              ) : null}

              {scanError && (
                <p className="font-mono text-xs text-tomato m-0">{scanError}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Full form — two-column editorial */}
      {(showFullForm || isEditing) && (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,360px)_1fr] gap-7 md:gap-10">
          {/* Left column: photos, categories, servings, source */}
          <aside className="space-y-6">
            <div>
              <FieldLabel en="Photos" it="le foto" />
              <ImageUpload
                onImagesReady={(blobs) =>
                  setPendingImages((prev) => [...prev, ...blobs])
                }
                existingImages={
                  existingImages?.map((img) => ({
                    id: img.id,
                    url: img.image_url,
                  })) || []
                }
                onDeleteExisting={(imageId) => {
                  const img = existingImages?.find((i) => i.id === imageId)
                  if (img && id) {
                    deleteImage.mutate({
                      imageId: img.id,
                      imageUrl: img.image_url,
                      recipeId: id,
                    })
                  }
                }}
              />
            </div>

            <div>
              <FieldLabel en="Categories" it="categorie" optional />
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const selected = categories.includes(c.value)
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setCategories((prev) =>
                          selected
                            ? prev.filter((v) => v !== c.value)
                            : [...prev, c.value],
                        )
                      }
                      className="px-2.5 py-1 cursor-pointer transition-colors flex items-baseline gap-1.5 border-[1.5px]"
                      style={{
                        borderRadius: 2,
                        background: selected ? 'var(--color-basil)' : 'transparent',
                        borderColor: selected ? 'var(--color-basil)' : 'var(--color-border)',
                        color: selected ? 'var(--color-cream)' : 'var(--color-text)',
                      }}
                    >
                      <span
                        className="font-display italic leading-none"
                        style={{ fontSize: 13 }}
                      >
                        {CATEGORY_LABEL[c.value]}
                      </span>
                      <span
                        className="font-mono font-bold uppercase"
                        style={{
                          fontSize: 8.5,
                          letterSpacing: '0.16em',
                          opacity: selected ? 0.9 : 0.6,
                        }}
                      >
                        {c.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {(servings || ingredients.length > 0 || isEditing) && (
              <div>
                <FieldLabel en="Servings" it="porzioni" optional />
                <input
                  type="text"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="e.g. 4-6, 1 loaf"
                  className={`w-48 ${inputClass}`}
                  style={inputStyle}
                />
              </div>
            )}

            {isEditing && (
              <div>
                <FieldLabel en="Source URL" it="origine" optional />
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            )}
          </aside>

          {/* Right column: title + description + ingredients + steps */}
          <main className="space-y-6">
            <div>
              <FieldLabel en="Title" it="il nome" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="What are we making?"
                className="w-full px-4 py-3 bg-bg-card text-text border border-border placeholder:text-text-muted/50 placeholder:italic focus:outline-none focus:border-tomato transition-colors font-display italic font-medium"
                style={{ borderRadius: 2, fontSize: 22 }}
              />
            </div>

            <div>
              <FieldLabel en="Notes" it="note" optional />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Any thoughts or context..."
                className={`${inputClass} resize-y`}
                style={inputStyle}
              />
            </div>

            {ingredients.length > 0 && (
              <div>
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="m-0 font-display italic text-2xl">Ingredients</h3>
                  <span
                    className="font-mono font-bold"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.25em',
                      color: 'var(--color-basil)',
                    }}
                  >
                    INGREDIENTI
                  </span>
                </div>
                <IngredientEditor
                  ingredients={ingredients}
                  onChange={setIngredients}
                />
              </div>
            )}

            {steps.length > 0 && (
              <div>
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="m-0 font-display italic text-2xl">Method</h3>
                  <span
                    className="font-mono font-bold"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.25em',
                      color: 'var(--color-basil)',
                    }}
                  >
                    PROCEDIMENTO
                  </span>
                </div>
                <StepEditor steps={steps} onChange={setSteps} />
              </div>
            )}
          </main>
        </div>
      )}

      {/* Footer action bar */}
      {(showFullForm || isEditing) && (
        <footer
          className="flex justify-between items-center gap-3 pt-5"
          style={{ borderTop: '2px solid var(--color-border)' }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="font-mono text-[11px] uppercase font-bold text-text-muted hover:text-text cursor-pointer bg-transparent border-none"
            style={{ letterSpacing: '0.2em' }}
          >
            ← cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="btn-trat disabled:opacity-50"
          >
            {saving ? 'saving…' : isEditing ? 'save changes' : 'save recipe'}
          </button>
        </footer>
      )}
    </form>
  )
}
