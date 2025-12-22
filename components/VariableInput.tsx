import { useState, useEffect } from "react"
import type { PromptVariable, Prompt } from "../hooks/usePrompts"
import { validateVariableValue } from "../hooks/usePromptVariables"

interface VariableInputProps {
  variable: PromptVariable
  value: string | number | undefined
  onChange: (value: string | number) => void
  prompts?: Prompt[] // For prompt type variables
  error?: string
}

export function VariableInput({
  variable,
  value,
  onChange,
  prompts = [],
  error,
}: VariableInputProps) {
  const [localError, setLocalError] = useState<string | undefined>(error)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setLocalError(error)
  }, [error])

  const handleChange = (newValue: string | number) => {
    const validation = validateVariableValue(variable, newValue)
    if (validation.valid) {
      setLocalError(undefined)
      onChange(newValue)
    } else {
      setLocalError(validation.error)
    }
  }

  switch (variable.type) {
    case "string":
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-white">
            {variable.name}
          </label>
          <input
            type="text"
            value={value as string || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder={`Enter ${variable.name}`}
          />
          {localError && (
            <p className="text-xs text-red-400">{localError}</p>
          )}
        </div>
      )

    case "number":
      const numValue =
        value !== undefined
          ? typeof value === "string"
            ? parseFloat(value) || 0
            : value
          : variable.config.min || 0
      const min = variable.config.min
      const max = variable.config.max
      const showSlider = min !== undefined && max !== undefined

      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">
            {variable.name}
            {min !== undefined && max !== undefined && (
              <span className="text-white/50 ml-2">
                ({min} - {max})
              </span>
            )}
          </label>
          {showSlider && (
            <input
              type="range"
              min={min}
              max={max}
              value={numValue}
              onChange={(e) => handleChange(parseFloat(e.target.value))}
              className="w-full"
            />
          )}
          <input
            type="number"
            value={numValue}
            min={min}
            max={max}
            onChange={(e) =>
              handleChange(
                e.target.value === "" ? 0 : parseFloat(e.target.value)
              )
            }
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder={`Enter ${variable.name}`}
          />
          {localError && (
            <p className="text-xs text-red-400">{localError}</p>
          )}
        </div>
      )

    case "enum":
      const options = variable.config.options || []

      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-white">
            {variable.name}
          </label>
          <select
            value={value as string || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Select {variable.name}</option>
            {options.map((option) => (
              <option key={option} value={option} className="bg-slate-800">
                {option}
              </option>
            ))}
          </select>
          {localError && (
            <p className="text-xs text-red-400">{localError}</p>
          )}
        </div>
      )

    case "prompt":
      const filteredPrompts = prompts.filter(
        (p) =>
          !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )

      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-white">
            {variable.name}
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-2"
          />
          <select
            value={value as string || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            size={Math.min(filteredPrompts.length + 1, 5)}
          >
            <option value="">Select a prompt</option>
            {filteredPrompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id} className="bg-slate-800">
                {prompt.emoji || "📝"} {prompt.title}
              </option>
            ))}
          </select>
          {localError && (
            <p className="text-xs text-red-400">{localError}</p>
          )}
        </div>
      )

    default:
      return null
  }
}

