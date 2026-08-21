import { Router } from 'express';
import authRoutes from './authRoutes.js';
import gameRoutes from './gameRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

export default router;
