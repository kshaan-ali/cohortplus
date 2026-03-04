import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('--- Checking Storage Bucket ---');

    const { data: files, error } = await supabase.storage
        .from('course-thumbnails')
        .list('thumbnails');

    if (error) {
        console.error('❌ Error listing storage:', error.message);
    } else {
        console.log(`Found ${files.length} files in thumbnails/ folder.`);
        files.forEach(f => console.log(`- ${f.name}`));
    }

    process.exit(0);
}

checkStorage();
