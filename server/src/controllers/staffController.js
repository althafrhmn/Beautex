import supabase from '../config/supabaseClient.js';

// Get all staff members with extended details
export const getAllStaff = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone_number, avatar_url, role, speciality, experience, assigned_shop, created_at')
            .eq('role', 'staff')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ staff: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new staff member (Admin only)
export const createStaff = async (req, res) => {
    const { email, password, fullName, phone, speciality, experience, assignedShop, avatarUrl } = req.body;

    try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'staff'
                }
            }
        });

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) throw new Error('User creation failed - no ID returned');

        // 2. Upsert profile with staff-specific fields
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                full_name: fullName,
                email: email,
                phone_number: phone,
                role: 'staff',
                speciality: speciality || null,
                experience: experience || null,
                assigned_shop: assignedShop || null,
                avatar_url: avatarUrl || null
            });

        if (profileError) throw profileError;

        res.status(201).json({
            message: 'Staff member created successfully',
            staff: { id: userId, full_name: fullName, email, speciality, experience, assigned_shop: assignedShop }
        });
    } catch (error) {
        console.error('Create staff error:', error);
        res.status(400).json({ error: error.message });
    }
};

// Update staff member details (Admin only)
export const updateStaff = async (req, res) => {
    const { id } = req.params;
    const { fullName, phone, speciality, experience, assignedShop, avatarUrl } = req.body;

    try {
        const updateData = {};
        if (fullName !== undefined) updateData.full_name = fullName;
        if (phone !== undefined) updateData.phone_number = phone;
        if (speciality !== undefined) updateData.speciality = speciality;
        if (experience !== undefined) updateData.experience = experience;
        if (assignedShop !== undefined) updateData.assigned_shop = assignedShop;
        if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .eq('role', 'staff')
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Staff updated successfully', staff: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete staff member (Admin only)
export const deleteStaff = async (req, res) => {
    const { id } = req.params;

    try {
        // Soft-delete: change role to 'customer' so they lose staff access
        const { error } = await supabase
            .from('profiles')
            .update({ role: 'customer', speciality: null, experience: null, assigned_shop: null })
            .eq('id', id)
            .eq('role', 'staff');

        if (error) throw error;

        res.status(200).json({ message: 'Staff member removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get staff member's own profile (Staff only)
export const getStaffProfile = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone_number, avatar_url, speciality, experience, assigned_shop, created_at')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;
        res.status(200).json({ profile: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update staff member's own profile (Staff only)
export const updateStaffProfile = async (req, res) => {
    const { fullName, phone, avatarUrl } = req.body;

    try {
        const updateData = {};
        if (fullName !== undefined) updateData.full_name = fullName;
        if (phone !== undefined) updateData.phone_number = phone;
        if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Profile updated', profile: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get bookings assigned to this staff member
export const getStaffBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id, booking_number, booking_date, start_time, end_time, status, total_price,
                customer:customer_id(id, full_name, phone_number, email),
                booking_services(services(id, name, price, duration_minutes))
            `)
            .eq('staff_id', req.user.id)
            .order('booking_date', { ascending: false });

        if (error) throw error;
        res.status(200).json({ bookings: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update booking status (Staff only - for their assigned bookings)
export const updateStaffBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id)
            .eq('staff_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Booking status updated', booking: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get staff dashboard stats
export const getStaffDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Today's appointments
        const { data: todayBookings, error: todayErr } = await supabase
            .from('bookings')
            .select('id, status')
            .eq('staff_id', req.user.id)
            .eq('booking_date', today);

        // Upcoming bookings
        const { data: upcomingBookings, error: upErr } = await supabase
            .from('bookings')
            .select('id')
            .eq('staff_id', req.user.id)
            .gte('booking_date', today)
            .in('status', ['pending', 'confirmed']);

        // Completed services
        const { data: completedBookings, error: compErr } = await supabase
            .from('bookings')
            .select('id')
            .eq('staff_id', req.user.id)
            .eq('status', 'completed');

        if (todayErr || upErr || compErr) throw new Error('Failed to fetch stats');

        res.status(200).json({
            stats: {
                todayAppointments: todayBookings?.length || 0,
                upcomingBookings: upcomingBookings?.length || 0,
                completedServices: completedBookings?.length || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
