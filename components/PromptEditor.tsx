import { useState, useEffect } from "react"
import { Save, X, Plus, Trash2 } from "lucide-react"
import type {
  Prompt,
  PromptVariable,
  CreatePromptInput,
  UpdatePromptInput,
} from "../hooks/usePrompts"
import {
  parseVariablesFromContent,
  validateVariables,
} from "../hooks/usePromptVariables"

interface PromptEditorProps {
  prompt?: Prompt | null
  onSave: (input: CreatePromptInput | UpdatePromptInput) => Promise<void>
  onCancel: () => void
}

const COMMON_EMOJIS = [
  "💬",
  "📝",
  "✨",
  "🚀",
  "💡",
  "🎯",
  "📚",
  "🔧",
  "⚡",
  "🎨",
  "📊",
  "🔍",
  "💻",
  "📱",
  "🌐",
  "🎓",
  "💼",
  "🎪",
  "🔥",
  "⭐",
]

export function PromptEditor({
  prompt,
  onSave,
  onCancel,
}: PromptEditorProps) {
  const [title, setTitle] = useState(prompt?.title || "")
  const [content, setContent] = useState(prompt?.content || "")
  const [emoji, setEmoji] = useState(prompt?.emoji || "")
  const [isPublic, setIsPublic] = useState(prompt?.is_public || false)
  const [tags, setTags] = useState<string[]>(prompt?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [variables, setVariables] = useState<Omit<
    PromptVariable,
    "id" | "prompt_id" | "created_at"
  >[]>(
    prompt?.variables?.map((v) => ({
      name: v.name,
      type: v.type,
      config: v.config,
      order_index: v.order_index,
    })) || []
  )
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-detect variables from content
  useEffect(() => {
    const detectedVars = parseVariablesFromContent(content)
    const existingVarNames = new Set(variables.map((v) => v.name))

    // Add new variables that don't exist yet
    detectedVars.forEach((varName) => {
      if (!existingVarNames.has(varName)) {
        setVariables((prev) => [
          ...prev,
          {
            name: varName,
            type: "string" as const,
            config: {},
            order_index: prev.length,
          },
        ])
      }
    })
  }, [content])

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleAddVariable = () => {
    setVariables([
      ...variables,
      {
        name: `var${variables.length + 1}`,
        type: "string",
        config: {},
        order_index: variables.length,
      },
    ])
  }

  const handleUpdateVariable = (
    index: number,
    updates: Partial<PromptVariable>
  ) => {
    setVariables(
      variables.map((v, i) => (i === index ? { ...v, ...updates } : v))
    )
  }

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setError(null)

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!content.trim()) {
      setError("Content is required")
      return
    }

    // Validate variables
    const validation = validateVariables(content, variables as PromptVariable[])
    if (!validation.valid) {
      setError(
        `Missing variable definitions: ${validation.missing.join(", ")}`
      )
      return
    }

    try {
      setSaving(true)

      const input = {
        title: title.trim(),
        content: content.trim(),
        emoji: emoji || null,
        is_public: isPublic,
        tags,
        variables: variables.map((v, i) => ({
          ...v,
          order_index: i,
        })),
      }

      await onSave(input)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prompt")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">
          {prompt ? "Edit Prompt" : "Create Prompt"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Emoji */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Emoji</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-12 h-12 flex items-center justify-center bg-white/10 border border-white/20 rounded-lg text-2xl hover:bg-white/15 transition-colors"
          >
            {emoji || "😀"}
          </button>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="Or type emoji"
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            maxLength={2}
          />
        </div>
        {showEmojiPicker && (
          <div className="grid grid-cols-10 gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
            {COMMON_EMOJIS.map((emojiOption) => (
              <button
                key={emojiOption}
                onClick={() => {
                  setEmoji(emojiOption)
                  setShowEmojiPicker(false)
                }}
                className="text-2xl hover:scale-125 transition-transform"
              >
                {emojiOption}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Enter prompt title"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          placeholder="Enter prompt content. Use {{variableName}} for variables."
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Add tag (e.g., #work/coding)"
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-100"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Variables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-white">
            Variables
          </label>
          <button
            onClick={handleAddVariable}
            className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors text-sm"
          >
            <Plus size={14} />
            Add Variable
          </button>
        </div>
        {variables.length > 0 && (
          <div className="space-y-3">
            {variables.map((variable, index) => (
              <div
                key={index}
                className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={variable.name}
                    onChange={(e) =>
                      handleUpdateVariable(index, { name: e.target.value })
                    }
                    className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/50"
                    placeholder="Variable name"
                  />
                  <select
                    value={variable.type}
                    onChange={(e) =>
                      handleUpdateVariable(index, {
                        type: e.target.value as PromptVariable["type"],
                        config: {},
                      })
                    }
                    className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="enum">Enum</option>
                    <option value="prompt">Prompt</option>
                  </select>
                  <button
                    onClick={() => handleRemoveVariable(index)}
                    className="p-1 text-white/70 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {variable.type === "number" && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={variable.config.min || ""}
                      onChange={(e) =>
                        handleUpdateVariable(index, {
                          config: {
                            ...variable.config,
                            min: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          },
                        })
                      }
                      placeholder="Min"
                      className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                    <input
                      type="number"
                      value={variable.config.max || ""}
                      onChange={(e) =>
                        handleUpdateVariable(index, {
                          config: {
                            ...variable.config,
                            max: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          },
                        })
                      }
                      placeholder="Max"
                      className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                )}
                {variable.type === "enum" && (
                  <input
                    type="text"
                    value={
                      Array.isArray(variable.config.options)
                        ? variable.config.options.join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      handleUpdateVariable(index, {
                        config: {
                          ...variable.config,
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                    placeholder="Options (comma-separated)"
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/50"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <label htmlFor="isPublic" className="text-sm text-white">
          Make this prompt public
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-white/70 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  )
}

