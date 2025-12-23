## MODIFIED Requirements

### Requirement: Tools Section
The system SHALL display a tools section on the newtab page that shows all available tools, filtered based on the current environment.

#### Scenario: Display tools section
- **WHEN** user opens the newtab page
- **THEN** the system SHALL display a tools section
- **AND** the tools section SHALL show all available tools in a grid or list layout
- **AND** each tool SHALL be represented by an emoji icon and label
- **AND** each tool SHALL have a unique emoji identifier
- **AND** the tools section SHALL only show tools that are available in the current environment (extension or web)

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

#### Scenario: Filter tools by environment
- **WHEN** the application is running in web mode
- **THEN** the tools section SHALL hide Extension Manager tool
- **AND** the tools section SHALL hide Tab Manager tool
- **AND** the tools section SHALL show other tools (e.g., Prompt Manager) that work in web mode

#### Scenario: Show all tools in extension mode
- **WHEN** the application is running in extension mode
- **THEN** the tools section SHALL show all available tools
- **AND** the tools section SHALL include Extension Manager and Tab Manager tools

### Requirement: Newtab as Homepage in Web Mode
The system SHALL serve the newtab page as the homepage when accessed from the web.

#### Scenario: Newtab page in web mode
- **WHEN** user accesses the application from a web browser (not as extension)
- **THEN** the newtab page SHALL be displayed as the homepage
- **AND** the page SHALL function identically to the extension newtab page
- **AND** the page SHALL show bookmark upload UI if no bookmarks are loaded
- **AND** the page SHALL display bookmarks in Launchpad style if bookmarks are available

#### Scenario: Authentication in web mode
- **WHEN** user accesses the application from web
- **THEN** authentication SHALL work the same as in extension mode
- **AND** the system SHALL use Supabase authentication
- **AND** authenticated users SHALL have access to tools that require authentication

