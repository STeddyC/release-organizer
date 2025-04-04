/*
  # Fix Subscription RLS Policies and Validation

  1. Changes
    - Drop existing policies
    - Create new RLS policies for subscriptions
    - Add validation for subscription data
    - Add helper functions for subscription management
  
  2. Security
    - Enable RLS on subscriptions table
    - Allow users to manage their own subscriptions
    - Enforce data validation
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

-- Function to handle subscription activation
CREATE OR REPLACE FUNCTION activate_subscription(
  p_user_id text,
  p_tier text,
  p_license_key text
) RETURNS boolean AS $$
BEGIN
  -- Deactivate existing subscriptions
  UPDATE subscriptions
  SET active = false
  WHERE user_id = p_user_id
    AND active = true;

  -- Insert new subscription
  INSERT INTO subscriptions (
    user_id,
    tier,
    active,
    current_period_start,
    current_period_end,
    license_key
  ) VALUES (
    p_user_id,
    p_tier,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + interval '1 year',
    p_license_key
  );

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;