import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function autocompleteBookings() {
    const today = new Date().toISOString().split('T')[0];
    
    // Update bookings where date is less than today and status is confirmed
    const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('status', 'confirmed')
        .lt('booking_date', today)
        .select('id, booking_date');
        
    if (error) {
        console.error('Error auto-completing bookings:', error);
    } else {
        console.log(`Successfully auto-completed ${data.length} past bookings.`);
        console.log(data);
    }
}

autocompleteBookings();
