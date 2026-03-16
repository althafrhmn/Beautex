import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
// Support both naming conventions; SUPABASE_KEY is already the service_role key in this project
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env file');
}

// Standard client — uses anon key, respects RLS
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client — uses service_role key, bypasses RLS for trusted server-side operations
export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceKey || supabaseKey, // falls back to anon key if service key not set
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export default supabase;
