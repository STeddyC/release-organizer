/*
  # Add license_key to subscriptions table

  1. Changes
    - Add license_key column to subscriptions table
    - Add unique constraint on license_key
  
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE subscriptions
ADD COLUMN license_key text UNIQUE;