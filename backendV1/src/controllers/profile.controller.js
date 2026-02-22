import { supabase } from '../config/supabase.js';

export async function syncProfile(req, res) {
  try {
    const userId = req.user.id;
    const { email, role } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          name: email ? email.split('@')[0] : 'User',
          role: role || 'student',
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error syncing profile', error: error.message });
    }

    return res.status(200).json({ profile: data });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to sync profile', error: error.message });
  }
}

export async function getMyProfile(req, res) {
  try {
    const userId = req.user.id;

    const result = await supabase
      .from('profiles')
      .select('id, name, role, created_at')
      .eq('id', userId)
      .single();

    if (result.error) {
      return res.status(404).json({
        message: 'Profile not found'
      });
    }

    return res.status(200).json({
      profile: result.data
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
}
