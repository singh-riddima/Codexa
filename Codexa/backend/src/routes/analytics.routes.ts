import { Router } from 'express';
import { prisma } from '@/config/prisma.js';
import { authMiddleware } from '@/middleware/auth.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { buildTelemetry } from '@/services/analyticsTelemetry.js';

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
  const snapshot = await prisma.analyticsSnapshot.findFirst({ where: { userId }, orderBy: { date: 'desc' } });
  const telemetry = buildTelemetry({ topics, problems, subjects, aptitude, goals, snapshot });

  res.json({
    charts: { dsa: topics, coding: problems, subjects, aptitude, goals },
    readiness: {
      score: telemetry.readinessScore,
      prediction: Math.min(100, telemetry.readinessScore + 3),
      risk: telemetry.dsaCompletion < 50 ? 'Topic completion' : telemetry.weeklyConsistency < 60 ? 'Consistency' : 'Advanced revisions'
    },
    weeklySeries: telemetry.weeklySeries,
    heatmap: telemetry.heatmap,
    radar: telemetry.radar
  });
}));

router.post('/snapshot', asyncHandler(async (req, res) => {
  const snapshot = await prisma.analyticsSnapshot.create({ data: { ...req.body, userId: req.user!.id } });
  res.status(201).json(snapshot);
}));

export default router;