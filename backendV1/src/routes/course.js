import express from 'express';
import multer from 'multer';
import { getCourses, getCoursesById, createCourse, getTutorCourses } from '../controllers/courses.controller.js';
import { getBatchesByCourseId } from '../controllers/batches.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getCourses);
router.post('/', requireAuth, upload.single('thumbnail'), createCourse);
router.get('/my', requireAuth, getTutorCourses);
router.get('/:id', getCoursesById);
router.get('/:courseId/batches', getBatchesByCourseId);

export default router;