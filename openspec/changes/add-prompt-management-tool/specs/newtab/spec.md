## ADDED Requirements

### Requirement: Tools Section
The system SHALL display a tools section on the newtab page that shows all available tools.

#### Scenario: Display tools section
- **WHEN** user opens the newtab page
- **THEN** the system SHALL display a tools section
- **AND** the tools section SHALL show all available tools in a grid or list layout
- **AND** each tool SHALL be represented by an emoji icon and label
- **AND** each tool SHALL have a unique emoji identifier

#### Scenario: Tools section layout
- **WHEN** the tools section is displayed
- **THEN** it SHALL be positioned prominently on the newtab page
- **AND** it SHALL be visually distinct from the bookmarks launchpad
- **AND** it SHALL use consistent styling with the rest of the newtab page

#### Scenario: Open tool
- **WHEN** user clicks on a tool in the tools section
- **THEN** the system SHALL open the tool interface
- **AND** the tool interface SHALL be displayed in a modal, overlay, or dedicated view
- **AND** the user SHALL be able to close the tool and return to the newtab page

#### Scenario: Multiple tools support
- **WHEN** multiple tools are available
- **THEN** the tools section SHALL display all tools
- **AND** tools SHALL be organized in a grid or list that scales with the number of tools
- **AND** the layout SHALL accommodate future tools without requiring structural changes

### Requirement: Prompt Tool Integration
The prompt management tool SHALL be accessible from the tools section.

#### Scenario: Prompt tool appears in tools section
- **WHEN** the tools section is displayed
- **THEN** the prompt management tool SHALL be visible
- **AND** it SHALL display with emoji icon 💬 (speech balloon)
- **AND** it SHALL have a recognizable label
- **AND** clicking it SHALL open the prompt management interface

#### Scenario: Prompt tool requires authentication
- **WHEN** user is not authenticated and clicks the prompt tool
- **THEN** the system SHALL prompt the user to sign in
- **AND** after authentication, the system SHALL open the prompt management interface

