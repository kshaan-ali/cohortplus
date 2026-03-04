import { supabase } from '../config/supabase.js';

export const getMyEnrollmentById = async (req, res) => {
    const userId = req.user.id;
    try {
        const { data: enrollmentsData, error } = await supabase
            .from('enrollments')
            .select('id, batch_id, enrolled_at')
            .eq('student_id', userId);

        if (error) {
            return res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
        }

        if (!enrollmentsData?.length) {
            return res.status(200).json({ enrollments: [] });
        }

        const batchIds = enrollmentsData.map((e) => e.batch_id);
        const { data: batchesData } = await supabase
            .from('batches')
            .select('id, course_id, start_date, end_date')
            .in('id', batchIds);

        const courseIds = [...new Set((batchesData || []).map((b) => b.course_id).filter(Boolean))];
        const { data: coursesData } = await supabase
            .from('courses')
            .select('id, title, description, thumbnail_url')
            .in('id', courseIds);

        const batchesMap = (batchesData || []).reduce((acc, b) => ({ ...acc, [b.id]: b }), {});
        const coursesMap = (coursesData || []).reduce((acc, c) => ({ ...acc, [c.id]: c }), {});

        const enrollments = enrollmentsData.map((e) => {
            const batch = batchesMap[e.batch_id];
            const course = batch ? coursesMap[batch.course_id] : null;
            return {
                id: e.id,
                student_id: userId,
                batch_id: e.batch_id,
                enrolled_at: e.enrolled_at,
                course_name: course?.title || 'Unknown Course',
                course_description: course?.description || 'No description available.',
                course_thumbnail: course?.thumbnail_url || null,
                batch_start_date: batch?.start_date,
                batch_end_date: batch?.end_date,
                course: course, // Providing the full course object as well
            };
        });

        return res.status(200).json({ enrollments });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
    }
};

export const createEnrollment = async (req, res) => {
    try {
        const { batch_id } = req.body;
        const student_id = req.user.id;
        console.log('Creating enrollment:', { batch_id, student_id });

        // Check for duplicate enrollment
        const { data: existing, error: checkError } = await supabase
            .from('enrollments')
            .select('id')
            .eq('batch_id', batch_id)
            .eq('student_id', student_id)
            .maybeSingle();

        if (checkError) {
            console.error('Error checking existing enrollment:', checkError);
            return res.status(500).json({ message: 'Error checking enrollment', error: checkError.message });
        }

        if (existing) {
            return res.status(409).json({ message: 'You are already enrolled in this batch' });
        }

        const enrolled_at = new Date().toISOString();
        const { data, error } = await supabase
            .from('enrollments')
            .insert([{ batch_id, student_id, enrolled_at }])
            .select()
            .single();

        if (error) {
            console.error('Supabase Error creating enrollment:', error);
            return res.status(500).json({ message: 'Error creating enrollment', error: error.message, details: error });
        }

        return res.status(201).json({ enrollment: data });
    } catch (error) {
        console.error('Server execution error creating enrollment:', error);
        return res.status(500).json({ message: 'Error creating enrollment', error: error.message });
    }
};