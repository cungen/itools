# Change: Add Chrome Tab Management Functionality

## Why
Users need a visual way to manage their open Chrome tabs, similar to Safari's tab management interface. Currently, users must rely on the default Chrome tab bar which becomes unwieldy with many tabs open. A grid card view with content previews will make it easier to identify, navigate, and manage tabs.

## What Changes
- Add a new tab management page accessible via keyboard shortcut
- Display all open tabs in a Safari-style grid card layout
- Show content preview images (screenshots) for each tab
- Allow users to switch to, close, and manage tabs from the grid view
- Add keyboard shortcut configuration for quick access

## Impact
- Affected specs: New `tab-management` capability
- Affected code:
  - New component: `components/TabManager.tsx` (grid view)
  - New component: `components/TabCard.tsx` (individual tab card)
  - New hook: `hooks/useTabs.ts` (Chrome tabs API integration)
  - New hook: `hooks/useTabScreenshots.ts` (screenshot capture and caching)
  - New entry point: `tabmanager.tsx` (tab management page)
  - Manifest updates: Add `tabs` permission, `commands` for shortcuts, `activeTab` for screenshots
  - Style updates: Add tab management grid styles to `style.css` or Tailwind classes

