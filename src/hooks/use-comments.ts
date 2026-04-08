import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Comment, Profile } from '../lib/types'

export interface CommentWithProfile extends Comment {
  profiles: Profile
}

export function useComments(recipeId: string | undefined) {
  return useQuery({
    queryKey: ['comments', recipeId],
    queryFn: async (): Promise<CommentWithProfile[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles!comments_author_id_fkey(*)')
        .eq('recipe_id', recipeId!)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as CommentWithProfile[]
    },
    enabled: !!recipeId,
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      recipeId,
      authorId,
      body,
    }: {
      recipeId: string
      authorId: string
      body: string
    }) => {
      const { error } = await supabase
        .from('comments')
        .insert({ recipe_id: recipeId, author_id: authorId, body })

      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['comments', vars.recipeId] })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      commentId,
    }: {
      commentId: string
      recipeId: string
    }) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['comments', vars.recipeId] })
    },
  })
}
