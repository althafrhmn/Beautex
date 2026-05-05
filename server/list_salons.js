import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listSalons() {
    const { data, error } = await supabase.from('salons').select('id, name');
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
}
listSalons();
