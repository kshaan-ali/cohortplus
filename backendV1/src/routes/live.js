
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createLiveSession,
  getLiveSessionById,
  getLiveSessionsByBatchId,
  joinLiveSession,
} from '../controllers/live.controller.js';

const router = express.Router();

router.post('/', requireAuth, createLiveSession);
router.get('/batch/:batchId', requireAuth, getLiveSessionsByBatchId);
router.get('/:sessionId', requireAuth, getLiveSessionById);
router.post('/join/:sessionId', requireAuth, joinLiveSession);

export default router;

