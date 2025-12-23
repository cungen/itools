import { useState } from "react"
import { useBookmarks } from "./hooks/useBookmarks"
import { useAuth } from "./hooks/useAuth"
import { useEnvironment } from "./hooks/useEnvironment"
import { Launchpad } from "./components/Launchpad"
import { AuthForm } from "./components/AuthForm"
import { ToolsSection } from "./components/ToolsSection"
import { BookmarkUpload } from "./components/BookmarkUpload"
import { LogIn, LogOut, User, Search } from "lucide-react"
import { Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { Dialog, DialogContent } from "./components/ui/dialog"
import "./style.css"

function NewTab() {
  const { bookmarks, loading, updateBookmarksFromUpload } = useBookmarks()
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth()
  const { isWeb } = useEnvironment()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAuthForm, setShowAuthForm] = useState(false)

  const filteredBookmarks = searchQuery
    ? filterBookmarks(bookmarks, searchQuery)
    : bookmarks

  if (loading || authLoading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-500">Loading...</div>
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleBookmarkUploadSuccess = async (uploadedBookmarks: any[]) => {
    const result = await updateBookmarksFromUpload(uploadedBookmarks)
    if (result.error) {
      console.error("Failed to save bookmarks:", result.error)
    }
  }

  const handleBookmarkUploadError = (error: string) => {
    console.error("Bookmark upload error:", error)
  }

  // Show upload UI in web mode when authenticated but no bookmarks
  const showUploadUI = isWeb && isAuthenticated && !loading && bookmarks.length === 0

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-screen px-8 py-16 bg-transparent relative overflow-hidden">
      {/* Background Image is handled in body or separate bg component, if not replacing body style yet, kept as is or moved to classes */}
      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-12">
        {/* Auth Status Indicator */}
        <div className="absolute top-4 right-4 z-20">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white">
                <User size={16} />
                <span className="text-sm">{user?.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/15"
                title="Sign out"
              >
                <LogOut size={16} />
                <span className="text-sm">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowAuthForm(true)}
              variant="ghost"
              size="sm"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/15"
            >
              <LogIn size={16} />
              <span className="text-sm">Sign In</span>
            </Button>
          )}
        </div>

        {/* Auth Form Modal */}
        <Dialog open={showAuthForm && !isAuthenticated} onOpenChange={setShowAuthForm}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-md border-white/20 !p-0">
            <div className="p-6 flex items-center justify-center">
              <AuthForm onClose={() => setShowAuthForm(false)} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Tools Section */}
        {isAuthenticated && <ToolsSection isAuthenticated={isAuthenticated} />}

        {/* Bookmark Upload UI (web mode, authenticated, no bookmarks) */}
        {showUploadUI && (
          <div className="w-full max-w-2xl">
            <BookmarkUpload
              onUploadSuccess={handleBookmarkUploadSuccess}
              onUploadError={handleBookmarkUploadError}
            />
          </div>
        )}

        {/* Search Input */}
        {!showUploadUI && (
          <div className="w-full max-w-xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              className="pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-blue-500/50 hover:bg-white/15 rounded-2xl"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Bookmarks Launchpad */}
        {!showUploadUI && <Launchpad rootNodes={filteredBookmarks} />}

        {/* Web mode authentication prompt for bookmarks */}
        {isWeb && !isAuthenticated && (
          <div className="w-full max-w-2xl text-center">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white p-6">
              <CardContent className="p-0">
                <p className="text-lg mb-4">
                  Sign in to upload and access your bookmarks
                </p>
                <Button
                  onClick={() => setShowAuthForm(true)}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
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
