import express from 'express';
import { getMessages, sendMessage, checkAccess, getUserChats } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-chats', requireAuth, getUserChats);
router.get('/:batchId/access', requireAuth, checkAccess);
router.get('/:batchId/messages', requireAuth, getMessages);
router.post('/:batchId/messages', requireAuth, sendMessage);

export default router;
