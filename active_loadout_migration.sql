-- Run this in your Supabase SQL Editor to enable reward persistence

ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS active_loadout JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS item_cooldowns JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows updates to these columns
-- (Usually handled by existing policies, but good to verify)
