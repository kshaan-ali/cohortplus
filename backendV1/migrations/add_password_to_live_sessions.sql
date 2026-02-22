ALTER TABLE public.live_sessions 
ADD COLUMN IF NOT EXISTS zoom_password TEXT;

NOTIFY pgrst, 'reload config';
