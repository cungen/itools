import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase"
import type { BookmarkNode } from "./useBookmarks"

interface BookmarkRecord {
  id: string
  user_id: string
  bookmark_tree: BookmarkNode[]
  created_at: string
  updated_at: string
}

export const useBookmarksSupabase = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBookmarks = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setBookmarks([])
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from("bookmarks")
        .select("bookmark_tree")
        .eq("user_id", user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          // No bookmarks found (not an error)
          setBookmarks([])
        } else {
          throw fetchError
        }
      } else if (data) {
        setBookmarks(data.bookmark_tree || [])
      } else {
        setBookmarks([])
      }
    } catch (err) {
      console.error("Failed to load bookmarks from Supabase:", err)
      setError(
        err instanceof Error ? err.message : "Failed to load bookmarks"
      )
      setBookmarks([])
    } finally {
      setLoading(false)
    }
  }

  const saveBookmarks = async (bookmarkTree: BookmarkNode[]) => {
    try {
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User must be authenticated to save bookmarks")
      }

      const { error: upsertError } = await supabase
        .from("bookmarks")
        .upsert(
          {
            user_id: user.id,
            bookmark_tree: bookmarkTree,
          },
          {
            onConflict: "user_id",
          }
        )

      if (upsertError) {
        throw upsertError
      }

      setBookmarks(bookmarkTree)
      return { error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save bookmarks"
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const updateBookmarks = async (bookmarkTree: BookmarkNode[]) => {
    return saveBookmarks(bookmarkTree)
  }

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks()
  }, [])

  return {
    bookmarks,
    loading,
    error,
    loadBookmarks,
    saveBookmarks,
    updateBookmarks,
  }
}

