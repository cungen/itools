## 1. Setup and Configuration
- [x] 1.1 Install shadcn/ui CLI and initialize configuration
- [x] 1.2 Install required dependencies (@radix-ui packages, class-variance-authority, clsx, tailwind-merge)
- [x] 1.3 Configure Tailwind config with shadcn/ui theme tokens and CSS variables
- [x] 1.4 Update `style.css` with shadcn/ui CSS variable definitions
- [x] 1.5 Create `components/ui/` directory structure
- [x] 1.6 Install core shadcn/ui components: button, input, select, card, dialog, label, separator

## 2. New Tab Page Migration
- [x] 2.1 Replace search input with shadcn/ui Input component
- [x] 2.2 Replace auth status buttons with shadcn/ui Button components
- [x] 2.3 Replace auth form modal with shadcn/ui Dialog component
- [x] 2.4 Test search functionality and auth flow
- [x] 2.5 Verify visual consistency with existing design

## 3. Extension Manager Popup Migration
- [x] 3.1 Replace search input with shadcn/ui Input component
- [x] 3.2 Replace extension items with shadcn/ui Card components
- [x] 3.3 Replace action buttons (pin, toggle, delete) with shadcn/ui Button components
- [x] 3.4 Update popup container styling to work with shadcn/ui components
- [x] 3.5 Test extension management functionality (enable/disable, uninstall, search)
- [x] 3.6 Verify visual consistency and accessibility

## 4. Settings Page Migration
- [x] 4.1 Replace form inputs with shadcn/ui Input components
- [x] 4.2 Replace select dropdowns with shadcn/ui Select components
- [x] 4.3 Replace labels with shadcn/ui Label components
- [x] 4.4 Replace settings sections with shadcn/ui Card components
- [x] 4.5 Test all settings functionality (theme, wallpaper, grid size)
- [x] 4.6 Verify form validation and user feedback

## 5. Tools Section Migration
- [x] 5.1 Replace tool cards with shadcn/ui Card components
- [x] 5.2 Replace tool modal with shadcn/ui Dialog component
- [x] 5.3 Replace close buttons with shadcn/ui Button components
- [x] 5.4 Test tool opening/closing functionality
- [x] 5.5 Verify visual consistency with newtab page

## 6. Testing and Validation
- [x] 6.1 Test all UI surfaces in Chrome extension context
- [x] 6.2 Verify accessibility (keyboard navigation, screen readers)
- [x] 6.3 Check responsive behavior on different screen sizes
- [x] 6.4 Verify dark theme consistency across all surfaces
- [x] 6.5 Test with existing functionality (bookmarks, extensions, settings)
- [x] 6.6 Check bundle size impact

## 7. Cleanup
- [x] 7.1 Remove unused custom CSS classes that are replaced by shadcn/ui
- [x] 7.2 Update component imports to use shadcn/ui components
- [x] 7.3 Document component usage patterns for future development
- [x] 7.4 Verify no regressions in existing features

