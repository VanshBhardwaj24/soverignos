-- Brand Accounts table
CREATE TABLE IF NOT EXISTS brand_accounts (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    handle TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'x', 'youtube', 'instagram', 'linkedin', etc.
    avatar_url TEXT,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Pieces table
CREATE TABLE IF NOT EXISTS content_pieces (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id TEXT REFERENCES brand_accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'idea', -- 'idea', 'research', 'production', 'refinement', 'scheduled', 'uploaded'
    platform TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ,
    posted_at TIMESTAMPTZ,
    is_repeating BOOLEAN DEFAULT FALSE,
    repeat_config JSONB DEFAULT '{}', -- { frequency: 'weekly', days: [1, 3, 5] }
    reminder_enabled BOOLEAN DEFAULT FALSE,
    reminder_offset INTEGER DEFAULT 60, -- minutes before
    notes TEXT,
    assets JSONB DEFAULT '[]', -- List of links/files
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE brand_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;

-- Policies for brand_accounts
CREATE POLICY "Users can manage their own brand accounts" ON brand_accounts
    FOR ALL USING (auth.uid() = user_id);

-- Policies for content_pieces
CREATE POLICY "Users can manage their own content pieces" ON content_pieces
    FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_user_id ON content_pieces(user_id);
CREATE INDEX IF NOT EXISTS idx_content_account_id ON content_pieces(account_id);
