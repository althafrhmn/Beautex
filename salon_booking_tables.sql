-- New Salons Table
CREATE TABLE public.salons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  hours TEXT, -- e.g., "10:00 AM - 08:00 PM"
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  price_range TEXT, -- "$", "$$", "$$$"
  image_url TEXT,
  tags TEXT[], -- array of tags e.g., ['Hair', 'Bridal']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- New Bookings Table
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_number TEXT UNIQUE NOT NULL, 
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  salon_id UUID REFERENCES public.salons(id) NOT NULL,
  staff_id UUID REFERENCES public.profiles(id), 
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'partially_paid')) DEFAULT 'unpaid',
  payment_method TEXT CHECK (payment_method IN ('online', 'cash')) DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- New Booking Services Table (For multiple services per booking)
CREATE TABLE public.booking_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  price_at_booking DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL
);

-- New Staff Availability Table
CREATE TABLE public.staff_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(staff_id, day_of_week, start_time, end_time)
);

-- Enable RLS
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;

-- Policies for Salons (Viewable by all)
CREATE POLICY "Salons are viewable by everyone" ON public.salons FOR SELECT USING (true);

-- Policies for Bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (
  auth.uid() = customer_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff'))
);

CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT WITH CHECK (
  auth.uid() = customer_id
);

CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (
  auth.uid() = customer_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff'))
);

-- Seed Initial Salons
INSERT INTO public.salons (name, address, city, phone, hours, rating, reviews_count, price_range, image_url, tags)
VALUES 
('Glam Makeovers Kottakkal', 'Pallippuram Arcade', 'Kottakkal', '+91 83598 98989', '10:00 AM - 08:00 PM', 4.8, 2300, '$$$', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800', ARRAY['Bridal', 'Makeup', 'Hair']),
('Red Rose Ladies Beauty Salon', 'Main Road', 'Tirur', '+91 83598 70000', '10:00 AM - 08:00 PM', 4.0, 1400, '$$', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800', ARRAY['Hair', 'Skin']),
('Toni&Guy Essensuals', 'Up Hill', 'Malappuram', '+91 75104 34434', '10:00 AM - 10:00 PM', 4.8, 1400, '$$$', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800', ARRAY['Luxury', 'Hair']),
('Vanya Salon', 'MG Road', 'Kochi', '+91 98950 12345', '10:00 AM - 09:00 PM', 4.8, 1200, '$$$', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800', ARRAY['Hair', 'Nails']),
('Beautx Unisex Salon', 'Main Junction', 'Valavanur', '+91 83598 00000', '10:00 AM - 08:00 PM', 4.5, 432, '$$', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800', ARRAY['Hair', 'Skin']);
