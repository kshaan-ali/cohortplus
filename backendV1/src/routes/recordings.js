import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getRecordingsByBatchId, getMyRecordings } from '../controllers/recordings.controller.js';

const router = express.Router();

router.get('/me', requireAuth, getMyRecordings);
router.get('/batch/:batchId', requireAuth, getRecordingsByBatchId);

export default router;
