-- Ensure profiles table has necessary fields for Customer Management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update RLS for profiles to allow admins to manage all profiles
-- Drop existing if conflict or just add new
CREATE POLICY "Admins can do everything on profiles" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Ensure role check for customers is robust
-- Usually, users might sign up and have 'user' role by default
-- We should ensure they are counted in totalCustomers if role is 'user' or 'customer'
