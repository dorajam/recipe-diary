import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface GroceryItem {
  id: string
  user_id: string
  label: string
  checked: boolean
  sort_order: number
  created_at: string
}

export function useGroceryItems(userId: string | undefined) {
  return useQuery({
    queryKey: ['grocery', userId],
    queryFn: async (): Promise<GroceryItem[]> => {
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('user_id', userId!)
        .order('checked', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as GroceryItem[]
    },
    enabled: !!userId,
  })
}

export function useAddGroceryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, label }: { userId: string; label: string }) => {
      const { error } = await supabase
        .from('grocery_items')
        .insert({ user_id: userId, label, sort_order: Date.now() })
      if (error) throw error
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['grocery', v.userId] }),
  })
}

export function useToggleGroceryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      checked,
    }: {
      id: string
      checked: boolean
      userId: string
    }) => {
      const { error } = await supabase
        .from('grocery_items')
        .update({ checked })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['grocery', v.userId] }),
  })
}

export function useDeleteGroceryItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; userId: string }) => {
      const { error } = await supabase.from('grocery_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['grocery', v.userId] }),
  })
}

/** Delete all checked items ("clear checked"). */
export function useClearCheckedGrocery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('user_id', userId)
        .eq('checked', true)
      if (error) throw error
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['grocery', v.userId] }),
  })
}
