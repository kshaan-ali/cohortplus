
import { supabase } from '../config/supabase.js';

export function requireRole(role) {
  return async function (req, res, next) {
    const userId = req.user.id;

    const result = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (result.error) {
      return res.status(500).json({ message: 'Role lookup failed' });
    }

    if (result.data.role !== role) {
      return res.status(403).json({ message: 'Forbidden: wrong role' });
    }

    next();
  };
}
