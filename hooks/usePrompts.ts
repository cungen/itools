import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase"
import type { User } from "@supabase/supabase-js"

export interface Prompt {
  id: string
  user_id: string
  title: string
  content: string
  emoji: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  tags?: string[]
  variables?: PromptVariable[]
}

export interface PromptVariable {
  id: string
  prompt_id: string
  name: string
  type: "string" | "number" | "enum" | "prompt"
  config: {
    min?: number
    max?: number
    options?: string[]
  }
  order_index: number
}

export interface CreatePromptInput {
  title: string
  content: string
  emoji?: string | null
  is_public?: boolean
  tags?: string[]
  variables?: Omit<PromptVariable, "id" | "prompt_id" | "created_at">[]
}

export interface UpdatePromptInput {
  title?: string
  content?: string
  emoji?: string | null
  is_public?: boolean
  tags?: string[]
  variables?: Omit<PromptVariable, "id" | "prompt_id" | "created_at">[]
}

export const usePrompts = (user: User | null) => {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrompts = async () => {
    if (!user) {
      setPrompts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch prompts (own, shared, and public)
      const { data: promptsData, error: promptsError } = await supabase
        .from("prompts")
        .select("*")
        .order("updated_at", { ascending: false })

      if (promptsError) throw promptsError

      // Fetch tags for all prompts
      const promptIds = promptsData?.map((p) => p.id) || []
      let tagsData = []
      let variablesData = []

      if (promptIds.length > 0) {
        const { data: tags, error: tagsError } = await supabase
          .from("prompt_tags")
          .select("prompt_id, tag_path")
          .in("prompt_id", promptIds)

        if (tagsError) throw tagsError
        tagsData = tags || []

        // Fetch variables for all prompts
        const { data: variables, error: variablesError } = await supabase
          .from("prompt_variables")
          .select("*")
          .in("prompt_id", promptIds)
          .order("order_index", { ascending: true })

        if (variablesError) throw variablesError
        variablesData = variables || []
      }

      // Combine data
      const promptsWithRelations = (promptsData || []).map((prompt) => {
        const tags = tagsData
          .filter((t) => t.prompt_id === prompt.id)
          .map((t) => t.tag_path)
        const variables = variablesData.filter(
          (v) => v.prompt_id === prompt.id
        )

        return {
          ...prompt,
          tags,
          variables,
        } as Prompt
      })

      setPrompts(promptsWithRelations)
    } catch (err) {
      console.error("Error fetching prompts:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch prompts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [user])

  const createPrompt = async (input: CreatePromptInput) => {
    if (!user) {
      throw new Error("User must be authenticated")
    }

    try {
      setError(null)

      // Create prompt
      const { data: promptData, error: promptError } = await supabase
        .from("prompts")
        .insert({
          user_id: user.id,
          title: input.title,
          content: input.content,
          emoji: input.emoji || null,
          is_public: input.is_public || false,
        })
        .select()
        .single()

      if (promptError) throw promptError

      const promptId = promptData.id

      // Create tags
      if (input.tags && input.tags.length > 0) {
        const tagsToInsert = input.tags.map((tag) => ({
          prompt_id: promptId,
          tag_path: tag,
        }))

        const { error: tagsError } = await supabase
          .from("prompt_tags")
          .insert(tagsToInsert)

        if (tagsError) throw tagsError
      }

      // Create variables
      if (input.variables && input.variables.length > 0) {
        const variablesToInsert = input.variables.map((variable) => ({
          prompt_id: promptId,
          name: variable.name,
          type: variable.type,
          config: variable.config || {},
          order_index: variable.order_index || 0,
        }))

        const { error: variablesError } = await supabase
          .from("prompt_variables")
          .insert(variablesToInsert)

        if (variablesError) throw variablesError
      }

      await fetchPrompts()
      return { data: promptData, error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create prompt"
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updatePrompt = async (id: string, input: UpdatePromptInput) => {
    if (!user) {
      throw new Error("User must be authenticated")
    }

    try {
      setError(null)

      // Update prompt
      const updateData: any = {}
      if (input.title !== undefined) updateData.title = input.title
      if (input.content !== undefined) updateData.content = input.content
      if (input.emoji !== undefined) updateData.emoji = input.emoji
      if (input.is_public !== undefined) updateData.is_public = input.is_public

      const { data: promptData, error: promptError } = await supabase
        .from("prompts")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (promptError) throw promptError

      // Update tags if provided
      if (input.tags !== undefined) {
        // Delete existing tags
        await supabase.from("prompt_tags").delete().eq("prompt_id", id)

        // Insert new tags
        if (input.tags.length > 0) {
          const tagsToInsert = input.tags.map((tag) => ({
            prompt_id: id,
            tag_path: tag,
          }))

          const { error: tagsError } = await supabase
            .from("prompt_tags")
            .insert(tagsToInsert)

          if (tagsError) throw tagsError
        }
      }

      // Update variables if provided
      if (input.variables !== undefined) {
        // Delete existing variables
        await supabase.from("prompt_variables").delete().eq("prompt_id", id)

        // Insert new variables
        if (input.variables.length > 0) {
          const variablesToInsert = input.variables.map((variable) => ({
            prompt_id: id,
            name: variable.name,
            type: variable.type,
            config: variable.config || {},
            order_index: variable.order_index || 0,
          }))

          const { error: variablesError } = await supabase
            .from("prompt_variables")
            .insert(variablesToInsert)

          if (variablesError) throw variablesError
        }
      }

      await fetchPrompts()
      return { data: promptData, error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update prompt"
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const deletePrompt = async (id: string) => {
    if (!user) {
      throw new Error("User must be authenticated")
    }

    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      await fetchPrompts()
      return { error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete prompt"
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const searchPrompts = async (query: string, tagFilter?: string) => {
    if (!user) {
      return []
    }

    try {
      let promptIds: string[] | null = null

      // Apply tag filter if provided
      if (tagFilter) {
        const { data: tagData } = await supabase
          .from("prompt_tags")
          .select("prompt_id")
          .or(`tag_path.eq.${tagFilter},tag_path.like.${tagFilter}/%`)

        promptIds = tagData?.map((t) => t.prompt_id) || []
        if (promptIds.length === 0) {
          return []
        }
      }

      // Build query
      let queryBuilder = supabase.from("prompts").select("*")

      if (promptIds) {
        queryBuilder = queryBuilder.in("id", promptIds)
      }

      // Apply text search
      if (query) {
        const lowerQuery = query.toLowerCase()
        queryBuilder = queryBuilder.or(
          `title.ilike.%${lowerQuery}%,content.ilike.%${lowerQuery}%`
        )
      }

      const { data, error } = await queryBuilder.order("updated_at", {
        ascending: false,
      })

      if (error) throw error

      // Fetch tags and variables for results
      const resultPromptIds = data?.map((p) => p.id) || []
      const [tagsResult, variablesResult] = await Promise.all([
        supabase
          .from("prompt_tags")
          .select("prompt_id, tag_path")
          .in("prompt_id", resultPromptIds),
        supabase
          .from("prompt_variables")
          .select("*")
          .in("prompt_id", resultPromptIds)
          .order("order_index", { ascending: true }),
      ])

      const tagsData = tagsResult.data || []
      const variablesData = variablesResult.data || []

      const promptsWithRelations = (data || []).map((prompt) => {
        const tags = tagsData
          .filter((t) => t.prompt_id === prompt.id)
          .map((t) => t.tag_path)
        const variables = variablesData.filter((v) => v.prompt_id === prompt.id)

        return {
          ...prompt,
          tags,
          variables,
        } as Prompt
      })

      return promptsWithRelations
    } catch (err) {
      console.error("Error searching prompts:", err)
      return []
    }
  }

  return {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    searchPrompts,
    refreshPrompts: fetchPrompts,
  }
}

