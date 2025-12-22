## ADDED Requirements

### Requirement: Prompt Storage
The system SHALL store prompts in Supabase, associated with the authenticated user.

#### Scenario: Create prompt
- **WHEN** user creates a new prompt
- **THEN** the system SHALL save the prompt to Supabase with user_id
- **AND** the prompt SHALL be stored with title, content, emoji icon, and metadata
- **AND** the prompt SHALL be accessible only to the creating user by default
- **AND** the emoji field SHALL be optional (nullable)

#### Scenario: List user prompts
- **WHEN** user requests their prompts
- **THEN** the system SHALL return all prompts created by the authenticated user
- **AND** results SHALL be ordered by most recently updated first

#### Scenario: Update prompt
- **WHEN** user modifies an existing prompt
- **THEN** the system SHALL update the prompt in Supabase
- **AND** the updated_at timestamp SHALL be updated
- **AND** only the prompt owner SHALL be able to update the prompt

#### Scenario: Delete prompt
- **WHEN** user deletes a prompt
- **THEN** the system SHALL remove the prompt from Supabase
- **AND** all associated tags, variables, and shares SHALL be removed
- **AND** only the prompt owner SHALL be able to delete the prompt

### Requirement: Hierarchical Tag System
The system SHALL support hierarchical tags in the format `#a/b/c` where prompts can be searched by any level of the hierarchy.

#### Scenario: Add hierarchical tag
- **WHEN** user adds a tag `#a/b/c` to a prompt
- **THEN** the system SHALL store the full tag path
- **AND** the prompt SHALL be searchable by `#a`, `#b`, `#c`, `#a/b`, `#b/c`, and `#a/b/c`

#### Scenario: Search by tag prefix
- **WHEN** user searches for `#a`
- **THEN** the system SHALL return all prompts tagged with `#a` or any tag starting with `#a/`
- **AND** results SHALL include prompts with tags like `#a/b`, `#a/b/c`, etc.

#### Scenario: Search by partial path
- **WHEN** user searches for `#a/b`
- **THEN** the system SHALL return all prompts tagged with `#a/b` or any tag starting with `#a/b/`
- **AND** results SHALL include prompts with tags like `#a/b/c`, `#a/b/d`, etc.

#### Scenario: Search by exact tag
- **WHEN** user searches for `#a/b/c`
- **THEN** the system SHALL return only prompts tagged with exactly `#a/b/c`

#### Scenario: Multiple tags per prompt
- **WHEN** user adds multiple tags to a prompt (e.g., `#work/coding` and `#personal`)
- **THEN** the system SHALL store all tags
- **AND** the prompt SHALL appear in search results for any of its tags

### Requirement: Prompt Variables
The system SHALL support variables in prompt content using `{{variableName}}` syntax with configurable types.

#### Scenario: Define string variable
- **WHEN** user defines a variable named `role` with type `string`
- **THEN** the system SHALL store the variable definition
- **AND** when the prompt is used, the system SHALL provide a text input for `{{role}}`

#### Scenario: Define number variable
- **WHEN** user defines a variable named `count` with type `number` and optional range (min, max)
- **THEN** the system SHALL store the variable definition with range config
- **AND** when the prompt is used, the system SHALL provide a number input with optional slider UI

#### Scenario: Define enum variable
- **WHEN** user defines a variable named `language` with type `enum` and options `["Python", "JavaScript", "TypeScript"]`
- **THEN** the system SHALL store the variable definition with options
- **AND** when the prompt is used, the system SHALL provide a dropdown to select one option

#### Scenario: Define prompt variable
- **WHEN** user defines a variable named `context` with type `prompt`
- **THEN** the system SHALL store the variable definition
- **AND** when the prompt is used, the system SHALL provide a searchable list of user's prompts to select from
- **AND** the selected prompt's resolved content SHALL be substituted for the variable

#### Scenario: Parse variables from content
- **WHEN** user enters prompt content containing `{{foo}}` and `{{role}}`
- **THEN** the system SHALL detect the variable names
- **AND** the system SHALL prompt user to define variables that don't exist
- **AND** the system SHALL validate that all variables in content have definitions

#### Scenario: Substitute variables
- **WHEN** user selects values for all variables in a prompt
- **THEN** the system SHALL replace `{{variableName}}` with the selected value
- **AND** the system SHALL resolve nested prompt variables (if prompt type variable references another prompt)
- **AND** the system SHALL return the final prompt with all variables substituted

### Requirement: Prompt Sharing
The system SHALL allow users to share prompts with other users or make them publicly accessible.

#### Scenario: Make prompt public
- **WHEN** user toggles a prompt to public
- **THEN** the system SHALL set `is_public` flag to true
- **AND** the prompt SHALL be accessible to all authenticated users
- **AND** the prompt SHALL appear in public prompt searches

#### Scenario: Share prompt with specific user
- **WHEN** user shares a prompt with another user by email
- **THEN** the system SHALL create a share record
- **AND** the shared user SHALL be able to view and use the prompt
- **AND** the shared user SHALL NOT be able to edit or delete the prompt

#### Scenario: Revoke share
- **WHEN** user revokes a share or makes a public prompt private
- **THEN** the system SHALL remove share access
- **AND** users who previously had access SHALL no longer see the prompt

#### Scenario: View shared prompts
- **WHEN** user requests shared prompts
- **THEN** the system SHALL return prompts shared with the user
- **AND** the system SHALL return public prompts
- **AND** results SHALL indicate the source (shared vs public)

### Requirement: Prompt Search
The system SHALL provide search functionality to find prompts by tags, title, or content.

#### Scenario: Search by title
- **WHEN** user searches for text in the search field
- **THEN** the system SHALL search prompt titles and content
- **AND** results SHALL be filtered to user's prompts and accessible shared/public prompts

#### Scenario: Search by tag
- **WHEN** user searches for a tag (e.g., `#work`)
- **THEN** the system SHALL return prompts matching the tag at any hierarchy level
- **AND** results SHALL include prompts with tags like `#work`, `#work/coding`, `#work/meetings`, etc.

#### Scenario: Combine search filters
- **WHEN** user searches for text and selects a tag filter
- **THEN** the system SHALL return prompts matching both the text search and tag filter
- **AND** results SHALL be ordered by relevance

### Requirement: Prompt Management UI
The system SHALL provide a user interface for managing prompts in the tools section of the newtab page.

#### Scenario: Access prompt tool
- **WHEN** user clicks on the prompt tool in the tools section
- **THEN** the system SHALL open the prompt management interface
- **AND** the interface SHALL display user's prompts in a list or grid

#### Scenario: Create new prompt
- **WHEN** user clicks "Create Prompt"
- **THEN** the system SHALL open a prompt editor
- **AND** the editor SHALL include fields for title, content, tags, and variables
- **AND** the system SHALL auto-detect variables from content

#### Scenario: Edit prompt
- **WHEN** user clicks on an existing prompt
- **THEN** the system SHALL open the prompt editor with existing data
- **AND** user SHALL be able to modify title, content, emoji icon, tags, and variables
- **AND** changes SHALL be saved to Supabase on save

#### Scenario: Set prompt emoji
- **WHEN** user sets an emoji icon for a prompt
- **THEN** the system SHALL store the emoji in the prompt's emoji field
- **AND** the emoji SHALL be displayed on the prompt card
- **AND** the emoji SHALL be displayed in prompt lists and search results

#### Scenario: Display prompt without emoji
- **WHEN** a prompt does not have an emoji set
- **THEN** the system SHALL display a default placeholder or no emoji
- **AND** the prompt SHALL still be fully functional

#### Scenario: Use prompt with variables
- **WHEN** user selects a prompt that has variables
- **THEN** the system SHALL display variable input UI for each variable
- **AND** the UI SHALL match the variable type (text, number slider, dropdown, prompt selector)
- **AND** after user provides values, the system SHALL display the resolved prompt

#### Scenario: Tag input
- **WHEN** user adds tags to a prompt
- **THEN** the system SHALL provide a tag input field
- **AND** the system SHALL support entering hierarchical tags like `#a/b/c`
- **AND** the system SHALL display existing tags as chips with remove option

