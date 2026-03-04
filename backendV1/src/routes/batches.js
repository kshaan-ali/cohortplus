import express from 'express';
import { createBatch, getBatchById, getParticipantsByBatchId } from '../controllers/batches.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createBatch)
router.get('/:batchId', getBatchById)
router.get('/:batchId/participants', requireAuth, getParticipantsByBatchId)
// router.get('/:batchId/enroll', requireAuth, enrollBatch)
export default router;