import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkTables() {
    const targets = ['salons', 'services', 'shops', 'rituals'];
    for (const target of targets) {
        console.log(`Checking [${target}] table...`);
        const { error } = await supabase.from(target).select('*').limit(1);
        if (error) {
            console.log(`❌ [${target}] table error:`, error.message);
        } else {
            console.log(`✅ [${target}] table exists.`);
        }
    }
}

checkTables();
