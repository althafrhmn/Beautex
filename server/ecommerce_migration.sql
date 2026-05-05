-- Migration Script for BeauteX E-Commerce Feature

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product Policies
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Products are editable by admins and staff of the salon" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR (profiles.role IN ('staff', 'manager') AND profiles.assigned_shop = products.salon_id::text))
        )
    );

-- 2. Create Product Orders Table
CREATE TABLE IF NOT EXISTS public.product_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, processing, completed, cancelled
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Product Orders
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- Product Order Policies
CREATE POLICY "Customers can view their own orders" ON public.product_orders
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert their own orders" ON public.product_orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff can view and update orders for their salon" ON public.product_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR (profiles.role IN ('staff', 'manager') AND profiles.assigned_shop = product_orders.salon_id::text))
        )
    );

-- 3. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.product_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order Item Policies
CREATE POLICY "Customers can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.product_orders
            WHERE product_orders.id = order_items.order_id
            AND product_orders.customer_id = auth.uid()
        )
    );

CREATE POLICY "Customers can insert their own order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.product_orders
            WHERE product_orders.id = order_items.order_id
            AND product_orders.customer_id = auth.uid()
        )
    );

CREATE POLICY "Staff can view and update order items for their salon" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.product_orders
            JOIN public.profiles ON profiles.id = auth.uid()
            WHERE product_orders.id = order_items.order_id
            AND (profiles.role = 'admin' OR (profiles.role IN ('staff', 'manager') AND profiles.assigned_shop = product_orders.salon_id::text))
        )
    );

-- Trigger to notify postgrest to reload schema
NOTIFY pgrst, 'reload schema';
