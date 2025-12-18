import { useEffect, useState } from "react"

export interface BookmarkNode {
  id: string
  title: string
  url?: string
  children?: BookmarkNode[]
  parentId?: string
}

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        if (typeof chrome !== "undefined" && chrome.bookmarks) {
          const tree = await chrome.bookmarks.getTree()
          // Usually tree[0] is root. tree[0].children contains "Bookmarks Bar", "Other Bookmarks", etc.
          // We likely want to flatten the first level or show the "Bookmarks Bar" as the main view.
          // Let's grab the "Bookmarks Bar" (usually index 0 of root children)
          // Flatten: We want the contents of "Bookmarks Bar" (id "1") to be the root items.
          // The root node (id "0") usually has children: "Bookmarks Bar" (1), "Other Bookmarks" (2), "Mobile Bookmarks" (3).
          const rootChildren = tree[0].children || []
          const bookmarksBar = rootChildren.find(node => node.id === "1")
          const otherBookmarks = rootChildren.find(node => node.id === "2")

          let displayNodes = bookmarksBar ? (bookmarksBar.children || []) : []

          // Optionally append "Other Bookmarks" folder if it has children
          // if (otherBookmarks && otherBookmarks.children && otherBookmarks.children.length > 0) {
          //   displayNodes.push(otherBookmarks)
          // }

          // If Bookmarks Bar is empty, maybe fallback to showing the top level folders?
          // But user complained "bookmark items is not the same", implying they want Bar contents.
          // If both are empty/missing, just show what we have.
          if (displayNodes.length === 0 && rootChildren.length > 0) {
             // Fallback: just show root children (the folders)
             displayNodes = rootChildren
          }

          const cleanTree = processBookmarks(displayNodes)
          setBookmarks(cleanTree)
        } else {
          // Mock data for development outside of extension context
          // MOCK_BOOKMARKS represents the children of the root (i.e. [Bar, Other])
          const bookmarksBar = MOCK_BOOKMARKS.find(node => node.id === "1")
          let displayNodes = bookmarksBar ? (bookmarksBar.children || []) : []
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
  }, [])

  return { bookmarks, loading }
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
