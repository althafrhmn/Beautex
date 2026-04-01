import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const test = async () => {
    console.log('Testing Supabase Admin Auth...');
    const { data, error } = await supabase.storage.from('salons').upload('test.txt', 'test content', { upsert: true });
    if (error) {
        console.error('Admin Upload Failed:', error.message);
        if (error.message.includes('bucket not found')) {
            console.log('Bucket "salons" not found. Creating it...');
            const { error: createError } = await supabase.storage.createBucket('salons', { public: true });
            if (createError) console.error('Failed to create bucket:', createError.message);
            else console.log('Bucket "salons" created successfully.');
        }
    } else {
        console.log('Admin Upload Succeeded:');
    }
};

test();
