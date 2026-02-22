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