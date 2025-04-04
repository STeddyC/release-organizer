/*
  # Strengthen subscription enforcement

  1. Changes
    - Add NOT NULL constraints to subscription fields
    - Add CHECK constraints for valid date ranges
    - Modify trigger to strictly enforce limits
    - Add indexes for better performance
  
  2. Security
    - Ensure subscription limits are properly enforced
    - Prevent invalid subscription data
*/

-- Add constraints to subscriptions table
ALTER TABLE subscriptions
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN tier SET NOT NULL,
  ALTER COLUMN current_period_start SET NOT NULL,
  ALTER COLUMN current_period_end SET NOT NULL,
  ADD CONSTRAINT subscriptions_dates_check 
    CHECK (current_period_end > current_period_start);

-- Create function to strictly enforce subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS trigger AS $$
DECLARE
  subscription_tier text;
  monthly_releases int;
  unique_artists int;
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

  -- If no active subscription found, create a basic tier subscription
  IF subscription_tier IS NULL THEN
    INSERT INTO subscriptions (
      user_id,
      tier,
      active,
      current_period_start,
      current_period_end
    ) VALUES (
      NEW.user_id,
      'basic',
      true,
      date_trunc('month', CURRENT_TIMESTAMP),
      date_trunc('month', CURRENT_TIMESTAMP) + interval '1 month'
    );
    subscription_tier := 'basic';
  END IF;

  -- Enforce tier limits
  CASE subscription_tier
    WHEN 'basic' THEN
      -- Check monthly release limit
      SELECT COUNT(*) INTO monthly_releases
      FROM releases
      WHERE user_id = NEW.user_id
        AND created_at >= date_trunc('month', CURRENT_TIMESTAMP);

      IF monthly_releases >= 5 THEN
        RAISE EXCEPTION 'Monthly release limit (5) reached for basic tier';
      END IF;

      -- Check unique artists limit
      SELECT COUNT(DISTINCT LOWER(artist)) INTO unique_artists
      FROM releases
      WHERE user_id = NEW.user_id;

      IF unique_artists >= 1 AND LOWER(NEW.artist) NOT IN (
        SELECT DISTINCT LOWER(artist)
        FROM releases
        WHERE user_id = NEW.user_id
      ) THEN
        RAISE EXCEPTION 'Artist limit (1) reached for basic tier';
      END IF;

    WHEN 'pro' THEN
      -- Check unique artists limit for pro tier
      SELECT COUNT(DISTINCT LOWER(artist)) INTO unique_artists
      FROM releases
      WHERE user_id = NEW.user_id;

      IF unique_artists >= 5 AND LOWER(NEW.artist) NOT IN (
        SELECT DISTINCT LOWER(artist)
        FROM releases
        WHERE user_id = NEW.user_id
      ) THEN
        RAISE EXCEPTION 'Artist limit (5) reached for pro tier';
      END IF;

    WHEN 'label' THEN
      -- No limits for label tier
      NULL;
    
    ELSE
      RAISE EXCEPTION 'Invalid subscription tier: %', subscription_tier;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS check_subscription_on_release ON releases;
CREATE TRIGGER check_subscription_on_release
  BEFORE INSERT ON releases
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_limits();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_active_idx 
  ON subscriptions (user_id, active);
CREATE INDEX IF NOT EXISTS subscriptions_period_idx 
  ON subscriptions (current_period_start, current_period_end);
CREATE INDEX IF NOT EXISTS releases_user_artist_idx 
  ON releases (user_id, LOWER(artist));