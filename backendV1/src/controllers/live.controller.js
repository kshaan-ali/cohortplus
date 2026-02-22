
import { supabase } from '../config/supabase.js';
import * as zoomService from '../services/zoom.js';

export const createLiveSession = async (req, res) => {
  const { batch_id, title, description, scheduledAt } = req.body;

  try {
    console.log('Creating live session:', { batch_id, title, description, scheduledAt });

    // 1. Create Zoom Meeting
    let zoomMeeting;
    try {
      // Calculate duration or default to 60
      const duration = 60;
      zoomMeeting = await zoomService.createMeeting(title, scheduledAt, duration);
      console.log('Created Zoom Meeting:', zoomMeeting.id);
    } catch (zoomError) {
      console.error('Failed to create Zoom meeting:', zoomError);
      return res.status(500).json({ message: 'Failed to create Zoom meeting', error: zoomError.message });
    }

    // 2. Save to Database
    const { data, error } = await supabase
      .from('live_sessions')
      .insert([{
        batch_id,
        title,
        description,
        scheduled_at: scheduledAt,
        zoom_meeting_id: zoomMeeting.id.toString(),
        zoom_password: zoomMeeting.password, // Save password
        zoom_join_url: zoomMeeting.join_url,
        duration_minutes: zoomMeeting.duration
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error creating live session:', error);
      return res.status(500).json({ message: 'Error creating live session', error: error.message, details: error });
    }

    return res.status(201).json({ liveSession: data });
  } catch (error) {
    console.error('Server execution error creating live session:', error);
    return res.status(500).json({ message: 'Error creating live session', error: error.message });
  }
};

export const getLiveSessionById = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error fetching live session', error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    return res.status(200).json({ liveSession: data });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching live session', error: error.message });
  }
};

export const getLiveSessionsByBatchId = async (req, res) => {
  const { batchId } = req.params;
  try {
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('batch_id', batchId)
      .order('scheduled_at', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Error fetching live sessions', error: error.message });
    }

    return res.status(200).json({ liveSessions: data });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching live sessions', error: error.message });
  }
};

export const joinLiveSession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const userId = req.user.id;

    // 1. Get Session Details with Batch and Course Info
    // We need to know the batch_id to check enrollments, and course's tutor_id to check if host.
    const { data: session, error: sessionError } = await supabase
      .from('live_sessions')
      .select(`
        zoom_meeting_id,
        zoom_password,
        batch_id,
        batches(
          course_id,
          courses(
            tutor_id
          )
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const batchId = session.batch_id;
    const tutorId = session.batches?.courses?.tutor_id;
    const isTutor = userId === tutorId;

    // 2. Check Permissions
    if (!isTutor) {
      // Check if student is enrolled in this batch
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', userId)
        .eq('batch_id', batchId)
        .single();

      if (enrollmentError || !enrollment) {
        return res.status(403).json({ message: 'Access denied. You are not enrolled in this batch.' });
      }
    }

    // 3. Generate Signature
    // Role 1 for Host (Tutor), 0 for Attendee (Student)
    const role = isTutor ? 1 : 0;
    const signature = zoomService.generateSignature(session.zoom_meeting_id, role);

    const credentials = {
      signature,
      meetingNumber: session.zoom_meeting_id,
      password: session.zoom_password,
      apiKey: process.env.ZOOM_SDK_KEY, // Use SDK Key, not Client ID
      userName: req.user.email || (isTutor ? 'Tutor' : 'Student'),
      userEmail: req.user.email
    };

    console.log('=== JOIN CREDENTIALS DEBUG ===');
    console.log('Meeting Number:', credentials.meetingNumber);
    console.log('Password:', credentials.password ? '***SET***' : 'MISSING');
    console.log('SDK Key:', credentials.apiKey ? credentials.apiKey.substring(0, 10) + '...' : 'MISSING');
    console.log('Signature:', signature ? 'Generated' : 'MISSING');
    console.log('Role:', role, '(0=attendee, 1=host)');
    console.log('User:', credentials.userName);
    console.log('==============================');

    return res.status(200).json(credentials);
  } catch (error) {
    console.error('Error generating join credentials:', error);
    return res.status(500).json({ message: 'Error joining session', error: error.message });
  }
};