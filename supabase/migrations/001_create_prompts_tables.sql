-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  emoji TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prompt_tags table
CREATE TABLE IF NOT EXISTS prompt_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  tag_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, tag_path)
);

-- Create prompt_variables table
CREATE TABLE IF NOT EXISTS prompt_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('string', 'number', 'enum', 'prompt')),
  config JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, name)
);

-- Create prompt_shares table
CREATE TABLE IF NOT EXISTS prompt_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, shared_with)
);

-- Enable pg_trgm extension for tag search (if not already enabled)
-- Note: This may require superuser privileges. If it fails, contact Supabase support.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable pg_trgm extension for tag search (if not already enabled)
-- Note: In Supabase, this extension is usually already enabled.
-- If you get an error, the extension may need to be enabled by a superuser.
-- You can skip this line if the extension is already enabled.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_updated_at ON prompts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_prompt_id ON prompt_tags(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag_path ON prompt_tags(tag_path);
-- Note: For hierarchical tag searches (e.g., #a/b/c searchable by #a, #a/b, etc.),
-- a regular B-tree index on tag_path works well for prefix searches with LIKE.
-- The GIN index with trigram is optional and only needed for fuzzy matching.
-- Commented out to avoid extension dependency issues:
-- CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag_path_prefix ON prompt_tags USING gin(tag_path gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prompt_variables_prompt_id ON prompt_variables(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_shares_prompt_id ON prompt_shares(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_shares_shared_with ON prompt_shares(shared_with);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for prompts table
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_shares ENABLE ROW LEVEL SECURITY;

-- Prompts policies
-- Users can view their own prompts
CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public prompts
CREATE POLICY "Users can view public prompts"
  ON prompts FOR SELECT
  USING (is_public = TRUE);

-- Users can view shared prompts
CREATE POLICY "Users can view shared prompts"
  ON prompts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prompt_shares
      WHERE prompt_shares.prompt_id = prompts.id
      AND prompt_shares.shared_with = auth.uid()
    )
  );

-- Users can insert their own prompts
CREATE POLICY "Users can insert own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prompts
CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own prompts
CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  USING (auth.uid() = user_id);

-- Prompt tags policies
CREATE POLICY "Users can view tags for accessible prompts"
  ON prompt_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_tags.prompt_id
      AND (
        prompts.user_id = auth.uid()
        OR prompts.is_public = TRUE
        OR EXISTS (
          SELECT 1 FROM prompt_shares
          WHERE prompt_shares.prompt_id = prompts.id
          AND prompt_shares.shared_with = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage tags for own prompts"
  ON prompt_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_tags.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

-- Prompt variables policies
CREATE POLICY "Users can view variables for accessible prompts"
  ON prompt_variables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_variables.prompt_id
      AND (
        prompts.user_id = auth.uid()
        OR prompts.is_public = TRUE
        OR EXISTS (
          SELECT 1 FROM prompt_shares
          WHERE prompt_shares.prompt_id = prompts.id
          AND prompt_shares.shared_with = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage variables for own prompts"
  ON prompt_variables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_variables.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

-- Prompt shares policies
CREATE POLICY "Users can view shares for accessible prompts"
  ON prompt_shares FOR SELECT
  USING (
    shared_by = auth.uid()
    OR shared_with = auth.uid()
    OR EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_shares.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for own prompts"
  ON prompt_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_shares.prompt_id
      AND prompts.user_id = auth.uid()
      AND prompt_shares.shared_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete shares for own prompts"
  ON prompt_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_shares.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

