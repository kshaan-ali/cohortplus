import { supabase } from '../config/supabase.js';

export const getMyRecordings = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get batches where student is enrolled
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('batch_id')
      .eq('student_id', studentId);

    if (enrollError) throw enrollError;

    if (!enrollments || enrollments.length === 0) {
      return res.status(200).json({ recordings: [] });
    }

    const batchIds = enrollments.map(e => e.batch_id);

    // 2. Fetch recordings for these batches with session and course info
    const { data, error } = await supabase
      .from('recordings')
      .select(`
        *,
        live_sessions (title),
        batches (
          id,
          courses (title)
        )
      `)
      .in('batch_id', batchIds)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Error fetching recordings', error: error.message });
    }

    return res.status(200).json({ recordings: data });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching recordings', error: error.message });
  }
};

export const getRecordingsByBatchId = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('batch_id', batchId);

    if (error) {
      return res.status(500).json({ message: 'Error fetching recordings', error: error.message });
    }

    return res.status(200).json({ recordings: data });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching recordings', error: error.message });
  }
};
