import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyEnrollmentById, createEnrollment } from '../controllers/enrollments.controller.js';

const router=express.Router();

router.get('/my', requireAuth, getMyEnrollmentById)
router.post('/', requireAuth, createEnrollment)
export default router;