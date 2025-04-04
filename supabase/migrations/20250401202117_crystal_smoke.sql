/*
  # Fix Subscription RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create simplified RLS policies for subscriptions table
    - Keep existing constraints and indexes
  
  2. Security
    - Allow users to read their own subscriptions
    - Allow users to create and update their own subscriptions
    - Maintain data integrity with constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can create own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Only system can manage subscriptions" ON subscriptions;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for subscriptions table
CREATE POLICY "Users can read own subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own subscriptions"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own subscriptions"
ON subscriptions FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

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