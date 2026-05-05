import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkManagers() {
    console.log('Checking for managers in profiles...');
    const { data: managers, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'manager');
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Managers found:', managers);
    }

    console.log('\nChecking all roles:');
    const { data: all, error: allErr } = await supabaseAdmin
        .from('profiles')
        .select('role', { count: 'exact', head: false });
    
    if (allErr) console.error(allErr);
    else {
        const counts = all.reduce((acc, p) => {
            acc[p.role] = (acc[p.role] || 0) + 1;
            return acc;
        }, {});
        console.log('Role counts:', counts);
    }
}

checkManagers();
