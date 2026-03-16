-- Create shops table
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    owner_name TEXT,
    phone TEXT,
    opening_time TEXT,
    closing_time TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Full access for admins on shops" ON public.shops FOR ALL USING (true);
