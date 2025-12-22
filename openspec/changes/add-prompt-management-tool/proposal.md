# Change: Add Prompt Management Tool

## Why
Users need a centralized way to manage, organize, and reuse prompts with support for variables, hierarchical tagging, and sharing capabilities. This tool will be the first in a tools section on the newtab page, establishing a pattern for future tools.

## What Changes
- **NEW**: Prompt management capability with Supabase storage
- **NEW**: Hierarchical tag system (#a/b/c) with multi-level search support
- **NEW**: Variable system supporting enum, number, string, and prompt types
- **NEW**: Prompt sharing functionality (public/private)
- **NEW**: Tools section in newtab page to display all available tools
- **NEW**: Prompt tool UI with variable value selection interfaces
- **NEW**: Emoji icon support for prompts (stored in Supabase)
- **NEW**: Emoji icon support for tools in the tools section

## Impact
- Affected specs:
  - `prompt-management` (new capability)
  - `newtab` (new capability)
- Affected code:
  - New components: `components/PromptManager.tsx`, `components/ToolsSection.tsx`, `components/PromptCard.tsx`, `components/PromptEditor.tsx`, `components/VariableInput.tsx`
  - New hooks: `hooks/usePrompts.ts`, `hooks/usePromptVariables.ts`
  - Modified: `newtab.tsx` (add tools section)
  - Database: New Supabase tables for prompts (with emoji field), tags, shares, and variables
- Dependencies: Supabase (already configured)

