-- 1. Alter Salons Table
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS rating_average NUMERIC(3,2) DEFAULT 0;
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Trigger Function to Auto-Update Salon Ratings
CREATE OR REPLACE FUNCTION update_salon_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.salons
    SET 
        rating_average = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE salon_id = NEW.salon_id),
        rating_count = (SELECT COUNT(*) FROM public.reviews WHERE salon_id = NEW.salon_id)
    WHERE id = NEW.salon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach Trigger
DROP TRIGGER IF EXISTS trg_update_salon_rating ON public.reviews;
CREATE TRIGGER trg_update_salon_rating
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_salon_rating();
