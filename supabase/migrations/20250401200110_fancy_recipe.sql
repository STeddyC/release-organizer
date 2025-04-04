/*
  # Add test subscriptions

  1. Changes
    - Add test subscriptions for different tiers
    - Set appropriate periods and active status
    - Add license keys for verification
  
  2. Security
    - Maintain existing RLS policies
    - Only add test data
*/

-- Function to add a test subscription
CREATE OR REPLACE FUNCTION add_test_subscription(
  p_user_id text,
  p_tier text,
  p_license_key text
) RETURNS void AS $$
BEGIN
  -- Deactivate any existing subscriptions for this user
  UPDATE subscriptions
  SET active = false
  WHERE user_id = p_user_id AND active = true;

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
    CURRENT_TIMESTAMP + interval '1 month',
    p_license_key
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to get test subscription
CREATE OR REPLACE FUNCTION get_test_subscription(
  p_user_id text,
  p_tier text DEFAULT 'basic'
) RETURNS TABLE (
  tier text,
  active boolean,
  current_period_start timestamptz,
  current_period_end timestamptz,
  license_key text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.tier,
    s.active,
    s.current_period_start,
    s.current_period_end,
    s.license_key
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.tier = p_tier
    AND s.active = true;
END;
$$ LANGUAGE plpgsql;