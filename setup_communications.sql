-- BEAUTEX PLATFORM COMMUNICATION SYSTEM
-- Bridges the gap between Platform Admins (SuperAdmin) and Shop Owners (Managers)

-- 1. Create Communications Table
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Null means sent to "All Admins"
    salon_id UUID REFERENCES public.salons(id) ON DELETE SET NULL, -- Reference to which salon this is about
    category TEXT CHECK (category IN ('General Support', 'Ad/Promotion Request', 'New Stylist Request', 'Contract Renewal', 'Billing Issue')) DEFAULT 'General Support',
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'In Progress', 'Responded', 'Resolved')) DEFAULT 'Pending',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can see messages they sent OR messages specifically for them OR messages sent to Admins (if they are Admin)
CREATE POLICY "Users can see involved communications" ON public.communications FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    (receiver_id IS NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')))
);

-- Users can send messages
CREATE POLICY "Users can send communications" ON public.communications FOR INSERT WITH CHECK (
    auth.uid() = sender_id
);

-- Admins/Managers can update status or mark as read
CREATE POLICY "Admins/Receivers can update communications" ON public.communications FOR UPDATE USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR 
    (receiver_id IS NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')))
);
