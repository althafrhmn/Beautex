import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdmins() {
    console.log('Checking for Admin accounts...');
    const { data: admins, error } = await supabase
        .from('profiles')
        .select('email, full_name, role')
        .in('role', ['admin', 'superadmin', 'manager']);

    if (error) {
        console.error('Error fetching admins:', error.message);
        return;
    }

    if (admins.length === 0) {
        console.log('No admin accounts found in profiles table.');
    } else {
        console.log('Current Admin Accounts:');
        admins.forEach(a => console.log(`- ${a.email} (${a.full_name} - ${a.role})`));
    }
}

checkAdmins();
