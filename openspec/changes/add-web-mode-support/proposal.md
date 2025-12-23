# Change: Add Web Mode Support

## Why
Currently, the application only works as a Chrome extension, limiting access to users who have installed it. Making the app accessible from the web will expand its reach and allow users to access core features (bookmarks, prompts, tools) without requiring extension installation. When accessed from the web, extension-specific features (extension management, tab management) will be hidden, and bookmarks will be loaded from user-uploaded files instead of Chrome APIs.

## What Changes
- **NEW**: Web mode detection capability to distinguish between extension and web contexts
- **NEW**: Bookmark file upload support (HTML and CSV formats) for web mode
- **NEW**: Supabase database schema for storing user bookmarks
- **MODIFIED**: Newtab page to work as a homepage in web mode
- **MODIFIED**: Tools section to conditionally hide extension management and tab management tools in web mode
- **MODIFIED**: Bookmark loading to use file uploads in web mode instead of Chrome Bookmarks API
- **MODIFIED**: Bookmark storage to use Supabase instead of localStorage for persistence and cross-device access

## Impact
- **Affected specs**:
  - `web-mode` (new capability)
  - `bookmarks` (new capability)
  - `newtab` (modified - currently only exists as delta in add-prompt-management-tool)
  - `tools` (new capability)
- **Affected code**:
  - `newtab.tsx` - Add web mode detection, conditional rendering
  - `hooks/useBookmarks.ts` - Add file upload parsing, conditional Chrome API usage, Supabase integration
  - `components/ToolsSection.tsx` - Conditionally hide extension/tab management tools
  - `components/Launchpad.tsx` - Should work unchanged (already uses bookmark data)
  - New components for file upload UI
  - New Supabase migration for bookmarks table
  - Build configuration to support web deployment

