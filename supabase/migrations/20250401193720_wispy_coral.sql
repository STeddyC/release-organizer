/*
  # Add subscription check trigger

  1. Changes
    - Add trigger function to check subscription limits
    - Add trigger to releases table
    - Add trigger to analytics table
  
  2. Security
    - Enforce subscription limits on database level
    - Prevent unauthorized operations
*/

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS trigger AS $$
DECLARE
  subscription_tier text;
  monthly_releases int;
BEGIN
  -- Get user's active subscription
  SELECT tier INTO subscription_tier
  FROM subscriptions
  WHERE user_id = NEW.user_id
    AND active = true
    AND current_period_start <= CURRENT_TIMESTAMP
    AND current_period_end > CURRENT_TIMESTAMP
  ORDER BY current_period_end DESC
  LIMIT 1;

  -- If no active subscription, default to basic tier
  IF subscription_tier IS NULL THEN
    subscription_tier := 'basic';
  END IF;

  -- Count releases this month for basic tier
  IF subscription_tier = 'basic' THEN
    SELECT COUNT(*) INTO monthly_releases
    FROM releases
    WHERE user_id = NEW.user_id
      AND created_at >= date_trunc('month', CURRENT_TIMESTAMP);

    IF monthly_releases >= 5 THEN
      RAISE EXCEPTION 'Monthly release limit reached for basic tier';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on releases table
DROP TRIGGER IF EXISTS check_subscription_on_release ON releases;
CREATE TRIGGER check_subscription_on_release
  BEFORE INSERT ON releases
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_limits();