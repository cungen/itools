# Supabase Migrations

## Running Migrations

To set up the database schema for the prompt management tool:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `001_create_prompts_tables.sql`
4. Run the migration

The migration will create:
- `prompts` table - stores prompt data
- `prompt_tags` table - stores hierarchical tags
- `prompt_variables` table - stores variable definitions
- `prompt_shares` table - stores sharing relationships
- All necessary indexes for performance
- Row Level Security (RLS) policies for data isolation

## Required Extensions

The migration enables the `pg_trgm` extension for efficient tag search. This should be available by default in Supabase.

## Verification

After running the migration, verify:
1. All tables are created
2. RLS policies are enabled
3. Indexes are created
4. The `update_updated_at_column()` trigger function exists

