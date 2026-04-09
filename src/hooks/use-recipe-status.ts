import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { RecipeStatus, UserRecipeStatus } from '../lib/types'

/** Fetch all statuses for the current user, keyed by recipe_id */
export function useAllRecipeStatuses(userId: string | undefined) {
  return useQuery({
    queryKey: ['recipe-statuses', userId],
    queryFn: async (): Promise<Record<string, RecipeStatus>> => {
      const { data, error } = await supabase
        .from('user_recipe_status')
        .select('recipe_id, status')
        .eq('user_id', userId!)

      if (error) throw error
      const map: Record<string, RecipeStatus> = {}
      for (const row of data as UserRecipeStatus[]) {
        if (row.status) map[row.recipe_id] = row.status
      }
      return map
    },
    enabled: !!userId,
  })
}

export function useRecipeStatus(recipeId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['recipe-status', recipeId, userId],
    queryFn: async (): Promise<RecipeStatus | null> => {
      const { data, error } = await supabase
        .from('user_recipe_status')
        .select('status')
        .eq('recipe_id', recipeId!)
        .eq('user_id', userId!)
        .maybeSingle()

      if (error) throw error
      return data?.status ?? null
    },
    enabled: !!recipeId && !!userId,
  })
}

export function useSetRecipeStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recipeId,
      userId,
      status,
    }: {
      recipeId: string
      userId: string
      status: RecipeStatus | null
    }) => {
      if (status === null) {
        await supabase
          .from('user_recipe_status')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', userId)
      } else {
        const { error } = await supabase
          .from('user_recipe_status')
          .upsert(
            { recipe_id: recipeId, user_id: userId, status },
            { onConflict: 'recipe_id,user_id' },
          )

        if (error) throw error
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['recipe-status', vars.recipeId, vars.userId],
      })
    },
  })
}
