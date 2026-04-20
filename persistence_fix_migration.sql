-- PERSISTENCE INFRASTRUCTURE MODERNIZATION
-- Run this in your Supabase SQL Editor to fix disappearing missions.

-- 1. Upgrade Quests Table
ALTER TABLE quests 
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'P2',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS repeating BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS postpone_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS postpone_history JSONB DEFAULT '[]';

-- 2. Upgrade User Stats Table (Defensive)
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS accountability_score INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS spirit_level INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS spirit_xp INT DEFAULT 0;

-- 3. Backfill existing data
UPDATE quests SET repeating = TRUE WHERE repeating IS NULL;
UPDATE quests SET archived = FALSE WHERE archived IS NULL;
UPDATE quests SET postpone_count = 0 WHERE postpone_count IS NULL;
UPDATE quests SET postpone_history = '[]' WHERE postpone_history IS NULL;

-- 4. Verify RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own quests" ON quests;
CREATE POLICY "Users can access their own quests" ON quests FOR ALL USING (auth.uid() = user_id);
