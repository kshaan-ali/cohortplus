import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    console.log('--- Checking Storage Policies ---');

    // Supabase JS SDK doesn't have a direct way to list policies, 
    // but we can try to query the storage.policies table if we have permissions.
    // Usually, as service_role, we can check.

    const { data: policies, error } = await supabase.rpc('get_policies', { bucket_id: 'course-thumbnails' });

    if (error) {
        console.log('Note: RPC get_policies not found or not accessible. Trying direct table select...');
        const { data: policies2, error: error2 } = await supabase
            .from('storage.policies') // Note: this might not work depending on permissions
            .select('*');

        if (error2) {
            console.log('Could not check policies directly. Please ensure you have a SELECT policy for public access.');
        } else {
            console.log('Found policies:', policies2);
        }
    } else {
        console.log('Policies:', policies);
    }

    process.exit(0);
}

// Since checking policies is hard via SDK, I'll advise the user to run a SQL command.
console.log('Advice: Run this SQL in Supabase to ensure public read access:');
console.log(`
CREATE POLICY "Public Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-thumbnails');
`);

checkPolicies();
