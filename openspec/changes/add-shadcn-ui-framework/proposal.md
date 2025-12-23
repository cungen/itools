# Change: Add shadcn/ui Framework for Enhanced UI

## Why
The extension currently uses a mix of Tailwind CSS utility classes and custom CSS for UI components. While functional, this approach requires manual styling for common UI patterns (buttons, inputs, dialogs, cards, etc.) and lacks consistency across different surfaces (newtab, popup, settings, tools). Integrating shadcn/ui will provide:

- **Consistent, beautiful components** out of the box with minimal configuration
- **Accessibility built-in** via Radix UI primitives
- **Tailwind CSS compatibility** (no conflicts with existing styling approach)
- **Component-based architecture** that aligns with React best practices
- **Easy customization** through Tailwind classes and CSS variables

This will improve the visual quality and user experience across all extension surfaces while reducing maintenance burden.

## What Changes
- **ADDED**: shadcn/ui framework integration with core components (Button, Input, Select, Card, Dialog, etc.)
- **MODIFIED**: New Tab page (`newtab.tsx`) to use shadcn/ui components for search input, auth buttons, and modals
- **MODIFIED**: Extension Manager popup (`popup.tsx`, `ExtensionManager.tsx`) to use shadcn/ui components for search, extension cards, and action buttons
- **MODIFIED**: Settings page (`options.tsx`) to use shadcn/ui components for form controls, labels, and sections
- **MODIFIED**: Tools section (`ToolsSection.tsx`) to use shadcn/ui components for tool cards and modals
- **MODIFIED**: Tailwind configuration to include shadcn/ui theme tokens and CSS variables
- **ADDED**: Component library structure under `components/ui/` for shadcn/ui components

## Impact
- **Affected specs**: New capability `ui-framework` added
- **Affected code**:
  - `newtab.tsx` - Search input, auth UI, modals
  - `popup.tsx` - Popup container styling
  - `options.tsx` - Settings form components
  - `components/ExtensionManager.tsx` - Extension list and search
  - `components/ToolsSection.tsx` - Tool cards and modals
  - `tailwind.config.js` - Theme configuration
  - `style.css` - CSS variable definitions for shadcn/ui theme
  - New: `components/ui/` directory for shadcn/ui components
- **Dependencies**:
  - `@radix-ui/react-*` packages (installed via shadcn/ui CLI)
  - `class-variance-authority` for component variants
  - `clsx` and `tailwind-merge` for className utilities
- **Breaking changes**: None - existing functionality preserved, only visual/styling improvements

