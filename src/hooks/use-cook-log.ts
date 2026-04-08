import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CookLog, Profile } from '../lib/types'

export interface CookLogWithProfile extends CookLog {
  profiles: Profile
}

export function useCookLog(recipeId: string | undefined) {
  return useQuery({
    queryKey: ['cook-log', recipeId],
    queryFn: async (): Promise<CookLogWithProfile[]> => {
      const { data, error } = await supabase
        .from('cook_log')
        .select('*, profiles!cook_log_cooked_by_fkey(*)')
        .eq('recipe_id', recipeId!)
        .order('cooked_on', { ascending: false })

      if (error) throw error
      return data as CookLogWithProfile[]
    },
    enabled: !!recipeId,
  })
}

export function useAddCookLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recipeId,
      cookedBy,
      cookedOn,
      note,
    }: {
      recipeId: string
      cookedBy: string
      cookedOn: string
      note?: string
    }) => {
      const { error } = await supabase.from('cook_log').insert({
        recipe_id: recipeId,
        cooked_by: cookedBy,
        cooked_on: cookedOn,
        note: note || null,
      })

      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['cook-log', vars.recipeId] })
    },
  })
}

export function useDeleteCookLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      logId,
    }: {
      logId: string
      recipeId: string
    }) => {
      const { error } = await supabase
        .from('cook_log')
        .delete()
        .eq('id', logId)

      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['cook-log', vars.recipeId] })
    },
  })
}
