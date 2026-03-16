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
    const { data: shops, error: sErr } = await supabase.from('shops').select('name');
    console.log('Shops (table shops):', shops?.map(s => s.name) || sErr);

    const { data: salons, error: slErr } = await supabase.from('salons').select('name');
    console.log('Salons (table salons):', salons?.map(s => s.name) || slErr);
}

check();
