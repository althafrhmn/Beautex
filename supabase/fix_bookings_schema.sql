-- Fix missing columns in 'bookings' table for Guest checkout
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Refresh Postgrest cache
NOTIFY pgrst, 'reload schema';
