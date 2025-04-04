/*
  # Fix RLS policies and storage configuration

  1. Security Updates
    - Fix type casting for auth.uid() in RLS policies
    - Configure storage bucket and policies
    - Update policies to use auth.uid() instead of id
  
  2. Changes
    - Add proper type casting for UUID comparisons
    - Create artworks bucket if not exists
    - Set up storage policies for artwork management
*/

-- Create artworks bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('artworks', 'artworks', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

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