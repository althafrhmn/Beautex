import supabase, { supabaseAdmin } from '../config/supabaseClient.js';


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
            payment_type,
            customer_id: body_customer_id,
            use_points,
            guest_name,
            guest_email,
            guest_phone,
            products
        } = req.body;

        // Resolve customer_id — priority: explicitly passed > logged-in user > email lookup (registered account)
        let customer_id = body_customer_id || (req.user ? req.user.id : null);

        // If still no customer_id but a guest_email was provided, check if it belongs to a registered user
        if (!customer_id && guest_email) {
            const { data: matchedProfile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('email', guest_email)
                .maybeSingle();
            if (matchedProfile?.id) {
                customer_id = matchedProfile.id;
            }
        }

        // 1. Fetch service details to calculate duration and total price
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .in('id', service_ids);

        if (servicesError) throw servicesError;

        let base_total_price = 0;
        let total_duration = 0;
        services.forEach(s => {
            base_total_price += parseFloat(s.price);
            total_duration += s.duration_minutes;
        });

        let product_total = 0;
        if (products && products.length > 0) {
            products.forEach(p => {
                product_total += parseFloat(p.price) * p.quantity;
            });
        }
        base_total_price += product_total;

        // Loyalty points discount logic
        let points_used = 0;
        let offer_discount = 0;

        // 1. Check for Active 20% OFF Salon Offers
        const { data: activeOffers } = await supabaseAdmin
            .from('announcements')
            .select('title')
            .eq('salon_id', salon_id)
            .eq('type', 'offer')
            .eq('status', 'approved')
            .eq('is_active', true);
        
        const has20PercentOffer = activeOffers?.some(o => o.title.toUpperCase().includes('20%'));
        if (has20PercentOffer) {
            offer_discount = Math.floor(base_total_price * 0.20);
        }

        let total_price = base_total_price - offer_discount;

        if (use_points && customer_id) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('loyalty_points')
                .eq('id', customer_id)
                .single();
                
            if (profile && profile.loyalty_points >= 100) {
                // Loyalty discount is 10% of the price AFTER offer discount
                const maxPointsAllowed = Math.floor(total_price * 0.10);
                points_used = Math.min(profile.loyalty_points, maxPointsAllowed);
                total_price = total_price - points_used;
            }
        }

        // Calculate end_time based on start_time and total_duration
        const [hours, minutes] = start_time.split(':').map(Number);
        const startDate = new Date(2000, 0, 1, hours, minutes);
        const endDate = new Date(startDate.getTime() + total_duration * 60000);
        const end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

        // 2. Double-booking prevention with Capacity Check
        const { data: salonBookings, error: salonOverlapError } = await supabase
            .from('bookings')
            .select('id, staff_id')
            .eq('salon_id', salon_id)
            .eq('booking_date', booking_date)
            .neq('status', 'cancelled')
            .neq('status', 'pending') // IGNORE pending bookings for capacity (they might be abandoned)
            .lt('start_time', end_time)
            .gt('end_time', start_time);

        if (salonOverlapError) throw salonOverlapError;

        if (staff_id) {
            // Case 1: Specific staff selected - Block only if THAT staff is busy
            const isStaffBusy = (salonBookings || []).some(b => b.staff_id === staff_id);
            if (isStaffBusy) {
                return res.status(400).json({ error: 'The selected staff is already booked for this time slot.' });
            }
        } else {
            // Case 2: No specific staff (Auto/Any) - Block if ALL staff are busy
            const { data: workingStaff } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'staff')
                .eq('assigned_shop', salon_id);

            const totalStaffCount = workingStaff?.length || 1;
            const currentBookingsCount = (salonBookings || []).length;

            if (currentBookingsCount >= totalStaffCount) {
                return res.status(400).json({ error: 'This time slot is at full capacity. Please choose another time.' });
            }
        }

        // 3. Generate Unique Booking ID
        const booking_number = `BTX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // 4. Insert Booking with 'pending' status - use supabaseAdmin to bypass RLS for Guest bookings
        const { data: booking, error: bookingError } = await supabaseAdmin
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
                points_used,
                payment_method,
                payment_type: payment_type || 'full',
                notes,
                guest_name: guest_name || null,
                guest_email: guest_email || null,
                guest_phone: guest_phone || null,
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

        const { error: bsError } = await supabaseAdmin
            .from('booking_services')
            .insert(bookingServicesData);

        if (bsError) throw bsError;

        // 5.5 Insert Product Orders if any
        if (products && products.length > 0) {
            const { data: order, error: orderError } = await supabaseAdmin
                .from('product_orders')
                .insert([{
                    customer_id,
                    salon_id,
                    total_amount: product_total,
                    status: 'pending',
                    payment_method
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            const orderItemsData = products.map(p => ({
                order_id: order.id,
                product_id: p.product_id,
                quantity: p.quantity,
                price_at_purchase: p.price
            }));

            const { error: itemsError } = await supabaseAdmin
                .from('order_items')
                .insert(orderItemsData);

            if (itemsError) throw itemsError;
            
            // Note: In a full app, you might want to decrement stock_quantity here
        }

        const amount_to_pay = payment_type === 'advance' ? Math.ceil(total_price / 2) : total_price;

        // 6. Create initial payment record
        await supabaseAdmin
            .from('payments')
            .insert([{
                booking_id: booking.id,
                customer_id,
                amount: amount_to_pay,
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
        const userId = req.user.id;
        const userEmail = req.user.email;

        const selectQuery = `
            *,
            salons (name, address, city, image_url),
            booking_services (
                service_id,
                services (name, price)
            ),
            reviews (id)
        `;

        // Use supabaseAdmin to bypass RLS — user is authenticated via requireAuth middleware
        const { data: ownedBookings, error: ownedError } = await supabaseAdmin
            .from('bookings')
            .select(selectQuery)
            .eq('customer_id', userId)
            .order('booking_date', { ascending: false });

        if (ownedError) throw ownedError;

        // Also fetch guest bookings matched by email (OTP bookings before account linking)
        let guestBookings = [];
        if (userEmail) {
            const { data: guestData } = await supabaseAdmin
                .from('bookings')
                .select(selectQuery)
                .is('customer_id', null)
                .eq('guest_email', userEmail)
                .order('booking_date', { ascending: false });
            guestBookings = guestData || [];
        }

        // Merge and de-duplicate by id
        const seen = new Set();
        const merged = [...(ownedBookings || []), ...guestBookings].filter(b => {
            if (seen.has(b.id)) return false;
            seen.add(b.id);
            return true;
        });

        // Auto-confirm any pending QR bookings (user already scanned and paid)
        const pendingQrIds = merged
            .filter(b => b.status === 'pending' && b.payment_method === 'qr')
            .map(b => b.id);

        if (pendingQrIds.length > 0) {
            await supabaseAdmin
                .from('bookings')
                .update({ status: 'confirmed', updated_at: new Date() })
                .in('id', pendingQrIds);

            // Update in-memory too so response is consistent
            merged.forEach(b => {
                if (pendingQrIds.includes(b.id)) {
                    b.status = 'confirmed';
                }
            });
        }

        // Sort merged list by booking_date descending
        merged.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));

        // Fetch staff names separately
        const staffIds = [...new Set(merged.map(b => b.staff_id).filter(Boolean))];
        let staffMap = {};
        if (staffIds.length > 0) {
            const { data: staffProfiles } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name')
                .in('id', staffIds);
            if (staffProfiles) {
                staffProfiles.forEach(p => { staffMap[p.id] = p.full_name; });
            }
        }

        const enriched = merged.map(b => {
            const has_review = Array.isArray(b.reviews) ? b.reviews.length > 0 : !!b.reviews;
            const res = {
                ...b,
                staff_name: b.staff_id ? staffMap[b.staff_id] || null : null,
                has_review
            };
            delete res.reviews;
            return res;
        });

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
        // 1. Fetch user's profile to check for assigned shop (Owner/Manager check)
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, role, assigned_shop')
            .eq('id', req.user.id)
            .single();

        // 2. Determine visibility scope: Salon-wide if assigned_shop exists, otherwise staff-specific
        let query = supabase
            .from('bookings')
            .select(`
                *,
                salons (name),
                booking_services (
                    services (name)
                )
            `);
        
        if (profile?.assigned_shop) {
            query = query.eq('salon_id', profile.assigned_shop);
        } else {
            query = query.eq('staff_id', req.user.id);
        }

        const { data, error } = await query.order('booking_date', { ascending: true });

        if (error) throw error;

        // Collect unique customer/staff IDs then fetch their profiles
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


