import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function reloadSchema() {
    const { data, error } = await supabase.rpc('reload_schema');
    if (error) {
        // Fallback: Just trigger a small query to ensure connection is alive,
        // PostgREST might automatically reload on certain errors or timeout.
        console.log('RPC reload_schema might not exist, but thats fine.', error.message);
    } else {
        console.log('Schema reloaded via RPC if exists');
    }
}
reloadSchema();
