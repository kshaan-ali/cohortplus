import express from 'express';
import dns from 'dns';

// DNS Override for Supabase to bypass ISP issues (e.g. Jio DNS misrouting)
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (hostname === 'rsaidiaymwnvzakzlaoq.supabase.co') {
    const cb = typeof options === 'function' ? options : callback;
    const opts = typeof options === 'object' ? options : {};
    if (opts.all) return cb(null, [{ address: '172.64.149.246', family: 4 }]);
    return cb(null, '172.64.149.246', 4);
  }
  return originalLookup(hostname, options, callback);
};

import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

import courseRoutes from './routes/course.js';
import batchRoutes from './routes/batches.js';
import liveRoutes from './routes/live.js';
import recordingRoutes from './routes/recordings.js';
import profileRoutes from './routes/profile.js';
import enrollmentRoutes from './routes/enrollments.js';
import webhookRoutes from './routes/webhooks.js';
import materialRoutes from './routes/materials.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

/* -------------------- HEALTH CHECK -------------------- */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'CohortPlus backend running'
  });
});
app.get('/authHealth', async (req, res) => {
  const { data, error } = await supabase.auth.admin.listUsers();

  console.log(data);
  res.status(200).json({
    status: 'OK',
    message: 'CohortPlus auth running',
    users: data || null
  });
});

/* -------------------- API ROUTES -------------------- */
app.use('/api/profile', profileRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/chat', chatRoutes);

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error'
  });
});

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
