-- Run this in your Supabase SQL editor
-- Dashboard → SQL Editor → New query → Paste & Run

-- Screening results table
CREATE TABLE IF NOT EXISTS screening_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  total_score INTEGER NOT NULL,
  ai_analysis JSONB,
  risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: users can only see their own results
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own results" ON screening_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own results" ON screening_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for fast history queries
CREATE INDEX idx_screening_results_user_date
  ON screening_results(user_id, created_at DESC);

-- Optional: anonymized aggregate view for research (no PII)
CREATE VIEW public_aggregate_stats AS
  SELECT
    risk_level,
    COUNT(*) as count,
    AVG(total_score) as avg_score,
    date_trunc('month', created_at) as month
  FROM screening_results
  GROUP BY risk_level, date_trunc('month', created_at);
