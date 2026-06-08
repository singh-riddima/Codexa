import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@/config/prisma.js';
import { authMiddleware } from '@/middleware/auth.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { validate } from '@/middleware/validate.js';

const router = Router();

const goalSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  progress: z.number().int().min(0).max(100).default(0),
  status: z.string().default('active')
});

router.use(authMiddleware);

router.get('/', asyncHandler(async (req, res) => {
  const goals = await prisma.goal.findMany({ where: { userId: req.user!.id }, orderBy: { updatedAt: 'desc' } });
  res.json(goals);
}));

router.post('/', validate(goalSchema), asyncHandler(async (req, res) => {
  const goal = await prisma.goal.create({ data: { ...req.body, userId: req.user!.id } });
  res.status(201).json(goal);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const goalId = String(req.params.id);
  const goal = await prisma.goal.update({ where: { id: goalId }, data: req.body });
  res.json(goal);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const goalId = String(req.params.id);
  await prisma.goal.delete({ where: { id: goalId } });
  res.status(204).send();
}));

export default router;