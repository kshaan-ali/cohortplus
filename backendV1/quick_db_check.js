import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- Quick DB Check ---');

    const { data: count, error: countError } = await supabase
        .from('courses')
        .select('id', { count: 'exact', head: true });

    if (countError) {
        console.error('❌ Error counting courses:', countError.message);
    } else {
        console.log(`Total courses: ${count?.length || 0}`);
    }

    const { data: courses, error } = await supabase
        .from('courses')
        .select('id, title, thumbnail_url')
        .limit(5);

    if (error) {
        console.error('❌ Error fetching courses:', error.message);
    } else {
        console.log(`Found ${courses?.length || 0} courses.`);
        courses.forEach(c => {
            console.log(`Title: ${c.title}, Thumbnail: ${c.thumbnail_url}`);
        });
    }

    process.exit(0);
}

inspect();
