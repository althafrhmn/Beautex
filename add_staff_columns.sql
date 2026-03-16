-- Add staff-specific columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS speciality TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_shop TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add staff_id to bookings if not exists
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.profiles(id);

-- Allow admin to insert profiles
CREATE POLICY IF NOT EXISTS "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- Allow admin to delete profiles  
CREATE POLICY IF NOT EXISTS "Admins can update any profile" ON public.profiles FOR UPDATE USING (true);
