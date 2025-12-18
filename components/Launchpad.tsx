import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppIcon } from "./AppIcon"
import type { BookmarkNode } from "../hooks/useBookmarks"
import { FolderOverlay } from "./FolderOverlay"
import "../style.css"

interface LaunchpadProps {
  rootNodes: BookmarkNode[]
}

export function Launchpad({ rootNodes }: LaunchpadProps) {
  const [openFolder, setOpenFolder] = useState<BookmarkNode | null>(null)

  const handleItemClick = (node: BookmarkNode) => {
    console.log("Launchpad: Item clicked", node.title, "isFolder:", !node.url);
    if (node.url) {
      window.open(node.url, "_blank")
    } else {
      console.log("Launchpad: Opening folder", node.title);
      setOpenFolder(node)
    }
  }

  return (
    <div className="launchpad-container">
      <div className="launchpad-grid">
        {rootNodes.map(node => (
          <AppIcon key={node.id} node={node} onClick={handleItemClick} />
        ))}
      </div>

      {openFolder && (
        <FolderOverlay
          folder={openFolder}
          onClose={() => {
            console.log("Launchpad: Closing folder");
            setOpenFolder(null);
          }}
        />
      )}
    </div>
  )
}
