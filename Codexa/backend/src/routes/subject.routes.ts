import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { authMiddleware } from '@/middleware/auth.js';
import { prisma } from '@/config/prisma.js';
import { getSubjectCatalog, listSubjectCatalog } from '@/services/subjectCatalog.js';

const router = Router();

type MemoryProgressRecord = {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  completed: boolean;
  notes: string | null;
};

const memoryProgressByUserId = new Map<string, MemoryProgressRecord[]>();

const isDbUnavailableError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('p1001') || message.includes("can't reach database server") || message.includes('database') || message.includes('connection');
};

const topicSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  order: z.number().optional(),
  status: z.string().optional()
});

const toProgressRecord = (topic: { id: string; topic: string; completed: boolean; notes: string | null }) => ({
  id: topic.id,
  title: topic.topic,
  status: topic.completed ? 'done' : 'todo',
  notes: topic.notes
});

const getMemoryTopics = (userId: string, subjectKey: string) => memoryProgressByUserId.get(userId)?.filter((entry) => entry.subject === subjectKey) ?? [];

const upsertMemoryTopic = (userId: string, subjectKey: string, title: string, status: string | undefined, notes?: string | null) => {
  const nextTopics = [...(memoryProgressByUserId.get(userId) ?? [])];
  const existingIndex = nextTopics.findIndex((entry) => entry.subject === subjectKey && entry.topic === title);
  const nextRecord: MemoryProgressRecord = {
    id: existingIndex >= 0 ? nextTopics[existingIndex].id : randomUUID(),
    userId,
    subject: subjectKey,
    topic: title,
    completed: status ? status === 'done' : existingIndex >= 0 ? nextTopics[existingIndex].completed : false,
    notes: notes ?? (existingIndex >= 0 ? nextTopics[existingIndex].notes : null)
  };

  if (existingIndex >= 0) {
    nextTopics[existingIndex] = nextRecord;
  } else {
    nextTopics.push(nextRecord);
  }

  memoryProgressByUserId.set(userId, nextTopics);
  return nextRecord;
};

const deleteMemoryTopic = (userId: string, subjectKey: string, topicId: string) => {
  const nextTopics = (memoryProgressByUserId.get(userId) ?? []).filter((entry) => !(entry.subject === subjectKey && entry.id === topicId));
  memoryProgressByUserId.set(userId, nextTopics);
};

router.get('/catalog', asyncHandler(async (_req, res) => {
  res.json({ subjects: listSubjectCatalog() });
}));

router.get('/:subjectKey/catalog', asyncHandler(async (req, res) => {
  const subject = getSubjectCatalog(req.params.subjectKey);
  if (!subject) return res.status(404).json({ message: 'Subject dataset not found' });
  res.json({ subject });
}));

router.use(authMiddleware);

router.get('/:subjectKey', asyncHandler(async (req, res) => {
  const subjectKey = req.params.subjectKey;
  const userId = req.user!.id;

  try {
    // aggregate basic subject stats
    const totalTopics = await prisma.subjectProgress.count({ where: { userId, subject: subjectKey } });
    const topicsCompleted = await prisma.subjectProgress.count({ where: { userId, subject: subjectKey, completed: true } });
    const questionsSolved = await prisma.practiceEntry.aggregate({ where: { userId, subject: subjectKey }, _sum: { count: true } }).then((r) => r._sum.count ?? 0);
    const mockCount = await prisma.mockInterviewEntry.count({ where: { userId, subject: subjectKey } });

    const completion = totalTopics ? Math.round((topicsCompleted / totalTopics) * 100) : 0;

    res.json({ subject: subjectKey, totalTopics, topicsCompleted, questionsSolved, mockCount, completion });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const memoryTopics = getMemoryTopics(userId, subjectKey);
    const totalTopics = memoryTopics.length;
    const topicsCompleted = memoryTopics.filter((topic) => topic.completed).length;
    const completion = totalTopics ? Math.round((topicsCompleted / totalTopics) * 100) : 0;

    res.json({ subject: subjectKey, totalTopics, topicsCompleted, questionsSolved: 0, mockCount: 0, completion, mode: 'fallback-memory-subjects' });
  }
}));

router.get('/:subjectKey/topics', asyncHandler(async (req, res) => {
  const subjectKey = req.params.subjectKey;
  const userId = req.user!.id;
  try {
    const topics = await prisma.subjectProgress.findMany({ where: { userId, subject: subjectKey }, orderBy: { updatedAt: 'desc' } });
    res.json({ topics: topics.map(toProgressRecord) });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const topics = getMemoryTopics(userId, subjectKey).map((topic) => ({
      id: topic.id,
      title: topic.topic,
      status: topic.completed ? 'done' : 'todo',
      notes: topic.notes
    }));
    res.json({ topics, mode: 'fallback-memory-subjects' });
  }
}));

router.post('/:subjectKey/topics', asyncHandler(async (req, res) => {
  const subjectKey = req.params.subjectKey;
  const userId = req.user!.id;
  const parsed = topicSchema.parse(req.body);

  try {
    const topic = await prisma.subjectProgress.create({
      data: {
        userId,
        subject: subjectKey,
        topic: parsed.title,
        completed: parsed.status === 'done',
        notes: parsed.notes ?? null,
        confidenceMeter: 0,
        revisionCount: 0
      }
    });

    res.status(201).json({ topic: toProgressRecord(topic) });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const topic = upsertMemoryTopic(userId, subjectKey, parsed.title, parsed.status, parsed.notes ?? null);
    res.status(201).json({ topic: toProgressRecord(topic) , mode: 'fallback-memory-subjects' });
  }
}));

router.patch('/:subjectKey/topics/:topicId', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const subjectKey = req.params.subjectKey;
  const { topicId } = req.params;
  const parsed = topicSchema.partial().parse(req.body);

  try {
    const topic = await prisma.subjectProgress.findUnique({ where: { id: topicId } });
    if (!topic || topic.userId !== userId) return res.status(404).json({ message: 'Topic not found' });
    const updated = await prisma.subjectProgress.update({
      where: { id: topicId },
      data: {
        topic: parsed.title ?? topic.topic,
        completed: parsed.status ? parsed.status === 'done' : topic.completed,
        notes: parsed.notes ?? topic.notes
      }
    });
    res.json({ topic: toProgressRecord(updated) });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const memoryTopics = getMemoryTopics(userId, subjectKey);
    const existing = memoryTopics.find((topic) => topic.id === topicId);
    if (!existing) return res.status(404).json({ message: 'Topic not found' });

    const nextTopic = {
      ...existing,
      topic: parsed.title ?? existing.topic,
      completed: parsed.status ? parsed.status === 'done' : existing.completed,
      notes: parsed.notes ?? existing.notes
    };

    const updatedTopics = (memoryProgressByUserId.get(userId) ?? []).map((topic) => topic.id === topicId ? nextTopic : topic);
    memoryProgressByUserId.set(userId, updatedTopics);
    res.json({ topic: toProgressRecord(nextTopic), mode: 'fallback-memory-subjects' });
  }
}));

router.delete('/:subjectKey/topics/:topicId', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { topicId } = req.params;

  try {
    const topic = await prisma.subjectProgress.findUnique({ where: { id: topicId } });
    if (!topic || topic.userId !== userId) return res.status(404).json({ message: 'Topic not found' });
    await prisma.subjectProgress.delete({ where: { id: topicId } });
    res.status(204).send();
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    deleteMemoryTopic(userId, req.params.subjectKey, topicId);
    res.status(204).send();
  }
}));

export default router;
