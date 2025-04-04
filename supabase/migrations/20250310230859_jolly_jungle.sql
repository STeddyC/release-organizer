/*
  # Create storage bucket for release artworks

  1. Storage
    - Create a new public bucket named 'artworks' for storing release artwork images
    - Enable public access for reading artwork images
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload artworks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artworks');

-- Set up storage policy to allow public to download
CREATE POLICY "Allow public to download artworks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'artworks');