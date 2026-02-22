import { supabase } from '../config/supabase.js';

export const getCourses = async (req, res) => {
  try {
    console.log('Fetching all courses...');
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, thumbnail_url, tutor_id, created_at');

    if (error) {
      console.error('Error fetching courses from Supabase:', error);
      return res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }

    console.log(`Fetched ${data?.length} courses. Fetching tutor profiles...`);

    // Fetch tutor names from profiles
    const tutorIds = [...new Set((data || []).map((c) => c.tutor_id).filter(Boolean))];
    let tutorNames = {};
    if (tutorIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', tutorIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
      }

      tutorNames = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});
    }

    const courses = (data || []).map((c) => ({
      ...c,
      tutor_name: tutorNames[c.tutor_id] || 'Unknown Tutor',
    }));

    console.log('Sending courses response.');
    return res.status(200).json({ courses });
  } catch (error) {
    console.error('Server error in getCourses:', error);
    return res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

export const getCoursesById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, thumbnail_url, tutor_id, created_at')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error fetching course', error: error.message });
    }

    let tutorName = 'Unknown Tutor';
    if (data?.tutor_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', data.tutor_id)
        .single();
      tutorName = profile?.name || tutorName;
    }

    return res.status(200).json({ course: { ...data, tutor_name: tutorName } });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

export const createCourse = async (req, res) => {
  const { title, description } = req.body;
  const file = req.file;

  try {
    let thumbnailUrl = null;

    if (file) {
      console.log('Thumbnail file details:', { name: file.originalname, size: file.size, type: file.mimetype });
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      console.log('Uploading thumbnail to Supabase:', filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-thumbnails')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading thumbnail:', uploadError);
        return res.status(500).json({ message: 'Error uploading thumbnail', error: uploadError.message });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('course-thumbnails')
        .getPublicUrl(filePath);

      thumbnailUrl = publicUrl;
      console.log('Thumbnail URL generated:', thumbnailUrl);
    }

    console.log('Creating course in DB:', { title, thumbnail_url: thumbnailUrl });
    const { data, error } = await supabase
      .from('courses')
      .insert([{ title, description, thumbnail_url: thumbnailUrl, tutor_id: req.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error creating course:', error);
      return res.status(500).json({ message: 'Error creating course', error: error.message, details: error });
    }

    return res.status(201).json({ course: data });
  } catch (error) {
    console.error('Server execution error creating course:', error);
    return res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

export const getTutorCourses = async (req, res) => {
  const tutorId = req.user.id;
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, thumbnail_url, tutor_id, created_at')
      .eq('tutor_id', tutorId);

    if (error) {
      return res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }

    return res.status(200).json({ courses: data });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};