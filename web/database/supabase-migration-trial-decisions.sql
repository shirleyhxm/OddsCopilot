-- ============================================
-- Migration: Add Trial Decisions Table
-- ============================================
-- This table stores anonymous trial decisions that can later
-- be claimed by users who sign up
-- ============================================

-- Trial Decisions Table (for anonymous users)
CREATE TABLE trial_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  category TEXT,
  decision_summary TEXT,
  context TEXT,
  insider_prompt TEXT,
  scenarios JSONB,
  key_factors JSONB,
  expected_value_score NUMERIC,
  sensitivity_note TEXT,
  claimed_by_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Index for cleanup of expired trials
CREATE INDEX trial_decisions_expires_at_idx ON trial_decisions(expires_at);

-- Enable RLS but allow anonymous inserts
ALTER TABLE trial_decisions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert trial decisions (anonymous)
CREATE POLICY "Anyone can create trial decisions"
  ON trial_decisions FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read unclaimed trial decisions
CREATE POLICY "Anyone can read unclaimed trial decisions"
  ON trial_decisions FOR SELECT
  USING (claimed_by_user_id IS NULL OR auth.uid() = claimed_by_user_id);

-- Only allow users to update their own claimed decisions
CREATE POLICY "Users can claim trial decisions"
  ON trial_decisions FOR UPDATE
  USING (claimed_by_user_id IS NULL OR auth.uid() = claimed_by_user_id);

-- Function to cleanup expired trial decisions (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_trial_decisions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM trial_decisions
  WHERE expires_at < NOW()
    AND claimed_by_user_id IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Setup Complete!
-- ============================================
-- To enable automatic cleanup, set up a cron job in Supabase:
-- https://supabase.com/docs/guides/database/extensions/pg_cron
--
-- Example cron job (runs daily at 2 AM):
-- SELECT cron.schedule('cleanup-expired-trials', '0 2 * * *',
--   'SELECT cleanup_expired_trial_decisions()');
-- ============================================
