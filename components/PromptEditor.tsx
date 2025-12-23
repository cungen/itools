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
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "./ui/checkbox"
import { Card, CardContent } from "./ui/card"

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
    <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">
          {prompt ? "Edit Prompt" : "Create Prompt"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={20} />
        </Button>
      </div>

      {error && (
        <Card className="bg-red-500/20 border-red-500/50">
          <CardContent className="p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Emoji */}
      <div className="space-y-2">
        <Label>Emoji</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="w-12 h-12 text-2xl"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            {emoji || "😀"}
          </Button>
          <Input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="Or type emoji"
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
        <Label>Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter prompt title"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label>Content</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder="Enter prompt content. Use {{variableName}} for variables."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
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
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button onClick={handleAddTag} size="icon">
            <Plus size={16} />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
              >
                {tag}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X size={12} />
                </Button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Variables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Variables</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddVariable}
          >
            <Plus size={14} />
            Add Variable
          </Button>
        </div>
        {variables.length > 0 && (
          <div className="space-y-3">
            {variables.map((variable, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={variable.name}
                      onChange={(e) =>
                        handleUpdateVariable(index, { name: e.target.value })
                      }
                      placeholder="Variable name"
                      className="flex-1 bg-white/10 border-white/20 text-white text-sm placeholder:text-white/50"
                    />
                    <Select
                      value={variable.type}
                      onValueChange={(value) =>
                        handleUpdateVariable(index, {
                          type: value as PromptVariable["type"],
                          config: {},
                        })
                      }
                    >
                      <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="enum">Enum</SelectItem>
                        <SelectItem value="prompt">Prompt</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveVariable(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  {variable.type === "number" && (
                    <div className="flex gap-2">
                      <Input
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
                        className="w-24 bg-white/10 border-white/20 text-white text-sm"
                      />
                      <Input
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
                        className="w-24 bg-white/10 border-white/20 text-white text-sm"
                      />
                    </div>
                  )}
                  {variable.type === "enum" && (
                    <Input
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
                      className="bg-white/10 border-white/20 text-white text-sm placeholder:text-white/50"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Public toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => setIsPublic(checked === true)}
        />
        <Label htmlFor="isPublic" className="text-sm cursor-pointer">
          Make this prompt public
        </Label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

