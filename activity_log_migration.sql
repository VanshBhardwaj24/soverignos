-- Migration: Add Activity Logging infrastructure for deeper analytics
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stat_id TEXT NOT NULL,
    xp INTEGER NOT NULL,
    quest_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    multiplier NUMERIC DEFAULT 1.0,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for analytics performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user_timestamp ON activity_log(user_id, timestamp DESC);
