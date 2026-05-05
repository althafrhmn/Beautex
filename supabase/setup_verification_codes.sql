-- Create the verification_codes table if it doesn't already exist
-- This table is used by the backend to store 6-digit OTPs temporarily.

CREATE TABLE IF NOT EXISTS public.verification_codes (
    email TEXT PRIMARY KEY, -- Using email as PK automatically ensures UNIQUE constraint for upsert
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Enable RLS (Optional, but good practice since we use supabaseAdmin to bypass it)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- If you are using the 'anon' key for anything related to this table, you'd add policies here.
-- Since we use supabaseAdmin (service_role), no extra policies are strictly needed for OTP sending.

-- Verify columns (in case table existed but was broken)
-- Run this if the table exists but OTP is still failing:
-- ALTER TABLE public.verification_codes ADD CONSTRAINT verification_codes_email_key UNIQUE (email);
