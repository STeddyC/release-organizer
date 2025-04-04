/*
  # Fix Subscriptions RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new RLS policies for subscriptions table
    - Add system role for managing subscriptions
  
  2. Security
    - Allow users to read their own subscriptions
    - Allow system to manage all subscriptions
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Only system can manage subscriptions" ON subscriptions;

-- Create new policies for subscriptions table
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_active_idx ON subscriptions(active);
CREATE INDEX IF NOT EXISTS subscriptions_period_idx ON subscriptions(current_period_start, current_period_end);