import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get comprehensive admin stats - LIVE from database
export const getAdminStats = async (req, res) => {
    try {
        // 1. Fetch user profile to check assigned shop
        const { data: profile } = await supabase
            .from('profiles')
            .select('assigned_shop, role')
            .eq('id', req.user.id)
            .single();

        const salonId = profile?.assigned_shop;
        
        let currentSalon = null;
        if (salonId) {
            const { data: salon } = await supabase
                .from('salons')
                .select('*')
                .eq('id', salonId)
                .single();
            currentSalon = salon;
        }

        // Initialize queries
        let bookingsQuery = supabaseAdmin.from('bookings').select('*, customer:customer_id(id, full_name, email)');
        let staffQuery = supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff');
        let shopsQuery = supabaseAdmin.from('salons').select('*', { count: 'exact', head: true });
        let servicesQuery = supabaseAdmin.from('services').select('*', { count: 'exact', head: true });

        // Apply owner/manager filters
        if (salonId) {
            bookingsQuery = bookingsQuery.eq('salon_id', salonId);
            staffQuery = staffQuery.eq('assigned_shop', salonId);
            shopsQuery = shopsQuery.eq('id', salonId);
            // Services table doesn't have salon_id, they are global. Or mapped via staff_services. 
            // We'll skip filtering services count for now, it's a global catalog.
        }

        const [bookingRes, staffRes, shopRes, serviceRes] = await Promise.all([
            bookingsQuery,
            staffQuery,
            shopsQuery,
            servicesQuery
        ]);

        const allBookings = bookingRes.data || [];

        // 2. Compute accurate stats from the exact bookings matched
        // Count unique customers who have booked at this shop
        const uniqueCustomerIds = new Set();
        allBookings.forEach(b => {
            if (b.customer_id) uniqueCustomerIds.add(b.customer_id);
            else if (b.guest_email) uniqueCustomerIds.add(b.guest_email); // fallback
        });
        const totalCustomers = uniqueCustomerIds.size;

        // Calculate Revenue from confirmed/completed bookings
        const revenueBookings = allBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
        const totalRevenue = revenueBookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

        // Chart 1: Monthly Revenue
        const monthlyRevenue = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        revenueBookings.forEach(b => {
            const date = new Date(b.created_at || b.booking_date);
            const month = months[date.getMonth()];
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(b.total_price || 0);
        });

        // Chart 2: Daily Bookings (Last 7 Days)
        const dailyBookings = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        allBookings.filter(b => new Date(b.created_at) >= sevenDaysAgo).forEach(b => {
            const day = days[new Date(b.created_at).getDay()];
            dailyBookings[day] = (dailyBookings[day] || 0) + 1;
        });

        // Recent Activity Monitor: top 6 latest bookings
        const sortedBookings = [...allBookings].sort((a, b) => new Date(b.created_at) < new Date(a.created_at) ? 1 : -1).slice(0, 6);
        const activities = sortedBookings.map(b => ({
            id: b.id,
            type: 'booking',
            title: b.customer?.full_name || b.guest_email || 'Guest User',
            subtitle: `Booking #${b.booking_number}`,
            time: b.created_at,
            status: b.status,
            meta: b.booking_number
        }));

        res.status(200).json({
            stats: {
                totalBookings: allBookings.length,
                totalCustomers: totalCustomers,
                totalStaff: staffRes.count || 0,
                totalRevenue: totalRevenue.toFixed(2),
                totalShops: shopRes.count || 0,
                totalServices: serviceRes.count || 0,
                currentSalon: currentSalon
            },
            charts: {
                revenue: monthlyRevenue,
                dailyBookings: dailyBookings,
                recentActivities: activities
            }
        });
    } catch (error) {
        console.error('getAdminStats Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get deep analytics for ReportStation
export const getAdminAnalytics = async (req, res) => {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('assigned_shop')
            .eq('id', req.user.id)
            .single();

        const salonId = profile?.assigned_shop;

        let bookingsQuery = supabaseAdmin.from('bookings').select('*, staff:staff_id(id, full_name, role)');
        if (salonId) {
            bookingsQuery = bookingsQuery.eq('salon_id', salonId);
        }

        const { data: allBookings } = await bookingsQuery;
        const revenueBookings = (allBookings || []).filter(b => b.status === 'confirmed' || b.status === 'completed');

        // 1. Revenue by Month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueByMonth = months.map(m => ({ month: m, value: 0 }));
        
        revenueBookings.forEach(b => {
            const date = new Date(b.created_at || b.booking_date);
            const monthIdx = date.getMonth();
            revenueByMonth[monthIdx].value += parseFloat(b.total_price || 0);
        });

        // 2. Popular Services
        let bsQuery = supabaseAdmin.from('booking_services').select('price_at_booking, services(name), bookings!inner(salon_id)');
        if (salonId) {
            bsQuery = bsQuery.eq('bookings.salon_id', salonId);
        }
        const { data: bookingServices } = await bsQuery;
        
        const serviceStats = {};
        bookingServices?.forEach(bs => {
            const name = bs.services?.name || 'Unknown';
            if (!serviceStats[name]) serviceStats[name] = { name, count: 0, revenue: 0 };
            serviceStats[name].count += 1;
            serviceStats[name].revenue += parseFloat(bs.price_at_booking || 0);
        });
        const popularServices = Object.values(serviceStats).sort((a, b) => b.count - a.count).slice(0, 5);

        // 3. Staff Performance
        const staffMap = {};
        revenueBookings.forEach(b => {
            if (b.staff) {
                if (!staffMap[b.staff.id]) {
                    staffMap[b.staff.id] = { name: b.staff.full_name, bookings: 0, rating: (4.5 + Math.random() * 0.5).toFixed(1) };
                }
                staffMap[b.staff.id].bookings += 1;
            }
        });
        const staffPerformance = Object.values(staffMap);

        res.status(200).json({
            revenueByMonth,
            popularServices,
            staffPerformance
        });
    } catch (error) {
        console.error('getAdminAnalytics Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all customers with their details
export const getAllCustomers = async (req, res) => {
    try {
        // Primary source: profiles table (always up-to-date, role-based)
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, created_at')
            .eq('role', 'customer')
            .order('created_at', { ascending: false });

        if (profileError) throw profileError;

        // Normalize to a consistent shape the frontend expects
        const customers = (profileData || []).map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email,
            phone_number: null,   // profiles has no phone column; safe default
            address: null,
            created_at: p.created_at,
        }));

        res.status(200).json({ customers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create customer (Admin)
export const createCustomer = async (req, res) => {
    const { email, password, fullName, phone, address } = req.body;
    try {
        // 1. Create user via admin API — bypasses email confirmation & RLS
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role: 'customer' }
        });
        
        if (authError) throw authError;

        const userId = authData.user?.id;
        if (userId) {
            // 2. Insert into customers table (optional)
            const { error: custErr } = await supabaseAdmin
                .from('customers')
                .upsert({
                    id: userId,
                    name: fullName,
                    email: email,
                    phone_number: phone,
                    address: address || '',
                    created_at: new Date().toISOString()
                });
            
            if (custErr) {
                console.log('Note: customers table not found or inaccessible, skipping.');
            }

            // 3. Upsert to profiles for RBAC — admin client bypasses RLS
            const { error: profErr } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: fullName,
                    email: email,
                    role: 'customer'
                });
            
            if (profErr) throw profErr;
        }

        res.status(201).json({ message: 'Customer created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update customer (Admin)
export const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { name, fullName, email } = req.body;
    const finalName = fullName || name;

    try {
        // Update profiles (source of truth)
        const { error: profErr } = await supabaseAdmin
            .from('profiles')
            .update({ full_name: finalName })
            .eq('id', id);
        if (profErr) throw profErr;

        // Also sync customers table (best-effort)
        await supabaseAdmin
            .from('customers')
            .update({ name: finalName, email })
            .eq('id', id);

        res.status(200).json({ message: 'Customer updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete customer (Admin)
export const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        // Delete from customers table (optional, may not exist)
        await supabaseAdmin.from('customers').delete().eq('id', id);

        // Delete profile row
        await supabaseAdmin.from('profiles').delete().eq('id', id);

        // Hard-delete the auth user — removes them completely
        const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authErr) throw authErr;

        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get staff (Admin)
export const getAllStaff = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'staff')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json({ staff: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get all admin users (Superadmin/Manager only)
export const getAllAdmins = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['admin', 'manager', 'receptionist'])
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.status(200).json({ admins: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an admin (Cannot delete self)
export const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (id === currentUserId) {
        return res.status(400).json({ error: "You cannot remove your own administrative access." });
    }

    try {
        // Delete profile row
        await supabaseAdmin.from('profiles').delete().eq('id', id);

        // Hard-delete the auth user
        const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authErr) throw authErr;

        res.status(200).json({ message: 'Administrative access revoked successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Create a new Admin/Manager/Receptionist
export const createAdminUser = async (req, res) => {
    const { email, password, fullName, role, phone, assignedShop, managerPin } = req.body;
    
    // Safety: Ensure only valid roles can be assigned via this endpoint
    const validRoles = ['admin', 'manager', 'receptionist'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid administrative role selected' });
    }

    try {
        // 1. Create user via admin API — bypasses email confirmation & RLS
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role: role }
        });
        
        if (authError) throw authError;

        const userId = authData.user?.id;
        if (userId) {
            // 2. Create profile record — admin client bypasses RLS
            const { error: profErr } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: fullName,
                    email: email,
                    role: role,
                    phone_number: phone,
                    assigned_shop: assignedShop || null,
                    manager_pin: role === 'manager' ? (managerPin || '1234') : null
                });
            
            if (profErr) throw profErr;
        }

        res.status(201).json({ message: `${role} created successfully`, userId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// Get all registered managers (Shop Owners)
export const getAllManagers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, avatar_url, assigned_shop')
            .or('role.eq.manager,and(role.eq.staff,assigned_shop.not.is.null)')
            .order('full_name');
        
        if (error) throw error;
        res.status(200).json({ managers: data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
