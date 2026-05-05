import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkBookings() {
    const { data, error } = await supabase
        .from('bookings')
        .select('id, salon_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
        
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
}
checkBookings();
