-- Fix infinite recursion in RLS policies for prompt_shares
-- The issue is that the "Users can view shared prompts" policy on prompts table
-- checks prompt_shares, which then has a policy that checks prompts again, causing recursion

-- Create a security definer function to check if a prompt is shared with the current user
-- This bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION check_prompt_shared_with_user(prompt_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM prompt_shares
    WHERE prompt_shares.prompt_id = prompt_id_param
    AND prompt_shares.shared_with = auth.uid()
  );
END;
$$;

-- Drop the problematic "Users can view shared prompts" policy
DROP POLICY IF EXISTS "Users can view shared prompts" ON prompts;

-- Recreate the policy using the security definer function to avoid recursion
CREATE POLICY "Users can view shared prompts"
  ON prompts FOR SELECT
  USING (check_prompt_shared_with_user(prompts.id));

-- Also fix the prompt_shares policies to avoid recursion
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view shares for accessible prompts" ON prompt_shares;
DROP POLICY IF EXISTS "Users can create shares for own prompts" ON prompt_shares;
DROP POLICY IF EXISTS "Users can delete shares for own prompts" ON prompt_shares;

-- Create a function to check if user owns a prompt (bypasses RLS)
CREATE OR REPLACE FUNCTION check_prompt_ownership_for_shares(prompt_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM prompts
    WHERE id = prompt_id_param
    AND user_id = auth.uid()
  );
END;
$$;

-- Recreate prompt_shares policies using security definer functions
-- Users can view shares where they are the sharer, sharee, or owner of the prompt
CREATE POLICY "Users can view shares for accessible prompts"
  ON prompt_shares FOR SELECT
  USING (
    shared_by = auth.uid()
    OR shared_with = auth.uid()
    OR check_prompt_ownership_for_shares(prompt_shares.prompt_id)
  );

-- Users can create shares for their own prompts
CREATE POLICY "Users can create shares for own prompts"
  ON prompt_shares FOR INSERT
  WITH CHECK (
    check_prompt_ownership_for_shares(prompt_shares.prompt_id)
    AND prompt_shares.shared_by = auth.uid()
  );

-- Users can delete shares for their own prompts
CREATE POLICY "Users can delete shares for own prompts"
  ON prompt_shares FOR DELETE
  USING (check_prompt_ownership_for_shares(prompt_shares.prompt_id));

