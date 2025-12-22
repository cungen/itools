import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { PromptManager } from "./PromptManager"
import "../style.css"

interface Tool {
  id: string
  name: string
  emoji: string
  component: React.ComponentType<{ onClose: () => void }>
}

const TOOLS: Tool[] = [
  {
    id: "prompt",
    name: "Prompts",
    emoji: "💬",
    component: PromptManager,
  },
]

interface ToolsSectionProps {
  isAuthenticated: boolean
}

export function ToolsSection({ isAuthenticated }: ToolsSectionProps) {
  const [openTool, setOpenTool] = useState<string | null>(null)

  if (!isAuthenticated) {
    return null
  }

  const handleToolClick = (toolId: string) => {
    setOpenTool(toolId)
  }

  const handleClose = () => {
    setOpenTool(null)
  }

  const currentTool = TOOLS.find((t) => t.id === openTool)
  const ToolComponent = currentTool?.component

  return (
    <>
      <div className="w-full mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">
          Tools
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className="flex flex-col items-center justify-center gap-2 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/15 transition-all duration-200 hover:scale-105"
            >
              <span className="text-4xl">{tool.emoji}</span>
              <span className="text-sm font-medium">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openTool && ToolComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full max-w-6xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {TOOLS.find((t) => t.id === openTool)?.emoji}
                  </span>
                  <h3 className="text-xl font-semibold text-white">
                    {TOOLS.find((t) => t.id === openTool)?.name}
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ToolComponent onClose={handleClose} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

