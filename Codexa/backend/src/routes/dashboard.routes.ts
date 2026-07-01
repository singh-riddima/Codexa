import { Router } from 'express';
import { prisma } from '@/config/prisma.js';
import { authMiddleware } from '@/middleware/auth.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { buildTelemetry } from '@/services/analyticsTelemetry.js';

const router = Router();

const isDbUnavailableError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('p1001') || message.includes('can\'t reach database server') || message.includes('database') || message.includes('connection');
};

const fallbackSummary = {
  metrics: {
    totalSolved: 0,
    dsaCompletion: 0,
    dailyStreak: 0,
    weeklyConsistency: 0,
    readinessScore: 0
  },
  goals: [],
  topics: [],
  problems: [],
  snapshot: null,
  weeklySeries: [],
  heatmap: [],
  radar: []
};

router.get('/summary', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  try {
    const [topics, problems, goals, snapshot] = await Promise.all([
      prisma.dsaTopic.findMany({ where: { userId } }),
      prisma.codingProblem.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.analyticsSnapshot.findFirst({ where: { userId }, orderBy: { date: 'desc' } })
    ]);
    const subjects = await prisma.subjectProgress.findMany({ where: { userId } });
    const aptitude = await prisma.aptitudePerformance.findMany({ where: { userId } });
    const telemetry = buildTelemetry({ topics, problems, subjects, aptitude, goals, snapshot });

    res.json({
      metrics: {
        totalSolved: telemetry.totalSolved,
        dsaCompletion: telemetry.dsaCompletion,
        dailyStreak: telemetry.dailyStreak,
        weeklyConsistency: telemetry.weeklyConsistency,
        readinessScore: telemetry.readinessScore
      },
      goals,
      topics,
      problems,
      snapshot,
      weeklySeries: telemetry.weeklySeries,
      heatmap: telemetry.heatmap,
      radar: telemetry.radar
    });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    res.status(200).json({ ...fallbackSummary, mode: 'fallback-memory-auth' });
  }
}));

export default router;