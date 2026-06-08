import jwt from 'jsonwebtoken';
import { env } from './env.js';
import type { AuthUser } from './types.js';

export function signToken(payload: AuthUser) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AuthUser;
}