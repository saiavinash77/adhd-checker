-- Run this in your Supabase SQL editor
-- Dashboard → SQL Editor → New query → Paste & Run
-- Safe to run multiple times — uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS

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

-- Row Level Security
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own results" ON screening_results;
CREATE POLICY "Users see own results" ON screening_results
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own results" ON screening_results;
CREATE POLICY "Users insert own results" ON screening_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index (skip if already exists)
CREATE INDEX IF NOT EXISTS idx_screening_results_user_date
  ON screening_results(user_id, created_at DESC);

-- Anonymized aggregate view
CREATE OR REPLACE VIEW public_aggregate_stats AS
  SELECT
    risk_level,
    COUNT(*) as count,
    AVG(total_score) as avg_score,
    date_trunc('month', created_at) as month
  FROM screening_results
  GROUP BY risk_level, date_trunc('month', created_at);

-- Profiles table for payment status
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  has_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profiles are created by the app after signup (see supabase.js signUp)
-- This policy allows users to insert their own profile row
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
