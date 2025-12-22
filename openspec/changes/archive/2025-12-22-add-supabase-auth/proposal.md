# Change: Add Supabase User Authentication

## Why
Users need a way to authenticate and maintain their identity across browser sessions and devices. Adding Supabase authentication will enable future features like syncing bookmarks, settings, and tab data across devices, as well as providing a foundation for user-specific features and data persistence.

## What Changes
- Add Supabase client integration for authentication
- Create login and signup UI components
- Implement session management with automatic token refresh
- Add authentication state management hooks
- Store authentication tokens securely in Chrome Storage
- Add authentication guard for protected features (future-ready)
- Configure Supabase project settings and environment variables

## Impact
- Affected specs: New `auth` capability
- Affected code:
  - New hook: `hooks/useAuth.ts`
  - New components: `components/LoginForm.tsx`, `components/SignupForm.tsx` (or combined `components/AuthForm.tsx`)
  - New entry point or modal: Authentication UI in newtab or popup
  - Configuration: Supabase client setup, environment variables
  - Dependencies: `@supabase/supabase-js` package
- Breaking changes: None (authentication is additive, existing features remain functional without login)

