/*
  # Fix Authentication and RLS Policies

  1. Changes
    - Create artworks bucket with proper configuration
    - Update RLS policies for releases table with correct auth handling
    - Set up storage policies with proper user ID handling
  
  2. Security
    - Enable RLS for storage and releases tables
    - Ensure proper user access control for both storage and database
*/

-- Create artworks bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on releases table
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Users can create releases" ON releases;
DROP POLICY IF EXISTS "Users can read own releases" ON releases;
DROP POLICY IF EXISTS "Users can update own releases" ON releases;
DROP POLICY IF EXISTS "Users can delete own releases" ON releases;

-- Create releases table policies
CREATE POLICY "Users can create releases"
ON releases FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read own releases"
ON releases FOR SELECT TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own releases"
ON releases FOR UPDATE TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own releases"
ON releases FOR DELETE TO authenticated
USING (auth.uid()::text = user_id::text);

-- Storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to manage their own artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to download artworks" ON storage.objects;

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