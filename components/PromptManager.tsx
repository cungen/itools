import { useState, useEffect } from "react"
import { Plus, Search, X } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { usePrompts, type Prompt } from "../hooks/usePrompts"
import { PromptCard } from "./PromptCard"
import { PromptEditor } from "./PromptEditor"
import { VariableInput } from "./VariableInput"
import {
  substituteVariables,
  resolvePromptVariable,
} from "../hooks/usePromptVariables"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent } from "./ui/card"

interface PromptManagerProps {
  onClose: () => void
}

export function PromptManager({ onClose }: PromptManagerProps) {
  const { user } = useAuth()
  const {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    searchPrompts,
  } = usePrompts(user)

  const [showEditor, setShowEditor] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [usingPrompt, setUsingPrompt] = useState<Prompt | null>(null)
  const [variableValues, setVariableValues] = useState<
    Record<string, string | number>
  >({})
  const [resolvedContent, setResolvedContent] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])

  // Filter prompts based on search and tag
  useEffect(() => {
    const filter = async () => {
      if (searchQuery || tagFilter) {
        const results = await searchPrompts(searchQuery, tagFilter)
        setFilteredPrompts(results)
      } else {
        setFilteredPrompts(prompts)
      }
    }
    filter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, tagFilter, prompts])

  const handleCreate = () => {
    setEditingPrompt(null)
    setShowEditor(true)
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setShowEditor(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      await deletePrompt(id)
    }
  }

  const handleUse = (prompt: Prompt) => {
    setUsingPrompt(prompt)
    setVariableValues({})
    setResolvedContent(null)
  }

  const handleSave = async (
    input: Parameters<typeof createPrompt>[0] | Parameters<typeof updatePrompt>[1]
  ) => {
    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, input as Parameters<typeof updatePrompt>[1])
    } else {
      await createPrompt(input as Parameters<typeof createPrompt>[0])
    }
    setShowEditor(false)
    setEditingPrompt(null)
  }

  const handleResolvePrompt = async () => {
    if (!usingPrompt) return

    try {
      let resolved = usingPrompt.content

      // Resolve prompt-type variables first
      for (const variable of usingPrompt.variables || []) {
        if (variable.type === "prompt" && variableValues[variable.name]) {
          const nestedPromptId = String(variableValues[variable.name])
          const nestedPrompt = prompts.find((p) => p.id === nestedPromptId)
          if (nestedPrompt) {
            try {
              const nestedContent = await resolvePromptVariable(
                nestedPromptId,
                prompts,
                variableValues
              )
              resolved = resolved.replace(
                new RegExp(`{{${variable.name}}}`, "g"),
                nestedContent
              )
            } catch (err) {
              console.error("Error resolving nested prompt:", err)
            }
          }
        }
      }

      // Substitute remaining variables
      resolved = substituteVariables(resolved, variableValues)
      setResolvedContent(resolved)
    } catch (err) {
      console.error("Error resolving prompt:", err)
    }
  }

  const displayPrompts = searchQuery || tagFilter ? filteredPrompts : prompts

  if (showEditor) {
    return (
      <PromptEditor
        prompt={editingPrompt}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false)
          setEditingPrompt(null)
        }}
      />
    )
  }

  if (usingPrompt) {
    return (
      <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Use Prompt: {usingPrompt.title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setUsingPrompt(null)
              setVariableValues({})
              setResolvedContent(null)
            }}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          {usingPrompt.variables && usingPrompt.variables.length > 0 ? (
            <>
              {usingPrompt.variables.map((variable) => (
                <VariableInput
                  key={variable.name}
                  variable={variable}
                  value={variableValues[variable.name]}
                  onChange={(value) => {
                    setVariableValues({
                      ...variableValues,
                      [variable.name]: value,
                    })
                  }}
                  prompts={prompts}
                />
              ))}
              <Button onClick={handleResolvePrompt} className="w-full">
                Resolve Prompt
              </Button>
            </>
          ) : (
            <div className="p-4 bg-white/5 rounded-lg text-white/70">
              This prompt has no variables. Content: {usingPrompt.content}
            </div>
          )}

          {resolvedContent && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Resolved Prompt
              </label>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="text-white whitespace-pre-wrap">
                    {resolvedContent}
                  </div>
                </CardContent>
              </Card>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(resolvedContent)
                  } catch (err) {
                    console.error("Failed to copy:", err)
                  }
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">My Prompts</h2>
        <Button onClick={handleCreate}>
          <Plus size={16} />
          Create Prompt
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="Filter by tag (e.g., #work)"
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          {tagFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTagFilter("")}
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Prompts List */}
      {loading ? (
        <div className="text-center text-white/50 py-12">Loading...</div>
      ) : displayPrompts.length === 0 ? (
        <div className="text-center text-white/50 py-12">
          {searchQuery || tagFilter
            ? "No prompts found"
            : "No prompts yet. Create your first prompt!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUse={handleUse}
            />
          ))}
        </div>
      )}
    </div>
  )
}

