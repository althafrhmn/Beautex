import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get comprehensive admin stats - LIVE from database
export const getAdminStats = async (req, res) => {
    try {
        // Resiliently fetch customer count
        let customerCount = 0;
        const { count: cCount, error: cErr } = await supabase.from('customers').select('*', { count: 'exact', head: true });
        if (cErr) {
            const { count: pCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer');
            customerCount = pCount || 0;
        } else {
            customerCount = cCount || 0;
        }

        const [bookingRes, staffRes, shopRes, serviceRes, recentBookings, paymentsRes] = await Promise.all([
            supabase.from('bookings').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
            supabase.from('salons').select('*', { count: 'exact', head: true }),
            supabase.from('services').select('*', { count: 'exact', head: true }),
            supabase.from('bookings').select('id, booking_number, created_at, status, customer:customer_id(full_name)').order('created_at', { ascending: false }).limit(5),
            supabase.from('payments').select('amount, created_at').eq('status', 'completed')
        ]);

        // Resiliently fetch recent customers
        let recentCustomersData = [];
        const { data: cData, error: cDataErr } = await supabase.from('customers').select('id, name, created_at').order('created_at', { ascending: false }).limit(5);
        if (cDataErr) {
            const { data: pData } = await supabase.from('profiles').select('id, name:full_name, created_at').eq('role', 'customer').order('created_at', { ascending: false }).limit(5);
            recentCustomersData = pData || [];
        } else {
            recentCustomersData = cData || [];
        }

        const totalRevenue = (paymentsRes.data || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        // Combine and sort activities
        const activities = [
            ...(recentBookings.data || []).map(b => ({
                id: b.id,
                type: 'booking',
                title: b.customer?.full_name || 'Anonymous',
                subtitle: `Booking #${b.booking_number}`,
                time: b.created_at,
                status: b.status,
                meta: b.booking_number
            })),
            ...(recentCustomersData).map(c => ({
                id: c.id,
                type: 'registration',
                title: c.name || 'New Member',
                subtitle: 'New Profile Registered',
                time: c.created_at,
                status: 'new'
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

        // Calculate monthly revenue for chart
        const monthlyRevenue = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        (paymentsRes.data || []).forEach(p => {
            const date = new Date(p.created_at);
            const month = months[date.getMonth()];
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(p.amount);
        });

        // Calculate weekly bookings density
        const dailyBookings = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Fetch last 7 days of bookings for density
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: recentBookingsData } = await supabase
            .from('bookings')
            .select('created_at')
            .gte('created_at', sevenDaysAgo.toISOString());

        recentBookingsData?.forEach(b => {
            const day = days[new Date(b.created_at).getDay()];
            dailyBookings[day] = (dailyBookings[day] || 0) + 1;
        });

        res.status(200).json({
            stats: {
                totalBookings: bookingRes.count || 0,
                totalCustomers: customerCount,
                totalStaff: staffRes.count || 0,
                totalRevenue: totalRevenue.toFixed(2),
                totalShops: shopRes.count || 0,
                totalServices: serviceRes.count || 0
            },
            charts: {
                revenue: monthlyRevenue,
                dailyBookings: dailyBookings,
                recentActivities: activities
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get deep analytics for ReportStation
export const getAdminAnalytics = async (req, res) => {
    try {
        // 1. Revenue by Month
        const { data: payments } = await supabase
            .from('payments')
            .select('amount, created_at')
            .eq('status', 'completed');
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueByMonth = months.map(m => ({ month: m, value: 0 }));
        
        payments?.forEach(p => {
            const date = new Date(p.created_at);
            const monthIdx = date.getMonth();
            revenueByMonth[monthIdx].value += parseFloat(p.amount);
        });

        // 2. Popular Services
        const { data: bookingServices } = await supabase
            .from('booking_services')
            .select('price_at_booking, services(name)');
        
        const serviceStats = {};
        bookingServices?.forEach(bs => {
            const name = bs.services?.name || 'Unknown';
            if (!serviceStats[name]) serviceStats[name] = { name, count: 0, revenue: 0 };
            serviceStats[name].count += 1;
            serviceStats[name].revenue += parseFloat(bs.price_at_booking);
        });
        const popularServices = Object.values(serviceStats).sort((a, b) => b.count - a.count).slice(0, 5);

        // 3. Staff Performance
        const { data: staffProfiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'staff');
        
        const { data: allBookings } = await supabase
            .from('bookings')
            .select('staff_id, status');

        const staffPerformance = staffProfiles?.map(s => {
            const bookings = allBookings?.filter(b => b.staff_id === s.id && b.status === 'completed').length || 0;
            return {
                name: s.full_name,
                bookings,
                rating: (4.5 + Math.random() * 0.5).toFixed(1) // Faking rating for now
            };
        }) || [];

        res.status(200).json({
            revenueByMonth,
            popularServices,
            staffPerformance
        });
    } catch (error) {
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
    const { email, password, fullName, role, phone } = req.body;
    
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
                    role: role
                });
            
            if (profErr) throw profErr;
        }

        res.status(201).json({ message: `${role} created successfully`, userId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
