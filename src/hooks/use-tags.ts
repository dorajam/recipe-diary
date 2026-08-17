import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tag } from '../lib/types'

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** All tags in use, for autocomplete/suggestions. */
export function useAllTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<Tag[]> => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data as Tag[]
    },
  })
}

/** All recipe→tag links, as a map of recipe_id → tag names. For search. */
export function useAllRecipeTags() {
  return useQuery({
    queryKey: ['all-recipe-tags'],
    queryFn: async (): Promise<Record<string, string[]>> => {
      const { data, error } = await supabase
        .from('recipe_tags')
        .select('recipe_id, tags(name)')
      if (error) throw error
      const map: Record<string, string[]> = {}
      for (const row of data as unknown as {
        recipe_id: string
        tags: { name: string } | null
      }[]) {
        if (!row.tags) continue
        ;(map[row.recipe_id] ??= []).push(row.tags.name)
      }
      return map
    },
  })
}

/** Tags on one recipe. */
export function useRecipeTags(recipeId: string | undefined) {
  return useQuery({
    queryKey: ['recipe-tags', recipeId],
    queryFn: async (): Promise<Tag[]> => {
      const { data, error } = await supabase
        .from('recipe_tags')
        .select('tags(*)')
        .eq('recipe_id', recipeId!)
      if (error) throw error
      // rows look like { tags: { id, name } }
      return (data as unknown as { tags: Tag }[])
        .map((r) => r.tags)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    enabled: !!recipeId,
  })
}

/** Add a tag to a recipe, creating the tag if it doesn't exist yet. */
export function useAddTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ recipeId, name }: { recipeId: string; name: string }) => {
      const clean = normalize(name)
      if (!clean) return

      // Find or create the tag.
      const { data: existing } = await supabase
        .from('tags')
        .select('id')
        .eq('name', clean)
        .maybeSingle()

      let tagId = existing?.id
      if (!tagId) {
        const { data: created, error: createErr } = await supabase
          .from('tags')
          .insert({ name: clean })
          .select('id')
          .single()
        if (createErr) throw createErr
        tagId = created.id
      }

      // Link it (ignore duplicate link errors).
      const { error: linkErr } = await supabase
        .from('recipe_tags')
        .upsert(
          { recipe_id: recipeId, tag_id: tagId },
          { onConflict: 'recipe_id,tag_id', ignoreDuplicates: true },
        )
      if (linkErr) throw linkErr
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['recipe-tags', v.recipeId] })
      qc.invalidateQueries({ queryKey: ['tags'] })
      qc.invalidateQueries({ queryKey: ['all-recipe-tags'] })
    },
  })
}

/** Remove a tag from a recipe (leaves the tag itself in place). */
export function useRemoveTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ recipeId, tagId }: { recipeId: string; tagId: string }) => {
      const { error } = await supabase
        .from('recipe_tags')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('tag_id', tagId)
      if (error) throw error
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['recipe-tags', v.recipeId] })
      qc.invalidateQueries({ queryKey: ['all-recipe-tags'] })
    },
  })
}
