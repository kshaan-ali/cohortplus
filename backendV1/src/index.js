import express from 'express';
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

dotenv.config();

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:5173',
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
