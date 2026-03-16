import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkSchema() {
    console.log('[1] Checking salons table schema...');
    const { data, error } = await supabase.from('salons').select('*').limit(1);
    if (error) {
        console.error('Error:', error.message);
        return;
    }
    if (data.length > 0) {
        console.log('[+] Columns:', Object.keys(data[0]).join(', '));
    } else {
        console.log('[!] Table is empty, can\'t check columns easily via select.');
    }
}

checkSchema();
