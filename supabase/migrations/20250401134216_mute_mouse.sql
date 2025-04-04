/*
  # Add subscriptions and analytics tables

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth users)
      - `tier` (text) - 'basic', 'pro', 'label'
      - `active` (boolean)
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `analytics`
      - `id` (uuid, primary key)
      - `user_id` (text, references auth users)
      - `release_id` (uuid, references releases)
      - `type` (text) - 'view', 'submission', 'approval', 'rejection'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  tier text NOT NULL,
  active boolean DEFAULT true,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT subscriptions_tier_check CHECK (tier IN ('basic', 'pro', 'label'))
);

-- Create analytics table
CREATE TABLE analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  release_id uuid REFERENCES releases(id) ON DELETE CASCADE,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT analytics_type_check CHECK (type IN ('view', 'submission', 'approval', 'rejection'))
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_active_idx ON subscriptions(active);
CREATE INDEX analytics_user_id_idx ON analytics(user_id);
CREATE INDEX analytics_release_id_idx ON analytics(release_id);
CREATE INDEX analytics_type_idx ON analytics(type);
CREATE INDEX analytics_created_at_idx ON analytics(created_at);

-- Create policies for subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Only system can manage subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Create policies for analytics
CREATE POLICY "Users can read own analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own analytics"
  ON analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Create function to update subscription status
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS trigger AS $$
BEGIN
  -- Get user's active subscription
  PERFORM *
  FROM subscriptions s
  WHERE s.user_id = NEW.user_id
    AND s.active = true
    AND s.current_period_end > now();
    
  -- If no active subscription, default to basic tier
  IF NOT FOUND THEN
    INSERT INTO subscriptions (
      user_id,
      tier,
      current_period_start,
      current_period_end
    ) VALUES (
      NEW.user_id,
      'basic',
      now(),
      now() + interval '1 month'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new releases
CREATE TRIGGER check_subscription_on_release
  AFTER INSERT ON releases
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_limits();