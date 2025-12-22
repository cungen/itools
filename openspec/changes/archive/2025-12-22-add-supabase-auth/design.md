# Design: Supabase Authentication Integration

## Context
This Chrome extension currently operates without user authentication. All data (bookmarks, settings, tab screenshots) is stored locally in Chrome Storage. Adding Supabase authentication will enable future cloud sync capabilities and user-specific features.

## Goals / Non-Goals

### Goals
- Enable users to sign up and log in using Supabase Auth
- Maintain secure session state across browser restarts
- Provide a clean, non-intrusive authentication UI
- Support email/password authentication (most common use case)
- Gracefully handle authentication errors and edge cases
- Store authentication tokens securely in Chrome Storage

### Non-Goals
- Social login providers (OAuth) in initial implementation
- Password reset flows (can be added later)
- Multi-factor authentication (can be added later)
- User profile management UI (can be added later)
- Cloud sync of bookmarks/settings (future feature, not in scope)
- Requiring authentication to use basic features (auth is optional initially)

## Decisions

### Decision: Use Supabase Auth with Email/Password
**Rationale**: Supabase provides a managed authentication service that handles user management, JWT tokens, and session management. Email/password is the simplest and most universal authentication method.

**Alternatives considered**:
- Firebase Auth: Similar features but Supabase has better TypeScript support and simpler API
- Custom auth server: Too much overhead for this use case
- Chrome Identity API: Limited to Google accounts only, not suitable for cross-platform use

### Decision: Store Session in Chrome Storage
**Rationale**: Chrome Storage persists across browser restarts and is accessible from all extension contexts (background, popup, newtab). We'll store the access token and refresh token securely.

**Alternatives considered**:
- In-memory only: Would require re-authentication on every browser restart
- IndexedDB: More complex, Chrome Storage is sufficient for tokens

### Decision: Optional Authentication (Not Required for Basic Features)
**Rationale**: Users should be able to use the extension's core features (bookmarks, tab management) without authentication. Authentication enables future sync features but doesn't block existing functionality.

**Alternatives considered**:
- Require authentication: Would create friction for users who just want local features
- Separate authenticated/unauthenticated modes: Adds complexity, optional auth is simpler

### Decision: Authentication UI in New Tab Page
**Rationale**: The new tab page is the primary interface users interact with. Adding a login prompt or auth status indicator here makes sense. Users can authenticate when they want to enable sync features.

**Alternatives considered**:
- Popup-only: Less visible, users might miss it
- Separate auth page: Adds navigation complexity
- Settings page: Less discoverable

### Decision: Use Supabase Client Singleton Pattern
**Rationale**: Create a single Supabase client instance that can be imported across the extension. This ensures consistent configuration and efficient connection management.

**Implementation**: Create `lib/supabase.ts` with a singleton client instance.

## Risks / Trade-offs

### Risk: Token Security in Chrome Storage
**Mitigation**: Chrome Storage is encrypted at rest by Chrome. We'll store only tokens, not passwords. Consider using `chrome.storage.local` (more secure than `sync`) for sensitive data, though sync storage is encrypted too.

### Risk: Network Dependency
**Mitigation**: Authentication requires network, but we'll handle offline scenarios gracefully. Core features remain functional without authentication.

### Risk: Supabase Project Configuration
**Mitigation**: Document environment variable setup clearly. Use `.env` files for local development and Plasmo's environment variable handling for builds.

### Trade-off: Initial Complexity vs Future Flexibility
**Decision**: Accept initial setup complexity (Supabase integration) to enable future cloud features. The authentication layer is a foundation for sync, user preferences, and multi-device support.

## Migration Plan

### Phase 1: Setup (No User Impact)
- Install Supabase client library
- Configure Supabase project and environment variables
- Create authentication hooks and utilities

### Phase 2: UI Implementation
- Add authentication forms (login/signup)
- Integrate auth UI into new tab page
- Add auth state indicators

### Phase 3: Session Management
- Implement token refresh logic
- Handle session persistence across restarts
- Add logout functionality

### Rollback Plan
- If issues arise, authentication can be disabled via feature flag
- Existing local features continue to work without auth
- No data migration needed (auth is additive)

## Open Questions

1. **Supabase Project Setup**: Does the user have a Supabase project already, or should we provide setup instructions?
   - **Resolution**: Include setup instructions in tasks.md and README

2. **Authentication Flow**: Should we show auth UI immediately on new tab, or only when user tries to access sync features?
   - **Decision**: Show auth status indicator, but make login optional. User can click to authenticate when ready.

3. **Token Refresh Strategy**: How often should we refresh tokens? Should we use Supabase's built-in refresh or implement custom logic?
   - **Decision**: Use Supabase's automatic token refresh via `onAuthStateChange` listener

4. **Error Handling**: How should we surface authentication errors to users?
   - **Decision**: Show inline error messages in auth forms, use toast notifications for session errors

