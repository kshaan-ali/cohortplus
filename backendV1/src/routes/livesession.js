import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createLiveSession } from '../controllers/live.controller.js';

const router=express.Router();

router.get('/', requireAuth, createLiveSession)
export default router;