import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type {
  Recipe,
  RecipeWithProfile,
  RecipeImage,
  ContentType,
  SourceType,
  RecipeCategory,
  Ingredient,
} from '../lib/types'

// ── Queries ──

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async (): Promise<RecipeWithProfile[]> => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, profiles!recipes_added_by_fkey(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as RecipeWithProfile[]
    },
  })
}

export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: async (): Promise<RecipeWithProfile> => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, profiles!recipes_added_by_fkey(*)')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data as RecipeWithProfile
    },
    enabled: !!id,
  })
}

export function useRecipeImages(recipeId: string | undefined) {
  return useQuery({
    queryKey: ['recipe-images', recipeId],
    queryFn: async (): Promise<RecipeImage[]> => {
      const { data, error } = await supabase
        .from('recipe_images')
        .select('*')
        .eq('recipe_id', recipeId!)
        .order('sort_order')

      if (error) throw error
      return data as RecipeImage[]
    },
    enabled: !!recipeId,
  })
}

// ── Mutations ──

export interface RecipeInput {
  title: string
  description?: string | null
  source_url?: string | null
  source_type?: SourceType
  content_type?: ContentType
  ingredients?: Ingredient[] | null
  steps?: string[] | null
  freeform_text?: string | null
  servings?: string | null
  categories?: RecipeCategory[]
}

export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recipe,
      userId,
    }: {
      recipe: RecipeInput
      userId: string
    }): Promise<Recipe> => {
      const { data, error } = await supabase
        .from('recipes')
        .insert({ ...recipe, added_by: userId })
        .select()
        .single()

      if (error) throw error
      return data as Recipe
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      recipe,
    }: {
      id: string
      recipe: RecipeInput
    }): Promise<Recipe> => {
      const { data, error } = await supabase
        .from('recipes')
        .update(recipe)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Recipe
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipes', vars.id] })
    },
  })
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recipes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

// ── Image operations ──

export function useUploadImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recipeId,
      file,
      imageType,
      uploadedBy,
    }: {
      recipeId: string
      file: Blob
      imageType: string
      uploadedBy: string
    }): Promise<RecipeImage> => {
      const fileName = `recipes/${recipeId}/${crypto.randomUUID()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, file, { contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(fileName)

      const { data, error } = await supabase
        .from('recipe_images')
        .insert({
          recipe_id: recipeId,
          image_url: urlData.publicUrl,
          image_type: imageType,
          uploaded_by: uploadedBy,
        })
        .select()
        .single()

      if (error) throw error
      return data as RecipeImage
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['recipe-images', vars.recipeId],
      })
    },
  })
}

export function useDeleteImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      imageId,
      imageUrl,
    }: {
      imageId: string
      imageUrl: string
      recipeId: string
    }) => {
      // Extract storage path from the full URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/storage/v1/object/public/recipe-images/')
      if (pathParts[1]) {
        await supabase.storage.from('recipe-images').remove([pathParts[1]])
      }

      const { error } = await supabase
        .from('recipe_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['recipe-images', vars.recipeId],
      })
    },
  })
}
