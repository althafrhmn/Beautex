-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS/PROFILES TABLE (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'receptionist', 'staff', 'customer', 'user')) DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SERVICES TABLE (Procedures offered by salon)
CREATE TABLE public.services (
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

-- 3. APPOINTMENTS TABLE
CREATE TABLE public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  staff_id UUID REFERENCES public.profiles(id), -- Optional: specific staff
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
  total_price DECIMAL(10, 2), -- Snapshot of price at booking
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. REVIEWS TABLE (New)
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. WORKING HOURS (To manage availability)
CREATE TABLE public.working_hours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_day_off BOOLEAN DEFAULT false,
  UNIQUE(staff_id, day_of_week)
);

-- RLS POLICIES (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Services Policies
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Appointments Policies
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (
  auth.uid() = customer_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff'))
);
CREATE POLICY "Users can insert own appointments" ON public.appointments FOR INSERT WITH CHECK (
  auth.uid() = customer_id
);
CREATE POLICY "Staff/Admin can update appointments" ON public.appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff'))
);

-- TRIGGER to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'customer'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove existing trigger if exists to avoid conflicts during updates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SEED DATA (Optional: Run this if you want initial data)
-- INSERT INTO public.services (name, description, price, duration_minutes, category, image_url) VALUES 
-- ('Classic Haircut', 'A timeless cut tailored to your style.', 29.99, 45, 'Hair', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=1000'),
-- ('Luxury Facial', 'Deep cleansing and rejuvenating facial.', 59.99, 60, 'Skin', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1000');
