-- Migration: Add insight_scenarios column to decisions table
-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql/new

ALTER TABLE decisions
ADD COLUMN IF NOT EXISTS insight_scenarios JSONB;

-- Optional: Add a comment to describe the column
COMMENT ON COLUMN decisions.insight_scenarios IS 'Snapshot of scenarios when insight was generated, used to detect if estimates have changed';
