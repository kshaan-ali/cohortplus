import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('--- Starting Course Thumbnail Verification ---');

    // 1. Check for thumbnail_url column in courses table
    console.log('Checking courses table schema...');
    const { data: cols, error: colError } = await supabase
        .rpc('get_table_columns', { table_name: 'courses' });

    // If RPC doesn't exist, we can try a simple query and check the properties of the returned object
    if (colError) {
        console.log('RPC get_table_columns not found, trying query method...');
        const { data: testData, error: testError } = await supabase
            .from('courses')
            .select('*')
            .limit(1);

        if (testError) {
            console.error('❌ Error querying courses table:', testError.message);
        } else {
            const hasColumn = testData && testData.length > 0 ? 'thumbnail_url' in testData[0] : false;
            if (hasColumn) {
                console.log('✅ Column thumbnail_url EXISTS in courses table.');
            } else {
                console.log('❌ Column thumbnail_url NOT found in courses table.');
                console.log('Run this SQL to add it:');
                console.log('ALTER TABLE public.courses ADD COLUMN thumbnail_url TEXT;');
            }
        }
    } else {
        const hasColumn = cols.some(c => c.column_name === 'thumbnail_url');
        if (hasColumn) {
            console.log('✅ Column thumbnail_url EXISTS in courses table.');
        } else {
            console.log('❌ Column thumbnail_url NOT found in courses table.');
        }
    }

    // 2. Check for course-thumbnails bucket
    console.log('\nChecking course-thumbnails bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
        console.error('❌ Error listing buckets:', bucketError.message);
    } else {
        const bucketExists = buckets.some(b => b.name === 'course-thumbnails');
        if (bucketExists) {
            console.log('✅ Storage bucket "course-thumbnails" exists.');
        } else {
            console.log('❌ Storage bucket "course-thumbnails" NOT found.');
            console.log('Please create a public bucket named "course-thumbnails" in Supabase Storage.');
        }
    }

    console.log('\n--- Verification Complete ---');
}

verify();
