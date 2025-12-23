## Context
The extension currently uses Tailwind CSS with custom CSS classes for styling. While this works, it requires manual implementation of common UI patterns and lacks consistency. The project needs a UI framework that:
- Works seamlessly with Tailwind CSS (already in use)
- Provides accessible, beautiful components out of the box
- Is compatible with React 18.2.0 and TypeScript
- Works well in browser extension contexts (Plasmo framework)
- Allows easy customization to match existing design aesthetic

## Goals / Non-Goals

### Goals
- Integrate shadcn/ui as the default UI component library
- Replace manual UI implementations with shadcn/ui components across all surfaces
- Maintain existing functionality while improving visual consistency
- Preserve the current glassmorphism and backdrop-blur aesthetic where appropriate
- Ensure all components are accessible (WCAG compliant)

### Non-Goals
- Complete redesign of the extension UI (this is a framework integration, not a redesign)
- Removing Tailwind CSS (shadcn/ui works with Tailwind)
- Changing the overall design language (glassmorphism, dark theme, etc.)
- Adding new features beyond UI improvements

## Decisions

### Decision: Use shadcn/ui
**Rationale**:
- Built on Radix UI (headless, accessible primitives)
- Works perfectly with Tailwind CSS (no conflicts)
- Component-based approach (copy components into project, not a dependency)
- Highly customizable via Tailwind classes and CSS variables
- Very popular and well-maintained
- Works well in browser extensions (used in Plasmo starter templates)

**Alternatives considered**:
- **Radix UI directly**: More control but requires building all components from scratch
- **Headless UI**: Similar to Radix but less popular, fewer examples
- **Chakra UI / Mantine**: Full component libraries but may conflict with Tailwind CSS
- **Material UI**: Too opinionated, conflicts with existing design aesthetic

### Decision: Install components incrementally
**Rationale**:
- Start with core components needed for current surfaces (Button, Input, Select, Card, Dialog)
- Add more components as needed rather than installing everything upfront
- Keeps bundle size smaller and allows gradual migration

**Components to install initially**:
- `button` - For all buttons (auth, actions, etc.)
- `input` - For search inputs and form fields
- `select` - For dropdowns (theme, grid size)
- `card` - For extension items, tool cards
- `dialog` - For modals (auth form, tool modals)
- `label` - For form labels
- `separator` - For visual dividers

### Decision: Preserve existing design tokens
**Rationale**:
- Current CSS variables (`--bg-color`, `--text-color`, `--accent-color`) align with shadcn/ui's theming system
- Map existing variables to shadcn/ui theme tokens
- Maintain dark theme aesthetic with glassmorphism effects

### Decision: Component location structure
**Rationale**:
- Place shadcn/ui components in `components/ui/` directory
- Follow shadcn/ui conventions (one component per file/folder)
- Keep existing components in `components/` root level

## Risks / Trade-offs

### Risk: Bundle size increase
**Mitigation**:
- shadcn/ui components are tree-shakeable
- Only install components that are actually used
- Radix UI primitives are relatively lightweight

### Risk: Style conflicts with existing CSS
**Mitigation**:
- shadcn/ui uses Tailwind classes, which can be overridden
- Custom CSS in `style.css` can be adjusted if needed
- Test each surface after migration

### Risk: Learning curve for team
**Mitigation**:
- shadcn/ui has excellent documentation
- Components are copy-paste, easy to understand
- Similar patterns to existing Tailwind usage

### Trade-off: Less control vs. faster development
- **Less control**: Using pre-built components means less customization flexibility
- **Faster development**: Don't need to build common patterns from scratch
- **Decision**: Accept less control for faster, more consistent UI development

## Migration Plan

### Phase 1: Setup
1. Install shadcn/ui CLI and dependencies
2. Configure Tailwind for shadcn/ui (theme tokens, CSS variables)
3. Install core components (button, input, select, card, dialog, label)

### Phase 2: New Tab Page
1. Replace search input with shadcn/ui Input
2. Replace auth buttons with shadcn/ui Button
3. Replace auth modal with shadcn/ui Dialog

### Phase 3: Extension Manager Popup
1. Replace search input with shadcn/ui Input
2. Replace extension items with shadcn/ui Card
3. Replace action buttons with shadcn/ui Button

### Phase 4: Settings Page
1. Replace form inputs with shadcn/ui Input
2. Replace selects with shadcn/ui Select
3. Replace labels with shadcn/ui Label
4. Replace sections with shadcn/ui Card

### Phase 5: Tools Section
1. Replace tool cards with shadcn/ui Card
2. Replace modal with shadcn/ui Dialog
3. Replace buttons with shadcn/ui Button

### Rollback Plan
- All changes are additive (new components, modified styling)
- Can revert by removing shadcn/ui components and restoring original implementations
- Git history preserves all previous code

## Open Questions
- Should we create a custom theme variant for the extension's dark aesthetic?
- Do we need to support light theme for settings page, or keep dark theme throughout?
- Should we create wrapper components that combine shadcn/ui components with extension-specific styling?

