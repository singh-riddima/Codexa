import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@/config/prisma.js';
import { authMiddleware } from '@/middleware/auth.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { validate } from '@/middleware/validate.js';
import { AppError } from '@/utils/appError.js';
import { localUsersById } from '@/routes/auth.routes.js';

const router = Router();

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  targetRole: z.string().optional(),
  university: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  themePreference: z.string().optional(),
  selectedSubjects: z.array(z.string().min(1)).optional(),
  onboardingDuration: z.string().optional().nullable(),
  onboardingIntensity: z.string().optional().nullable(),
  onboardingCompleted: z.boolean().optional()
});

const isDbUnavailableError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('p1001') || message.includes('can\'t reach database server') || message.includes('database') || message.includes('connection');
};

router.use(authMiddleware);

router.get('/me', asyncHandler(async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'User not found');
    res.json({ user });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const localUser = localUsersById.get(req.user!.id);
    if (!localUser) throw new AppError(404, 'User not found');
    res.json({ user: localUser, mode: 'fallback-memory-auth' });
  }
}));

router.put('/me', validate(profileSchema), asyncHandler(async (req, res) => {
  try {
    const user = await prisma.user.update({ where: { id: req.user!.id }, data: req.body });
    res.json({ user });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const localUser = localUsersById.get(req.user!.id);
    if (!localUser) throw new AppError(404, 'User not found');

    if (typeof req.body.name === 'string') localUser.name = req.body.name;
    if (typeof req.body.bio === 'string') localUser.bio = req.body.bio;
    if (typeof req.body.targetRole === 'string') localUser.targetRole = req.body.targetRole;
    if (typeof req.body.university === 'string') localUser.university = req.body.university;
    if (typeof req.body.githubUrl === 'string') localUser.githubUrl = req.body.githubUrl || null;
    if (typeof req.body.portfolioUrl === 'string') localUser.portfolioUrl = req.body.portfolioUrl || null;
    if (typeof req.body.avatarUrl === 'string') localUser.avatarUrl = req.body.avatarUrl || null;
    if (typeof req.body.themePreference === 'string') localUser.themePreference = req.body.themePreference;
    if (Array.isArray(req.body.selectedSubjects)) localUser.selectedSubjects = req.body.selectedSubjects;
    if (typeof req.body.onboardingDuration === 'string' || req.body.onboardingDuration === null) localUser.onboardingDuration = req.body.onboardingDuration;
    if (typeof req.body.onboardingIntensity === 'string' || req.body.onboardingIntensity === null) localUser.onboardingIntensity = req.body.onboardingIntensity;
    if (typeof req.body.onboardingCompleted === 'boolean') localUser.onboardingCompleted = req.body.onboardingCompleted;

    res.json({ user: localUser, mode: 'fallback-memory-auth' });
  }
}));

export default router;