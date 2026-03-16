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

async function check() {
    const { data: shops, error: sErr } = await supabase.from('salons').select('name');
    console.log('Shops in DB:', shops?.map(s => s.name) || sErr);

    const { data: services, error: svErr } = await supabase.from('services').select('name');
    console.log('Services in DB:', services?.map(s => s.name) || svErr);
}

check();
