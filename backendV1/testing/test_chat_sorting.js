import dns from 'dns';

// DNS Override for Supabase to bypass ISP issues (e.g. Jio DNS misrouting)
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (hostname === 'rsaidiaymwnvzakzlaoq.supabase.co') {
        const cb = typeof options === 'function' ? options : callback;
        const opts = typeof options === 'object' ? options : {};

        if (opts.all) {
            return cb(null, [{ address: '172.64.149.246', family: 4 }]);
        }
        return cb(null, '172.64.149.246', 4);
    }
    return originalLookup(hostname, options, callback);
};

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUserChats() {
    const testUser = { id: '20e6fc6d-f656-431f-a38d-3fdaec937ba3', email: 'kshaaneali' };
    console.log('Testing for user:', testUser.email);

    // Replicate logic from getUserChats
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
        batch_id,
        batches (
            id,
            start_date,
            courses (
                title
            )
        )
    `)
        .eq('student_id', testUser.id);

    const chats = [];
    enrollments?.forEach(e => {
        if (e.batches) {
            chats.push({
                id: e.batches.id,
                course_name: e.batches.courses?.title || 'Unknown Course',
                start_date: e.batches.start_date,
                role: 'student'
            });
        }
    });

    const uniqueChats = Array.from(new Map(chats.map(item => [item.id, item])).values());

    const chatsWithLastMessage = await Promise.all(uniqueChats.map(async (chat) => {
        const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('message, created_at, sender_email')
            .eq('batch_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return {
            ...chat,
            last_message: lastMsg || null
        };
    }));

    console.log('Before sort:');
    chatsWithLastMessage.forEach(c => {
        console.log(`- ${c.course_name} | Last Msg: ${c.last_message?.created_at || 'None'} | Start: ${c.start_date}`);
    });

    chatsWithLastMessage.sort((a, b) => {
        const timeA = a.last_message ? new Date(a.last_message.created_at).getTime() : new Date(a.start_date).getTime();
        const timeB = b.last_message ? new Date(b.last_message.created_at).getTime() : new Date(b.start_date).getTime();
        return timeB - timeA;
    });

    console.log('\nAfter sort:');
    chatsWithLastMessage.forEach(c => {
        console.log(`- ${c.course_name} | Last Msg: ${c.last_message?.created_at || 'None'} | Start: ${c.start_date}`);
    });
}

testUserChats();
