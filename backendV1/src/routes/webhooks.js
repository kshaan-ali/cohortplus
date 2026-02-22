import express from 'express';
import { handleZoomWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Public endpoint for Zoom webhooks (supports optional trailing slash)
router.post(['/zoom', '/zoom/'], handleZoomWebhook);

export default router;
