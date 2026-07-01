import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@/config/prisma.js';
import { authMiddleware } from '@/middleware/auth.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { validate } from '@/middleware/validate.js';

const router = Router();

const targetSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  schedule: z.string().min(1),
  scheduleDate: z.string().datetime().optional().nullable(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).default('Pending'),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  progress: z.number().int().min(0).max(100).default(0),
  completed: z.boolean().default(false)
});

const updateTargetSchema = targetSchema.partial();

router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  const targets = await prisma.target.findMany({
    where: { userId: req.user!.id },
    orderBy: { updatedAt: 'desc' }
  });

  res.json({ targets });
}));

router.post('/', validate(targetSchema), asyncHandler(async (req, res) => {
  const target = await prisma.target.create({
    data: {
      userId: req.user!.id,
      subject: req.body.subject,
      topic: req.body.topic,
      schedule: req.body.schedule,
      scheduleDate: req.body.scheduleDate ? new Date(req.body.scheduleDate) : null,
      status: req.body.status,
      priority: req.body.priority,
      progress: req.body.progress,
      completed: req.body.completed
    }
  });

  res.status(201).json({ target });
}));

router.patch('/:id', validate(updateTargetSchema), asyncHandler(async (req, res) => {
  const existing = await prisma.target.findUnique({ where: { id: String(req.params.id) } });
  if (!existing || existing.userId !== req.user!.id) {
    return res.status(404).json({ message: 'Target not found' });
  }

  const target = await prisma.target.update({
    where: { id: existing.id },
    data: {
      subject: req.body.subject ?? existing.subject,
      topic: req.body.topic ?? existing.topic,
      schedule: req.body.schedule ?? existing.schedule,
      scheduleDate: req.body.scheduleDate !== undefined ? (req.body.scheduleDate ? new Date(req.body.scheduleDate) : null) : existing.scheduleDate,
      status: req.body.status ?? existing.status,
      priority: req.body.priority ?? existing.priority,
      progress: req.body.progress ?? existing.progress,
      completed: req.body.completed ?? existing.completed
    }
  });

  res.json({ target });
}));

router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  const existing = await prisma.target.findUnique({ where: { id: String(req.params.id) } });
  if (!existing || existing.userId !== req.user!.id) {
    return res.status(404).json({ message: 'Target not found' });
  }

  const target = await prisma.target.update({
    where: { id: existing.id },
    data: {
      completed: !existing.completed,
      progress: existing.completed ? existing.progress : 100,
      status: !existing.completed ? 'Completed' : 'In Progress'
    }
  });

  res.json({ target });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const existing = await prisma.target.findUnique({ where: { id: String(req.params.id) } });
  if (!existing || existing.userId !== req.user!.id) {
    return res.status(404).json({ message: 'Target not found' });
  }

  await prisma.target.delete({ where: { id: existing.id } });
  res.status(204).send();
}));

export default router;