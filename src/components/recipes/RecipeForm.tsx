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
import type { ContentType, Ingredient } from '../../lib/types'
import { ImageUpload } from './ImageUpload'
import { IngredientEditor } from './IngredientEditor'
import { StepEditor } from './StepEditor'

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
  const [contentType, setContentType] = useState<ContentType>('freeform')
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { amount: '', unit: '', item: '' },
  ])
  const [steps, setSteps] = useState<string[]>([''])
  const [freeformText, setFreeformText] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [servings, setServings] = useState('')
  const [pendingImages, setPendingImages] = useState<Blob[]>([])
  const [saving, setSaving] = useState(false)

  const hasPopulated = useRef(false)

  useEffect(() => {
    if (existingRecipe && !hasPopulated.current) {
      hasPopulated.current = true
      setTitle(existingRecipe.title)
      setDescription(existingRecipe.description || '')
      setContentType(existingRecipe.content_type)
      setIngredients(
        existingRecipe.ingredients?.length
          ? existingRecipe.ingredients
          : [{ amount: '', unit: '', item: '' }],
      )
      setSteps(existingRecipe.steps?.length ? existingRecipe.steps : [''])
      setFreeformText(existingRecipe.freeform_text || '')
      setSourceUrl(existingRecipe.source_url || '')
      setServings(existingRecipe.servings || '')
    }
  }, [existingRecipe])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !title.trim()) return

    setSaving(true)

    const recipeInput: RecipeInput = {
      title: title.trim(),
      description: description.trim() || null,
      source_url: sourceUrl.trim() || null,
      source_type: sourceUrl.trim() ? 'url' : 'manual',
      content_type: contentType,
      ingredients:
        contentType === 'structured'
          ? ingredients.filter((i) => i.item.trim())
          : null,
      steps:
        contentType === 'structured'
          ? steps.filter((s) => s.trim())
          : null,
      freeform_text:
        contentType === 'freeform' ? freeformText.trim() || null : null,
      servings: servings.trim() || null,
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

      // Upload any pending images
      for (const blob of pendingImages) {
        await uploadImage.mutateAsync({
          recipeId,
          file: blob,
          imageType: 'dish_photo',
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

  const contentTypes: { value: ContentType; label: string; desc: string }[] = [
    {
      value: 'structured',
      label: 'Structured',
      desc: 'Ingredients + steps',
    },
    {
      value: 'freeform',
      label: 'Freeform',
      desc: 'Write it however you like',
    },
    {
      value: 'photo_only',
      label: 'Photo only',
      desc: 'Just a photo of the recipe',
    },
  ]

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl tracking-tight">
        {isEditing ? 'Edit Recipe' : 'New Recipe'}
      </h2>

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
          Description{' '}
          <span className="text-text-muted font-normal">optional</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="A short note or headnote..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card
            text-base focus:outline-none focus:border-accent resize-y
            placeholder:text-text-muted/50"
        />
      </div>

      {/* Content Type Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">Format</label>
        <div className="flex gap-2">
          {contentTypes.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => setContentType(ct.value)}
              className={`flex-1 px-3 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                contentType === ct.value
                  ? 'border-accent bg-accent-soft'
                  : 'border-border bg-bg-card hover:border-accent/40'
              }`}
            >
              <div className="text-sm font-medium">{ct.label}</div>
              <div className="text-xs text-text-muted mt-0.5">{ct.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Structured content */}
      {contentType === 'structured' && (
        <div className="space-y-6">
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

          <IngredientEditor
            ingredients={ingredients}
            onChange={setIngredients}
          />
          <StepEditor steps={steps} onChange={setSteps} />
        </div>
      )}

      {/* Freeform content */}
      {contentType === 'freeform' && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-text">Recipe</label>
          <textarea
            value={freeformText}
            onChange={(e) => setFreeformText(e.target.value)}
            rows={10}
            placeholder="Write the recipe in any format you like..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card
              text-base focus:outline-none focus:border-accent resize-y
              placeholder:text-text-muted/50 leading-relaxed"
          />
        </div>
      )}

      {/* Source URL */}
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

      {/* Image Upload */}
      <ImageUpload
        onImagesReady={(blobs) =>
          setPendingImages((prev) => [...prev, ...blobs])
        }
        existingImages={
          existingImages?.map((img) => ({ id: img.id, url: img.image_url })) ||
          []
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
    </form>
  )
}
