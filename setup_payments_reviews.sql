-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'pending',
    transaction_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.profiles(id),
    salon_id UUID REFERENCES public.salons(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for Payments
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Customers can view their own payments" ON public.payments FOR SELECT USING (customer_id = auth.uid());

-- Policies for Reviews
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (customer_id = auth.uid());
