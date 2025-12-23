## ADDED Requirements

### Requirement: Bookmark Database Schema
The system SHALL provide a Supabase database table for storing user bookmarks.

#### Scenario: Bookmarks table structure
- **WHEN** the database migration is executed
- **THEN** the system SHALL create a `bookmarks` table with columns: `id` (UUID), `user_id` (UUID), `bookmark_tree` (JSONB), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
- **AND** the table SHALL have a foreign key constraint on `user_id` referencing `auth.users(id)`
- **AND** the table SHALL have indexes on `user_id` and `updated_at` for query performance

#### Scenario: Row Level Security for bookmarks
- **WHEN** Row Level Security is enabled on the bookmarks table
- **THEN** users SHALL only be able to access their own bookmarks
- **AND** users SHALL only be able to insert, update, and delete their own bookmarks
- **AND** users SHALL NOT be able to access other users' bookmarks

### Requirement: Bookmark Loading in Extension Mode
The system SHALL load bookmarks from Chrome Bookmarks API when running in extension context.

#### Scenario: Load bookmarks from Chrome API
- **WHEN** the application is running in extension mode
- **THEN** the system SHALL use `chrome.bookmarks.getTree()` to fetch bookmarks
- **AND** the system SHALL display bookmarks from the "Bookmarks Bar" folder
- **AND** the system SHALL maintain the existing bookmark loading behavior

### Requirement: Bookmark File Upload
The system SHALL allow users to upload bookmark files in web mode.

#### Scenario: Upload HTML bookmark file
- **WHEN** user is in web mode and authenticated, and clicks to upload bookmarks
- **THEN** the system SHALL provide a file input that accepts HTML files
- **AND** the system SHALL validate the file is an HTML file
- **AND** the system SHALL parse the HTML file using Netscape bookmark format
- **AND** the system SHALL extract bookmark tree structure (folders, URLs, titles)
- **AND** the system SHALL store parsed bookmarks in Supabase database
- **AND** the system SHALL associate bookmarks with the authenticated user
- **AND** the system SHALL display the bookmarks in the Launchpad interface

#### Scenario: Upload CSV bookmark file
- **WHEN** user is in web mode and authenticated, and clicks to upload bookmarks
- **THEN** the system SHALL provide a file input that accepts CSV files
- **AND** the system SHALL validate the file is a CSV file
- **AND** the system SHALL parse the CSV file (expecting columns: title, URL, folder path)
- **AND** the system SHALL build bookmark tree from flat CSV structure
- **AND** the system SHALL store parsed bookmarks in Supabase database
- **AND** the system SHALL associate bookmarks with the authenticated user
- **AND** the system SHALL display the bookmarks in the Launchpad interface

#### Scenario: File upload validation
- **WHEN** user attempts to upload a file
- **THEN** the system SHALL validate file type (HTML or CSV)
- **AND** the system SHALL validate file size (maximum 10MB)
- **AND** if validation fails, the system SHALL display an error message
- **AND** the system SHALL NOT process invalid files

#### Scenario: Bookmark upload error handling
- **WHEN** bookmark file parsing fails
- **THEN** the system SHALL display an error message to the user
- **AND** the system SHALL indicate the file format may be invalid
- **AND** the system SHALL allow the user to try uploading a different file

### Requirement: Bookmark Persistence in Web Mode
The system SHALL persist uploaded bookmarks in Supabase database for cross-device access and session persistence.

#### Scenario: Store bookmarks in Supabase
- **WHEN** bookmarks are successfully parsed from uploaded file and user is authenticated
- **THEN** the system SHALL store the bookmark tree as JSONB in Supabase `bookmarks` table
- **AND** the system SHALL associate bookmarks with the authenticated user via `user_id`
- **AND** the system SHALL update the `updated_at` timestamp
- **AND** the system SHALL handle Supabase errors gracefully

#### Scenario: Load bookmarks from Supabase
- **WHEN** the application loads in web mode and user is authenticated
- **THEN** the system SHALL query Supabase for the user's bookmarks
- **AND** if bookmarks exist, the system SHALL load and display them
- **AND** if no bookmarks exist, the system SHALL show the upload UI
- **AND** the system SHALL handle authentication errors gracefully

#### Scenario: Replace stored bookmarks
- **WHEN** authenticated user wants to replace bookmarks with a new file
- **THEN** the system SHALL allow uploading a new file
- **AND** the system SHALL replace existing bookmarks in Supabase with new ones
- **AND** the system SHALL update the `updated_at` timestamp
- **AND** the system SHALL maintain data isolation per user (RLS policies)

#### Scenario: Bookmark access requires authentication
- **WHEN** user is in web mode and not authenticated
- **THEN** the system SHALL prompt the user to sign in
- **AND** the system SHALL NOT allow bookmark upload until authenticated
- **AND** the system SHALL NOT load bookmarks from Supabase until authenticated

### Requirement: Bookmark Upload UI
The system SHALL provide a user interface for uploading bookmark files in web mode.

#### Scenario: Display upload UI when no bookmarks
- **WHEN** user is in web mode, authenticated, and no bookmarks are loaded
- **THEN** the system SHALL display a bookmark upload interface
- **AND** the interface SHALL include a file input for HTML and CSV files
- **AND** the interface SHALL provide instructions on how to export bookmarks from browsers
- **AND** the interface SHALL be prominently displayed on the newtab page

#### Scenario: Display authentication prompt for bookmarks
- **WHEN** user is in web mode and not authenticated
- **THEN** the system SHALL display a message prompting the user to sign in to access bookmarks
- **AND** the system SHALL provide a sign in button or link
- **AND** the system SHALL NOT show the bookmark upload interface until authenticated

#### Scenario: Upload progress feedback
- **WHEN** user uploads a bookmark file
- **THEN** the system SHALL show upload progress indicator
- **AND** the system SHALL show parsing progress
- **AND** upon success, the system SHALL display a success message
- **AND** upon error, the system SHALL display an error message

