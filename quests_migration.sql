-- Run this script in your Supabase SQL Editor

ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS subtasks_enabled BOOLEAN DEFAULT FALSE;
