# Design: Prompt Management Tool

## Context
The prompt management tool is a new feature that allows users to create, organize, search, and share prompts with variable support. It will be the first tool in a tools section on the newtab page, establishing a pattern for future tools.

## Goals / Non-Goals

### Goals
- Provide a user-friendly interface for managing prompts
- Support hierarchical tagging for flexible organization
- Enable variable substitution with type-safe inputs
- Allow sharing prompts with other users
- Store all data in Supabase with user isolation
- Create extensible tools section architecture for future tools

### Non-Goals
- Real-time collaboration (sharing is one-way)
- Version control or history tracking (v1)
- Prompt templates marketplace (v1)
- Import/export functionality (v1)
- Prompt execution/API integration (v1)

## Decisions

### Decision: Hierarchical Tag System
**What**: Tags support hierarchical structure like `#a/b/c` where prompts can be found by any level (`#a`, `#b`, `#c`, `#a/b`, `#b/c`, `#a/b/c`).

**Why**: Provides flexible organization without requiring strict folder structures. Users can organize by category/subcategory or use flat tags.

**Alternatives considered**:
- Flat tags only: Less flexible, harder to organize large collections
- Strict folder hierarchy: Too rigid, doesn't support multi-categorization
- Both folders and tags: More complex, hierarchical tags provide the benefits of both

### Decision: Variable Types
**What**: Variables support four types:
- `string`: Free text input
- `number`: Numeric input with optional slider UI
- `enum`: Predefined list of options
- `prompt`: Reference to another prompt (allows composition)

**Why**: Covers common use cases while keeping the system simple. Prompt type enables prompt composition and reuse.

**Alternatives considered**:
- More types (date, boolean, etc.): Can be added later if needed
- Only string type: Too limiting, requires manual validation

### Decision: Supabase Storage Schema
**What**: Separate tables for:
- `prompts`: Core prompt data (id, user_id, title, content, emoji, created_at, updated_at, is_public)
- `prompt_tags`: Junction table for prompt-tag relationships
- `prompt_variables`: Variable definitions (prompt_id, name, type, config)
- `prompt_shares`: Sharing relationships (prompt_id, shared_by, shared_with, created_at)

**Why**: Normalized schema allows efficient querying, supports many-to-many tag relationships, and enables future features like sharing analytics. Emoji field allows visual identification of prompts.

**Alternatives considered**:
- Single JSONB column: Less queryable, harder to index
- Denormalized structure: More storage, harder to maintain consistency
- Separate emoji table: Overkill for a single string field per prompt

### Decision: Tools Section Architecture
**What**: Tools section displays all available tools in a grid/list. Each tool is a component that can be opened in a modal or overlay.

**Why**: Establishes a pattern for future tools. Keeps newtab page organized as more tools are added.

**Alternatives considered**:
- Separate page per tool: More navigation, less integrated
- Tabs: Limited scalability, harder to discover tools

### Decision: Variable Input UI
**What**: Different input components based on type:
- String: Text input
- Number: Text input with optional slider (for ranges)
- Enum: Dropdown/select
- Prompt: Searchable list of user's prompts

**Why**: Provides appropriate UX for each type while keeping implementation simple.

### Decision: Emoji Icons
**What**:
- Each prompt can have an emoji icon stored in the `emoji` field (VARCHAR, nullable)
- Each tool in the tools section has an emoji icon defined in the tool configuration
- Default emoji for prompt tool: 💬 (speech balloon)

**Why**: Emojis provide quick visual identification and make the UI more engaging. Storing emoji as a string in the database is simple and efficient. Default emoji for the prompt tool helps users quickly identify it.

**Alternatives considered**:
- Image icons: More complex, requires storage/URLs, larger payload
- Icon fonts: Less flexible, harder for users to customize
- No icons: Less visual appeal, harder to scan

## Risks / Trade-offs

### Risk: Tag Search Performance
**Mitigation**: Use PostgreSQL full-text search or GIN indexes on tag paths. Limit search results and implement pagination.

### Risk: Variable Parsing Complexity
**Mitigation**: Use simple regex for `{{variable}}` syntax. Validate variable names match defined variables before saving.

### Risk: Prompt Composition Depth
**Mitigation**: Limit nesting depth (e.g., max 3 levels) to prevent infinite loops. Cache resolved prompts.

### Risk: Sharing Privacy
**Mitigation**: Default to private. Clear UI indicators for public prompts. Allow users to revoke shares.

## Migration Plan
1. Create Supabase tables via migration
2. Deploy new components and hooks
3. Update newtab page to include tools section
4. No data migration needed (new feature)

## Open Questions
- Should public prompts be discoverable/searchable by all users or only via direct share links?
- What is the maximum number of variables per prompt? (Suggested: 20)
- Should there be a character limit on prompt content? (Suggested: 10,000)
- Should tags have a maximum depth? (Suggested: 5 levels)

