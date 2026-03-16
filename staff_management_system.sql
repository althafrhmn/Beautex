-- BEAUTEX STAFF MANAGEMENT SYSTEM - DATABASE SCHEMA
-- This schema extends the existing profiles and implements Attendance, Payroll, and Inventory management.

-- 1. EMPLOYEES EXTENSION (Linked to Profiles)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    employee_id TEXT UNIQUE NOT NULL, -- Format like BTX-001
    address TEXT,
    joining_date DATE DEFAULT CURRENT_DATE,
    experience_years INTEGER DEFAULT 0,
    salary_type TEXT CHECK (salary_type IN ('Fixed', 'Commission Based', 'Hybrid')) DEFAULT 'Fixed',
    base_salary DECIMAL(10, 2) DEFAULT 0.00,
    status TEXT CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ATTENDANCE & SHIFTS
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('Present', 'Absent', 'Late', 'Half Day')) DEFAULT 'Present',
    overtime_hours DECIMAL(4, 2) DEFAULT 0.00,
    notes TEXT,
    UNIQUE(employee_id, date)
);

-- 3. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type TEXT CHECK (leave_type IN ('Sick', 'Casual', 'Earned', 'Unpaid')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COMMISSIONS (Linked to appointments)
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    commission_amount DECIMAL(10, 2) NOT NULL,
    percentage DECIMAL(5, 2),
    status TEXT CHECK (status IN ('Pending', 'Paid')) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PAYROLL
CREATE TABLE IF NOT EXISTS public.payroll (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    total_commission DECIMAL(10, 2) DEFAULT 0.00,
    bonus DECIMAL(10, 2) DEFAULT 0.00,
    deductions DECIMAL(10, 2) DEFAULT 0.00,
    net_salary DECIMAL(10, 2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('Unpaid', 'Paid')) DEFAULT 'Unpaid',
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(employee_id, period_month, period_year)
);

-- 6. INVENTORY
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT,
    quantity INTEGER DEFAULT 0,
    unit TEXT, -- ml, oz, items, etc.
    min_stock_level INTEGER DEFAULT 5,
    last_restocked DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. INVENTORY USAGE (Link staff to product usage)
CREATE TABLE IF NOT EXISTS public.inventory_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id),
    appointment_id UUID REFERENCES public.appointments(id),
    quantity_used INTEGER NOT NULL,
    usage_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES for new tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_usage ENABLE ROW LEVEL SECURITY;

-- Global Admin Access
CREATE POLICY "Admins have full access to everything" ON public.employees FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Attendance: Staff can see their own
CREATE POLICY "Staff can view own attendance" ON public.attendance FOR SELECT USING (
    auth.uid() = employee_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Commissions: Staff can see their own
CREATE POLICY "Staff can view own commissions" ON public.commissions FOR SELECT USING (
    auth.uid() = employee_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Payroll: Staff can see their own slips
CREATE POLICY "Staff can view own payroll" ON public.payroll FOR SELECT USING (
    auth.uid() = employee_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
