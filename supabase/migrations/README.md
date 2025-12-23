# Supabase Migrations

## Running Migrations

To set up the database schema for the prompt management tool:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run migrations in order:
   - `001_create_prompts_tables.sql` - Creates all tables, indexes, and initial RLS policies
   - `002_fix_rls_recursion.sql` - Fixes infinite recursion in prompt_tags and prompt_variables policies
   - `003_fix_prompt_shares_rls_recursion.sql` - Fixes infinite recursion in prompt_shares policies

**Important**: Run all three migrations in order. The later migrations fix RLS recursion issues that would prevent queries from working.

The migrations will create:
- `prompts` table - stores prompt data
- `prompt_tags` table - stores hierarchical tags
- `prompt_variables` table - stores variable definitions
- `prompt_shares` table - stores sharing relationships
- All necessary indexes for performance
- Row Level Security (RLS) policies for data isolation
- Security definer functions to prevent RLS recursion

## Required Extensions

The migration enables the `pg_trgm` extension for efficient tag search. This should be available by default in Supabase.

## Verification

After running all migrations, verify:
1. All tables are created
2. RLS policies are enabled
3. Indexes are created
4. The `update_updated_at_column()` trigger function exists
5. Security definer functions exist:
   - `check_prompt_ownership()`
   - `check_prompt_shared_with_user()`
   - `check_prompt_ownership_for_shares()`

## Troubleshooting

If you encounter "infinite recursion detected in policy" errors:
- Make sure you've run all three migrations in order
- Verify that the security definer functions exist
- Check that the policies reference the functions correctly

