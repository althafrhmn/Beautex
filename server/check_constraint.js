import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkConstraint() {
    // We can just try 'staff'
    console.log('Testing update to staff...');
    const email = 'althafrahman961@gmail.com';
    
    // get user id
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
    if(profile) {
        const { error } = await supabase.from('profiles').update({ role: 'staff' }).eq('id', profile.id);
        if(error) {
            console.error('Update to staff failed:', error.message);
        } else {
            console.log('Update to staff succeeded!');
        }
    }
}

checkConstraint();
