import supabase from '../config/supabaseClient.js';

// Get staff availability for a salon
export const getStaffForSalon = async (req, res) => {
    try {
        const { salon_id } = req.params;
        // This is a simplification. Usually staff are linked to salons via a join table.
        // For now, we'll return all staff members from profiles.
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .eq('role', 'staff');

        if (error) throw error;

        res.status(200).json({ staff: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get available slots for a staff/salon on a date
export const getAvailableSlots = async (req, res) => {
    try {
        const { salon_id, staff_id, date, duration_minutes } = req.query;
        const duration = parseInt(duration_minutes) || 60;

        // 1. Fetch Salon Hours
        const { data: salon, error: salonError } = await supabase
            .from('salons')
            .select('hours')
            .eq('id', salon_id)
            .single();

        if (salonError) throw salonError;

        // Simple parsing of "10:00 AM - 08:00 PM"
        const [startStr, endStr] = salon.hours.split(' - ');

        const parseTime = (str) => {
            let [time, modifier] = str.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
            return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
        };

        const startTime = parseTime(startStr);
        const endTime = parseTime(endStr);

        // 1.1 Fetch Staff Hours (if specific staff selected)
        let staffHours = null;
        if (staff_id && staff_id !== 'any' && staff_id !== 'auto') {
            const { data: staff } = await supabase
                .from('profiles')
                .select('working_hours, off_days')
                .eq('id', staff_id)
                .single();

            if (staff) {
                const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
                staffHours = staff.working_hours?.[dayOfWeek];

                // If the staff has no hours defined for this day or is on off_day
                if (!staffHours || staff.off_days?.includes(date)) {
                    return res.status(200).json({ slots: [], message: 'Staff is not working on this day' });
                }
            }
        }

        const effectiveStartTime = staffHours ? parseTime(staffHours.start) : startTime;
        const effectiveEndTime = staffHours ? parseTime(staffHours.end) : endTime;

        // 2. Fetch existing bookings — always scoped to the salon so slots are accurate
        let query = supabase
            .from('bookings')
            .select('start_time, end_time')
            .eq('salon_id', salon_id)
            .eq('booking_date', date)
            .neq('status', 'cancelled');

        if (staff_id && staff_id !== 'auto' && staff_id !== 'any') {
            query = query.eq('staff_id', staff_id);
        }

        const { data: bookings, error: bookingsError } = await query;
        if (bookingsError) throw bookingsError;

        // 3. Generate slots
        const slots = [];
        const interval = 30; // 30 min intervals

        for (let t = effectiveStartTime; t <= effectiveEndTime - duration; t += interval) {
            const h = Math.floor(t / 60);
            const m = t % 60;
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
            const timeStrShort = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            // Check if slot overlaps with any booking
            const isBooked = bookings.some(b => {
                const bStart = parseTimeFromDB(b.start_time);
                const bEnd = parseTimeFromDB(b.end_time);
                const sStart = t;
                const sEnd = t + duration;
                return (sStart < bEnd && sEnd > bStart);
            });

            slots.push({ time: timeStrShort, available: !isBooked });
        }

        res.status(200).json({ slots });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const parseTimeFromDB = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};
