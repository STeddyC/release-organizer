/*
  # Add test subscriptions

  1. Changes
    - Add test subscriptions for different tiers
    - Set appropriate periods and active status
    - Add license keys for testing
  
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
    CURRENT_TIMESTAMP + interval '1 year',
    p_license_key
  );
END;
$$ LANGUAGE plpgsql;

-- Add test subscriptions
SELECT add_test_subscription(
  'test_basic_user',
  'basic',
  'TEST-BASIC-123'
);

SELECT add_test_subscription(
  'test_pro_user',
  'pro',
  'TEST-PRO-456'
);

SELECT add_test_subscription(
  'test_label_user',
  'label',
  'TEST-LABEL-789'
);

-- Drop the helper function
DROP FUNCTION add_test_subscription;