-- PROFESSIONAL SALON BOOKING SYSTEM SCHEMA
-- Run this in your Supabase SQL Editor to prepare your database

-- 1. Services Module
-- (Assuming services table already exists, ensuring it has all fields)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image TEXT;

-- 2. Staff Profiles Extension
-- We use the profiles table for staff. Adding specialization and hours.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{"mon": {"start": "10:00", "end": "20:00"}, "tue": {"start": "10:00", "end": "20:00"}, "wed": {"start": "10:00", "end": "20:00"}, "thu": {"start": "10:00", "end": "20:00"}, "fri": {"start": "10:00", "end": "20:00"}, "sat": {"start": "10:00", "end": "18:00"}, "sun": null}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS off_days TEXT[] DEFAULT '{}';

-- 3. Bookings Extension
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'));

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  order_id TEXT,
  payment_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  status TEXT,
  method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RLS Policies for Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE public.bookings.id = public.payments.booking_id 
    AND public.bookings.customer_id = auth.uid()
  )
);
