-- Create a table to store metadata for course materials
CREATE TABLE IF NOT EXISTS public.course_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_materials_pkey PRIMARY KEY (id),
  CONSTRAINT course_materials_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);

-- Note: You may need to manually enable Row Level Security (RLS) 
-- and add policies in the Supabase dashboard for this table/bucket.
