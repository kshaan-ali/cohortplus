import { supabase } from '../config/supabase.js';

export const getBatchesByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('course_id', courseId);

    if (error) {
      return res.status(500).json({ message: 'Error fetching batches', error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const createBatch = async (req, res) => {
  try {
    const { course_id, start_date, end_date, price, billing_type } = req.body;
    console.log('Creating batch with payload:', { course_id, start_date, end_date, price, billing_type });

    // Prevent creating batches with past start dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(start_date) < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    const created_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('batches')
      .insert([{ course_id, start_date, end_date, price, billing_type, created_at }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error creating batch:', error);
      return res.status(500).json({ message: 'Error creating batch', error: error.message, details: error });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Server execution error creating batch:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error fetching batch', error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getParticipantsByBatchId = async (req, res) => {
  try {
    const { batchId } = req.params;

    // 1. Get the batch to find the course_id
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('id, course_id')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // 2. Get the course to find the tutor
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, tutor_id')
      .eq('id', batch.course_id)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 3. Get all enrollments for this batch
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('student_id, enrolled_at')
      .eq('batch_id', batchId);

    if (enrollError) {
      return res.status(500).json({ message: 'Error fetching enrollments', error: enrollError.message });
    }

    // 4. Collect all user IDs (students + tutor)
    const studentIds = (enrollments || []).map(e => e.student_id);
    const allUserIds = [...new Set([course.tutor_id, ...studentIds])];

    // 5. Get profiles for all users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, role, created_at')
      .in('id', allUserIds);

    if (profileError) {
      return res.status(500).json({ message: 'Error fetching profiles', error: profileError.message });
    }

    // 6. Also get auth emails from auth.users via supabase admin
    // Since we can't always query auth.users from client, we'll use the profiles + enrollments
    // Build participant list
    const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
    const enrollmentMap = (enrollments || []).reduce((acc, e) => ({ ...acc, [e.student_id]: e }), {});

    const participants = allUserIds.map(userId => {
      const profile = profileMap[userId];
      const isTutor = userId === course.tutor_id;
      const enrollment = enrollmentMap[userId];
      return {
        id: userId,
        name: profile?.name || 'Unknown',
        role: isTutor ? 'tutor' : 'student',
        joined_at: isTutor ? null : enrollment?.enrolled_at || null,
      };
    });

    // Sort: tutor first, then students alphabetically
    participants.sort((a, b) => {
      if (a.role === 'tutor') return -1;
      if (b.role === 'tutor') return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

    return res.json({
      batch_id: batchId,
      course_name: course.title,
      total: participants.length,
      participants,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};