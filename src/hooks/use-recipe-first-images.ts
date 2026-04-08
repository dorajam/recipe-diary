import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { RecipeImage } from '../lib/types'

/**
 * Fetch the first image for each recipe in a list.
 * Returns a map of recipe_id → RecipeImage.
 */
export function useRecipeFirstImages(recipeIds: string[] | undefined) {
  const { data } = useQuery({
    queryKey: ['recipe-first-images', recipeIds],
    queryFn: async (): Promise<Record<string, RecipeImage>> => {
      if (!recipeIds?.length) return {}

      const { data, error } = await supabase
        .from('recipe_images')
        .select('*')
        .in('recipe_id', recipeIds)
        .order('sort_order')

      if (error) throw error

      // Keep only the first image per recipe
      const map: Record<string, RecipeImage> = {}
      for (const img of data as RecipeImage[]) {
        if (!map[img.recipe_id]) {
          map[img.recipe_id] = img
        }
      }
      return map
    },
    enabled: !!recipeIds?.length,
  })

  return data || {}
}
