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
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-fill-100 gap-8 w-full max-w-7xl justify-items-center p-8">
        {rootNodes.map(node => (
          <AppIcon key={node.id} node={node} onClick={handleItemClick} />
        ))}
      </div>

      {openFolder && (
        <FolderOverlay
          key={openFolder.id}
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
