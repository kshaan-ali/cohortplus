-- Ensure all required columns exist in live_sessions
ALTER TABLE public.live_sessions 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id),
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS zoom_meeting_id TEXT,
ADD COLUMN IF NOT EXISTS zoom_join_url TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Force schema cache reload (Supabase usually does this automatically on DDL, but good to be safe)
NOTIFY pgrst, 'reload config';
