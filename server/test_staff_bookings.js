import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testQuery() {
    const salonId = '1effd55b-ad0e-4972-9aa4-33bd3e49b93c';
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            id, booking_number, booking_date, start_time, end_time, status, total_price, guest_email, staff_id,
            customer:customer_id(id, full_name, phone_number, email),
            staff:staff_id(id, full_name),
            booking_services(services(id, name, price, duration_minutes))
        `)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log('Bookings returned:', data.length);
        if (data.length > 0) {
            console.log(JSON.stringify(data[0], null, 2));
        }
    }
}
testQuery();
