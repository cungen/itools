import { useState } from "react"
import { Edit, Trash2, Copy, Eye } from "lucide-react"
import type { Prompt } from "../hooks/usePrompts"

interface PromptCardProps {
  prompt: Prompt
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
  onUse: (prompt: Prompt) => void
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onUse,
}: PromptCardProps) {
  const [showActions, setShowActions] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">
          {prompt.emoji || "📝"}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1 truncate">
            {prompt.title}
          </h3>
          <p className="text-sm text-white/70 line-clamp-2 mb-2">
            {prompt.content}
          </p>
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {prompt.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {prompt.tags.length > 3 && (
                <span className="text-xs px-2 py-1 text-white/50">
                  +{prompt.tags.length - 3}
                </span>
              )}
            </div>
          )}
          {prompt.variables && prompt.variables.length > 0 && (
            <div className="text-xs text-white/50">
              {prompt.variables.length} variable
              {prompt.variables.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="absolute top-2 right-2 flex gap-1 bg-slate-800/90 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={() => onUse(prompt)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Use prompt"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Copy content"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={() => onEdit(prompt)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Edit prompt"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Delete prompt"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

