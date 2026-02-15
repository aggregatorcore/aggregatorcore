-- Add created_at to click_tracking if missing
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'click_tracking' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.click_tracking ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;
