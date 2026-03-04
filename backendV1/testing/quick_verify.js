import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('--- Quick Course Thumbnail Verification ---');

    // 1. Check for thumbnail_url column
    const { data: testData, error: testError } = await supabase
        .from('courses')
        .select('*')
        .limit(1);

    if (testError) {
        console.error('❌ Error querying courses:', testError.message);
    } else {
        const hasColumn = testData && testData.length > 0 ? 'thumbnail_url' in testData[0] : false;
        if (hasColumn) {
            console.log('✅ Column thumbnail_url EXISTS.');
        } else {
            console.log('❌ Column thumbnail_url NOT found.');
        }
    }

    // 2. Check for course-thumbnails bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
        console.error('❌ Error listing buckets:', bucketError.message);
    } else {
        const bucketExists = buckets.some(b => b.name === 'course-thumbnails');
        if (bucketExists) {
            console.log('✅ Storage bucket "course-thumbnails" exists.');
        } else {
            console.log('❌ Storage bucket "course-thumbnails" NOT found.');
        }
    }

    process.exit(0);
}

verify();
