/*
  # Fix RLS and Storage Policies

  1. Changes
    - Create artworks bucket with proper configuration
    - Update RLS policies for releases table
    - Set up storage policies with correct user ID handling
  
  2. Security
    - Enable RLS for storage and releases tables
    - Ensure proper user access control
*/

-- Create artworks bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Users can create releases" ON releases;
DROP POLICY IF EXISTS "Users can read own releases" ON releases;
DROP POLICY IF EXISTS "Users can update own releases" ON releases;
DROP POLICY IF EXISTS "Users can delete own releases" ON releases;
DROP POLICY IF EXISTS "Allow authenticated users to upload artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to manage their own artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to download artworks" ON storage.objects;

-- Create releases policies
CREATE POLICY "Users can create releases"
ON releases FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own releases"
ON releases FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own releases"
ON releases FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own releases"
ON releases FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create storage policies
CREATE POLICY "Allow authenticated users to upload artworks"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'artworks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to manage their own artworks"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'artworks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow public to download artworks"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'artworks');