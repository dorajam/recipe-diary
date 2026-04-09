import { useEffect, useRef, useState } from 'react'
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

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [steps, setSteps] = useState<string[]>([])
  const [servings, setServings] = useState('')
  const [categories, setCategories] = useState<RecipeCategory[]>([])
  const [pendingImages, setPendingImages] = useState<Blob[]>([])
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [hasFetched, setHasFetched] = useState(false)

  const hasPopulated = useRef(false)

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

      // If the recipe has an image, fetch and resize it
      if (scraped.image_url) {
        try {
          const imgResponse = await fetch(scraped.image_url)
          const blob = await imgResponse.blob()
          const file = new File([blob], 'recipe.jpg', { type: blob.type })
          const { resizeImage } = await import('../../lib/image-resize')
          const resized = await resizeImage(file)
          setPendingImages((prev) => [...prev, resized])
        } catch {
          // Image fetch failed, that's okay
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
      source_type: sourceUrl.trim() ? 'url' : hasPhotos ? 'photo' : 'manual',
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

      navigate(`/recipes/${recipeId}`)
    } catch (err) {
      console.error('Failed to save recipe:', err)
    } finally {
      setSaving(false)
    }
  }

  // Show the full form once we've fetched from URL, or if editing, or if there's no URL
  const showFullForm = hasFetched || isEditing || !sourceUrl.trim()

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl tracking-tight">
        {isEditing ? 'Edit Recipe' : 'New Recipe'}
      </h2>

      {/* URL Input — prominent when creating */}
      {!isEditing && (
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
