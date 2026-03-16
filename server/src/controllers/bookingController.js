import supabase from '../config/supabaseClient.js';


// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const {
            salon_id,
            service_ids,
            staff_id,
            booking_date,
            start_time,
            notes,
            payment_method,
            customer_id: body_customer_id
        } = req.body;

        const customer_id = body_customer_id || req.user.id;

        // 1. Fetch service details to calculate duration and total price
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .in('id', service_ids);

        if (servicesError) throw servicesError;

        let total_price = 0;
        let total_duration = 0;
        services.forEach(s => {
            total_price += parseFloat(s.price);
            total_duration += s.duration_minutes;
        });

        // Calculate end_time based on start_time and total_duration
        const [hours, minutes] = start_time.split(':').map(Number);
        const startDate = new Date(2000, 0, 1, hours, minutes);
        const endDate = new Date(startDate.getTime() + total_duration * 60000);
        const end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

        // 2. Double-booking prevention
        const overlapFilter = `start_time.lt.${end_time},end_time.gt.${start_time}`;

        // Always check salon-level conflicts (catches all bookings regardless of staff)
        const { data: salonOverlap, error: salonOverlapError } = await supabase
            .from('bookings')
            .select('id')
            .eq('salon_id', salon_id)
            .eq('booking_date', booking_date)
            .neq('status', 'cancelled')
            .lt('start_time', end_time)
            .gt('end_time', start_time);

        if (salonOverlapError) throw salonOverlapError;
        if (salonOverlap && salonOverlap.length > 0) {
            return res.status(400).json({ error: 'This time slot is already booked. Please choose a different time.' });
        }

        // Also check staff-level conflicts if a specific staff is assigned
        if (staff_id) {
            const { data: staffOverlap, error: staffOverlapError } = await supabase
                .from('bookings')
                .select('id')
                .eq('staff_id', staff_id)
                .eq('booking_date', booking_date)
                .neq('status', 'cancelled')
                .lt('start_time', end_time)
                .gt('end_time', start_time);

            if (staffOverlapError) throw staffOverlapError;
            if (staffOverlap && staffOverlap.length > 0) {
                return res.status(400).json({ error: 'Selected staff is not available at this time.' });
            }
        }

        // 3. Generate Unique Booking ID
        const booking_number = `BTX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // 4. Insert Booking with 'pending' status
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert([{
                booking_number,
                customer_id,
                salon_id,
                staff_id,
                booking_date,
                start_time,
                end_time,
                total_price,
                payment_method,
                notes,
                status: 'pending' // Insert as pending to satisfy db constraints
            }])
            .select()
            .single();

        if (bookingError) throw bookingError;

        // 5. Insert Booking Services
        const bookingServicesData = services.map(s => ({
            booking_id: booking.id,
            service_id: s.id,
            price_at_booking: s.price,
            duration_minutes: s.duration_minutes
        }));

        const { error: bsError } = await supabase
            .from('booking_services')
            .insert(bookingServicesData);

        if (bsError) throw bsError;

        // 6. Create initial payment record
        await supabase
            .from('payments')
            .insert([{
                booking_id: booking.id,
                customer_id,
                amount: total_price,
                payment_method: payment_method || 'cash',
                status: 'pending',
                transaction_id: `TRX-${booking_number.split('-')[1]}`
            }]);

        res.status(201).json({
            message: 'Booking created successfully',
            booking: {
                ...booking,
                services
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get User Bookings
export const getUserBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                salons (name, address, city, image_url),
                booking_services (
                    service_id,
                    services (name, price)
                )
            `)
            .eq('customer_id', req.user.id)
            .order('booking_date', { ascending: false });

        if (error) throw error;

        // Fetch staff names separately to avoid double-join schema cache issues
        const staffIds = [...new Set(data.map(b => b.staff_id).filter(Boolean))];
        let staffMap = {};
        if (staffIds.length > 0) {
            const { data: staffProfiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', staffIds);
            if (staffProfiles) {
                staffProfiles.forEach(p => { staffMap[p.id] = p.full_name; });
            }
        }

        const enriched = data.map(b => ({
            ...b,
            staff_name: b.staff_id ? staffMap[b.staff_id] || null : null
        }));

        res.status(200).json({ bookings: enriched });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Bookings (Admin)
export const getAllBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                salons (name),
                booking_services (
                    services (name)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Collect unique customer/staff IDs then fetch their profiles in one go
        const profileIds = [...new Set([
            ...data.map(b => b.customer_id).filter(Boolean),
            ...data.map(b => b.staff_id).filter(Boolean)
        ])];

        let profileMap = {};
        if (profileIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, phone_number')
                .in('id', profileIds);
            if (profiles) {
                profiles.forEach(p => { profileMap[p.id] = p; });
            }
        }

        const enriched = data.map(b => ({
            ...b,
            customer: profileMap[b.customer_id] || null,
            staff: profileMap[b.staff_id] ? { full_name: profileMap[b.staff_id].full_name } : null,
        }));

        res.status(200).json({ bookings: enriched });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Staff Bookings
export const getStaffBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                salons (name),
                booking_services (
                    services (name)
                )
            `)
            .eq('staff_id', req.user.id)
            .order('booking_date', { ascending: true });

        if (error) throw error;

        const customerIds = [...new Set(data.map(b => b.customer_id).filter(Boolean))];
        let profileMap = {};
        if (customerIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, phone_number')
                .in('id', customerIds);
            if (profiles) {
                profiles.forEach(p => { profileMap[p.id] = p; });
            }
        }

        const enriched = data.map(b => ({
            ...b,
            customer: profileMap[b.customer_id] || null,
        }));

        res.status(200).json({ bookings: enriched });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Booking Status
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('bookings')
            .update({ status, updated_at: new Date() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Booking status updated', booking: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel Booking
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user owns the booking or is admin/staff
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('customer_id')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (booking.customer_id !== req.user.id && req.user.role === 'customer') {
            return res.status(403).json({ error: 'You can only cancel your own bookings' });
        }

        const { data, error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled', updated_at: new Date() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Booking cancelled successfully', booking: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reschedule Booking
export const rescheduleBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { booking_date, start_time } = req.body;

        // 1. Get current booking info
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*, booking_services(*)')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        if (booking.customer_id !== req.user.id && req.user.role === 'customer') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // 2. Calculate new end_time
        const total_duration = booking.booking_services.reduce((sum, s) => sum + s.duration_minutes, 0);
        const [hours, minutes] = start_time.split(':').map(Number);
        const startDate = new Date(2000, 0, 1, hours, minutes);
        const endDate = new Date(startDate.getTime() + total_duration * 60000);
        const end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

        // 3. Double booking check
        if (booking.staff_id) {
            const { data: overlapping } = await supabase
                .from('bookings')
                .select('*')
                .eq('staff_id', booking.staff_id)
                .eq('booking_date', booking_date)
                .neq('id', id) // Exclude current booking
                .neq('status', 'cancelled')
                .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time})`);

            if (overlapping && overlapping.length > 0) {
                return res.status(400).json({ error: 'New time slot is not available' });
            }
        }

        // 4. Update
        const { data: updated, error: updateError } = await supabase
            .from('bookings')
            .update({
                booking_date,
                start_time,
                end_time,
                status: 'rescheduled',
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single();

        res.status(200).json({ message: 'Booking rescheduled successfully', booking: updated });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Assign Staff (Admin)
export const assignStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { staffId } = req.body;

        const { data, error } = await supabase
            .from('bookings')
            .update({ staff_id: staffId, updated_at: new Date() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Staff assigned successfully', booking: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


