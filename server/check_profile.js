import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkProfile() {
    const { data, error } = await supabase.from('profiles').select('email, role, assigned_shop').eq('email', 'althafrahman961@gmail.com');
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
}
checkProfile();
