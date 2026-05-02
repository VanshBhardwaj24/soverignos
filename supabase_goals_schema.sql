-- Create the goals table
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'life'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed'
    progress INTEGER DEFAULT 0,
    deadline TIMESTAMPTZ,
    xp_reward INTEGER DEFAULT 0,
    gc_reward INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    stat_id TEXT NOT NULL,
    is_auto_tracked BOOLEAN DEFAULT FALSE,
    template_id TEXT,
    target_value INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Create Index for performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
