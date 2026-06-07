import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@/config/prisma.js';
import { authMiddleware } from '@/middleware/auth.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { validate } from '@/middleware/validate.js';

const router = Router();

const dsaSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  completed: z.boolean().default(false),
  revisionCount: z.number().int().min(0).default(0),
  weakSpot: z.boolean().default(false),
  notes: z.string().optional(),
  completion: z.number().int().min(0).max(100).default(0)
});

const codingSchema = z.object({
  platform: z.enum(['LEETCODE', 'CODEFORCES', 'HACKERRANK']),
  title: z.string().min(2),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  tags: z.array(z.string()).default([]),
  timeTakenMin: z.number().int().min(0).default(0),
  revisionNeeded: z.boolean().default(false),
  solved: z.boolean().default(false),
  notes: z.string().optional()
});

const subjectSchema = z.object({
  subject: z.enum(['DBMS', 'OS', 'CN', 'OOPS']),
  topic: z.string().min(2),
  completed: z.boolean().default(false),
  confidenceMeter: z.number().int().min(0).max(100).default(0),
  revisionCount: z.number().int().min(0).default(0),
  notes: z.string().optional()
});

const aptitudeSchema = z.object({
  category: z.string().min(2),
  accuracy: z.number().int().min(0).max(100).default(0),
  speed: z.number().int().min(0).max(100).default(0),
  mockScore: z.number().int().min(0).max(100).default(0),
  attempted: z.number().int().min(0).default(0),
  correct: z.number().int().min(0).default(0),
  notes: z.string().optional()
});

router.use(authMiddleware);

router.route('/dsa-topics').get(asyncHandler(async (req, res) => {
  res.json(await prisma.dsaTopic.findMany({ where: { userId: req.user!.id }, orderBy: { updatedAt: 'desc' } }));
})).post(validate(dsaSchema), asyncHandler(async (req, res) => {
  const topic = await prisma.dsaTopic.create({ data: { ...req.body, userId: req.user!.id } });
  res.status(201).json(topic);
}));

router.patch('/dsa-topics/:id', asyncHandler(async (req, res) => {
  const topic = await prisma.dsaTopic.update({ where: { id: req.params.id }, data: req.body });
  res.json(topic);
}));

router.delete('/dsa-topics/:id', asyncHandler(async (req, res) => {
  await prisma.dsaTopic.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

router.route('/coding-problems').get(asyncHandler(async (req, res) => {
  res.json(await prisma.codingProblem.findMany({ where: { userId: req.user!.id }, orderBy: { submissionDate: 'desc' } }));
})).post(validate(codingSchema), asyncHandler(async (req, res) => {
  const problem = await prisma.codingProblem.create({ data: { ...req.body, userId: req.user!.id } });
  res.status(201).json(problem);
}));

router.patch('/coding-problems/:id', asyncHandler(async (req, res) => {
  const problem = await prisma.codingProblem.update({ where: { id: req.params.id }, data: req.body });
  res.json(problem);
}));

router.delete('/coding-problems/:id', asyncHandler(async (req, res) => {
  await prisma.codingProblem.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

router.route('/subjects').get(asyncHandler(async (req, res) => {
  res.json(await prisma.subjectProgress.findMany({ where: { userId: req.user!.id }, orderBy: { updatedAt: 'desc' } }));
})).post(validate(subjectSchema), asyncHandler(async (req, res) => {
  const subject = await prisma.subjectProgress.create({ data: { ...req.body, userId: req.user!.id } });
  res.status(201).json(subject);
}));

router.patch('/subjects/:id', asyncHandler(async (req, res) => {
  const subject = await prisma.subjectProgress.update({ where: { id: req.params.id }, data: req.body });
  res.json(subject);
}));

router.delete('/subjects/:id', asyncHandler(async (req, res) => {
  await prisma.subjectProgress.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

router.route('/aptitude').get(asyncHandler(async (req, res) => {
  res.json(await prisma.aptitudePerformance.findMany({ where: { userId: req.user!.id }, orderBy: { takenAt: 'desc' } }));
})).post(validate(aptitudeSchema), asyncHandler(async (req, res) => {
  const result = await prisma.aptitudePerformance.create({ data: { ...req.body, userId: req.user!.id } });
  res.status(201).json(result);
}));

router.patch('/aptitude/:id', asyncHandler(async (req, res) => {
  const result = await prisma.aptitudePerformance.update({ where: { id: req.params.id }, data: req.body });
  res.json(result);
}));

router.delete('/aptitude/:id', asyncHandler(async (req, res) => {
  await prisma.aptitudePerformance.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export default router;