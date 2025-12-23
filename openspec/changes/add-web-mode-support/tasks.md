## 1. Environment Detection
- [x] 1.1 Create `hooks/useEnvironment.ts` hook to detect extension vs web context
- [x] 1.2 Add environment detection logic (check for `chrome.runtime.id`)
- [x] 1.3 Export `isExtension` and `isWeb` boolean flags
- [ ] 1.4 Test hook in both extension and web contexts

## 2. Bookmark File Upload UI
- [x] 2.1 Create `components/BookmarkUpload.tsx` component
- [x] 2.2 Add file input for HTML and CSV files
- [x] 2.3 Add file validation (file type, size limits)
- [x] 2.4 Add upload progress indicator
- [x] 2.5 Add success/error feedback messages
- [x] 2.6 Integrate upload component into newtab page (show when no bookmarks in web mode)

## 3. HTML Bookmark Parser
- [x] 3.1 Create `lib/bookmarkParsers.ts` utility file
- [x] 3.2 Implement HTML (Netscape format) bookmark parser
- [x] 3.3 Parse bookmark tree structure from HTML
- [x] 3.4 Handle nested folders
- [x] 3.5 Extract URLs, titles, and folder hierarchy
- [x] 3.6 Convert to `BookmarkNode` format
- [x] 3.7 Add error handling for malformed HTML

## 4. CSV Bookmark Parser
- [x] 4.1 Implement CSV bookmark parser in `lib/bookmarkParsers.ts`
- [x] 4.2 Parse CSV format (title, URL, folder path)
- [x] 4.3 Build bookmark tree from flat CSV structure
- [x] 4.4 Handle folder hierarchy from CSV paths
- [x] 4.5 Convert to `BookmarkNode` format
- [x] 4.6 Add error handling for malformed CSV

## 5. Bookmark Database Schema
- [x] 5.1 Create Supabase migration file `supabase/migrations/004_create_bookmarks_table.sql`
- [x] 5.2 Define `bookmarks` table schema (id, user_id, bookmark_tree JSONB, created_at, updated_at)
- [x] 5.3 Add foreign key constraint to `auth.users(id)`
- [x] 5.4 Create indexes on `user_id` and `updated_at`
- [x] 5.5 Enable Row Level Security (RLS) on bookmarks table
- [x] 5.6 Create RLS policies: users can only access their own bookmarks
- [x] 5.7 Add `updated_at` trigger function for bookmarks table
- [ ] 5.8 Test migration in Supabase SQL Editor

## 6. Bookmark Supabase Integration
- [x] 6.1 Create `hooks/useBookmarksSupabase.ts` hook for Supabase operations
- [x] 6.2 Implement function to save bookmarks to Supabase
- [x] 6.3 Implement function to load bookmarks from Supabase
- [x] 6.4 Implement function to update bookmarks in Supabase
- [x] 6.5 Add error handling for Supabase operations
- [x] 6.6 Add loading states for Supabase queries
- [x] 6.7 Handle authentication errors gracefully

## 7. Update useBookmarks Hook
- [x] 7.1 Modify `hooks/useBookmarks.ts` to check environment
- [x] 7.2 Use Chrome Bookmarks API when `isExtension === true`
- [x] 7.3 Use Supabase/bookmark upload when `isWeb === true`
- [x] 7.4 Integrate `useBookmarksSupabase` hook for web mode
- [x] 7.5 Add function to update bookmarks from file upload (save to Supabase)
- [x] 7.6 Require authentication for bookmark operations in web mode
- [x] 7.7 Maintain backward compatibility with extension mode
- [ ] 7.8 Test bookmark loading in both modes

## 8. Conditional Tools Rendering
- [x] 8.1 Update `components/ToolsSection.tsx` to use environment detection
- [x] 8.2 Filter tools list based on `isExtension` flag
- [x] 8.3 Hide Extension Manager tool in web mode
- [x] 8.4 Hide Tab Manager tool in web mode
- [x] 8.5 Keep Prompt Manager and other tools visible in both modes
- [ ] 8.6 Test tools visibility in both extension and web modes

## 9. Newtab Page Updates
- [x] 9.1 Update `newtab.tsx` to work as homepage in web mode
- [x] 9.2 Show bookmark upload UI when no bookmarks available (web mode)
- [x] 9.3 Ensure all features work correctly in web mode
- [ ] 9.4 Test newtab page in both extension and web contexts

## 10. Web Build Configuration
- [x] 10.1 Add Vite configuration for web build (or similar)
- [x] 10.2 Configure entry point (newtab.tsx as homepage)
- [x] 10.3 Configure build output for web deployment
- [x] 10.4 Add build script for web in `package.json`
- [ ] 10.5 Test web build process
- [ ] 10.6 Update deployment documentation

## 11. Testing and Validation
- [ ] 11.1 Test bookmark upload with HTML files (various browsers)
- [ ] 11.2 Test bookmark upload with CSV files
- [ ] 11.3 Test bookmark persistence in Supabase (web mode)
- [ ] 11.4 Test bookmark loading from Supabase on page reload (web mode)
- [ ] 11.5 Test bookmark access requires authentication (web mode)
- [ ] 11.6 Test RLS policies prevent cross-user bookmark access
- [ ] 11.7 Test extension mode still works correctly
- [ ] 11.8 Test tools visibility in both modes
- [ ] 11.9 Test newtab page as homepage in web mode
- [ ] 11.10 Verify no Chrome API calls in web mode
- [ ] 11.11 Test error handling for invalid file formats
- [ ] 11.12 Test error handling for Supabase connection issues

