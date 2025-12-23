import { useState } from "react"
import { PromptManager } from "./PromptManager"
import { ExtensionManager } from "./ExtensionManager"
import { TabManager } from "./TabManager"
import { useEnvironment } from "~/hooks/useEnvironment"
import { Card, CardContent } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import "../style.css"

interface Tool {
  id: string
  name: string
  emoji: string
  component: React.ComponentType<{ onClose: () => void }>
  requiresExtension?: boolean
}

const ALL_TOOLS: Tool[] = [
  {
    id: "prompt",
    name: "Prompts",
    emoji: "💬",
    component: PromptManager,
    requiresExtension: false,
  },
  {
    id: "extensions",
    name: "Extensions",
    emoji: "🔌",
    component: ExtensionManager,
    requiresExtension: true,
  },
  {
    id: "tabs",
    name: "Tabs",
    emoji: "📑",
    component: TabManager,
    requiresExtension: true,
  },
]

interface ToolsSectionProps {
  isAuthenticated: boolean
}

export function ToolsSection({ isAuthenticated }: ToolsSectionProps) {
  const [openTool, setOpenTool] = useState<string | null>(null)
  const { isExtension } = useEnvironment()

  if (!isAuthenticated) {
    return null
  }

  // Filter tools based on environment
  const availableTools = ALL_TOOLS.filter(
    (tool) => !tool.requiresExtension || isExtension
  )

  const handleToolClick = (toolId: string) => {
    setOpenTool(toolId)
  }

  const handleClose = () => {
    setOpenTool(null)
  }

  const currentTool = ALL_TOOLS.find((t) => t.id === openTool)
  const ToolComponent = currentTool?.component

  return (
    <>
      <div className="w-full mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4 text-center">
          Tools
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {availableTools.map((tool) => (
            <Card
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className="flex flex-col items-center justify-center gap-2 p-6 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <CardContent className="p-0 flex flex-col items-center gap-2">
                <span className="text-4xl">{tool.emoji}</span>
                <span className="text-sm font-medium">{tool.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!openTool} onOpenChange={(open) => !open && handleClose()}>
        {openTool && ToolComponent && (
          <DialogContent className="max-w-6xl max-h-[90vh] bg-slate-900/95 backdrop-blur-md border-white/20 flex flex-col !p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
              <DialogTitle className="flex items-center gap-3 text-white">
                <span className="text-2xl">
                  {ALL_TOOLS.find((t) => t.id === openTool)?.emoji}
                </span>
                {ALL_TOOLS.find((t) => t.id === openTool)?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <ToolComponent onClose={handleClose} />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

