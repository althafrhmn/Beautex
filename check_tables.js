import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkTables() {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .limit(1);
    
    if (error) {
        console.log('Customers table error:', error.message);
    } else {
        console.log('Customers table exists.');
    }

    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (profileError) {
        console.log('Profiles table error:', profileError.message);
    } else {
        console.log('Profiles table exists.');
    }
}

checkTables();
