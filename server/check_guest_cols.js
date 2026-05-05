import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('bookings').select('guest_email').limit(1);
    if (error && error.message.includes('column "guest_email" does not exist')) {
        console.log('RESULT: MISSING');
    } else {
        console.log('RESULT: EXISTS');
    }
}
check();
