-- SOVEREIGN OS SUPABASE SCHEMA
-- Paste this entire block into the SQL Editor in your Supabase Dashboard

-- 1. Create Core Profile / Stats
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    code_level INT DEFAULT 1, code_xp INT DEFAULT 0,
    wealth_level INT DEFAULT 1, wealth_xp INT DEFAULT 0,
    body_level INT DEFAULT 1, body_xp INT DEFAULT 0,
    mind_level INT DEFAULT 1, mind_xp INT DEFAULT 0,
    brand_level INT DEFAULT 1, brand_xp INT DEFAULT 0,
    network_level INT DEFAULT 1, network_xp INT DEFAULT 0,
    gold INT DEFAULT 0,
    inventory TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration logic for adding gold and inventory columns to existing tables
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_stats' AND column_name='gold') THEN
        ALTER TABLE user_stats ADD COLUMN gold INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_stats' AND column_name='inventory') THEN
        ALTER TABLE user_stats ADD COLUMN inventory TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_stats' AND column_name='accountability_score') THEN
        ALTER TABLE user_stats ADD COLUMN accountability_score INT DEFAULT 100;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_stats' AND column_name='spirit_level') THEN
        ALTER TABLE user_stats ADD COLUMN spirit_level INT DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_stats' AND column_name='spirit_xp') THEN
        ALTER TABLE user_stats ADD COLUMN spirit_xp INT DEFAULT 0;
    END IF;
END $$;

-- 2. Create Job Applications Tracker
CREATE TABLE IF NOT EXISTS job_applications (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Transactions (Wealth Ledger)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    sector TEXT DEFAULT 'Personal',
    pool_id TEXT DEFAULT 'personal',
    metadata JSONB DEFAULT '{}',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Encrypted Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    folder TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Quests (Tasks)
CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    xp_reward INT NOT NULL,
    stat_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    failed BOOLEAN DEFAULT FALSE,
    type TEXT NOT NULL, -- 'daily', 'weekly', 'boss'
    streak INT DEFAULT 0,
    difficulty TEXT DEFAULT 'medium',
    priority TEXT DEFAULT 'P2',
    due_date TIMESTAMP WITH TIME ZONE,
    repeating BOOLEAN DEFAULT TRUE,
    archived BOOLEAN DEFAULT FALSE,
    postpone_count INT DEFAULT 0,
    postpone_history JSONB DEFAULT '[]',
    last_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration for streak columns
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quests' AND column_name='streak') THEN
        ALTER TABLE quests ADD COLUMN streak INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quests' AND column_name='last_completed_at') THEN
        ALTER TABLE quests ADD COLUMN last_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quests' AND column_name='difficulty') THEN
        ALTER TABLE quests ADD COLUMN difficulty TEXT DEFAULT 'medium';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quests' AND column_name='priority') THEN
        ALTER TABLE quests ADD COLUMN priority TEXT DEFAULT 'P2';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quests' AND column_name='due_date') THEN
        ALTER TABLE quests ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quests' AND column_name='repeating') THEN
        ALTER TABLE quests ADD COLUMN repeating BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quests' AND column_name='archived') THEN
        ALTER TABLE quests ADD COLUMN archived BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quests' AND column_name='postpone_count') THEN
        ALTER TABLE quests ADD COLUMN postpone_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quests' AND column_name='postpone_history') THEN
        ALTER TABLE quests ADD COLUMN postpone_history JSONB DEFAULT '[]';
    END IF;
END $$;

-- RLS (Row Level Security) Configuration
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Idempotent Policies
DROP POLICY IF EXISTS "Users can only select their own stats" ON user_stats;
CREATE POLICY "Users can only select their own stats" ON user_stats FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can only insert their own stats" ON user_stats;
CREATE POLICY "Users can only insert their own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can only update their own stats" ON user_stats;
CREATE POLICY "Users can only update their own stats" ON user_stats FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can access their own jobs" ON job_applications;
CREATE POLICY "Users can access their own jobs" ON job_applications FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access their own transactions" ON transactions;
CREATE POLICY "Users can access their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access their own journals" ON journal_entries;
CREATE POLICY "Users can access their own journals" ON journal_entries FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access their own quests" ON quests;
CREATE POLICY "Users can access their own quests" ON quests FOR ALL USING (auth.uid() = user_id);

-- 6. Financial Goals
CREATE TABLE IF NOT EXISTS financial_goals (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    category TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active'
);
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own goals" ON financial_goals;
CREATE POLICY "Users can access their own goals" ON financial_goals FOR ALL USING (auth.uid() = user_id);

-- 7. Portfolios
CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    metadata JSONB DEFAULT '{}'
);
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own portfolios" ON portfolios;
CREATE POLICY "Users can access their own portfolios" ON portfolios FOR ALL USING (auth.uid() = user_id);

-- 8. Punishments
CREATE TABLE IF NOT EXISTS punishments (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    penalty NUMERIC,
    status TEXT DEFAULT 'active',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quest_id TEXT
);
ALTER TABLE punishments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own punishments" ON punishments;
CREATE POLICY "Users can access their own punishments" ON punishments FOR ALL USING (auth.uid() = user_id);

-- Trigger for auto-creating a stats row upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_stats (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

