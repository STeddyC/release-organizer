/*
  # Modify user_id column type

  1. Changes
    - Drop existing RLS policies first
    - Remove foreign key constraint
    - Change user_id column type from UUID to TEXT to support Firebase Auth IDs
    - Recreate RLS policies with text type
  
  2. Security
    - Maintain same security model with updated column type
    - Ensure policies work with Firebase Auth IDs
*/

-- First drop all policies that depend on the user_id column
DROP POLICY IF EXISTS "Users can create releases" ON releases;
DROP POLICY IF EXISTS "Users can read own releases" ON releases;
DROP POLICY IF EXISTS "Users can update own releases" ON releases;
DROP POLICY IF EXISTS "Users can delete own releases" ON releases;

-- Drop the foreign key constraint
ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_user_id_fkey;

-- Modify the column type
ALTER TABLE releases 
  ALTER COLUMN user_id TYPE text;

-- Recreate the policies with text type
CREATE POLICY "Users can create releases"
  ON releases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can read own releases"
  ON releases FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own releases"
  ON releases FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own releases"
  ON releases FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);