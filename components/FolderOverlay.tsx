import { useState } from "react"
import { motion } from "framer-motion"
import { AppIcon } from "./AppIcon"
import type { BookmarkNode } from "../hooks/useBookmarks"
import { X } from "lucide-react"
import "../style.css"

interface FolderOverlayProps {
  folder: BookmarkNode
  onClose: () => void
}

export function FolderOverlay({ folder, onClose }: FolderOverlayProps) {
  const [currentFolder, setCurrentFolder] = useState<BookmarkNode>(folder)

  const handleItemClick = (node: BookmarkNode) => {
    console.log("FolderOverlay: Item clicked", node.title);
    if (node.url) {
      window.open(node.url, "_blank")
    } else {
      console.log("FolderOverlay: Navigating to subfolder", node.title);
      setCurrentFolder(node)
    }
  }

  return (
    <div className="folder-overlay-backdrop" onClick={onClose}>
      <div className="folder-overlay-content" onClick={(e) => e.stopPropagation()}>
        <div className="folder-header">
          <div className="folder-title-area">
            {currentFolder.id !== folder.id && (
              <button onClick={() => {
                console.log("FolderOverlay: Going back to root folder");
                setCurrentFolder(folder);
              }} className="back-btn">←</button>
            )}
            <h2>{currentFolder.title}</h2>
          </div>
          <button onClick={onClose} className="close-btn"><X /></button>
        </div>
        <div className="folder-grid">
          {currentFolder.children?.map(node => (
             <AppIcon key={node.id} node={node} onClick={handleItemClick} />
          ))}
          {(!currentFolder.children || currentFolder.children.length === 0) && (
            <div className="empty-folder">No bookmarks in this folder</div>
          )}
        </div>
      </div>
    </div>
  )
}
