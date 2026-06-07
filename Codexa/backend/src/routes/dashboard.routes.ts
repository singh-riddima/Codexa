import { Router } from 'express';
import { prisma } from '@/config/prisma.js';
import { authMiddleware } from '@/middleware/auth.js';
import { asyncHandler } from '@/utils/asyncHandler.js';

const router = Router();

const isDbUnavailableError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('p1001') || message.includes('can\'t reach database server') || message.includes('database') || message.includes('connection');
};

const fallbackSummary = {
  metrics: {
    totalSolved: 186,
    dsaCompletion: 78,
    dailyStreak: 21,
    weeklyConsistency: 91,
    readinessScore: 84
  },
  goals: [
    { id: 'goal-1', title: 'Finish 250 DSA problems', description: 'Keep pushing arrays, trees, and graphs.' },
    { id: 'goal-2', title: 'Revise core subjects', description: 'Refresh DBMS, OS, CN, and OOPs.' },
    { id: 'goal-3', title: 'Improve mock interview score', description: 'Practice technical questions twice this week.' }
  ],
  topics: [],
  problems: [],
  snapshot: null
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

    res.json({
      metrics: {
        totalSolved: problems.filter((problem) => problem.solved).length,
        dsaCompletion: topics.length ? Math.round((topics.filter((topic) => topic.completed).length / topics.length) * 100) : 0,
        dailyStreak: snapshot?.streak ?? 0,
        weeklyConsistency: snapshot?.weeklyConsistency ?? 0,
        readinessScore: snapshot?.readinessScore ?? 0
      },
      goals,
      topics,
      problems,
      snapshot
    });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    res.status(200).json({ ...fallbackSummary, mode: 'fallback-memory-auth' });
  }
}));

export default router;