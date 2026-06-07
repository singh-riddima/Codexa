import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/utils/appError.js';
import { verifyToken } from '@/config/jwt.js';

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Missing authentication token'));
  }

  try {
    req.user = verifyToken(header.slice(7));
    return next();
  } catch {
    return next(new AppError(401, 'Invalid authentication token'));
  }
}