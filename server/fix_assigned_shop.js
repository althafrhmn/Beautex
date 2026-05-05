import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixProfile() {
    const { data, error } = await supabase
        .from('profiles')
        .update({ assigned_shop: '1effd55b-ad0e-4972-9aa4-33bd3e49b93c' })
        .eq('email', 'althafrahman961@gmail.com');
    if (error) {
        console.error(error);
    } else {
        console.log('Fixed assigned_shop successfully!');
    }
}
fixProfile();
