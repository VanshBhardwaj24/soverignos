-- Sovereign OS Migration: Reset Persistence
-- Target Table: user_stats

ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS last_daily_reset DATE;

-- OPTIONAL: Initialize with yesterday's date if null
UPDATE user_stats 
SET last_daily_reset = CURRENT_DATE - INTERVAL '1 day' 
WHERE last_daily_reset IS NULL;
