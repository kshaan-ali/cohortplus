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
            .select('id, title')
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
                batch_start_date: batch?.start_date,
                batch_end_date: batch?.end_date,
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