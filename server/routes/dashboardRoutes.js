import { Router } from 'express';
import { adminDashboard, studentDashboard, teacherDashboard } from '../controllers/dashboardController.js';
import { adminReports, teacherReports } from '../controllers/reportController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/admin/dashboard', requireAuth, requireRole('admin'), adminDashboard);
router.get('/teacher/dashboard', requireAuth, requireRole('teacher'), teacherDashboard);
router.get('/student/dashboard', requireAuth, requireRole('student'), studentDashboard);
router.get('/admin/reports', requireAuth, requireRole('admin'), adminReports);
router.get('/teacher/reports', requireAuth, requireRole('teacher'), teacherReports);

export default router;
