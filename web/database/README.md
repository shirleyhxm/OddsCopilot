# Database Schema and Migrations

This folder contains SQL files for the Supabase database schema and migrations.

## Files

- **supabase-schema.sql** - Complete database schema including tables, indexes, RLS policies, and triggers
- **supabase-migration-insight-scenarios.sql** - Migration to add `insight_scenarios` column for tracking scenario changes

## How to Use

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/_/sql/new
2. Copy and paste the SQL from the appropriate file
3. Run the SQL in the SQL Editor

## Initial Setup

For a new project, run `supabase-schema.sql` first to set up all tables and policies.

## Migrations

Run migration files in order as new features are added. Each migration file is safe to run multiple times (uses `IF NOT EXISTS` where applicable).
