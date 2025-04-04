/*
  # Create releases table

  1. New Tables
    - `releases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `artist` (text)
      - `type` (text)
      - `label` (text)
      - `release_date` (date)
      - `artwork_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `releases` table
    - Add policies for authenticated users to:
      - Read their own releases
      - Create new releases
      - Update their own releases
      - Delete their own releases
*/

CREATE TABLE IF NOT EXISTS releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  artist text NOT NULL,
  type text NOT NULL,
  label text NOT NULL,
  release_date date NOT NULL,
  artwork_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own releases"
  ON releases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create releases"
  ON releases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own releases"
  ON releases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own releases"
  ON releases
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);