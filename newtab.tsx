import { useState } from "react"
import { useBookmarks } from "./hooks/useBookmarks"
import { Launchpad } from "./components/Launchpad"
import "./style.css"

function NewTab() {
  const { bookmarks, loading } = useBookmarks()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredBookmarks = searchQuery
    ? filterBookmarks(bookmarks, searchQuery)
    : bookmarks

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-500">Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-screen px-8 py-16 bg-transparent relative overflow-hidden">
      {/* Background Image is handled in body or separate bg component, if not replacing body style yet, kept as is or moved to classes */}
      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-12">
        {/* Search Input */}
        <div className="w-full max-w-xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-lg hover:bg-white/15 transition-all duration-200"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Launchpad rootNodes={filteredBookmarks} />
      </div>
    </div>
  )
}

function filterBookmarks(nodes: any[], query: string): any[] {
  const lowerQuery = query.toLowerCase()
  let results: any[] = []

  const search = (items: any[]) => {
    for (const node of items) {
      const isFolder = !node.url
      const titleMatch = node.title.toLowerCase().includes(lowerQuery)
      const urlMatch = node.url && node.url.toLowerCase().includes(lowerQuery)

      if (titleMatch || urlMatch) {
        results.push(node)
      }

      if (node.children) {
        search(node.children)
      }
    }
  }

  search(nodes)

  // Deduplicate by ID
  const unique = Array.from(new Map(results.map(item => [item.id, item])).values())
  return unique
}

export default NewTab
