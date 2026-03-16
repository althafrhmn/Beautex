-- MASTER SUPABASE MIGRATION: BeauteX Luxury Salon Management System
-- Version: 1.0.0
-- Description: Comprehensive schema setup including Auth extensions, Salons, Bookings, and Payments.

-- ==========================================
-- 1. EXTENSIONS & INITIAL SETUP
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. PROFILES & ACCESS CONTROL
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    address TEXT,
    role TEXT CHECK (role IN ('admin', 'manager', 'receptionist', 'staff', 'customer', 'user')) DEFAULT 'customer',
    specialization TEXT,
    working_hours JSONB DEFAULT '{"mon": {"start": "10:00", "end": "20:00"}, "tue": {"start": "10:00", "end": "20:00"}, "wed": {"start": "10:00", "end": "20:00"}, "thu": {"start": "10:00", "end": "20:00"}, "fri": {"start": "10:00", "end": "20:00"}, "sat": {"start": "10:00", "end": "18:00"}, "sun": null}',
    off_days TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was already there
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{"mon": {"start": "10:00", "end": "20:00"}, "tue": {"start": "10:00", "end": "20:00"}, "wed": {"start": "10:00", "end": "20:00"}, "thu": {"start": "10:00", "end": "20:00"}, "fri": {"start": "10:00", "end": "20:00"}, "sat": {"start": "10:00", "end": "18:00"}, "sun": null}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS off_days TEXT[] DEFAULT '{}';

-- ==========================================
-- 3. SALONS (SHOPS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.salons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT,
    hours TEXT DEFAULT '10:00 AM - 08:00 PM',
    rating DECIMAL(3, 2) DEFAULT 4.5,
    reviews_count INTEGER DEFAULT 0,
    price_range TEXT DEFAULT '$$',
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was already there
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS hours TEXT;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS city TEXT;

-- ==========================================
-- 4. SERVICES (RITUALS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    category TEXT CHECK (category IN ('Hair', 'Nails', 'Skin', 'Massage', 'Other')) DEFAULT 'Hair',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 5. BOOKINGS & RESERVATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_number TEXT UNIQUE NOT NULL, 
    customer_id UUID REFERENCES public.profiles(id) NOT NULL,
    salon_id UUID REFERENCES public.salons(id) NOT NULL,
    staff_id UUID REFERENCES public.profiles(id), 
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'pending',
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'partially_paid')) DEFAULT 'unpaid',
    payment_method TEXT CHECK (payment_method IN ('online', 'cash', 'qr')) DEFAULT 'cash',
    notes TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Junction table for multiple services per booking
CREATE TABLE IF NOT EXISTS public.booking_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services(id) NOT NULL,
    price_at_booking DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL
);

-- ==========================================
-- 6. PAYMENTS & FINANCES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    order_id TEXT,
    payment_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending',
    method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 7. REVIEWS & FEEDBACK
-- ==========================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) NOT NULL,
    salon_id UUID REFERENCES public.salons(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 8. CUSTOMERS (Redundant View Table for Admin)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone_number TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 9. TRIGGERS & AUTOMATION
-- ==========================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into profiles
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

    -- Sync to customers if role is customer
    IF (COALESCE(new.raw_user_meta_data->>'role', 'customer') = 'customer') THEN
        INSERT INTO public.customers (id, name, email)
        VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email)
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 10.1 Profiles Policies
DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 10.2 Salons & Services (Public Read)
DROP POLICY IF EXISTS "Public read salons" ON public.salons;
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read salons" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);

-- 10.3 Bookings Policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff', 'receptionist'))
);
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Staff can update bookings" ON public.bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'staff', 'receptionist'))
);

-- 10.4 Reviews Policies
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers can insert own reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));
CREATE POLICY "Customers can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 10.5 Customers View Table Policies
DROP POLICY IF EXISTS "Admins can view customers" ON public.customers;
CREATE POLICY "Admins can view customers" ON public.customers FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'staff')));

-- ==========================================
-- 11. SEED DATA (INITIAL BOOTSTRAP)
-- ==========================================

-- Seed Salons
INSERT INTO public.salons (name, address, city, phone, image_url, tags)
VALUES 
('Glam Makeovers Kottakkal', 'Pallippuram Arcade', 'Kottakkal', '+91 83598 98989', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800', ARRAY['Bridal', 'Makeup', 'Hair']),
('Beautx Unisex Salon', 'Main Junction', 'Valavanur', '+91 83598 00000', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800', ARRAY['Hair', 'Skin'])
ON CONFLICT DO NOTHING;

-- Seed Services
INSERT INTO public.services (name, description, price, duration_minutes, category)
VALUES 
('Luxury Haircut', 'Precision cut & styling', 1200.00, 45, 'Hair'),
('Bridal Makeup', 'Full wedding glam', 15000.00, 180, 'Other'),
('Gel Manicure', 'Long lasting nail color', 800.00, 60, 'Nails'),
('Hydra Facial', 'Deep cleansing treatment', 3500.00, 90, 'Skin')
ON CONFLICT DO NOTHING;
