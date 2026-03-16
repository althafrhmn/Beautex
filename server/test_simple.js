import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
    const { data, error } = await supabase.from('services').select('count', { count: 'exact' });
    if (error) console.log('SERVICE_ERROR:', error.message);
    else console.log('SERVICE_COUNT:', data);
    
    const { data: d2, error: e2 } = await supabase.from('salons').select('count', { count: 'exact' });
    if (e2) console.log('SALON_ERROR:', e2.message);
    else console.log('SALON_COUNT:', d2);
}

test();
