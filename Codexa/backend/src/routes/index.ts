import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import trackerRoutes from './tracker.routes.js';
import analyticsRoutes from './analytics.routes.js';
import profileRoutes from './profile.routes.js';
import goalsRoutes from './goals.routes.js';
import subjectRoutes from './subject.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tracker', trackerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/profile', profileRoutes);
router.use('/goals', goalsRoutes);
router.use('/subject', subjectRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'codexa-api' });
});

export default router;