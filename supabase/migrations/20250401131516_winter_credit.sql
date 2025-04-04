/*
  # Fix Releases Table Schema

  1. Changes
    - Add NOT NULL constraint to user_id
    - Add CHECK constraint for artwork_url format
    - Add CHECK constraint for valid release types
    - Add index on release_date for better query performance
  
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with constraints
*/

-- Add NOT NULL constraint to user_id if not already present
ALTER TABLE releases 
  ALTER COLUMN user_id SET NOT NULL;

-- Add CHECK constraint for valid release types
ALTER TABLE releases
  ADD CONSTRAINT releases_type_check 
  CHECK (type IN ('Single', 'EP', 'Album'));

-- Add CHECK constraint for artwork_url format
ALTER TABLE releases
  ADD CONSTRAINT releases_artwork_url_check
  CHECK (
    artwork_url IS NULL OR 
    artwork_url ~* '^https?://[^\s/$.?#].[^\s]*$'
  );

-- Add index on release_date for better query performance
CREATE INDEX IF NOT EXISTS releases_release_date_idx 
  ON releases (release_date);

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS releases_user_id_idx 
  ON releases (user_id);