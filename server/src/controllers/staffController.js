import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get all staff members with extended details
export const getAllStaff = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, specialization, phone_number, experience, assigned_shop, avatar_url, working_hours, off_days, created_at')
            .eq('role', 'staff')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ 
            staff: data || [],
            professionals: data || [] // Add fallback for extra robustness
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new staff member (Admin only)
export const createStaff = async (req, res) => {
    const { email, password, fullName, phone, speciality, experience, assignedShop, avatarUrl } = req.body;

    try {
        // 1. Create user via admin API (bypasses email confirmation, no RLS issues)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: 'staff'
            }
        });

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) throw new Error('User creation failed - no ID returned');

        // 2. Upsert profile using admin client to bypass RLS
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                full_name: fullName,
                email: email,
                role: 'staff',
                phone_number: phone || null,
                specialization: speciality || null,
                experience: experience || null,
                assigned_shop: assignedShop || null,
                avatar_url: avatarUrl || null,
                working_hours: null,
                off_days: []
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
    const { fullName, phone, speciality, experience, assignedShop, avatarUrl, password } = req.body;

    try {
        // Update profile fields
        const updateData = {};
        if (fullName !== undefined)     updateData.full_name = fullName;
        if (phone !== undefined)        updateData.phone_number = phone;
        if (speciality !== undefined)   updateData.specialization = speciality;
        if (experience !== undefined)   updateData.experience = experience;
        if (assignedShop !== undefined) updateData.assigned_shop = assignedShop;
        if (avatarUrl !== undefined)    updateData.avatar_url = avatarUrl;

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .eq('role', 'staff')
            .select()
            .single();

        if (error) throw error;

        // Reset password if provided
        if (password && password.trim().length >= 6) {
            const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(id, { password });
            if (pwError) throw pwError;
        }

        res.status(200).json({ message: 'Staff updated successfully', staff: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete staff member (Admin only)
export const deleteStaff = async (req, res) => {
    const { id } = req.params;

    try {
        // Delete the profile row
        await supabaseAdmin.from('profiles').delete().eq('id', id);

        // Hard-delete the auth user — fully removes them
        const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authErr) throw authErr;

        res.status(200).json({ message: 'Staff member deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get staff member's own profile (Staff only)
export const getStaffProfile = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, phone_number, specialization, experience, assigned_shop, avatar_url, working_hours, off_days, created_at')
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
    const { fullName, phone, speciality, avatarUrl } = req.body;

    try {
        const updateData = {};
        if (fullName !== undefined)   updateData.full_name = fullName;
        if (phone !== undefined)      updateData.phone_number = phone;
        if (speciality !== undefined) updateData.specialization = speciality;
        if (avatarUrl !== undefined)  updateData.avatar_url = avatarUrl;

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
