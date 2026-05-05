import supabase, { supabaseAdmin } from '../config/supabaseClient.js';

// Get staff availability for a salon
export const getStaffForSalon = async (req, res) => {
    try {
        const { salon_id } = req.params;
        const { service_id } = req.query;

        let query = supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role, specialization, assigned_shop')
            .eq('role', 'staff')
            .eq('assigned_shop', salon_id);

        if (service_id && service_id !== 'undefined' && service_id !== 'null') {
            // Find staff who can perform this service
            const { data: ssData, error: ssError } = await supabase
                .from('staff_services')
                .select('staff_id')
                .eq('service_id', service_id);
            
            if (ssError) throw ssError;
            
            const staffIds = (ssData || []).map(s => s.staff_id);
            
            // If we have specific assignments, filter by them.
            // If none are found, we fall back to showing all specialists to avoid an empty screen.
            if (staffIds.length > 0) {
                query = query.in('id', staffIds);
            }
        }

        const { data, error } = await query;
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

        // 1. Fetch Salon Hours, Name, Off Days, and Holidays
        const { data: salon, error: salonError } = await supabaseAdmin
            .from('salons')
            .select('hours, name, off_days, holidays')
            .eq('id', salon_id)
            .single();

        if (salonError && !salonError.message.includes('column')) throw salonError;

        // 1.1 Check if today is a Salon Holiday or Weekly Off-Day (Safety check if columns missing)
        const fullDayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
        
        if (salon?.off_days || salon?.holidays) {
            const isOffDay = (salon.off_days || []).includes(fullDayName);
            const isHoliday = (salon.holidays || []).includes(date);

            if (isOffDay || isHoliday) {
                return res.status(200).json({ 
                    slots: [], 
                    message: isOffDay ? `Shop is closed every ${fullDayName}` : 'Shop is closed for a specific holiday' 
                });
            }
        }

        // Parse salon hours — fallback to 9 AM - 8 PM if missing/malformed
        let startTime = 9 * 60;   // 540
        let endTime   = 20 * 60;  // 1200

        const parseTime = (str) => {
            try {
                let [time, modifier] = str.trim().split(' ');
                let [hours, minutes] = time.split(':');
                if (hours === '12') hours = '00';
                if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
                return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
            } catch { return null; }
        };

        if (salon?.hours) {
            const parts = salon.hours.split(' - ');
            if (parts.length === 2) {
                const s = parseTime(parts[0]);
                const e = parseTime(parts[1]);
                if (s != null) startTime = s;
                if (e != null) endTime   = e;
            }
        }

        // 1.2 Fetch Staff Hours (if specific staff selected)
        let staffHours = null;
        if (staff_id && staff_id !== 'any' && staff_id !== 'auto' && staff_id !== 'undefined') {
            const { data: staff } = await supabaseAdmin
                .from('profiles')
                .select('working_hours, off_days')
                .eq('id', staff_id)
                .single();

            if (staff) {
                const wh = staff.working_hours || {};
                const dayHours = wh[dayOfWeek]; // e.g. { start: '09:00', end: '17:00' }
                
                // Only use custom hours if the day key actually has start/end
                if (dayHours && dayHours.start && dayHours.end) {
                    staffHours = dayHours;
                }
                // If staff is on an off day, return no slots
                if (staff.off_days?.includes(date)) {
                    return res.status(200).json({ slots: [], message: 'Staff is not working on this day' });
                }
            }
        }

        const effectiveStartTime = staffHours ? parseTime(staffHours.start) : startTime;
        const effectiveEndTime = staffHours ? parseTime(staffHours.end) : endTime;

        // 2. Fetch ALL existing bookings for this salon on this day
        const { data: bookings, error: bookingsError } = await supabaseAdmin
            .from('bookings')
            .select('start_time, end_time, staff_id')
            .eq('salon_id', salon_id)
            .eq('booking_date', date)
            .neq('status', 'cancelled');
        if (bookingsError) throw bookingsError;

        // 2.1 Fetch ALL staff for this salon to calculate capacity
        const { data: salonStaff } = await supabaseAdmin
            .from('profiles')
            .select('id, working_hours, off_days')
            .eq('role', 'staff')
            .eq('assigned_shop', salon_id);

        // 3. Generate slots
        // Use staff's custom slot_duration from working_hours, fallback to 30 mins
        let interval = 30;
        if (staff_id && staff_id !== 'any' && staff_id !== 'auto' && staff_id !== 'undefined') {
            const { data: stf } = await supabaseAdmin.from('profiles').select('working_hours').eq('id', staff_id).single();
            if (stf?.working_hours?.slot_duration) interval = parseInt(stf.working_hours.slot_duration);
        }

        const slots = [];
        const lunchStart = 12 * 60 + 30; // 12:30 PM (750)
        const lunchEnd = 13 * 60 + 30;   // 1:30 PM (810)

        for (let t = effectiveStartTime; t <= effectiveEndTime - duration; t += interval) {
            const sStart = t;
            const sEnd = t + duration;

            // LUNCH BREAK FILTER (All slots between 12:30 and 1:30)
            if (sStart < lunchEnd && sEnd > lunchStart) {
                continue;
            }

            const h = Math.floor(t / 60);
            const m = t % 60;
            const timeStrShort = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            let isAvailable = false;

            if (staff_id && staff_id !== 'any' && staff_id !== 'auto') {
                // Specific staff availability: Just check if THIS staff is booked
                const isBooked = bookings.some(b => {
                    if (b.staff_id !== staff_id) return false;
                    const bStart = parseTimeFromDB(b.start_time);
                    const bEnd = parseTimeFromDB(b.end_time);
                    return (sStart < bEnd && sEnd > bStart);
                });
                isAvailable = !isBooked;
            } else {
                // "Any Staff" availability: Check if AT LEAST ONE working staff is free
                const workingStaff = (salonStaff || []).filter(s => {
                    if (s.off_days?.includes(date)) return false;
                    const wh = s.working_hours || {};
                    const sHours = wh[dayOfWeek]; // day-specific hours
                    
                    // IF staff has valid day-specific hours, use them
                    if (sHours && sHours.start && sHours.end) {
                        const sWorkStart = parseTime(sHours.start);
                        const sWorkEnd = parseTime(sHours.end);
                        return sStart >= sWorkStart && sEnd <= sWorkEnd;
                    }

                    // OTHERWISE fall back to SALON hours (default behaviour)
                    return sStart >= startTime && sEnd <= endTime;
                });

                // Fallback: If no staff are registered for this salon at ALL, 
                // we treat the salon as having 1 virtual professional to allow bookings.
                if (workingStaff.length === 0 && (!salonStaff || salonStaff.length === 0)) {
                    // Check standard salon bookings (those without staff assigned)
                    const standardBookingsAtThisTime = bookings
                        .filter(b => {
                            const bStart = parseTimeFromDB(b.start_time);
                            const bEnd = parseTimeFromDB(b.end_time);
                            return (sStart < bEnd && sEnd > bStart);
                        })
                        .length;
                    
                    // If less than 1 (or we can assume a default capacity of 2-3 for small shops)
                    isAvailable = standardBookingsAtThisTime < 1; 
                } else if (workingStaff.length === 0) {
                    isAvailable = false;
                } else {
                    // Check how many of these working staff are already booked
                    const bookingsAtThisTime = bookings.filter(b => {
                        const bStart = parseTimeFromDB(b.start_time);
                        const bEnd = parseTimeFromDB(b.end_time);
                        return (sStart < bEnd && sEnd > bStart);
                    });

                    // Explicitly assigned staff IDs
                    const specificBookedStaffIds = bookingsAtThisTime
                        .map(b => b.staff_id)
                        .filter(id => id !== null && id !== undefined);

                    // Bookings with NO specific staff assigned
                    const unassignedBookingsCount = bookingsAtThisTime.filter(b => !b.staff_id).length;

                    // Calculate how many staff are completely free from specific bookings
                    const specificFreeStaffCount = workingStaff.filter(s => !specificBookedStaffIds.includes(s.id)).length;
                    
                    // Unassigned bookings consume ANY free staff capacity
                    const totalFreeStaffCount = specificFreeStaffCount - unassignedBookingsCount;

                    isAvailable = totalFreeStaffCount > 0;
                }
            }

            slots.push({ time: timeStrShort, available: isAvailable });
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
