/*
  # Fix RLS and storage policies

  1. Changes
    - Update RLS policies to use auth.uid()::uuid for user comparison
    - Ensure storage bucket exists and is public
    - Fix storage policies to handle user-specific folders
    - Add proper type casting for all comparisons

  2. Security
    - Maintain row-level security for releases table
    - Configure proper storage access controls
    - Ensure users can only access their own data
*/

-- Create artworks bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Update releases table RLS policies
DROP POLICY IF EXISTS "Users can create releases" ON releases;
DROP POLICY IF EXISTS "Users can read own releases" ON releases;
DROP POLICY IF EXISTS "Users can update own releases" ON releases;
DROP POLICY IF EXISTS "Users can delete own releases" ON releases;

CREATE POLICY "Users can create releases"
ON releases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can read own releases"
ON releases
FOR SELECT
TO authenticated
USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own releases"
ON releases
FOR UPDATE
TO authenticated
USING (auth.uid()::uuid = user_id)
WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own releases"
ON releases
FOR DELETE
TO authenticated
USING (auth.uid()::uuid = user_id);

-- Update storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to manage their own artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to download artworks" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload artworks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'artworks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to manage their own artworks"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'artworks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow public to download artworks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'artworks');