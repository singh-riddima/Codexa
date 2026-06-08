import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomBytes, randomUUID } from 'node:crypto';
import { prisma } from '@/config/prisma.js';
import { env } from '@/config/env.js';
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

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_SCOPES = ['openid', 'email', 'profile'].join(' ');

type GoogleOAuthState = {
  rememberMe?: boolean;
};

type GoogleUserInfo = {
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
};

const getGoogleOAuthConfig = () => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = env.GOOGLE_REDIRECT_URI;
  const frontendUrl = env.FRONTEND_URL;

  if (!clientId || !clientSecret) {
    throw new AppError(500, 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    frontendUrl
  };
};

const encodeGoogleState = (state: GoogleOAuthState) => Buffer.from(JSON.stringify(state)).toString('base64url');

const decodeGoogleState = (state: string | undefined) => {
  if (!state) return { rememberMe: true };

  try {
    return JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as GoogleOAuthState;
  } catch {
    return { rememberMe: true };
  }
};

const isDbUnavailableError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('p1001') || message.includes('can\'t reach database server') || message.includes('database') || message.includes('connection');
};

export const createLocalUser = (payload: { name: string; email: string; password: string; avatarUrl?: string | null }) => {
  const user: LocalUser = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: 'student',
    avatarUrl: payload.avatarUrl ?? null,
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

const createGoogleUser = async (payload: { name: string; email: string; picture?: string | null }) => {
  const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });

  if (existing) {
    return prisma.user.update({
      where: { email: payload.email },
      data: {
        name: payload.name,
        avatarUrl: payload.picture ?? existing.avatarUrl
      }
    });
  }

  return prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password,
      avatarUrl: payload.picture ?? null,
      selectedSubjects: [],
      onboardingCompleted: false
    }
  });
};

const createLocalGoogleUser = (payload: { name: string; email: string; picture?: string | null }) => {
  const existing = localUsersByEmail.get(payload.email);
  if (existing) {
    return existing;
  }

  const password = bcrypt.hashSync(randomBytes(32).toString('hex'), 10);
  return createLocalUser({
    name: payload.name,
    email: payload.email,
    password,
    avatarUrl: payload.picture ?? null
  });
};

const getFrontendCallbackUrl = () => {
  const { frontendUrl } = getGoogleOAuthConfig();
  return new URL('/auth/google/callback', frontendUrl ?? 'http://localhost:5173');
};

router.get('/google', asyncHandler(async (req, res) => {
  const { clientId, redirectUri } = getGoogleOAuthConfig();
  const rememberMe = req.query.rememberMe !== '0' && req.query.rememberMe !== 'false';
  const authorizationUrl = new URL(GOOGLE_AUTH_URL);

  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri ?? 'http://localhost:4000/api/auth/google/callback',
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'select_account',
    state: encodeGoogleState({ rememberMe })
  }).toString();

  res.redirect(authorizationUrl.toString());
}));

router.get('/google/callback', asyncHandler(async (req, res) => {
  if (typeof req.query.error === 'string') {
    throw new AppError(400, `Google sign-in was cancelled or failed: ${req.query.error}`);
  }

  const code = typeof req.query.code === 'string' ? req.query.code : null;
  if (!code) {
    throw new AppError(400, 'Missing Google authorization code.');
  }

  const { clientId, clientSecret, redirectUri, frontendUrl } = getGoogleOAuthConfig();
  const state = decodeGoogleState(typeof req.query.state === 'string' ? req.query.state : undefined);

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri ?? 'http://localhost:4000/api/auth/google/callback',
      grant_type: 'authorization_code'
    })
  });

  if (!tokenResponse.ok) {
    throw new AppError(502, `Google token exchange failed: ${await tokenResponse.text()}`);
  }

  const tokenData = await tokenResponse.json() as { access_token?: string };
  if (!tokenData.access_token) {
    throw new AppError(502, 'Google token exchange did not return an access token.');
  }

  const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  if (!userInfoResponse.ok) {
    throw new AppError(502, `Google user info request failed: ${await userInfoResponse.text()}`);
  }

  const googleUser = await userInfoResponse.json() as GoogleUserInfo;
  if (!googleUser.email) {
    throw new AppError(502, 'Google user info response did not include an email address.');
  }

  if (googleUser.email_verified === false) {
    throw new AppError(401, 'Google account email is not verified.');
  }

  const profileName = googleUser.name ?? googleUser.email.split('@')[0] ?? 'Google User';

  try {
    const user = await createGoogleUser({
      name: profileName,
      email: googleUser.email,
      picture: googleUser.picture ?? null
    });
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    const callbackUrl = getFrontendCallbackUrl();
    callbackUrl.hash = new URLSearchParams({
      token,
      rememberMe: state.rememberMe ? '1' : '0'
    }).toString();

    res.redirect(callbackUrl.toString());
  } catch (error) {
    if (!isDbUnavailableError(error)) {
      throw error;
    }

    const localUser = createLocalGoogleUser({
      name: profileName,
      email: googleUser.email,
      picture: googleUser.picture ?? null
    });
    const token = signToken({ id: localUser.id, name: localUser.name, email: localUser.email, role: localUser.role });
    const callbackUrl = getFrontendCallbackUrl();
    callbackUrl.hash = new URLSearchParams({
      token,
      rememberMe: state.rememberMe ? '1' : '0'
    }).toString();

    res.redirect(callbackUrl.toString());
  }
}));

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