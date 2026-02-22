import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyProfile, syncProfile } from '../controllers/profile.controller.js';

const router = express.Router();

router.get('/me', requireAuth, getMyProfile);
router.post('/sync', requireAuth, syncProfile);

export default router;
