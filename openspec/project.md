# Project Context

## Purpose
A Chrome extension that provides a beautiful, customizable New Tab experience with bookmark management and extension management capabilities. The extension features:

- **Custom New Tab Page**: Displays bookmarks in a macOS Launchpad-style grid interface with folder support
- **Extension Manager Popup**: Quick access to enable/disable, uninstall, and manage Chrome extensions
- **Settings Page**: Configure theme, wallpaper, and grid size preferences

The project aims to create a modern, visually appealing alternative to the default Chrome new tab page while providing useful browser management tools.

## Tech Stack
- **Framework**: Plasmo 0.90.5 (Chrome extension framework)
- **UI Library**: React 18.2.0 with React DOM
- **Language**: TypeScript 5.3.3
- **Animations**: Framer Motion 12.23.26
- **Icons**: Lucide React 0.561.0
- **Styling**: Tailwind CSS (preferred) with custom CSS for complex components
- **Package Manager**: pnpm
- **Build Tool**: Plasmo (handles bundling and manifest generation)
- **Chrome APIs**: bookmarks, management, storage, favicon

## Project Conventions

### Code Style
- **Formatting**: Prettier with the following rules:
  - Print width: 80 characters
  - Tab width: 2 spaces (no tabs)
  - No semicolons
  - Double quotes for strings
  - No trailing commas
  - Bracket spacing enabled
  - Bracket same line enabled
- **Import Sorting**: Uses `@ianvs/prettier-plugin-sort-imports` with ordered groups:
  1. Node.js built-in modules
  2. Third-party modules
  3. Plasmo modules (`@plasmo/*`)
  4. Plasmohq modules (`@plasmohq/*`)
  5. Local aliases (`~*`)
  6. Relative imports (`./`, `../`)
- **Naming Conventions**:
  - Components: PascalCase (e.g., `Launchpad`, `AppIcon`)
  - Hooks: camelCase with `use` prefix (e.g., `useBookmarks`, `useExtensions`)
  - Files: Match component/hook names (PascalCase for components, camelCase for hooks)
  - Interfaces: PascalCase (e.g., `BookmarkNode`, `ExtensionInfo`)
  - CSS classes: kebab-case (e.g., `app-icon-container`, `popup-header`)

### Architecture Patterns
- **Component Structure**:
  - Entry points at root: `newtab.tsx`, `popup.tsx`, `options.tsx`
  - Reusable components in `/components`
  - Custom hooks in `/hooks` for data fetching and state management
  - Shared styles in `style.css` (global stylesheet for complex custom styles)
- **Styling Approach**:
  - **Primary**: Use Tailwind CSS utility classes for styling (preferred approach)
  - **Secondary**: Custom CSS classes in `style.css` for complex component-specific styles (e.g., glassmorphism effects, complex animations, backdrop filters)
  - Mix Tailwind utilities with custom classes when needed
- **React Patterns**:
  - Functional components exclusively
  - Custom hooks for Chrome API interactions and state management
  - Props interfaces defined inline or imported from hooks
  - State management via React hooks (`useState`, `useEffect`)
- **Chrome Extension Patterns**:
  - Graceful fallbacks with mock data for development outside extension context
  - Type checking for Chrome API availability (`typeof chrome !== "undefined"`)
  - Event listeners for Chrome API changes (e.g., extension management events)
- **Path Aliases**:
  - `~*` maps to project root (configured in `tsconfig.json`)
  - Use for importing from root-level files

### Testing Strategy
Currently no testing infrastructure is set up. Testing strategy to be determined.

### Git Workflow
Git workflow conventions not yet established. To be defined.

## Domain Context
- **Chrome Extension Manifest V3**: The project uses Plasmo which generates Manifest V3 extensions
- **Bookmark Structure**: Chrome bookmarks are hierarchical trees. The root node typically has children: "Bookmarks Bar" (id "1"), "Other Bookmarks" (id "2"), "Mobile Bookmarks" (id "3"). The extension primarily displays contents of the "Bookmarks Bar".
- **Extension Management**: Uses Chrome Management API to list, enable/disable, and uninstall extensions. Filters out themes and the extension itself from the list.
- **Favicon Access**: Uses Chrome's favicon API via `chrome-extension://${chrome.runtime.id}/_favicon/` endpoint
- **Launchpad UI**: Inspired by macOS Launchpad with grid layout, folder overlays, and glassmorphism styling
- **Settings Storage**: Uses Chrome Storage API (via Plasmo) for persisting user preferences

## Important Constraints
- **Chrome Extension APIs**: Must check for API availability before use (`typeof chrome !== "undefined"`)
- **Manifest Permissions**: Required permissions include `bookmarks`, `management`, `favicon`, `storage`, and `host_permissions` for `https://*/*`
- **Extension Context**: Some features require running within the extension context (not just as a web page)
- **Browser Compatibility**: Targets Chrome/Chromium browsers (Chrome Extension APIs)
- **Build Output**: Plasmo generates builds in `/build` directory with platform-specific subdirectories (e.g., `chrome-mv3-dev`)

## External Dependencies
- **Plasmo Framework**: Handles extension bundling, manifest generation, and development server
- **Chrome Extension APIs**:
  - `chrome.bookmarks`: For fetching and managing bookmarks
  - `chrome.management`: For extension management operations
  - `chrome.storage`: For persisting user settings
  - `chrome.runtime`: For extension metadata (e.g., extension ID)
  - `chrome.tabs`: For opening new tabs (e.g., extension details page)
- **Framer Motion**: Used for animations (e.g., folder overlay transitions)
- **Lucide React**: Icon library for UI elements
- **Tailwind CSS**: Utility-first CSS framework for styling (preferred for new components)
