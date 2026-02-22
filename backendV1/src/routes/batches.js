import express from 'express';
import { createBatch, getBatchById } from '../controllers/batches.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router=express.Router();

router.post('/', requireAuth, createBatch)
router.get('/:batchId',getBatchById)
// router.get('/:batchId/enroll', requireAuth, enrollBatch)
export default router;