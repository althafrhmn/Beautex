-- FIX: Ensure auth.users correctly triggers profile creation in public.profiles
-- This script fixes the issue where users might be out of sync.

-- 1. Ensure the profiles table is correctly structured
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'receptionist', 'staff', 'customer', 'user')) DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS if not enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Setup robust policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert/update everything" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can do anything" ON public.profiles USING (true) WITH CHECK (true);

-- 4. Recreate the trigger function with ON CONFLICT and better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. BACKFILL: Sync existing auth.users to profiles just in case
INSERT INTO public.profiles (id, full_name, role)
SELECT 
  id, 
  raw_user_meta_data->>'full_name', 
  COALESCE(raw_user_meta_data->>'role', 'customer')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
