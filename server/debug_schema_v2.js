import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data: s, error: e } = await supabase.from('salons').select('*').limit(1);
    console.log('Salons Error:', JSON.stringify(e, null, 2));
    
    const { data: sv, error: eve } = await supabase.from('services').select('*').limit(1);
    console.log('Services Error:', JSON.stringify(eve, null, 2));
}

check();
