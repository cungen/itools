-- Fix infinite recursion in RLS policies
-- The issue is that policies on prompt_tags and prompt_variables use FOR ALL
-- which causes recursion when checking the prompts table during INSERT

-- Create a security definer function to check prompt ownership without RLS recursion
CREATE OR REPLACE FUNCTION check_prompt_ownership(prompt_id_param UUID)
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

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can manage tags for own prompts" ON prompt_tags;
DROP POLICY IF EXISTS "Users can manage variables for own prompts" ON prompt_variables;

-- Create separate policies for prompt_tags
-- INSERT policy: Users can insert tags for their own prompts
CREATE POLICY "Users can insert tags for own prompts"
  ON prompt_tags FOR INSERT
  WITH CHECK (check_prompt_ownership(prompt_tags.prompt_id));

-- UPDATE policy: Users can update tags for their own prompts
CREATE POLICY "Users can update tags for own prompts"
  ON prompt_tags FOR UPDATE
  USING (check_prompt_ownership(prompt_tags.prompt_id))
  WITH CHECK (check_prompt_ownership(prompt_tags.prompt_id));

-- DELETE policy: Users can delete tags for their own prompts
CREATE POLICY "Users can delete tags for own prompts"
  ON prompt_tags FOR DELETE
  USING (check_prompt_ownership(prompt_tags.prompt_id));

-- Create separate policies for prompt_variables
-- INSERT policy: Users can insert variables for their own prompts
CREATE POLICY "Users can insert variables for own prompts"
  ON prompt_variables FOR INSERT
  WITH CHECK (check_prompt_ownership(prompt_variables.prompt_id));

-- UPDATE policy: Users can update variables for their own prompts
CREATE POLICY "Users can update variables for own prompts"
  ON prompt_variables FOR UPDATE
  USING (check_prompt_ownership(prompt_variables.prompt_id))
  WITH CHECK (check_prompt_ownership(prompt_variables.prompt_id));

-- DELETE policy: Users can delete variables for their own prompts
CREATE POLICY "Users can delete variables for own prompts"
  ON prompt_variables FOR DELETE
  USING (check_prompt_ownership(prompt_variables.prompt_id));

