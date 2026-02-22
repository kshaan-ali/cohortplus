import express from 'express';
import multer from 'multer';
import { uploadMaterial, getMaterialsByCourse, deleteMaterial } from '../controllers/materials.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Routes
router.post('/upload', requireAuth, upload.single('file'), uploadMaterial);
router.get('/course/:courseId', requireAuth, getMaterialsByCourse);
router.delete('/:id', requireAuth, deleteMaterial);

export default router;
