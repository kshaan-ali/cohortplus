import { supabase } from './src/config/supabase.js';
import fs from 'fs';
import path from 'path';

async function verify() {
    console.log('--- Starting Course Materials Verification ---');

    try {
        // 1. Check if table exists (simple select)
        console.log('Checking course_materials table...');
        const { error: tableError } = await supabase
            .from('course_materials')
            .select('count')
            .limit(1);

        if (tableError) {
            console.error('Table error (is the migration run?):', tableError.message);
        } else {
            console.log('✅ Table course_materials exists.');
        }

        // 2. Check if materials bucket exists
        console.log('Checking materials bucket...');
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

        if (bucketError) {
            console.error('Bucket list error:', bucketError.message);
        } else {
            const materialBucket = buckets.find(b => b.id === 'materials');
            if (materialBucket) {
                console.log('✅ Storage bucket "materials" exists.');
            } else {
                console.error('❌ Storage bucket "materials" NOT found. Please create it in Supabase dashboard.');
            }
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }

    console.log('--- Verification Complete ---');
}

verify();
