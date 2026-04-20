-- Migration: Add Global Streak tracking to user_stats
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS global_streak_current INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS global_streak_longest INTEGER DEFAULT 0;

-- Note: Ensure you have already added the punishments column if you haven't:
-- ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS punishments JSONB DEFAULT '[]'::jsonb;
