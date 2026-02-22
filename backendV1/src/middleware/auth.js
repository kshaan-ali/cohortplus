import { supabase } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = data.user; // contains user.id, email
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
