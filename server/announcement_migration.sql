-- Migration for Announcements and Job Board
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE, -- Null for global announcements
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('offer', 'job', 'announcement')),
    image_url TEXT,
    link_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public can read active announcements
CREATE POLICY "Public can read active announcements" ON announcements
    FOR SELECT USING (is_active = TRUE AND (end_date IS NULL OR end_date > NOW()));

-- Managers can manage their own salon's announcements
CREATE POLICY "Managers can manage their salon announcements" ON announcements
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE assigned_shop = announcements.salon_id 
            AND (role = 'manager' OR role = 'admin')
        )
    );
