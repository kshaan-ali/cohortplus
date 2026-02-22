import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- Inspecting Course Thumbnails ---');

    const { data: courses, error } = await supabase
        .from('courses')
        .select('id, title, thumbnail_url')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('❌ Error fetching courses:', error.message);
    } else {
        courses.forEach(c => {
            console.log(`Course: ${c.title}`);
            console.log(`ID: ${c.id}`);
            console.log(`Thumbnail URL: ${c.thumbnail_url}`);
            console.log('---');
        });
    }

    process.exit(0);
}

inspect();
