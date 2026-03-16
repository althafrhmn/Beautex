import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function migrate() {
    try {
        console.log('[1] Testing profiles table access...');
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('[-] Cannot access profiles:', error.message);
            return;
        }
        
        console.log('[+] Profiles accessible. Sample columns:', data.length > 0 ? Object.keys(data[0]).join(', ') : 'empty table');
        
        // Check if the new columns already exist
        if (data.length > 0 && 'speciality' in data[0]) {
            console.log('[+] Staff columns already exist!');
        } else {
            console.log('[!] Staff columns NOT found. You need to run this SQL in your Supabase Dashboard SQL Editor:');
            console.log('');
            console.log('  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS speciality TEXT;');
            console.log('  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience TEXT;');
            console.log('  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_shop TEXT;');
            console.log('  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;');
            console.log('');
        }
        
        console.log('[2] Done.');
    } catch (e) {
        console.error('Error:', e.message);
    }
}

migrate();
