import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: services } = await supabase.from('services').select('*');
    for (const service of services) {
      console.log(service.name, service.category, service.price);
    }
}
run();
