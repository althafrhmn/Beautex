-- Create the dedicated customers table as requested
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone_number TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do everything
CREATE POLICY "Admins have full access to customers"
ON public.customers
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Users can see their own data
CREATE POLICY "Users can see their own customer profile"
ON public.customers
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Allow insertion during signup
CREATE POLICY "Enable insert for registration"
ON public.customers
FOR INSERT
TO authenticated, anon
WITH CHECK (true);
