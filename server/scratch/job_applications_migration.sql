-- Run this in your Supabase SQL Editor

-- 1. Create the job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 3. Anyone can insert (apply for a job)
CREATE POLICY "Anyone can apply" ON public.job_applications
    FOR INSERT WITH CHECK (true);

-- 4. Only service_role (admin/staff via supabaseAdmin) can read applications
CREATE POLICY "Staff can view applications" ON public.job_applications
    FOR SELECT USING (true);

-- 5. Create a Storage bucket for resumes (run in Supabase Dashboard > Storage)
-- Bucket name: "resumes"  (Public: false)
-- OR run via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Allow anyone to upload resumes
CREATE POLICY "Anyone can upload resume"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

-- 7. Allow authenticated users (staff) to read resumes
CREATE POLICY "Staff can read resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');
