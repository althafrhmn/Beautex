import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function listTables() {
    console.log('[1] Fetching table names...');
    const { data, error } = await supabase.rpc('get_tables'); // Custom RPC or try common tables
    
    // Fallback: try to select from common tables
    const tables = ['salons', 'shops', 'profiles', 'services', 'bookings'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (!error) {
            console.log(`[+] Found table: ${table}`);
        } else {
            console.log(`[-] Missing table: ${table} (${error.message})`);
        }
    }
}

listTables();
