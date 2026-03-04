import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
    console.log('--- Checking Bucket Public Status ---');

    const { data: bucket, error } = await supabase.storage.getBucket('course-thumbnails');

    if (error) {
        console.error('❌ Error fetching bucket:', error.message);
    } else {
        console.log(`Bucket Name: ${bucket.id}`);
        console.log(`Public: ${bucket.public}`);

        if (!bucket.public) {
            console.log('❌ BUCKET IS NOT PUBLIC. Images will not show up in the browser.');
        } else {
            console.log('✅ Bucket is public.');
        }
    }

    process.exit(0);
}

checkBucket();
