import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/config/prisma.js';
import { signToken } from '@/config/jwt.js';
import { authMiddleware } from '@/middleware/auth.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { validate } from '@/middleware/validate.js';
import { AppError } from '@/utils/appError.js';

const router = Router();

type LocalUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  targetRole: string | null;
  university: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  themePreference: string | null;
  selectedSubjects: string[];
  onboardingDuration: string | null;
  onboardingIntensity: string | null;
  onboardingCompleted: boolean;
};

export const localUsersByEmail = new Map<string, LocalUser>();
export const localUsersById = new Map<string, LocalUser>();

const isDbUnavailableError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('p1001') || message.includes('can\'t reach database server') || message.includes('database') || message.includes('connection');
};

export const createLocalUser = (payload: { name: string; email: string; password: string }) => {
  const user: LocalUser = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: 'student',
    avatarUrl: null,
    bio: null,
    targetRole: null,
    university: null,
    githubUrl: null,
    portfolioUrl: null,
    themePreference: 'dark',
    selectedSubjects: [],
    onboardingDuration: null,
    onboardingIntensity: null,
    onboardingCompleted: false
  };

  localUsersByEmail.set(user.email, user);
  localUsersById.set(user.id, user);
  return user;
};

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = authSchema.extend({
  name: z.string().min(2)
});

const sanitizeUser = (user: { id: string; name: string; email: string; role: string; avatarUrl: string | null; bio?: string | null; targetRole?: string | null; university?: string | null; githubUrl?: string | null; portfolioUrl?: string | null; themePreference?: string | null; selectedSubjects?: string[]; onboardingDuration?: string | null; onboardingIntensity?: string | null; onboardingCompleted?: boolean }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  bio: user.bio ?? null,
  targetRole: user.targetRole ?? null,
  university: user.university ?? null,
  githubUrl: user.githubUrl ?? null,
  portfolioUrl: user.portfolioUrl ?? null,
  themePreference: user.themePreference ?? 'dark',
  selectedSubjects: user.selectedSubjects ?? [],
  onboardingDuration: user.onboardingDuration ?? null,
  onboardingIntensity: user.onboardingIntensity ?? null,
  onboardingCompleted: user.onboardingCompleted ?? false
});

router.post('/signup', validate(signupSchema), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body as z.infer<typeof signupSchema>;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, selectedSubjects: [], onboardingCompleted: false } });
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });

    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const existingLocal = localUsersByEmail.get(email);
    if (existingLocal) throw new AppError(409, 'User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const localUser = createLocalUser({ name, email, password: hashedPassword });
    const token = signToken({ id: localUser.id, name: localUser.name, email: localUser.email, role: localUser.role });

    res.status(201).json({ user: sanitizeUser(localUser), token, mode: 'fallback-memory-auth' });
  }
}));

router.post('/login', validate(authSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body as z.infer<typeof authSchema>;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, 'Invalid credentials');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new AppError(401, 'Invalid credentials');

    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    res.json({ user: sanitizeUser(user), token });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const user = localUsersByEmail.get(email);
    if (!user) throw new AppError(401, 'Invalid credentials');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new AppError(401, 'Invalid credentials');

    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    res.json({ user: sanitizeUser(user), token, mode: 'fallback-memory-auth' });
  }
}));

router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw new AppError(404, 'User not found');
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const localUser = localUsersById.get(req.user!.id);
    if (!localUser) throw new AppError(404, 'User not found');
    res.json({ user: sanitizeUser(localUser), mode: 'fallback-memory-auth' });
  }
}));

router.delete('/me', authMiddleware, asyncHandler(async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.status(204).send();
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const localUser = localUsersById.get(req.user!.id);
    if (!localUser) throw new AppError(404, 'User not found');

    localUsersById.delete(localUser.id);
    localUsersByEmail.delete(localUser.email);
    res.status(204).send();
  }
}));

export default router;