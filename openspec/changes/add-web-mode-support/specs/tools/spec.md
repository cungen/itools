## ADDED Requirements

### Requirement: Environment-Aware Tool Visibility
The system SHALL conditionally display tools based on the current environment (extension or web).

#### Scenario: Hide extension-specific tools in web mode
- **WHEN** the application is running in web mode
- **THEN** the Extension Manager tool SHALL NOT be displayed in the tools section
- **AND** the Tab Manager tool SHALL NOT be displayed in the tools section
- **AND** tools that require Chrome extension APIs SHALL be hidden

#### Scenario: Show extension-specific tools in extension mode
- **WHEN** the application is running in extension mode
- **THEN** the Extension Manager tool SHALL be displayed in the tools section
- **AND** the Tab Manager tool SHALL be displayed in the tools section
- **AND** all available tools SHALL be visible

#### Scenario: Show web-compatible tools in both modes
- **WHEN** a tool does not require Chrome extension APIs
- **THEN** the tool SHALL be displayed in both extension and web modes
- **AND** the tool SHALL function identically in both environments
- **AND** examples include Prompt Manager and other tools that work in web mode

### Requirement: Tool Environment Detection
Each tool SHALL be aware of its environment requirements and availability.

#### Scenario: Tool availability check
- **WHEN** the tools section renders
- **THEN** each tool SHALL declare its environment requirements
- **AND** tools requiring extension APIs SHALL only appear when `isExtension === true`
- **AND** tools that work in web mode SHALL appear in both environments

#### Scenario: Tool filtering logic
- **WHEN** filtering tools for display
- **THEN** the system SHALL check each tool's environment requirements
- **AND** the system SHALL compare tool requirements with current environment
- **AND** the system SHALL only display tools that are compatible with current environment

