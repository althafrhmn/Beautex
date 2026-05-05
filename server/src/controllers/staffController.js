import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get all staff members with extended details
export const getAllStaff = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
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
    const { email, password, fullName, phone, speciality, experience, assignedShop, avatarUrl, working_hours, slot_duration } = req.body;

    // Password validation: 6-12 chars
    if (password && (password.length < 6 || password.length > 12)) {
        return res.status(400).json({ error: 'Password must be between 6 and 12 characters.' });
    }

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
                working_hours: { ...(working_hours || {}), slot_duration: slot_duration || 30 },
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
    const { fullName, phone, speciality, experience, assignedShop, avatarUrl, password, working_hours, slot_duration } = req.body;

    // Password validation on update
    if (password && (password.length < 6 || password.length > 12)) {
        return res.status(400).json({ error: 'Password must be between 6 and 12 characters.' });
    }

    try {
        // Update profile fields
        const updateData = {};
        if (fullName !== undefined)     updateData.full_name = fullName;
        if (phone !== undefined)        updateData.phone_number = phone;
        if (speciality !== undefined)   updateData.specialization = speciality;
        if (experience !== undefined)   updateData.experience = experience;
        if (assignedShop !== undefined) updateData.assigned_shop = assignedShop;
        if (avatarUrl !== undefined)    updateData.avatar_url = avatarUrl;
        
        // Merge slot_duration into working_hours if either is provided
        if (working_hours !== undefined || slot_duration !== undefined) {
            const { data: currentStaff } = await supabaseAdmin.from('profiles').select('working_hours').eq('id', id).single();
            const existingHours = currentStaff?.working_hours || {};
            updateData.working_hours = { 
                ...(working_hours !== undefined ? working_hours : existingHours),
                slot_duration: slot_duration !== undefined ? slot_duration : existingHours.slot_duration || 30
            };
        }

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
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select(`
                id, full_name, email, role, phone_number, specialization, experience, assigned_shop, avatar_url, working_hours, off_days, manager_pin, created_at
            `)
            .eq('id', req.user.id)
            .single();

        if (error) throw error;
        
        if (profile.assigned_shop) {
            const { data: salonData } = await supabase
                .from('salons')
                .select('id, name, manager_pin')
                .eq('id', profile.assigned_shop)
                .single();
            profile.salon = salonData || null;
        } else {
            profile.salon = null;
        }

        res.status(200).json({ profile });
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
        if (req.body.managerPin !== undefined && req.user.role === 'manager') {
             updateData.manager_pin = req.body.managerPin;
        }

        const { data, error } = await supabaseAdmin
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

// Get bookings for the assigned shop
export const getStaffBookings = async (req, res) => {
    try {
        // 1. Get the assigned shop for the staff member
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('assigned_shop')
            .eq('id', req.user.id)
            .single();

        if (!profile?.assigned_shop) {
             return res.status(200).json({ bookings: [] });
        }

        // 2. Fetch all bookings for the shop, so staff can see and claim unassigned ones
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                id, booking_number, booking_date, start_time, end_time, status, total_price, guest_email, staff_id,
                customer:customer_id(id, full_name, phone_number, email),
                staff:staff_id(id, full_name),
                booking_services(services(id, name, price, duration_minutes))
            `)
            .eq('salon_id', profile.assigned_shop)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ bookings: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update booking status (Staff only - for bookings in their shop)
export const updateStaffBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // First verify the booking belongs to their assigned_shop
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('assigned_shop')
            .eq('id', req.user.id)
            .single();

        if (!profile?.assigned_shop) throw new Error('Unassigned to any shop');

        // Check if booking is in that shop
        const { data: bookingCheck } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('id', id)
            .eq('salon_id', profile.assigned_shop)
            .single();

        if (!bookingCheck) throw new Error('Unauthorized or booking not found in your shop');

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .update({ status })
            .eq('id', id)
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

        // 1. Get the assigned shop
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('assigned_shop')
            .eq('id', req.user.id)
            .single();

        if (!profile?.assigned_shop) {
             return res.status(200).json({ stats: { todayAppointments: 0, upcomingBookings: 0, completedServices: 0 } });
        }

        // Today's appointments
        const { data: todayBookings, error: todayErr } = await supabaseAdmin
            .from('bookings')
            .select('id, status')
            .eq('salon_id', profile.assigned_shop)
            .eq('booking_date', today);

        // Upcoming bookings
        const { data: upcomingBookings, error: upErr } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('salon_id', profile.assigned_shop)
            .gte('booking_date', today)
            .in('status', ['pending', 'confirmed']);

        // Completed services
        const { data: completedBookings, error: compErr } = await supabaseAdmin
            .from('bookings')
            .select('id')
            .eq('salon_id', profile.assigned_shop)
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

// Get services assigned to a staff member
export const getStaffServices = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('staff_services')
            .select('service_id, services(id, name, category, price, duration_minutes)')
            .eq('staff_id', id);

        if (error) throw error;

        const services = (data || []).map(row => row.services).filter(Boolean);
        res.status(200).json({ services });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Assign services to a staff member
export const assignStaffServices = async (req, res) => {
    try {
        const { id } = req.params;
        const { services } = req.body; // array of service IDs

        // Delete existing
        await supabaseAdmin
            .from('staff_services')
            .delete()
            .eq('staff_id', id);

        // Insert new
        if (services && services.length > 0) {
            const rows = services.map(sId => ({ 
                staff_id: id, 
                service_id: sId 
            }));
            const { error } = await supabaseAdmin
                .from('staff_services')
                .insert(rows);
            if (error) throw error;
        }

        res.status(200).json({ message: 'Staff services updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get Executive Report
export const getStaffExecutiveReport = async (req, res) => {
    try {
        const { period, date } = req.query; // period: 'monthly' | 'yearly', date: '2026-04' or '2026'
        
        // 1. Get the assigned shop
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('assigned_shop')
            .eq('id', req.user.id)
            .single();

        if (!profile?.assigned_shop) {
             return res.status(200).json({ report: null });
        }

        const salonId = profile.assigned_shop;
        
        let startDate, endDate, prevStartDate, prevEndDate;
        
        if (period === 'monthly') {
            const [year, month] = date.split('-');
            startDate = new Date(year, month - 1, 1).toISOString();
            endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
            
            prevStartDate = new Date(year, month - 2, 1).toISOString();
            prevEndDate = new Date(year, month - 1, 0, 23, 59, 59).toISOString();
        } else {
            // yearly
            startDate = new Date(date, 0, 1).toISOString();
            endDate = new Date(date, 11, 31, 23, 59, 59).toISOString();
            
            prevStartDate = new Date(date - 1, 0, 1).toISOString();
            prevEndDate = new Date(date - 1, 11, 31, 23, 59, 59).toISOString();
        }

        // Fetch current period bookings (confirmed = payment received, completed = service done)
        const { data: currentBookings, error: currErr } = await supabaseAdmin
            .from('bookings')
            .select('id, total_price, customer_id, status')
            .eq('salon_id', salonId)
            .in('status', ['completed', 'confirmed'])
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        // Fetch previous period bookings
        const { data: prevBookings, error: prevErr } = await supabaseAdmin
            .from('bookings')
            .select('total_price')
            .eq('salon_id', salonId)
            .in('status', ['completed', 'confirmed'])
            .gte('created_at', prevStartDate)
            .lte('created_at', prevEndDate);

        if (currErr || prevErr) throw new Error('Error fetching report data');

        const currentRevenue = (currentBookings || []).reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
        const prevRevenue = (prevBookings || []).reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

        
        // Calculate Growth
        let growthPercent = 0;
        if (prevRevenue > 0) {
            growthPercent = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
        } else if (currentRevenue > 0) {
            growthPercent = 100;
        }
        
        // Calculate Retention (Naive approach: Customers with >1 booking ever)
        // For simplicity, just check unique customers in this period who had a booking before this period
        let retentionRate = 100;
        if (currentBookings && currentBookings.length > 0) {
            const uniqueCustomers = [...new Set(currentBookings.map(b => b.customer_id).filter(Boolean))];
            if (uniqueCustomers.length > 0) {
                const { data: oldBookings } = await supabaseAdmin
                    .from('bookings')
                    .select('customer_id')
                    .eq('salon_id', salonId)
                    .in('customer_id', uniqueCustomers)
                    .lt('created_at', startDate);
                    
                const returningCustomers = new Set(oldBookings?.map(b => b.customer_id) || []).size;
                retentionRate = (returningCustomers / uniqueCustomers.length) * 100;
            }
        }

        const platformFeePercent = 10;
        const platformFee = currentRevenue * (platformFeePercent / 100);
        const netRevenue = currentRevenue - platformFee;

        res.status(200).json({
            report: {
                totalRevenue: currentRevenue,
                netRevenue: netRevenue,
                platformFee: platformFee,
                prevRevenue: prevRevenue,
                growthPercent: growthPercent,
                retentionRate: retentionRate,
                bookingsCount: currentBookings?.length || 0
            }
        });

    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: error.message });
    }
};
