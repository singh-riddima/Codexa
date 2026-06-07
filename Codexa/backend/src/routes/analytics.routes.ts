import { Router } from 'express';
import { prisma } from '@/config/prisma.js';
import { authMiddleware } from '@/middleware/auth.js';
import { asyncHandler } from '@/utils/asyncHandler.js';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const [topics, problems, subjects, aptitude, goals] = await Promise.all([
    prisma.dsaTopic.findMany({ where: { userId } }),
    prisma.codingProblem.findMany({ where: { userId } }),
    prisma.subjectProgress.findMany({ where: { userId } }),
    prisma.aptitudePerformance.findMany({ where: { userId } }),
    prisma.goal.findMany({ where: { userId } })
  ]);

  res.json({
    charts: { dsa: topics, coding: problems, subjects, aptitude, goals },
    readiness: { score: 84, prediction: 87, risk: 'Dynamic Programming revision' }
  });
}));

router.post('/snapshot', asyncHandler(async (req, res) => {
  const snapshot = await prisma.analyticsSnapshot.create({ data: { ...req.body, userId: req.user!.id } });
  res.status(201).json(snapshot);
}));

export default router;