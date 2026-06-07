import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '@/utils/appError.js';

export const validate = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(400, result.error.issues.map((issue) => issue.message).join(', ')));
  }
  req.body = result.data;
  return next();
};