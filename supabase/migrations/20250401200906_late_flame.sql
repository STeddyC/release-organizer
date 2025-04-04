/*
  # Fix Subscriptions RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new RLS policies for subscriptions table
    - Add proper constraints and checks
  
  2. Security
    - Allow users to read their own subscriptions
    - Allow users to create and update their own subscriptions
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can create own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create new policies for subscriptions table
CREATE POLICY "Users can read own subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own subscriptions"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid()::text = user_id AND
  tier IN ('basic', 'pro', 'label') AND
  current_period_end > current_period_start
);

CREATE POLICY "Users can update own subscriptions"
ON subscriptions FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (
  auth.uid()::text = user_id AND
  tier IN ('basic', 'pro', 'label') AND
  current_period_end > current_period_start
);

-- Add constraints if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_tier_check'
  ) THEN
    ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_tier_check
    CHECK (tier IN ('basic', 'pro', 'label'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_dates_check'
  ) THEN
    ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_dates_check
    CHECK (current_period_end > current_period_start);
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_active_idx ON subscriptions(active);
CREATE INDEX IF NOT EXISTS subscriptions_period_idx ON subscriptions(current_period_start, current_period_end);