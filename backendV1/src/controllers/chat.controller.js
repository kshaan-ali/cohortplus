import { supabase } from '../config/supabase.js';

/**
 * Check if a user has access to a batch (enrolled student or course tutor)
 */
async function checkBatchAccess(userId, batchId) {
    // Check if user is enrolled in this batch
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', userId)
        .eq('batch_id', batchId)
        .single();

    if (enrollment) return true;

    // Check if user is the tutor of the course this batch belongs to
    const { data: batch } = await supabase
        .from('batches')
        .select('course_id')
        .eq('id', batchId)
        .single();

    if (!batch) return false;

    const { data: course } = await supabase
        .from('courses')
        .select('tutor_id')
        .eq('id', batch.course_id)
        .single();

    return course?.tutor_id === userId;
}

/**
 * GET /:batchId/messages — Fetch messages for a batch
 */
export const getMessages = async (req, res) => {
    try {
        const { batchId } = req.params;
        const userId = req.user.id;
        const { before, limit = 50 } = req.query;

        const hasAccess = await checkBatchAccess(userId, batchId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'You do not have access to this batch chat' });
        }

        let query = supabase
            .from('chat_messages')
            .select('*')
            .eq('batch_id', batchId)
            .order('created_at', { ascending: false })
            .limit(Number(limit));

        if (before) {
            query = query.lt('created_at', before);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching messages:', error);
            return res.status(500).json({ message: 'Error fetching messages', error: error.message });
        }

        // Return in chronological order (oldest first)
        res.json(data.reverse());
    } catch (err) {
        console.error('Server error fetching messages:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

/**
 * POST /:batchId/messages — Send a message to a batch chat
 */
export const sendMessage = async (req, res) => {
    try {
        const { batchId } = req.params;
        const userId = req.user.id;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        const hasAccess = await checkBatchAccess(userId, batchId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'You do not have access to this batch chat' });
        }

        // Get sender profile info
        const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', userId)
            .single();

        const senderEmail = profile?.name || req.user.email || 'Unknown';
        const senderRole = profile?.role || 'student';

        const { data, error } = await supabase
            .from('chat_messages')
            .insert([{
                batch_id: batchId,
                sender_id: userId,
                sender_email: senderEmail,
                sender_role: senderRole,
                message: message.trim(),
            }])
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ message: 'Error sending message', error: error.message });
        }

        res.status(201).json(data);
    } catch (err) {
        console.error('Server error sending message:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

/**
 * GET /:batchId/access — Check if current user has access to batch chat
 */
export const checkAccess = async (req, res) => {
    try {
        const { batchId } = req.params;
        const userId = req.user.id;

        const hasAccess = await checkBatchAccess(userId, batchId);

        // Also fetch batch + course info for the header
        const { data: batch } = await supabase
            .from('batches')
            .select('id, course_id, start_date, end_date')
            .eq('id', batchId)
            .single();

        let courseName = 'Unknown Course';
        if (batch) {
            const { data: course } = await supabase
                .from('courses')
                .select('title')
                .eq('id', batch.course_id)
                .single();
            courseName = course?.title || courseName;
        }

        res.json({
            hasAccess,
            batchInfo: batch ? { ...batch, course_name: courseName } : null,
        });
    } catch (err) {
        console.error('Server error checking access:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

/**
 * GET /chats — Fetch all chat groups (batches) for the current user
 */
export const getUserChats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get student chats (enrolled batches)
        const { data: enrollments, error: studentError } = await supabase
            .from('enrollments')
            .select(`
                batch_id,
                batches (
                    id,
                    start_date,
                    end_date,
                    created_at,
                    courses (
                        id,
                        title
                    )
                )
            `)
            .eq('student_id', userId);

        if (studentError) {
            console.error('Error fetching student chats:', studentError);
        }

        // 2. Get tutor chats (batches belonging to tutor's courses)
        const { data: courses, error: tutorError } = await supabase
            .from('courses')
            .select(`
                id,
                title,
                batches (
                    id,
                    start_date,
                    end_date,
                    created_at
                )
            `)
            .eq('tutor_id', userId);

        if (tutorError) {
            console.error('Error fetching tutor chats:', tutorError);
        }

        // Format and merge
        const chats = [];

        // Add student chats
        enrollments?.forEach(e => {
            if (e.batches) {
                chats.push({
                    id: e.batches.id,
                    course_name: e.batches.courses?.title || 'Unknown Course',
                    start_date: e.batches.start_date,
                    created_at: e.batches.created_at,
                    role: 'student'
                });
            }
        });

        // Add tutor chats
        courses?.forEach(c => {
            c.batches?.forEach(b => {
                chats.push({
                    id: b.id,
                    course_name: c.title,
                    start_date: b.start_date,
                    created_at: b.created_at,
                    role: 'tutor'
                });
            });
        });

        // Deduplicate
        const uniqueChats = Array.from(new Map(chats.map(item => [item.id, item])).values());

        // Fetch last message for each chat
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

        // Sort by last message date if available, otherwise by batch created_at, then start_date
        chatsWithLastMessage.sort((a, b) => {
            const timeA = a.last_message
                ? new Date(a.last_message.created_at).getTime()
                : (a.created_at ? new Date(a.created_at).getTime() : new Date(a.start_date || 0).getTime());

            const timeB = b.last_message
                ? new Date(b.last_message.created_at).getTime()
                : (b.created_at ? new Date(b.created_at).getTime() : new Date(b.start_date || 0).getTime());

            return timeB - timeA;
        });

        res.json(chatsWithLastMessage);
    } catch (err) {
        console.error('Server error fetching user chats:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
