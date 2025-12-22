# Design: Tab Management Feature

## Context
The extension needs to provide a Safari-like tab management interface for Chrome. This requires:
- Accessing all open tabs via Chrome Tabs API
- Capturing visual previews (screenshots) of tab content
- Displaying tabs in a grid layout similar to the existing Launchpad component
- Providing keyboard shortcuts for quick access
- Handling tab operations (switch, close, etc.)

## Goals / Non-Goals

### Goals
- Grid card view of all open tabs with preview images
- Keyboard shortcut to open tab management page
- Ability to switch to tabs by clicking on cards
- Ability to close tabs from the grid view
- Visual previews that help users identify tabs quickly

### Non-Goals
- Tab grouping/organization (future enhancement)
- Tab search/filtering (future enhancement)
- Tab history or session restore (future enhancement)
- Cross-window tab management (focus on single window initially)

## Decisions

### Decision: Use Chrome Tabs API with captureVisibleTab
**Rationale**: Chrome provides `chrome.tabs` API for listing tabs and `chrome.tabs.captureVisibleTab` for screenshots. This is the standard approach for tab management extensions.

**Alternatives considered**:
- Using `chrome.tabs.captureTab` (requires `tabs` permission and active tab context)
- Using third-party screenshot services (unnecessary complexity, privacy concerns)

### Decision: Cache Screenshots in Chrome Storage
**Rationale**: Screenshots should be cached to avoid repeated captures and improve performance. Use Chrome Storage API with reasonable expiration.

**Alternatives considered**:
- No caching (poor performance, rate limits)
- IndexedDB (overkill for simple key-value storage)
- Memory-only cache (lost on extension reload)

### Decision: Grid Layout Similar to Launchpad
**Rationale**: Reuse existing Launchpad grid styling patterns for consistency. Use Tailwind CSS classes where possible, custom CSS for complex card effects.

**Alternatives considered**:
- Completely new layout (inconsistent UX)
- List view (doesn't match Safari-style requirement)

### Decision: Keyboard Shortcut via Chrome Commands API
**Rationale**: Chrome Commands API provides declarative keyboard shortcuts in manifest. Standard approach for extension shortcuts.

**Alternatives considered**:
- Content script keyboard listeners (less reliable, conflicts with page scripts)
- Background service worker listeners (more complex, unnecessary)

### Decision: Separate Entry Point (tabmanager.tsx)
**Rationale**: Tab management is a distinct feature from the new tab page. Separate entry point allows it to be opened in a new tab/window.

**Alternatives considered**:
- Overlay on new tab page (clutters main interface)
- Popup (too small for grid view)

## Risks / Trade-offs

### Risk: Screenshot Capture Performance
**Mitigation**:
- Cache screenshots with timestamps
- Capture on-demand (when tab management opens) rather than continuously
- Limit concurrent captures to avoid rate limiting
- Show loading placeholders while capturing

### Risk: Screenshot Privacy Concerns
**Mitigation**:
- Screenshots stored locally in Chrome Storage only
- No external transmission
- Clear in privacy policy/documentation

### Risk: Permission Requirements
**Mitigation**:
- `tabs` permission is standard for tab management
- `activeTab` permission allows screenshot capture without full `tabs` permission, but we need `tabs` anyway for listing
- Clearly communicate why permissions are needed

### Trade-off: Screenshot Quality vs Performance
- Higher quality screenshots look better but take longer
- Default to medium quality, allow user preference later if needed

## Migration Plan
- No migration needed (new feature)
- Existing functionality remains unchanged

## Open Questions
- Should screenshots update automatically when tabs change, or only on tab management page open?
- Should we support multiple windows or focus on current window initially?
- What should be the default keyboard shortcut? (Recommend: `Ctrl+Shift+T` or `Ctrl+Shift+M`)

