## ADDED Requirements

### Requirement: Environment Detection
The system SHALL detect whether it is running in a Chrome extension context or a web browser context.

#### Scenario: Detect extension context
- **WHEN** the application initializes
- **THEN** the system SHALL check for the presence of Chrome extension APIs
- **AND** if `chrome.runtime.id` exists, the system SHALL identify as extension context
- **AND** the system SHALL provide `isExtension: true` and `isWeb: false` flags

#### Scenario: Detect web context
- **WHEN** the application initializes
- **THEN** the system SHALL check for the presence of Chrome extension APIs
- **AND** if `chrome.runtime.id` does not exist, the system SHALL identify as web context
- **AND** the system SHALL provide `isExtension: false` and `isWeb: true` flags

#### Scenario: Environment state availability
- **WHEN** a component needs to check the environment
- **THEN** the component SHALL use the `useEnvironment` hook
- **AND** the hook SHALL return current environment state (`isExtension`, `isWeb`)
- **AND** the state SHALL be available immediately on component mount

