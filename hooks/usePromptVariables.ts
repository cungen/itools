import type { PromptVariable } from "./usePrompts"

/**
 * Parse variables from prompt content using {{variableName}} syntax
 */
export const parseVariablesFromContent = (content: string): string[] => {
  const regex = /{{(\w+)}}/g
  const matches = content.matchAll(regex)
  const variables = new Set<string>()

  for (const match of matches) {
    variables.add(match[1])
  }

  return Array.from(variables)
}

/**
 * Validate that all variables in content have definitions
 */
export const validateVariables = (
  content: string,
  variables: PromptVariable[]
): { valid: boolean; missing: string[] } => {
  const contentVariables = parseVariablesFromContent(content)
  const definedNames = new Set(variables.map((v) => v.name))
  const missing = contentVariables.filter((name) => !definedNames.has(name))

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Substitute variables in prompt content with provided values
 */
export const substituteVariables = (
  content: string,
  variableValues: Record<string, string | number>
): string => {
  let result = content

  for (const [name, value] of Object.entries(variableValues)) {
    const regex = new RegExp(`{{${name}}}`, "g")
    result = result.replace(regex, String(value))
  }

  return result
}

/**
 * Resolve nested prompt variables (when a prompt variable references another prompt)
 * Max depth: 3 levels to prevent infinite loops
 */
export const resolvePromptVariable = async (
  promptId: string,
  prompts: Array<{ id: string; content: string; variables?: PromptVariable[] }>,
  variableValues: Record<string, string | number>,
  depth: number = 0
): Promise<string> => {
  if (depth > 3) {
    throw new Error("Maximum prompt composition depth exceeded")
  }

  const prompt = prompts.find((p) => p.id === promptId)
  if (!prompt) {
    throw new Error(`Prompt with id ${promptId} not found`)
  }

  // If the referenced prompt has variables, we need to resolve them first
  // For now, we'll use the variable values provided, but this could be enhanced
  // to prompt the user for nested variable values
  let resolvedContent = prompt.content

  if (prompt.variables && prompt.variables.length > 0) {
    // Try to resolve any variables in the referenced prompt
    for (const variable of prompt.variables) {
      if (variable.type === "prompt" && variableValues[variable.name]) {
        // Recursively resolve nested prompt
        const nestedPromptId = String(variableValues[variable.name])
        try {
          const nestedContent = await resolvePromptVariable(
            nestedPromptId,
            prompts,
            variableValues,
            depth + 1
          )
          resolvedContent = resolvedContent.replace(
            new RegExp(`{{${variable.name}}}`, "g"),
            nestedContent
          )
        } catch (err) {
          console.error("Error resolving nested prompt:", err)
          // Fallback to the variable value as-is
          resolvedContent = resolvedContent.replace(
            new RegExp(`{{${variable.name}}}`, "g"),
            String(variableValues[variable.name])
          )
        }
      } else if (variableValues[variable.name] !== undefined) {
        // Substitute regular variable
        resolvedContent = resolvedContent.replace(
          new RegExp(`{{${variable.name}}}`, "g"),
          String(variableValues[variable.name])
        )
      }
    }
  }

  // Substitute any remaining variables from the main variableValues
  resolvedContent = substituteVariables(resolvedContent, variableValues)

  return resolvedContent
}

/**
 * Validate variable value based on type
 */
export const validateVariableValue = (
  variable: PromptVariable,
  value: string | number
): { valid: boolean; error?: string } => {
  switch (variable.type) {
    case "string":
      if (typeof value !== "string") {
        return { valid: false, error: "Value must be a string" }
      }
      return { valid: true }

    case "number":
      const numValue = typeof value === "string" ? parseFloat(value) : value
      if (isNaN(numValue)) {
        return { valid: false, error: "Value must be a number" }
      }
      if (variable.config.min !== undefined && numValue < variable.config.min) {
        return {
          valid: false,
          error: `Value must be at least ${variable.config.min}`,
        }
      }
      if (variable.config.max !== undefined && numValue > variable.config.max) {
        return {
          valid: false,
          error: `Value must be at most ${variable.config.max}`,
        }
      }
      return { valid: true }

    case "enum":
      if (!variable.config.options || !Array.isArray(variable.config.options)) {
        return { valid: false, error: "Enum variable must have options" }
      }
      if (!variable.config.options.includes(String(value))) {
        return {
          valid: false,
          error: `Value must be one of: ${variable.config.options.join(", ")}`,
        }
      }
      return { valid: true }

    case "prompt":
      // Prompt type validation - just check it's a string (prompt ID)
      if (typeof value !== "string") {
        return { valid: false, error: "Value must be a prompt ID (string)" }
      }
      return { valid: true }

    default:
      return { valid: false, error: `Unknown variable type: ${variable.type}` }
  }
}

