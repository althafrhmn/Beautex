-- Ensure salons table has all required columns for "Shops" management
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS opening_time TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS closing_time TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Rename 'address' to 'location' alias is handled in controller, 
-- but we can add location if preferred. Let's keep address for compatibility.

-- Ensure RLS is configured for admin access
CREATE POLICY "Admins can do everything on salons" 
ON public.salons FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
));
