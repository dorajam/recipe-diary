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
import { ImageUpload } from './ImageUpload'
import { IngredientEditor } from './IngredientEditor'
import { StepEditor } from './StepEditor'
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

  // Persist draft to sessionStorage
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

    setFetching(true)
    setFetchError('')

    try {
      const { data, error } = await supabase.functions.invoke('scrape-recipe', {
        body: { url: sourceUrl.trim() },
      })

      if (error) throw error

      const scraped = data as ScrapedRecipe
      if (scraped.title) setTitle(scraped.title)
      if (scraped.description) setDescription(scraped.description)
      if (scraped.ingredients?.length) setIngredients(scraped.ingredients)
      if (scraped.steps?.length) setSteps(scraped.steps)
      if (scraped.servings) setServings(scraped.servings)

      // Use the inlined image data from the Edge Function (avoids CORS)
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

      // Resize all photos and convert to base64
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
      if (scraped.title) setTitle(scraped.title)
      if (scraped.description) setDescription(scraped.description)
      if (scraped.ingredients?.length) setIngredients(scraped.ingredients)
      if (scraped.steps?.length) setSteps(scraped.steps)
      if (scraped.servings) setServings(scraped.servings)

      // Add all scanned photos as recipe images
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

  // Show the full form once we've fetched/scanned, or if editing, or if manual entry
  const showFullForm = hasFetched || isEditing || (addMode === 'url' && !sourceUrl.trim())

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl tracking-tight">
        {isEditing ? 'Edit Recipe' : 'New Recipe'}
      </h2>

      {/* Add method — URL or Photo */}
      {!isEditing && (
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2 bg-accent-soft/50 rounded-full p-1 max-w-xs">
            <button
              type="button"
              onClick={() => setAddMode('url')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all
                cursor-pointer border-none
                ${addMode === 'url'
                  ? 'bg-bg-card text-text shadow-sm'
                  : 'bg-transparent text-text-muted hover:text-text'
                }`}
            >
              From URL
            </button>
            <button
              type="button"
              onClick={() => setAddMode('photo')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all
                cursor-pointer border-none
                ${addMode === 'photo'
                  ? 'bg-bg-card text-text shadow-sm'
                  : 'bg-transparent text-text-muted hover:text-text'
                }`}
            >
              From Photo
            </button>
          </div>

          {addMode === 'url' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">
                Paste a recipe URL
              </label>
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
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg-card
                    text-base focus:outline-none focus:border-accent
                    placeholder:text-text-muted/50"
                />
                <button
                  type="button"
                  onClick={handleFetchUrl}
                  disabled={fetching || !sourceUrl.trim()}
                  className="px-5 py-3 rounded-xl bg-accent text-white font-medium
                    hover:opacity-90 transition-opacity disabled:opacity-50
                    cursor-pointer border-none shrink-0"
                >
                  {fetching ? 'Fetching...' : 'Fetch'}
                </button>
              </div>
              {fetchError && (
                <p className="text-sm text-accent">{fetchError}</p>
              )}

              {!hasFetched && !sourceUrl.trim() && (
                <p className="text-sm text-text-muted">
                  or just fill in the details below
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text">
                Snap recipe photos
              </label>
              <p className="text-sm text-text-muted">
                Take one or more photos of a recipe from a book, magazine, or handwritten note.
              </p>

              {scanning ? (
                <div className="flex items-center gap-3 py-8 justify-center text-text-muted">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Reading {scanPhotos.length > 1 ? `${scanPhotos.length} photos` : 'recipe'}...
                </div>
              ) : !hasFetched ? (
                <>
                  {/* Photo thumbnails */}
                  {scanPhotos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {scanPhotos.map((file, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/60">
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setScanPhotos((prev) => prev.filter((_, j) => j !== i))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50
                              text-white text-xs flex items-center justify-center cursor-pointer
                              border-none hover:bg-black/70"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <label
                      className="flex-1 flex flex-col items-center justify-center gap-3 py-8 px-6
                        rounded-2xl border-2 border-dashed border-border/60
                        hover:border-accent/40 bg-bg-card/50 transition-colors cursor-pointer"
                    >
                      <svg className="w-8 h-8 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                      </svg>
                      <span className="text-sm text-text-muted">
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
                  </div>

                  {scanPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleScanPhotos}
                      className="w-full px-5 py-3 rounded-xl bg-accent text-white font-medium
                        hover:opacity-90 transition-opacity cursor-pointer border-none"
                    >
                      Scan {scanPhotos.length === 1 ? 'photo' : `${scanPhotos.length} photos`}
                    </button>
                  )}
                </>
              ) : null}

              {scanError && (
                <p className="text-sm text-accent">{scanError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Full form */}
      {(showFullForm || isEditing) && (
        <>
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="What are we making?"
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card
                text-base focus:outline-none focus:border-accent
                placeholder:text-text-muted/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text">
              Notes{' '}
              <span className="text-text-muted font-normal">optional</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Any thoughts or context..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card
                text-base focus:outline-none focus:border-accent resize-y
                placeholder:text-text-muted/50"
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text">
              Categories{' '}
              <span className="text-text-muted font-normal">optional</span>
            </label>
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border
                      ${
                        selected
                          ? 'bg-sunny text-white border-sunny shadow-sm'
                          : 'bg-bg-card text-text-muted border-border/60 hover:border-sunny/30 hover:text-text'
                      }`}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Servings */}
          {(servings || ingredients.length > 0) && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text">
                Servings{' '}
                <span className="text-text-muted font-normal">optional</span>
              </label>
              <input
                type="text"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="e.g. 4-6, 1 loaf"
                className="w-48 px-3 py-2 rounded-lg border border-border bg-bg-card
                  text-sm focus:outline-none focus:border-accent
                  placeholder:text-text-muted/50"
              />
            </div>
          )}

          {/* Ingredients — shown if scraped or already present */}
          {ingredients.length > 0 && (
            <IngredientEditor
              ingredients={ingredients}
              onChange={setIngredients}
            />
          )}

          {/* Steps — shown if scraped or already present */}
          {steps.length > 0 && (
            <StepEditor steps={steps} onChange={setSteps} />
          )}

          {/* Photos */}
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

          {/* Source URL — shown when editing */}
          {isEditing && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-text">
                Source URL{' '}
                <span className="text-text-muted font-normal">optional</span>
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card
                  text-base focus:outline-none focus:border-accent
                  placeholder:text-text-muted/50"
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="px-6 py-3 rounded-xl bg-accent text-white font-medium
                hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer
                border-none"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Recipe'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-border text-text-muted
                hover:text-text transition-colors cursor-pointer bg-transparent"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </form>
  )
}
