# Design: Web Mode Support

## Context
The application is currently built as a Chrome extension using Plasmo framework. It provides:
- New Tab page with bookmarks in Launchpad-style grid
- Extension management popup
- Tab management page
- Tools section (prompts, etc.)
- Authentication via Supabase

To make it accessible from the web, we need to:
1. Detect whether running in extension context vs web context
2. Conditionally hide extension-specific features
3. Replace Chrome API dependencies (bookmarks, extensions, tabs) with web-compatible alternatives
4. Support bookmark data via file uploads (HTML/CSV)

## Goals / Non-Goals

### Goals
- Make core features (bookmarks, prompts, tools) accessible from web
- Hide extension-specific features (extension manager, tab manager) in web mode
- Support bookmark import from HTML and CSV files
- Maintain existing functionality when running as extension
- Use newtab page as homepage in web mode

### Non-Goals
- Full feature parity between web and extension modes (extension/tab management remain extension-only)
- Real-time bookmark sync between web and extension (future feature)
- Bookmark editing in web mode (read-only for now)
- Support for other bookmark file formats beyond HTML and CSV

## Decisions

### Decision: Environment Detection
**What**: Use runtime detection to determine if running in extension context vs web context.

**How**:
- Check for `typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id`
- Create a `useEnvironment` hook that returns `{ isExtension: boolean, isWeb: boolean }`
- Use this hook throughout the app to conditionally render features

**Alternatives considered**:
- Build-time flags: Rejected - would require separate builds, more complex deployment
- URL-based detection: Rejected - less reliable, could be spoofed
- Feature detection: Accepted - most reliable, works at runtime

**Rationale**: Runtime detection is the most flexible approach and doesn't require separate builds. It allows the same codebase to work in both contexts.

### Decision: Bookmark File Format Support
**What**: Support both HTML (Netscape format) and CSV bookmark exports.

**How**:
- Parse HTML bookmarks using DOMParser
- Parse CSV bookmarks using standard CSV parsing
- Store parsed bookmarks in local state (localStorage or IndexedDB for persistence)
- Provide file upload UI component

**Alternatives considered**:
- HTML only: Rejected - CSV is common export format
- JSON format: Rejected - not standard browser export format
- Both HTML and CSV: Accepted - covers most user needs

**Rationale**: HTML (Netscape format) is the standard browser export format. CSV is also commonly used. Supporting both covers the majority of use cases.

### Decision: Bookmark Storage in Web Mode
**What**: Store uploaded bookmarks in Supabase database.

**How**:
- Parse uploaded file immediately
- Store parsed bookmark tree in Supabase `bookmarks` table (JSONB column)
- Associate bookmarks with authenticated user via `user_id`
- Load from Supabase on page load (requires authentication)
- Provide UI to re-upload/refresh bookmarks
- Support cross-device access through Supabase sync

**Alternatives considered**:
- localStorage: Rejected - doesn't support cross-device access, limited storage
- IndexedDB: Rejected - local-only, no sync capability
- Server-side storage (Supabase): Accepted - enables cross-device sync, leverages existing auth infrastructure

**Rationale**: Using Supabase provides cross-device bookmark access, leverages existing authentication infrastructure, and enables future sync features. The system already uses Supabase for prompts and auth, so this maintains consistency.

### Decision: Conditional Feature Rendering
**What**: Hide extension management and tab management tools in web mode.

**How**:
- Tools section checks environment mode
- Filter tools list based on `isExtension` flag
- Extension Manager and Tab Manager only appear when `isExtension === true`

**Alternatives considered**:
- Disable features: Rejected - better UX to hide unavailable features
- Show with error message: Rejected - cleaner to hide
- Hide completely: Accepted - cleanest UX

**Rationale**: Hiding unavailable features provides a cleaner user experience than showing disabled features or error messages.

### Decision: Build Configuration
**What**: Support both extension build and web build from same codebase.

**How**:
- Plasmo handles extension build (existing)
- Add web build configuration (Vite or similar) for web deployment
- Use environment detection so same code works in both contexts
- Configure routing so newtab.tsx serves as homepage in web mode

**Alternatives considered**:
- Separate codebase: Rejected - too much duplication
- Build-time flags: Rejected - runtime detection is cleaner
- Same build, different deployment: Accepted - simplest approach

**Rationale**: Using the same codebase with runtime detection reduces maintenance burden and ensures consistency between web and extension versions.

## Risks / Trade-offs

### Risk: Bookmark Parsing Complexity
**Mitigation**: Start with basic HTML/CSV parsing. Handle common formats first, add edge cases as needed.

### Risk: Supabase Storage Limits
**Mitigation**: Monitor bookmark data size. Supabase free tier supports reasonable bookmark data. Consider compression for very large bookmark sets.

### Risk: Feature Parity Confusion
**Mitigation**: Clear UI indicators showing which mode is active. Hide unavailable features rather than showing errors.

### Trade-off: Read-only Bookmarks in Web Mode
**Acceptable**: Users can re-upload updated bookmark files. Full editing can be added later if needed.

## Migration Plan

### Phase 1: Environment Detection
1. Create `useEnvironment` hook
2. Add environment detection throughout app
3. Test in both extension and web contexts

### Phase 2: Bookmark Database Schema
1. Create Supabase migration for bookmarks table
2. Define bookmark schema (user_id, bookmark_tree JSONB, timestamps)
3. Set up Row Level Security (RLS) policies
4. Test database operations

### Phase 3: Bookmark File Upload
1. Create file upload UI component
2. Implement HTML bookmark parser
3. Implement CSV bookmark parser
4. Add Supabase persistence (store parsed bookmarks)
5. Update `useBookmarks` hook to use Supabase in web mode

### Phase 4: Conditional Feature Rendering
1. Update ToolsSection to filter tools based on environment
2. Hide Extension Manager and Tab Manager in web mode
3. Test feature visibility in both modes

### Phase 5: Web Build Configuration
1. Add web build configuration (Vite)
2. Configure routing for web deployment
3. Test web deployment
4. Update deployment documentation

## Open Questions
- Should we support bookmark editing in web mode? (Deferred - read-only for now)
- Should we support real-time bookmark sync between extension and web modes? (Future feature)
- What's the maximum bookmark file size we should support? (Start with 10MB limit)
- Should bookmarks require authentication in web mode? (Yes - required for Supabase storage)

