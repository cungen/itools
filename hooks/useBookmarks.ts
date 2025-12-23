import { useEffect, useState } from "react"
import { useEnvironment } from "./useEnvironment"
import { useBookmarksSupabase } from "./useBookmarksSupabase"
import { useAuth } from "./useAuth"

export interface BookmarkNode {
  id: string
  title: string
  url?: string
  children?: BookmarkNode[]
  parentId?: string
}

export const useBookmarks = () => {
  const { isExtension, isWeb } = useEnvironment()
  const { isAuthenticated } = useAuth()
  const {
    bookmarks: supabaseBookmarks,
    loading: supabaseLoading,
    saveBookmarks: saveToSupabase,
  } = useBookmarksSupabase()

  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([])
  const [loading, setLoading] = useState(true)

  // Load bookmarks based on environment
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        if (isExtension) {
          // Extension mode: use Chrome Bookmarks API
          if (typeof chrome !== "undefined" && chrome.bookmarks) {
            const tree = await chrome.bookmarks.getTree()
            // Usually tree[0] is root. tree[0].children contains "Bookmarks Bar", "Other Bookmarks", etc.
            // We likely want to flatten the first level or show the "Bookmarks Bar" as the main view.
            // Let's grab the "Bookmarks Bar" (usually index 0 of root children)
            // Flatten: We want the contents of "Bookmarks Bar" (id "1") to be the root items.
            // The root node (id "0") usually has children: "Bookmarks Bar" (1), "Other Bookmarks" (2), "Mobile Bookmarks" (3).
            const rootChildren = tree[0].children || []
            const bookmarksBar = rootChildren.find((node) => node.id === "1")
            const otherBookmarks = rootChildren.find((node) => node.id === "2")

            let displayNodes = bookmarksBar ? bookmarksBar.children || [] : []

            // If Bookmarks Bar is empty, maybe fallback to showing the top level folders?
            // But user complained "bookmark items is not the same", implying they want Bar contents.
            // If both are empty/missing, just show what we have.
            if (displayNodes.length === 0 && rootChildren.length > 0) {
              // Fallback: just show root children (the folders)
              displayNodes = rootChildren
            }

            const cleanTree = processBookmarks(displayNodes)
            setBookmarks(cleanTree)
          }
        } else if (isWeb) {
          // Web mode: use Supabase (requires authentication)
          if (isAuthenticated) {
            setBookmarks(supabaseBookmarks)
            setLoading(supabaseLoading)
            return
          } else {
            // Not authenticated in web mode - no bookmarks
            setBookmarks([])
          }
        } else {
          // Fallback: mock data for development
          const bookmarksBar = MOCK_BOOKMARKS.find((node) => node.id === "1")
          let displayNodes = bookmarksBar ? bookmarksBar.children || [] : []
          if (displayNodes.length === 0) displayNodes = MOCK_BOOKMARKS
          setBookmarks(displayNodes)
        }
      } catch (e) {
        console.error("Failed to fetch bookmarks", e)
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarks()
  }, [isExtension, isWeb, isAuthenticated, supabaseBookmarks, supabaseLoading])

  // Function to update bookmarks from file upload (web mode only)
  const updateBookmarksFromUpload = async (bookmarkTree: BookmarkNode[]) => {
    if (isWeb && isAuthenticated) {
      const result = await saveToSupabase(bookmarkTree)
      if (!result.error) {
        setBookmarks(bookmarkTree)
      }
      return result
    }
    return { error: "Bookmark upload only available in web mode when authenticated" }
  }

  return {
    bookmarks,
    loading: isWeb && isAuthenticated ? supabaseLoading : loading,
    updateBookmarksFromUpload,
  }
}

const processBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]): BookmarkNode[] => {
  return nodes.map(node => ({
    id: node.id,
    title: node.title,
    url: node.url,
    parentId: node.parentId,
    children: node.children ? processBookmarks(node.children) : undefined
  }))
}

const MOCK_BOOKMARKS: BookmarkNode[] = [
  {
    id: "1",
    title: "Bookmarks Bar",
    children: [
      { id: "10", title: "Google", url: "https://google.com" },
      { id: "11", title: "GitHub", url: "https://github.com" },
      {
        id: "12",
        title: "Work Tools",
        children: [
          { id: "121", title: "Jira", url: "https://jira.com" },
          { id: "122", title: "Slack", url: "https://slack.com" }
        ]
      }
    ]
  },
  {
    id: "2",
    title: "Other Bookmarks",
    children: [
      { id: "21", title: "Recipe", url: "https://recipe.com" }
    ]
  }
]
