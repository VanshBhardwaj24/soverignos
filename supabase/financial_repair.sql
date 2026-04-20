-- REPAIR SCRIPT FOR FINANCIAL HUB SCHEMA
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Ensure Transactions table has high-fidelity metadata columns
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS sector TEXT DEFAULT 'Personal',
ADD COLUMN IF NOT EXISTS pool_id TEXT DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Create Financial Goals table if it was lost
CREATE TABLE IF NOT EXISTS financial_goals (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    category TEXT CHECK (category IN ('trip', 'asset', 'gear', 'emergency')),
    deadline TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Portfolios table (Asset buckets)
CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('fiat', 'crypto', 'brokerage', 'cold_storage')),
    balance NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- 5. Policies for user isolation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own goals') THEN
        CREATE POLICY "Users can manage their own goals" ON financial_goals 
        FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own portfolios') THEN
        CREATE POLICY "Users can manage their own portfolios" ON portfolios 
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
