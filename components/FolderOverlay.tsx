import { useState } from "react"
import { AppIcon } from "./AppIcon"
import type { BookmarkNode } from "../hooks/useBookmarks"
import { X, LayoutGrid, List, Image } from "lucide-react"
import "../style.css"

interface FolderOverlayProps {
  folder: BookmarkNode
  onClose: () => void
}

type ViewMode = 'grid' | 'list' | 'gallery'

export function FolderOverlay({ folder, onClose }: FolderOverlayProps) {
  const [currentFolder, setCurrentFolder] = useState<BookmarkNode>(folder)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const handleItemClick = (node: BookmarkNode) => {
    if (node.url) {
      window.open(node.url, "_blank")
    } else {
      setCurrentFolder(node)
    }
  }

  const gridClasses = {
    grid: "grid grid-cols-fill-100 gap-10 justify-items-center",
    list: "flex flex-col gap-2 max-w-2xl mx-auto w-full",
    gallery: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-xl z-[9999] flex items-center justify-center cursor-default" onClick={onClose}>
      <div
        className="bg-[#1c1c1e]/70 backdrop-blur-[40px] backdrop-saturate-[180%] p-10 rounded-[40px] w-[90%] max-w-6xl max-h-[85vh] border border-white/15 shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            {currentFolder.id !== folder.id && (
              <button onClick={() => setCurrentFolder(folder)} className="bg-white/10 hover:bg-white/20 border-none cursor-pointer w-10 h-10 flex items-center justify-center rounded-full text-white transition-colors">←</button>
            )}
            <h2 className="m-0 text-3xl text-white font-bold tracking-tight">{currentFolder.title}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/20 text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/20 text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                title="List View"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('gallery')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'gallery' ? 'bg-white/20 text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                title="Gallery View"
              >
                <Image size={20} />
              </button>
            </div>

            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 border-none cursor-pointer p-2.5 rounded-full text-white transition-colors"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 -mx-4">
          <div className={gridClasses[viewMode]}>
            {currentFolder.children?.map(node => (
               <div
                 key={node.id}
                 className={viewMode === 'list' || viewMode === 'gallery' ? 'w-full' : ''}
               >
                 <AppIcon node={node} onClick={handleItemClick} variant={viewMode} />
               </div>
            ))}
          </div>

          {(!currentFolder.children || currentFolder.children.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
              <div className="text-white/20 text-6xl">📭</div>
              <div className="text-white/40 text-lg font-medium">No bookmarks in this folder</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

