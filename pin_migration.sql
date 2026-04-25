-- Add pinned column to quests table
ALTER TABLE quests ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;
