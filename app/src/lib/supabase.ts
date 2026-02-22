import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

const hasCredentials = supabaseUrl && supabaseAnonKey;

if (!hasCredentials) {
  console.warn(
    'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env for auth. See .env.example.'
  );
}

// Use placeholders when not configured so the app loads; auth will fail until .env is set
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type SupabaseClient = typeof supabase;
