import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    // There isn't a direct "list all tables" in supabase-js, but we can query information_schema or try typical names
    const tables = ['salons', 'shops', 'services', 'profiles', 'bookings', 'payments', 'reviews', 'customers'];
    for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`Table [${t}]: NOT FOUND or ERROR:`, error.message);
        } else {
            console.log(`Table [${t}]: EXISTS (Count: ${count})`);
        }
    }
}

listTables();
